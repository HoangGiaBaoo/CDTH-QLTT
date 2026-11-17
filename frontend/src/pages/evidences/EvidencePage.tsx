import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { evidenceApi } from '../../api/evidences';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_HINH_THUC_THUC_TAP, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { dungLuong, ngayGio } from '../../utils/format';
import { homNayIso, khoangTuan, tuanCua } from '../../utils/lich';
import { luuTep } from '../../utils/taiTep';
import EvidenceUploadForm, { type LoaiTaiLen } from './EvidenceUploadForm';
import type { DoiChieuMinhChung, DongDoiChieu, MinhChung } from '../../types/evidence';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { Dot } from '../../types/term';

/** Mã "Minh chứng khác" trong `LoaiMinhChungDanhMuc` — luôn tải lên được, không thuộc danh mục bắt buộc nào. */
const KHAC: LoaiTaiLen = { ma: 'KHAC', ten: 'Minh chứng khác' };
/** Cùng tập trạng thái `MinhChungService.DUOC_TAI_LEN` — ngoài các trạng thái này backend trả RESOURCE_LOCKED. */
const DUOC_TAI_LEN: TrangThaiHoSo[] = ['DANG_THUC_TAP', 'CHO_DANH_GIA'];
/** Từ lúc chờ đánh giá, thiếu minh chứng mới là cảnh báo (Đ15 k3d); trước đó nhiều mục chưa tới hạn — như SCR-12. */
const DEN_HAN: TrangThaiHoSo[] = ['CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH'];

/**
 * Mục do hệ thống tự ghi nhận: khi nào được coi là "Đã có" (mô tả lại `MinhChungService.coTuHeThong`, chỉ để giải
 * thích — kết quả Đã có / Chưa có vẫn do backend trả) và màn có dữ liệu đó.
 */
const HE_THONG: Record<string, { khi: string; con?: string; menuSv?: string }> = {
  PHIEU_DANG_KY: { khi: 'khi cán bộ ĐVHD xác nhận tiếp nhận phiếu đăng ký', con: '', menuSv: '/my-record' },
  NHAT_KY: { khi: 'khi đã có nhật ký thực tập', con: 'logbooks', menuSv: '/my-record/logbook' },
  KE_HOACH_HOC_TAP: { khi: 'khi kế hoạch có đủ xác nhận của ĐVHD và GVHD', con: 'study_plan', menuSv: '/my-record/plan' },
  BAO_CAO_THUC_TAP: { khi: 'khi bản báo cáo mới nhất được ĐVHD và GVHD xác nhận', con: 'reports', menuSv: '/my-record/report' },
  PHAN_HOI_08A: { khi: 'khi cán bộ ĐVHD gửi phiếu 08a', con: 'feedbacks', menuSv: '/my-record/feedback' },
  PHAN_HOI_08B: { khi: 'khi sinh viên gửi phiếu 08b', con: 'feedbacks', menuSv: '/my-record/feedback' },
  NHAN_XET_GVHD: { khi: 'khi GVHD nộp phiếu đánh giá kèm nhận xét' },
};

const duoiTep = (ten: string) => {
  const i = ten.lastIndexOf('.');
  return i < 0 ? '' : ten.slice(i + 1).toLowerCase();
};

/** `/records/:recordId/evidences` — lối từ ô Minh chứng của SCR-12 và từ danh mục minh chứng bắt buộc. */
export function EvidenceRoute() {
  const id = Number(useParams().recordId);
  return <EvidencePage key={id} recordId={id} />;
}

/**
 * SCR-17 — Minh chứng (UC07, #64–#68). Bảng đối chiếu danh mục bắt buộc theo hình thức thực tập (#65, BR-07.6 — điều
 * kiện (d) công nhận); danh sách tệp lọc theo loại + tuần (#64), tải về qua endpoint có kiểm quyền (#67). Sinh viên tải
 * lên (#66) và xóa (#68) khi hồ sơ đang thực tập / chờ đánh giá; người khác chỉ xem + tải. Mọi quy tắc do backend kiểm.
 * `recordId` trống ⇒ hồ sơ của SV đang đăng nhập (#40).
 */
export default function EvidencePage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [bang, setBang] = useState<DoiChieuMinhChung | null>(null);
  const [ds, setDs] = useState<MinhChung[] | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loaiChon, setLoaiChon] = useState<string>();
  const [thongBao, setThongBao] = useState<string>();
  const [loiTaiVe, setLoiTaiVe] = useState<unknown>(null);
  const [dangTaiVe, setDangTaiVe] = useState<number>();
  const [xoa, setXoa] = useState<MinhChung | null>(null);
  const [loiXoa, setLoiXoa] = useState<unknown>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [loc, setLoc] = useSearchParams();

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = recordId ? await recordApi.chiTiet(recordId) : await recordApi.cuaToi();
      const [d, b, m] = await Promise.all([termApi.chiTiet(h.dot.id), evidenceApi.doiChieu(h.id), evidenceApi.danhSach(h.id)]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      setBang(b);
      setDs(m);
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [recordId]);

  const taiLai = useCallback(async (hoSoId: number) => {
    const [b, m] = await Promise.all([evidenceApi.doiChieu(hoSoId), evidenceApi.danhSach(hoSoId)]);
    setBang(b);
    setDs(m);
  }, []);

  /** Loại SV tải lên được: các loại TAI_LEN của danh mục bắt buộc (loại còn thiếu lên trước) + Minh chứng khác. */
  const loaiTaiLen = useMemo<LoaiTaiLen[]>(() => {
    const batBuoc = (bang?.danhMuc ?? []).filter((d) => d.nguon === 'TAI_LEN')
      .map((d) => ({ ma: d.loaiMinhChung, ten: d.tenHienThi, thieu: !d.daCo }));
    return [...batBuoc.filter((l) => l.thieu), ...batBuoc.filter((l) => !l.thieu), KHAC];
  }, [bang]);

  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;
  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">Minh chứng</h1>
          {hoSo && !laSv && <div className="muted small">{hoSo.sinhVien.hoTen} — {hoSo.sinhVien.maSv} · đợt {hoSo.dot.maDot}</div>}
        </div>
        {hoSo && <StatusBadge value={hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />}
      </div>
    </>
  );

  if (loiTai) {
    const chuaCoHoSo = laSv && loiTai instanceof ApiError && loiTai.code === 'RESOURCE_NOT_FOUND';
    return (
      <div>
        {tieuDe}
        {chuaCoHoSo ? (
          <div className="card empty">
            <div className="empty-title">{loiTai.message}</div>
            <div className="muted">Danh mục minh chứng bắt buộc tùy theo hình thức thực tập bạn chọn khi đăng ký (Điều 4).</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || !bang || !ds) return <div>{tieuDe}<Loading /></div>;

  const taiLenDuoc = laSv && DUOC_TAI_LEN.includes(hoSo.trangThai);
  const denHan = DEN_HAN.includes(hoSo.trangThai);
  const daKhoa = ds.some((m) => m.daKhoa);
  const loaiDangChon = loaiChon && loaiTaiLen.some((l) => l.ma === loaiChon) ? loaiChon : loaiTaiLen[0].ma;
  const soDaCo = bang.danhMuc.filter((d) => d.daCo).length;
  const tongDungLuong = ds.reduce((s, m) => s + (m.kichThuoc ?? 0), 0);
  const tuanNay = tuanCua(dot, homNayIso());
  const coTaiLenBatBuoc = bang.danhMuc.some((d) => d.nguon === 'TAI_LEN');

  // Bộ lọc giữ trong URL (?loai=&tuan=) để quay lại / gửi link vẫn đúng chỗ; lọc trên danh sách đã tải (#64 vẫn nhận
  // `type`, `week` cho Postman) để mỗi lựa chọn có số đếm.
  const locLoai = loc.get('loai') ?? '';
  const locTuan = loc.get('tuan') ?? '';
  const datLoc = (khoa: 'loai' | 'tuan', v: string) => setLoc((cu) => {
    const moi = new URLSearchParams(cu);
    if (v) moi.set(khoa, v); else moi.delete(khoa);
    return moi;
  }, { replace: true });
  const hopTuan = (m: MinhChung) => (locTuan === '' ? true : locTuan === 'khong' ? !m.tuan : m.tuan === Number(locTuan));
  const dsLoc = ds.filter((m) => (!locLoai || m.loaiMinhChung === locLoai) && hopTuan(m));
  const cacLoai = [...new Map(ds.map((m) => [m.loaiMinhChung, m.tenLoai])).entries()];
  const cacTuan = [...new Set(ds.map((m) => m.tuan).filter((t): t is number => !!t))].sort((a, b) => a - b);
  const demLoai = (ma: string) => ds.filter((m) => m.loaiMinhChung === ma && hopTuan(m)).length;
  const demTuan = (t: string) => ds.filter((m) => (!locLoai || m.loaiMinhChung === locLoai)
    && (t === 'khong' ? !m.tuan : m.tuan === Number(t))).length;

  const lenDanhSach = () => document.getElementById('mc-ds')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const xemTep = (ma: string) => {
    setLoc(new URLSearchParams({ loai: ma }), { replace: true });
    lenDanhSach();
  };
  const moTaiLen = (ma: string) => {
    setLoaiChon(ma);
    setThongBao(undefined);
    document.getElementById('mc-tai-len')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('mc-tep')?.focus({ preventScroll: true });
  };

  const daTai = (m: MinhChung, message?: string) => {
    setThongBao(`${message ?? 'Đã tải lên minh chứng'}: ${m.tenFile} (${m.tenLoai}${m.tuan ? `, tuần ${m.tuan}` : ''}).`);
    setLoiTaiVe(null);
    taiLai(hoSo.id).catch(setLoiTai);
  };

  const taiVe = async (m: MinhChung) => {
    setDangTaiVe(m.id);
    setLoiTaiVe(null);
    try {
      const { blob, tenTep } = await evidenceApi.taiVe(m.id, m.tenFile);
      luuTep(blob, tenTep);
    } catch (e) {
      setLoiTaiVe(e);
    } finally {
      setDangTaiVe(undefined);
    }
  };

  const moXoa = (m: MinhChung) => {
    setLoiXoa(null);
    setThongBao(undefined);
    setXoa(m);
  };
  const xacNhanXoa = async () => {
    if (!xoa) return;
    setDangXoa(true);
    setLoiXoa(null);
    try {
      const { message } = await evidenceApi.xoa(xoa.id);
      setThongBao(`${message ?? 'Đã xóa minh chứng'}: ${xoa.tenFile}.`);
      setXoa(null);
      await taiLai(hoSo.id);
    } catch (e) {
      setLoiXoa(e);
    } finally {
      setDangXoa(false);
    }
  };

  const huongDan = (() => {
    if (laSv) {
      if (taiLenDuoc) {
        return {
          loai: 'xanh-duong',
          noiDung: 'Chọn loại minh chứng, tuần liên quan (nếu có) rồi chọn tệp. Các mục "Hệ thống tự ghi nhận" được đối chiếu '
            + 'thẳng từ dữ liệu trên hệ thống — bạn không cần tải lại.',
        };
      }
      if (!DEN_HAN.includes(hoSo.trangThai) && hoSo.trangThai !== 'GIAN_DOAN') {
        return { loai: 'vang', noiDung: 'Bạn tải minh chứng được khi hồ sơ đã được GVHD phê duyệt (Đang thực tập) hoặc đang chờ đánh giá.' };
      }
      return { loai: 'vang', noiDung: 'Hồ sơ không còn ở giai đoạn thực tập / chờ đánh giá nên minh chứng chỉ còn để xem và tải về.' };
    }
    return { loai: 'xanh-duong', noiDung: 'Chỉ xem và tải về — sinh viên tự tải minh chứng lên.' };
  })();

  const trangThaiDong = (d: DongDoiChieu) => (d.daCo
    ? <span className="badge badge-xanh-la">✓ Đã có</span>
    : denHan ? <span className="badge badge-vang">Thiếu</span> : <span className="badge badge-xam">Chưa có</span>);

  const lienKet = (d: DongDoiChieu) => {
    const ht = HE_THONG[d.loaiMinhChung];
    if (!ht) return null;
    const den = laSv ? ht.menuSv : ht.con === undefined ? undefined : ht.con ? `/records/${hoSo.id}/${ht.con}` : `/records/${hoSo.id}`;
    return den ? <Link to={den} className="small nowrap">Mở →</Link> : null;
  };

  const xoaLaTepCuoi = xoa && bang.danhMuc.some((d) => d.loaiMinhChung === xoa.loaiMinhChung && d.nguon === 'TAI_LEN' && d.soTep === 1);

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <div className={`alert alert-${huongDan.loai} mb`}>{huongDan.noiDung}</div>
      {daKhoa && (
        <div className="alert alert-vang mb" role="status">
          Giáo vụ đã xác nhận kết quả học phần — các minh chứng đã nộp bị khóa, không xóa được (UC07 8a).
        </div>
      )}

      <div className="stat-row mb">
        <div className={`stat ${bang.du ? 'stat-xanh-la' : denHan ? 'stat-vang' : ''}`}>
          <b>{soDaCo}/{bang.danhMuc.length}</b><span>loại bắt buộc đã có</span>
        </div>
        <div className="stat"><b>{ds.length}</b><span>tệp đã tải lên{ds.length ? ` · ${dungLuong(tongDungLuong)}` : ''}</span></div>
        <div className="stat">
          <b className="stat-chu">{tuanNay < 1 ? 'Chưa bắt đầu' : tuanNay > dot.soTuan ? 'Đã kết thúc' : `Tuần ${tuanNay}/${dot.soTuan}`}</b>
          <span>đợt {dot.maDot}</span>
        </div>
      </div>

      <section className="card mb" aria-labelledby="mc-doi-chieu">
        <div className="card-head">
          <h2 id="mc-doi-chieu" className="section-title">
            Đối chiếu minh chứng bắt buộc
            <span className="muted"> — {NHAN_HINH_THUC_THUC_TAP[bang.hinhThucThucTap] ?? bang.hinhThucThucTap}</span>
          </h2>
          <span className={`badge ${bang.du ? 'badge-xanh-la' : denHan ? 'badge-vang' : 'badge-xam'}`}>
            {bang.du ? 'Đủ' : `${denHan ? 'Thiếu' : 'Chưa đủ'} ${bang.loaiConThieu.length}/${bang.danhMuc.length} loại`}
          </span>
        </div>
        <p className="muted small mt0">
          Danh mục theo hình thức thực tập (Điều 4). Đủ minh chứng bắt buộc là điều kiện (d) để công nhận hoàn thành học
          phần (Điều 15 khoản 3) — thiếu thì kết quả là Không đạt (CBR-16).
        </p>
        <div className="table-wrap">
          <table className="table table-giua mc-bang">
            <thead>
              <tr>
                <th>Minh chứng bắt buộc</th>
                <th>Cách ghi nhận</th>
                <th className="mc-tt">Trạng thái</th>
                {coTaiLenBatBuoc && <th className="mc-nut" aria-label="Thao tác" />}
              </tr>
            </thead>
            <tbody>
              {bang.danhMuc.map((d) => (
                <tr key={d.loaiMinhChung} className={!d.daCo && denHan ? 'mc-thieu' : undefined}>
                  <td><b>{d.tenHienThi}</b></td>
                  <td className="small">
                    {d.nguon === 'HE_THONG' ? (
                      <>Hệ thống tự ghi nhận {HE_THONG[d.loaiMinhChung]?.khi ?? ''} {lienKet(d)}</>
                    ) : (
                      <>{laSv ? 'Bạn tải lên' : 'Sinh viên tải lên'} · {d.soTep ? `${d.soTep} tệp` : 'chưa có tệp'}</>
                    )}
                  </td>
                  <td className="mc-tt">{trangThaiDong(d)}</td>
                  {coTaiLenBatBuoc && <td className="mc-nut">
                    {d.nguon === 'TAI_LEN' && (
                      <div className="mc-nut-nhom">
                        {d.soTep > 0 && (
                          <button type="button" className="btn btn-phu btn-nho" onClick={() => xemTep(d.loaiMinhChung)}>Xem tệp</button>
                        )}
                        {taiLenDuoc && (
                          <button type="button" className="btn btn-phu btn-nho" onClick={() => moTaiLen(d.loaiMinhChung)}>Tải lên</button>
                        )}
                      </div>
                    )}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!bang.du && (
          <p className={`hint${denHan ? ' hint-loi' : ''}`}>
            {denHan ? 'Còn thiếu' : 'Chưa có'}: {bang.loaiConThieu.join('; ')}.
            {!denHan && ' Nhiều mục chỉ có khi tới bước tương ứng (báo cáo, phiếu phản hồi…).'}
          </p>
        )}
      </section>

      {taiLenDuoc && (
        <EvidenceUploadForm hoSoId={hoSo.id} dot={dot} loai={loaiTaiLen} loaiChon={loaiDangChon}
                            onDoiLoai={setLoaiChon} onDaTai={daTai}
                            ghiChu={coTaiLenBatBuoc ? undefined
                              : 'Mọi minh chứng bắt buộc của hình thức này do hệ thống tự ghi nhận — chỉ tải lên "Minh chứng khác" khi cần bổ sung.'} />
      )}

      <section id="mc-ds" aria-labelledby="mc-ds-tieu-de">
        <div className="card-head">
          <h2 id="mc-ds-tieu-de" className="section-title">Tệp đã tải lên ({ds.length})</h2>
        </div>
        {ds.length > 0 && (
          <div className="toolbar">
            <label className="field field-inline">
              <span>Loại minh chứng</span>
              <select value={locLoai} onChange={(e) => datLoc('loai', e.target.value)}>
                <option value="">Tất cả loại</option>
                {cacLoai.map(([ma, ten]) => <option key={ma} value={ma}>{ten} ({demLoai(ma)})</option>)}
              </select>
            </label>
            <label className="field field-inline">
              <span>Tuần</span>
              <select value={locTuan} onChange={(e) => datLoc('tuan', e.target.value)}>
                <option value="">Tất cả tuần</option>
                {cacTuan.map((t) => <option key={t} value={t}>Tuần {t} ({demTuan(String(t))})</option>)}
                {ds.some((m) => !m.tuan) && <option value="khong">Không gắn tuần ({demTuan('khong')})</option>}
              </select>
            </label>
            {(locLoai || locTuan) && (
              <button type="button" className="btn btn-phu btn-nho" onClick={() => setLoc(new URLSearchParams(), { replace: true })}>
                Bỏ lọc
              </button>
            )}
          </div>
        )}
        <ErrorAlert error={loiTaiVe} />
        {ds.length === 0 ? (
          <div className="card empty">
            <div className="empty-title">Chưa có tệp minh chứng nào</div>
            <div className="muted">{taiLenDuoc ? 'Dùng mục "Tải lên minh chứng" ở trên.' : 'Sinh viên chưa tải lên tệp nào.'}</div>
          </div>
        ) : dsLoc.length === 0 ? (
          <div className="card empty"><div className="muted">Không có tệp nào khớp bộ lọc.</div></div>
        ) : (
          <div className={`table-wrap${loiTaiVe ? ' mt' : ''}`}>
            <table className="table table-giua mc-tep">
              <thead>
                <tr>
                  <th>Tệp</th>
                  <th>Loại minh chứng</th>
                  <th className="mc-tuan">Tuần</th>
                  <th className="mc-ngay">Tải lên lúc</th>
                  <th className="actions" aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {dsLoc.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="mc-ten">
                        <span className="mc-duoi" aria-hidden>{duoiTep(m.tenFile) || '?'}</span>
                        <span><b className="mc-ten-tep">{m.tenFile}</b><span className="muted small"> · {dungLuong(m.kichThuoc)}</span></span>
                      </div>
                    </td>
                    <td>{m.tenLoai}</td>
                    <td className="mc-tuan">
                      {m.tuan ? <>Tuần {m.tuan}<div className="muted small">{khoangTuan(dot, m.tuan)}</div></> : <span className="muted">—</span>}
                    </td>
                    <td className="mc-ngay">{ngayGio(m.ngayTaiLen)}</td>
                    <td className="actions">
                      <button type="button" className="btn btn-phu btn-nho" disabled={dangTaiVe === m.id} onClick={() => void taiVe(m)}>
                        {dangTaiVe === m.id ? 'Đang tải…' : 'Tải về'}
                      </button>
                      {taiLenDuoc && (m.daKhoa
                        ? <span className="badge badge-xam mc-khoa" title="Kết quả đã được giáo vụ xác nhận">Đã khóa</span>
                        : <button type="button" className="btn btn-phu btn-nho mc-xoa" onClick={() => moXoa(m)}>Xóa</button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        mo={!!xoa}
        tieuDe="Xóa minh chứng?"
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={() => void xacNhanXoa()}
        onHuy={() => setXoa(null)}
      >
        {xoa && (
          <>
            <p>
              Xóa tệp <b>{xoa.tenFile}</b> ({xoa.tenLoai}{xoa.tuan ? `, tuần ${xoa.tuan}` : ''}). Tệp bị xóa hẳn khỏi hệ
              thống, không khôi phục được.
            </p>
            {xoaLaTepCuoi && (
              <p className="text-vang">Đây là tệp duy nhất của loại "{xoa.tenLoai}" — xóa xong, mục này trong bảng đối chiếu thành chưa có.</p>
            )}
            <ErrorAlert error={loiXoa} />
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
