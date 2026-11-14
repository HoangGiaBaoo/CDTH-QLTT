import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { progressApi } from '../../api/progress';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import { homNayIso, khoangTuan, thu, tuanCua } from '../../utils/lich';
import type { NhatKy, TienDo } from '../../types/progress';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { Dot } from '../../types/term';

type Form = { congViecDuocGiao: string; ketQuaThucHien: string; phanTramHoanThanh: string };
type Hoi = { loai: 'XAC_NHAN' | 'BO_SUNG'; dong: TienDo };

/** Trạng thái hiển thị của một dòng — suy từ dữ liệu #61, không phải enum backend. */
type TrangThaiDong = 'DA_XAC_NHAN' | 'CAN_BO_SUNG' | 'CHO_XAC_NHAN' | 'CHUA_DU' | 'CHUA_CAP_NHAT';
const NHAN_DONG: Record<TrangThaiDong, { nhan: string; mau: string }> = {
  DA_XAC_NHAN: { nhan: 'Đã xác nhận', mau: 'xanh-la' },
  CAN_BO_SUNG: { nhan: 'Cần bổ sung', mau: 'do' },
  CHO_XAC_NHAN: { nhan: 'Chờ xác nhận', mau: 'vang' },
  CHUA_DU: { nhan: 'Chưa đủ nội dung', mau: 'xam' },
  CHUA_CAP_NHAT: { nhan: 'Chưa cập nhật', mau: 'xam' },
};

const coChu = (s?: string) => !!s && !!s.trim();
const co = (p?: number) => p !== undefined && p !== null;
/** Cùng điều kiện backend kiểm trước khi cho cán bộ xác nhận (#63): đủ ba nội dung. */
const duNoiDung = (t: TienDo) => coChu(t.congViecDuocGiao) && coChu(t.ketQuaThucHien) && co(t.phanTramHoanThanh);
const trangThaiDong = (t: TienDo): TrangThaiDong => {
  if (t.daXacNhan) return 'DA_XAC_NHAN';
  if (t.yeuCauBoSung) return 'CAN_BO_SUNG';
  if (duNoiDung(t)) return 'CHO_XAC_NHAN';
  return coChu(t.congViecDuocGiao) || coChu(t.ketQuaThucHien) || co(t.phanTramHoanThanh) ? 'CHUA_DU' : 'CHUA_CAP_NHAT';
};
const tuDong = (t: TienDo): Form => ({
  congViecDuocGiao: t.congViecDuocGiao ?? '',
  ketQuaThucHien: t.ketQuaThucHien ?? '',
  phanTramHoanThanh: co(t.phanTramHoanThanh) ? String(t.phanTramHoanThanh) : '',
});
const sangReq = (f: Form) => ({
  congViecDuocGiao: f.congViecDuocGiao.trim() || undefined,
  ketQuaThucHien: f.ketQuaThucHien.trim() || undefined,
  phanTramHoanThanh: f.phanTramHoanThanh === '' ? undefined : Number(f.phanTramHoanThanh),
});
const soGio = (n: NhatKy) => (n.soGio === undefined || n.soGio === null || n.soGio === '' ? 0 : Number(n.soGio));
const hienGio = (x: number) => x.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const loiO = (e: unknown, truong: string) => (e instanceof ApiError ? e.loiTruong(truong) : undefined);
const TRUOC_THUC_TAP: TrangThaiHoSo[] = ['NHAP', 'CHO_DVHD', 'CHO_GVHD', 'TU_CHOI'];

/** `/records/:recordId/weekly_progress` — đích NT-08 (SV) và lối từ ô Tiến độ của SCR-12 (cán bộ, GV, giáo vụ). */
export function WeeklyProgressRoute() {
  const id = Number(useParams().recordId);
  return <WeeklyProgressPage key={id} recordId={id} />;
}

/**
 * SCR-16 — Tiến độ tuần TTTN-03 (UC07, #61–#63). Sinh viên cập nhật dòng tuần chưa được xác nhận (#62); cán bộ ĐVHD
 * của hồ sơ xem nhật ký của tuần ngay trên dòng (#57) rồi Xác nhận — khóa dòng — hoặc Yêu cầu bổ sung (#63, UC07 6a);
 * GVHD, giáo vụ chỉ xem. `recordId` trống ⇒ hồ sơ của SV đang đăng nhập (#40). Quy tắc do backend kiểm.
 */
export default function WeeklyProgressPage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [ds, setDs] = useState<TienDo[] | null>(null);
  const [nhatKy, setNhatKy] = useState<NhatKy[]>([]);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [mo, setMo] = useState<Set<number>>(new Set());
  const [sua, setSua] = useState<{ id: number; f: Form } | null>(null);
  const [loiSua, setLoiSua] = useState<unknown>(null);
  const [hoi, setHoi] = useState<Hoi | null>(null);
  const [noiDungBoSung, setNoiDungBoSung] = useState('');
  const [loiHoi, setLoiHoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState<string>();

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';
  const laCanBo = nguoiDung?.vaiTro === 'CAN_BO_DVHD' && hoSo?.canBoDvhd?.nguoiDungId === nguoiDung.id;

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = recordId ? await recordApi.chiTiet(recordId) : await recordApi.cuaToi();
      const [d, t, n] = await Promise.all([termApi.chiTiet(h.dot.id), progressApi.tienDo(h.id), progressApi.nhatKy(h.id)]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      setDs(t);
      setNhatKy(n);
      // Cán bộ của hồ sơ mở sẵn nhật ký những tuần đang chờ mình xem (UC07 bước 6).
      const laCanBoHoSo = nguoiDung?.vaiTro === 'CAN_BO_DVHD' && h.canBoDvhd?.nguoiDungId === nguoiDung.id;
      if (laCanBoHoSo) setMo(new Set(t.filter((x) => !x.daXacNhan && duNoiDung(x)).map((x) => x.tuan)));
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [recordId, nguoiDung]);

  /** Nhật ký nhóm theo tuần của đợt (tuần 1 bắt đầu từ ngày bắt đầu đợt, như SCR-15), cũ trước. */
  const nhatKyTheoTuan = useMemo(() => {
    const m = new Map<number, NhatKy[]>();
    if (!dot) return m;
    [...nhatKy].sort((a, b) => a.ngay.localeCompare(b.ngay))
      .forEach((n) => { const t = tuanCua(dot, n.ngay); m.set(t, [...(m.get(t) ?? []), n]); });
    return m;
  }, [nhatKy, dot]);

  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;
  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">Tiến độ tuần TTTN-03</h1>
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
            <div className="muted">Bảng tiến độ được tạo khi hồ sơ đã được GVHD phê duyệt và chuyển sang Đang thực tập.</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || !ds) return <div>{tieuDe}<Loading /></div>;

  if (ds.length === 0) {
    return (
      <div>
        {tieuDe}
        <div className="card empty">
          <div className="empty-title">Chưa có bảng tiến độ</div>
          <div className="muted">
            {TRUOC_THUC_TAP.includes(hoSo.trangThai)
              ? 'Bảng tiến độ đủ số tuần của đợt được tạo khi GVHD phê duyệt hồ sơ.'
              : 'Hồ sơ này không có dòng tiến độ nào.'}
          </div>
        </div>
      </div>
    );
  }

  const suaDuoc = laSv && hoSo.trangThai === 'DANG_THUC_TAP';
  const coCot = suaDuoc || laCanBo;
  const soCot = coCot ? 6 : 5;
  const tuanNay = tuanCua(dot, homNayIso());
  const dem = (tt: TrangThaiDong) => ds.filter((t) => trangThaiDong(t) === tt).length;
  const daXacNhan = dem('DA_XAC_NHAN');
  const choXacNhan = dem('CHO_XAC_NHAN');
  const canBoSung = ds.filter((t) => trangThaiDong(t) === 'CAN_BO_SUNG');

  const thayDong = (moi: TienDo) => setDs((cu) => (cu ?? []).map((t) => (t.id === moi.id ? moi : t)));
  const doiMo = (tuan: number) => setMo((cu) => {
    const s = new Set(cu);
    if (s.has(tuan)) s.delete(tuan); else s.add(tuan);
    return s;
  });

  const moSua = (t: TienDo) => {
    setLoiSua(null);
    setThongBao(undefined);
    setSua({ id: t.id, f: tuDong(t) });
  };
  const doiSua = (truong: keyof Form, v: string) => setSua((s) => (s ? { ...s, f: { ...s.f, [truong]: v } } : s));
  const luuSua = async () => {
    if (!sua) return;
    setDangGui(true);
    setLoiSua(null);
    try {
      const { data, message } = await progressApi.capNhatTienDo(sua.id, sangReq(sua.f));
      thayDong(data);
      setSua(null);
      setThongBao(data.yeuCauBoSung ? `${message}. Cán bộ ĐVHD sẽ xem lại tuần ${data.tuan}.` : message);
    } catch (e) {
      setLoiSua(e);
    } finally {
      setDangGui(false);
    }
  };

  const moHoi = (loai: Hoi['loai'], dong: TienDo) => {
    setLoiHoi(null);
    setNoiDungBoSung('');
    setThongBao(undefined);
    setHoi({ loai, dong });
  };
  const guiHoi = async () => {
    if (!hoi) return;
    setDangGui(true);
    setLoiHoi(null);
    try {
      const { data, message } = await progressApi.xacNhanTuan(hoi.dong.id, hoi.loai === 'XAC_NHAN'
        ? { dongY: true }
        : { dongY: false, yeuCauBoSung: noiDungBoSung.trim() });
      thayDong(data);
      setHoi(null);
      setThongBao(`${message} — tuần ${data.tuan}.`);
      if (data.daXacNhan) setMo((cu) => { const s = new Set(cu); s.delete(data.tuan); return s; });
    } catch (e) {
      setLoiHoi(e);
    } finally {
      setDangGui(false);
    }
  };

  const huongDan = (() => {
    if (laSv) {
      if (suaDuoc) {
        return {
          loai: 'xanh-duong',
          noiDung: 'Cuối mỗi tuần, cập nhật công việc được giao, kết quả thực hiện và phần trăm hoàn thành (0–100). '
            + 'Cán bộ ĐVHD xem nhật ký của tuần rồi xác nhận; dòng đã xác nhận bị khóa.',
        };
      }
      return { loai: 'vang', noiDung: 'Hồ sơ không ở trạng thái Đang thực tập nên bảng tiến độ chỉ còn để xem.' };
    }
    if (laCanBo) {
      return {
        loai: 'xanh-duong',
        noiDung: 'Đối chiếu nhật ký của tuần với nội dung sinh viên cập nhật, rồi Xác nhận (khóa dòng) hoặc Yêu cầu '
          + 'bổ sung kèm nội dung — sinh viên nhận thông báo và cập nhật lại.',
      };
    }
    return { loai: 'xanh-duong', noiDung: 'Chỉ xem — cán bộ ĐVHD của hồ sơ xác nhận từng tuần.' };
  })();

  const xemNhatKy = (tuan: number) => {
    const cacNgay = nhatKyTheoTuan.get(tuan) ?? [];
    if (cacNgay.length === 0) return <div className="muted small">Không có nhật ký nào trong tuần này.</div>;
    return (
      <ul className="td-nk" aria-label={`Nhật ký tuần ${tuan}`}>
        <li className="td-nk-tong muted">
          Nhật ký tuần {tuan}: {cacNgay.length} ngày · {hienGio(cacNgay.reduce((s, n) => s + soGio(n), 0))} giờ
        </li>
        {cacNgay.map((n) => (
          <li key={n.id}>
            <span className="td-nk-ngay"><b>{thu(n.ngay)}</b> {ngay(n.ngay).slice(0, 5)}</span>
            <span className="td-nk-gio">{soGio(n) ? `${hienGio(soGio(n))} giờ` : '—'}</span>
            <span className="pre-line">
              {n.noiDung}
              {n.ketQua && <span className="muted"> — {n.ketQua}</span>}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const hoiDong = hoi?.dong;
  const dangNhapBoSung = hoi?.loai === 'BO_SUNG';

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <div className={`alert alert-${huongDan.loai} mb`}>{huongDan.noiDung}</div>
      {laSv && canBoSung.length > 0 && (
        <div className="alert alert-vang mb" role="status">
          Cán bộ ĐVHD yêu cầu bổ sung {canBoSung.map((t) => `tuần ${t.tuan}`).join(', ')} — xem nội dung trên từng dòng
          {suaDuoc ? ' và cập nhật lại.' : '.'}
        </div>
      )}
      {laCanBo && choXacNhan > 0 && (
        <div className="alert alert-vang mb" role="status">{choXacNhan} tuần đã cập nhật đủ, chờ bạn xác nhận.</div>
      )}

      <div className="stat-row mb">
        <div className="stat stat-xanh-la"><b>{daXacNhan}/{ds.length}</b><span>tuần đã xác nhận</span></div>
        <div className="stat stat-vang"><b>{choXacNhan}</b><span>tuần chờ xác nhận</span></div>
        <div className="stat"><b>{canBoSung.length}</b><span>tuần cần bổ sung</span></div>
        <div className="stat">
          <b className="stat-chu">{tuanNay < 1 ? 'Chưa bắt đầu' : tuanNay > dot.soTuan ? 'Đã kết thúc' : `Tuần ${tuanNay}/${dot.soTuan}`}</b>
          <span>đợt {ngay(dot.ngayBatDau)} – {ngay(dot.ngayKetThuc)}</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table tien-do">
          <thead>
            <tr>
              <th className="td-tuan">Tuần</th>
              <th>Công việc được giao</th>
              <th>Kết quả thực hiện</th>
              <th className="td-pt">Hoàn thành</th>
              <th className="td-xn">Xác nhận ĐVHD</th>
              {coCot && <th className="td-tt" aria-label="Thao tác" />}
            </tr>
          </thead>
          <tbody>
            {ds.map((t) => {
              const tt = trangThaiDong(t);
              const cacNgay = nhatKyTheoTuan.get(t.tuan) ?? [];
              const dangMo = mo.has(t.tuan);
              const dangSua = sua?.id === t.id;
              return (
                <Fragment key={t.id}>
                  <tr id={`td-${t.tuan}`} className={dangSua ? 'td-dang-sua' : tt === 'CAN_BO_SUNG' ? 'td-bo-sung' : undefined}>
                    <td className="td-tuan">
                      <b>Tuần {t.tuan}</b>
                      <div className="muted small">{khoangTuan(dot, t.tuan)}</div>
                      {t.tuan === tuanNay && <div className="small text-xanh-duong">Tuần hiện tại</div>}
                      <button type="button" className="link-btn small td-mo" aria-expanded={dangMo} onClick={() => doiMo(t.tuan)}>
                        {cacNgay.length ? `Nhật ký (${cacNgay.length} ngày)` : 'Nhật ký: chưa có'} {dangMo ? '▴' : '▾'}
                      </button>
                    </td>
                    {dangSua ? (
                      <>
                        <td>
                          <textarea className={`textarea${loiO(loiSua, 'congViecDuocGiao') ? ' input-loi' : ''}`} rows={4} maxLength={5000}
                                    aria-label={`Công việc được giao tuần ${t.tuan}`} value={sua.f.congViecDuocGiao}
                                    onChange={(e) => doiSua('congViecDuocGiao', e.target.value)} />
                          {loiO(loiSua, 'congViecDuocGiao') && <small className="field-error">{loiO(loiSua, 'congViecDuocGiao')}</small>}
                        </td>
                        <td>
                          <textarea className={`textarea${loiO(loiSua, 'ketQuaThucHien') ? ' input-loi' : ''}`} rows={4} maxLength={5000}
                                    aria-label={`Kết quả thực hiện tuần ${t.tuan}`} value={sua.f.ketQuaThucHien}
                                    onChange={(e) => doiSua('ketQuaThucHien', e.target.value)} />
                          {loiO(loiSua, 'ketQuaThucHien') && <small className="field-error">{loiO(loiSua, 'ketQuaThucHien')}</small>}
                        </td>
                        <td className="td-pt">
                          <div className="td-pt-nhap">
                            <input type="number" min={0} max={100} step={1} inputMode="numeric"
                                   className={`input-so${loiO(loiSua, 'phanTramHoanThanh') ? ' input-loi' : ''}`}
                                   aria-label={`Phần trăm hoàn thành tuần ${t.tuan}`} value={sua.f.phanTramHoanThanh}
                                   onChange={(e) => doiSua('phanTramHoanThanh', e.target.value)} />
                            <span>%</span>
                          </div>
                          {loiO(loiSua, 'phanTramHoanThanh') && <small className="field-error">{loiO(loiSua, 'phanTramHoanThanh')}</small>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="pre-line">{t.congViecDuocGiao ?? <span className="muted">—</span>}</td>
                        <td className="pre-line">{t.ketQuaThucHien ?? <span className="muted">—</span>}</td>
                        <td className="td-pt">
                          {co(t.phanTramHoanThanh) ? (
                            <>
                              <b>{t.phanTramHoanThanh}%</b>
                              <div className="meter-ray" role="img" aria-label={`Hoàn thành ${t.phanTramHoanThanh}%`}>
                                <div className="meter-dat" style={{ width: `${Math.min(100, Math.max(0, t.phanTramHoanThanh!))}%` }} />
                              </div>
                            </>
                          ) : <span className="muted">—</span>}
                        </td>
                      </>
                    )}
                    <td className="td-xn">
                      <span className={`badge badge-${NHAN_DONG[tt].mau}`}>{NHAN_DONG[tt].nhan}</span>
                      {t.daXacNhan && <div className="muted small">{ngayGio(t.ngayXacNhan)}</div>}
                    </td>
                    {coCot && (
                      <td className="td-tt">
                        {t.daXacNhan ? (
                          <span className="muted small" title="Dòng đã được cán bộ ĐVHD xác nhận">Đã khóa</span>
                        ) : suaDuoc ? (
                          dangSua ? (
                            <div className="nk-nut">
                              <button type="button" className="btn btn-chinh btn-nho" disabled={dangGui} onClick={() => void luuSua()}>
                                {dangGui ? 'Đang lưu…' : 'Lưu'}
                              </button>
                              <button type="button" className="btn btn-phu btn-nho" disabled={dangGui} onClick={() => setSua(null)}>Hủy</button>
                            </div>
                          ) : (
                            <button type="button" className="btn btn-phu btn-nho" disabled={dangGui} onClick={() => moSua(t)}>
                              {tt === 'CHUA_CAP_NHAT' ? 'Cập nhật' : 'Sửa'}
                            </button>
                          )
                        ) : laCanBo ? (
                          <div className="nk-nut">
                            <button type="button" className="btn btn-chinh btn-nho" disabled={dangGui} onClick={() => moHoi('XAC_NHAN', t)}>Xác nhận</button>
                            <button type="button" className="btn btn-phu btn-nho" disabled={dangGui} onClick={() => moHoi('BO_SUNG', t)}>Yêu cầu bổ sung</button>
                          </div>
                        ) : null}
                      </td>
                    )}
                  </tr>
                  {t.yeuCauBoSung && !t.daXacNhan && (
                    <tr className="td-phu td-bo-sung">
                      <td />
                      <td colSpan={soCot - 1}>
                        <div className="td-yeu-cau"><b>Cán bộ ĐVHD yêu cầu bổ sung:</b> <span className="pre-line">{t.yeuCauBoSung}</span></div>
                      </td>
                    </tr>
                  )}
                  {dangSua && loiSua !== null && (
                    <tr className="td-phu td-dang-sua"><td colSpan={soCot}><ErrorAlert error={loiSua} /></td></tr>
                  )}
                  {dangMo && (
                    <tr className="td-phu">
                      <td />
                      <td colSpan={soCot - 1}>{xemNhatKy(t.tuan)}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        mo={hoi?.loai === 'XAC_NHAN'}
        tieuDe={`Xác nhận tiến độ tuần ${hoiDong?.tuan ?? ''}?`}
        nhanXacNhan="Xác nhận"
        dangXuLy={dangGui}
        onXacNhan={() => void guiHoi()}
        onHuy={() => setHoi(null)}
      >
        {hoiDong && (
          <>
            <p>
              Bạn xác nhận tiến độ tuần {hoiDong.tuan} ({khoangTuan(dot, hoiDong.tuan)}) của <b>{hoSo.sinhVien.hoTen}</b>
              {co(hoiDong.phanTramHoanThanh) && <> — hoàn thành {hoiDong.phanTramHoanThanh}%</>}. Dòng sẽ bị khóa, sinh
              viên không sửa được nữa.
            </p>
            {!duNoiDung(hoiDong) && (
              <p className="text-vang">Sinh viên chưa điền đủ công việc, kết quả và phần trăm hoàn thành — hệ thống sẽ không nhận.</p>
            )}
            <ErrorAlert error={loiHoi} />
          </>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        mo={dangNhapBoSung}
        tieuDe={`Yêu cầu bổ sung tiến độ tuần ${hoiDong?.tuan ?? ''}`}
        nhanXacNhan="Gửi yêu cầu"
        dangXuLy={dangGui}
        khoaXacNhan={!noiDungBoSung.trim()}
        tuFocusNut={false}
        onXacNhan={() => void guiHoi()}
        onHuy={() => setHoi(null)}
      >
        {hoiDong && (
          <>
            <p>Sinh viên nhận thông báo kèm nội dung dưới đây và cập nhật lại dòng tuần {hoiDong.tuan}.</p>
            {hoiDong.yeuCauBoSung && <p className="muted small">Yêu cầu trước: {hoiDong.yeuCauBoSung}</p>}
            <label className="field">
              <span>Nội dung cần bổ sung *</span>
              <textarea className="textarea" rows={4} maxLength={500} autoFocus value={noiDungBoSung}
                        onChange={(e) => setNoiDungBoSung(e.target.value)} />
              <small className="muted">{noiDungBoSung.length}/500 ký tự</small>
            </label>
            <ErrorAlert error={loiHoi} />
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
