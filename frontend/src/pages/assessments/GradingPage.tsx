import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { assessmentApi } from '../../api/assessments';
import { ApiError } from '../../api/client';
import { termApi } from '../../api/terms';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import RubricLevelPicker, { moTaKhoang, thuocKhoang } from '../../components/RubricLevelPicker';
import StatusBadge from '../../components/StatusBadge';
import {
  NHAN_CHUONG_TRINH, NHAN_HINH_THUC_THUC_TAP, NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_CHANG, NHAN_TRANG_THAI_HO_SO,
  NHAN_TRANG_THAI_PHIEU,
} from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { BieuMau, CauHoiBieuMau, Phieu, PhieuRequest } from '../../types/assessment';
import type { CauHoi } from '../../types/term';

interface O { muc?: number; diem: string; nhanXet: string }

/** "7,5" hoặc "7.5" ⇒ 7.5; rỗng / sai định dạng / quá 2 chữ số thập phân ⇒ NaN. */
function docDiem(s: string): number {
  const t = s.trim().replace(',', '.');
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(t)) return NaN;
  const n = Number(t);
  return n >= 0 && n <= 10 ? n : NaN;
}

function vietDiem(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 2, useGrouping: false });
}

/** Lỗi của một dòng CLO theo đúng điều kiện nộp phiếu (UC08 8a, CBR-10) — chỉ để tô đỏ, backend kiểm lại. */
function loiDong(q: CauHoiBieuMau, o: O | undefined): string | null {
  if (!o || o.muc === undefined) return 'Chưa chọn mức đạt';
  const d = docDiem(o.diem);
  if (Number.isNaN(d)) return 'Điểm từ 0 đến 10, tối đa hai chữ số thập phân';
  const m = q.cacMuc.find((x) => x.muc === o.muc);
  const cao = Math.max(...q.cacMuc.map((x) => x.muc));
  if (m && !thuocKhoang(d, m, cao)) return `Điểm của Mức ${m.muc} phải ${moTaKhoang(m, cao)} (Điều 13 khoản 2)`;
  return null;
}

/**
 * SCR-18 (chặng 1, TTTN-04) và SCR-20 (chặng 2, TTTN-05) — chấm một sinh viên theo rubric (UC08, UC09, #70–#74).
 * Không hiển thị bất cứ gì của người chấm khác (BR-08.7).
 */
export default function GradingPage() {
  const [params] = useSearchParams();
  const recordId = Number(params.get('recordId'));
  const stage = Number(params.get('stage'));

  const [bm, setBm] = useState<BieuMau | null>(null);
  const [phieu, setPhieu] = useState<Phieu | null>(null);
  const [cauChang, setCauChang] = useState<CauHoi[]>([]);
  const [o, setO] = useState<Record<string, O>>({});
  const [nhanXetChung, setNhanXetChung] = useState('');
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [daThuNop, setDaThuNop] = useState(false);
  const [hoiNop, setHoiNop] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [doi, setDoi] = useState(false);

  const napPhieu = (p: Phieu | null) => {
    setPhieu(p);
    setNhanXetChung(p?.nhanXetChung ?? '');
    setO(Object.fromEntries((p?.diemClos ?? []).map((d) => [d.maClo, { muc: d.mucDat, diem: vietDiem(d.diem), nhanXet: d.nhanXet ?? '' }])));
    setDoi(false);
  };

  /** `conHieuLuc` = false khi đã rời trang / tải lại: bỏ kết quả cũ để không ghi đè chữ người chấm vừa sửa. */
  const tai = useCallback(async (conHieuLuc: () => boolean = () => true) => {
    setLoiTai(null);
    try {
      const b = await assessmentApi.bieuMau(recordId, stage);
      const p = b.phieuId ? await assessmentApi.chiTiet(b.phieuId) : null;
      if (!conHieuLuc()) return;
      // Đặt biểu mẫu và nháp cùng lúc: hiện form trước khi nháp về thì chữ người chấm gõ sẽ bị nháp ghi đè.
      napPhieu(p);
      setBm(b);
      // Câu hỏi đầy đủ của chặng — để hiện dòng CLO không thuộc phạm vi chấm của nhóm (CLO7 với ĐVHD, CBR-09).
      const chang = (await termApi.danhSachChang(b.hoSo.dot.id)).find((c) => c.thuTu === stage);
      const cau = chang ? await termApi.danhSachCauHoi(chang.id) : [];
      if (conHieuLuc()) setCauChang(cau);
    } catch (e) {
      if (conHieuLuc()) setLoiTai(e);
    }
  }, [recordId, stage]);

  useEffect(() => {
    let conHieuLuc = true;
    void tai(() => conHieuLuc);
    return () => { conHieuLuc = false; };
  }, [tai]);

  // Rời trang khi còn thay đổi chưa lưu ⇒ trình duyệt hỏi lại.
  useEffect(() => {
    if (!doi) return;
    const chan = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', chan);
    return () => window.removeEventListener('beforeunload', chan);
  }, [doi]);

  const cauHois = useMemo(() => [...(bm?.cauHois ?? [])].sort((a, b) => a.thuTu - b.thuTu), [bm]);
  const ngoaiPhamVi = useMemo(() => {
    const coTrongPhieu = new Set(cauHois.map((q) => q.maClo));
    return cauChang.filter((q) => !coTrongPhieu.has(q.maClo)).sort((a, b) => a.thuTu - b.thuTu);
  }, [cauChang, cauHois]);

  if (!recordId || !stage) return <ErrorAlert error={new ApiError('VALIDATION_ERROR', 'Thiếu hồ sơ hoặc chặng cần chấm')} />;
  if (loiTai) {
    return (
      <div>
        <Link to="/assessments" className="back-link">← Danh sách chấm</Link>
        <ErrorAlert error={loiTai} />
      </div>
    );
  }
  if (!bm) return <Loading />;

  const changMo = bm.trangThaiChang === 'DANG_MO';
  // Nháp chỉ sửa khi chặng còn mở; phiếu được giáo vụ mở lại thì sửa được kể cả khi chặng đã đóng (#73).
  const suaDuoc = phieu?.trangThai === 'MO_LAI' || (changMo && phieu?.trangThai !== 'DA_NOP');
  const hs = bm.hoSo;
  const loiTungDong = Object.fromEntries(cauHois.map((q) => [q.maClo, loiDong(q, o[q.maClo])]));
  const soXong = cauHois.filter((q) => !loiTungDong[q.maClo]).length;
  const thieuNhanXet = !nhanXetChung.trim();
  const hopLeDeNop = soXong === cauHois.length && !thieuNhanXet;

  const dat = (ma: string, gt: Partial<O>) => {
    setO((x) => ({ ...x, [ma]: { ...(x[ma] ?? { diem: '', nhanXet: '' }), ...gt } }));
    setDoi(true);
    setThongBao(undefined);
  };

  const chonMuc = (q: CauHoiBieuMau, muc: number) => {
    const m = q.cacMuc.find((x) => x.muc === muc);
    // UC08 bước 5: chọn mức ⇒ điền sẵn điểm giữa khoảng, người chấm chỉnh trong khoảng.
    dat(q.maClo, { muc, diem: m ? vietDiem(m.diemGoiY) : '' });
  };

  /** Nháp gửi mọi dòng đã chọn mức và có điểm 0–10 hợp lệ; dòng chưa xong để trống (backend xóa khỏi nháp). */
  const yeuCau = (): PhieuRequest => ({
    nhanXetChung: nhanXetChung.trim() || undefined,
    diemClos: cauHois.flatMap((q) => {
      const x = o[q.maClo];
      const d = x ? docDiem(x.diem) : NaN;
      return x?.muc !== undefined && !Number.isNaN(d)
        ? [{ maClo: q.maClo, mucDat: x.muc, diem: d, nhanXet: x.nhanXet.trim() || undefined }]
        : [];
    }),
  });

  const luu = async (): Promise<Phieu> => {
    const req = yeuCau();
    const { data, message } = phieu
      ? await assessmentApi.capNhat(phieu.id, req)
      : await assessmentApi.tao({ ...req, hoSoId: recordId, chang: stage });
    napPhieu(data);
    setThongBao(message);
    return data;
  };

  const chay = async (lam: () => Promise<void>) => {
    setLoi(null);
    setDangGui(true);
    try {
      await lam();
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
      setHoiNop(false);
    }
  };

  const nop = () => chay(async () => {
    const p = await luu();
    const { data, message } = await assessmentApi.nop(p.id);
    napPhieu(data);
    setThongBao(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const bamNop = () => {
    setDaThuNop(true);
    if (hopLeDeNop) setHoiNop(true);
  };

  const scr = stage === 1 ? 'SCR-18 · TTTN-04' : 'SCR-20 · TTTN-05';
  const tenNhom = NHAN_NHOM_NGUOI_CHAM[bm.nhom];

  return (
    <div className="grading">
      <Link to="/assessments" className="back-link">← Danh sách chấm</Link>
      <div className="page-head">
        <h1 className="page-title">
          Phiếu đánh giá — {hs.sinhVien.hoTen}
          <StatusBadge value={phieu?.trangThai ?? 'NHAP'} labels={phieu ? NHAN_TRANG_THAI_PHIEU : { NHAP: 'Chưa có phiếu' }} />
        </h1>
        <span className="muted small">{scr}</span>
      </div>

      {/* Hồ sơ tóm tắt */}
      <div className="card mb">
        <div className="info-grid">
          <div><span className="muted">Sinh viên</span>{hs.sinhVien.maSv} · {hs.sinhVien.hoTen}</div>
          <div><span className="muted">Lớp · Chương trình</span>{hs.sinhVien.lop ?? '—'} · {NHAN_CHUONG_TRINH[hs.sinhVien.chuongTrinhDaoTao]}</div>
          <div><span className="muted">Hình thức</span>{NHAN_HINH_THUC_THUC_TAP[hs.hinhThucThucTap] ?? hs.hinhThucThucTap}</div>
          <div><span className="muted">Đơn vị hướng dẫn</span>{hs.donVi?.ten ?? '—'}</div>
          <div><span className="muted">Đề tài / nhiệm vụ</span>{hs.deTai ?? '—'}</div>
          <div><span className="muted">GVHD · Cán bộ ĐVHD</span>{hs.gvhd?.hoTen ?? '—'} · {hs.canBoDvhd?.hoTen ?? '—'}</div>
          <div><span className="muted">Trạng thái hồ sơ</span><StatusBadge value={hs.trangThai} labels={NHAN_TRANG_THAI_HO_SO} /></div>
          <div>
            <span className="muted">{bm.tenChang}</span>
            <span><StatusBadge value={bm.trangThaiChang} labels={NHAN_TRANG_THAI_CHANG} /> {bm.ngayMo && <>từ {ngay(bm.ngayMo)}</>}</span>
          </div>
          <div><span className="muted">Bạn chấm với tư cách</span><b>{tenNhom}</b></div>
        </div>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      {phieu?.trangThai === 'MO_LAI' && (
        <div className="alert alert-vang mb">
          Giáo vụ đã mở lại phiếu{phieu.lyDoMoLai && <> — lý do: <b>{phieu.lyDoMoLai}</b></>}. Sửa rồi nộp lại; hệ thống sẽ tính lại
          điểm và ghi nhật ký (CBR-12).
        </div>
      )}
      {phieu?.trangThai === 'DA_NOP' && (
        <div className="alert alert-xanh mb">
          Phiếu đã nộp lúc {ngayGio(phieu.ngayNop)} và bị khóa. Cần sửa thì đề nghị giáo vụ mở lại phiếu (CBR-12).
        </div>
      )}
      {!suaDuoc && phieu?.trangThai !== 'DA_NOP' && (
        <div className="alert alert-vang mb">
          {bm.tenChang} {bm.trangThaiChang === 'CHUA_MO' ? `chưa mở${bm.ngayMo ? ` (mở từ ${ngay(bm.ngayMo)})` : ''}` : 'đã đóng'} —
          chưa nhập được phiếu.
        </div>
      )}
      {suaDuoc && stage === 2 && hs.trangThai !== 'CHO_DANH_GIA' && (
        <div className="alert alert-vang mb">
          Sinh viên chưa có báo cáo TTTN-06 được ĐVHD và GVHD xác nhận nên chưa chấm được chặng cuối kỳ (Điều 10 khoản 2).
        </div>
      )}
      <ErrorAlert error={loi} />

      {/* Từng CLO */}
      <div className="clo-list">
        {cauHois.map((q) => {
          const x = o[q.maClo];
          const loiQ = loiTungDong[q.maClo];
          const doDo = suaDuoc && daThuNop && !!loiQ;
          const saiKhoang = suaDuoc && x?.muc !== undefined && !!loiQ && x.diem.trim() !== '';
          return (
            <div key={q.maClo} className={`card clo-row ${doDo ? 'clo-row-loi' : ''}`}>
              <div className="clo-head">
                <div>
                  <div className="clo-ma">Câu {q.thuTu} · {q.maClo}{!q.noiDung.includes(q.tenClo) && <> — {q.tenClo}</>}</div>
                  <div className="clo-cauhoi">{q.noiDung}</div>
                </div>
                {!loiQ && <span className="badge badge-xanh-la">Đã chấm</span>}
              </div>
              <RubricLevelPicker cacMuc={q.cacMuc} value={x?.muc} disabled={!suaDuoc} nhan={q.maClo}
                                 onChange={(m) => chonMuc(q, m)} />
              <div className="clo-nhap">
                <label className="field field-diem">
                  <span>Điểm (thang 10)</span>
                  <input inputMode="decimal" value={x?.diem ?? ''} disabled={!suaDuoc || x?.muc === undefined}
                         className={saiKhoang || doDo ? 'input-loi' : undefined}
                         placeholder={x?.muc === undefined ? 'Chọn mức trước' : undefined}
                         onChange={(e) => dat(q.maClo, { diem: e.target.value })} aria-label={`Điểm ${q.maClo}`} />
                </label>
                <label className="field field-nhanxet">
                  <span>Nhận xét {q.maClo} (không bắt buộc)</span>
                  <input value={x?.nhanXet ?? ''} disabled={!suaDuoc} maxLength={500}
                         onChange={(e) => dat(q.maClo, { nhanXet: e.target.value })} />
                </label>
              </div>
              {(saiKhoang || doDo) && <div className="field-error small">{loiQ}</div>}
            </div>
          );
        })}

        {ngoaiPhamVi.map((q) => (
          <div key={q.id} className="card clo-row clo-row-tat">
            <div className="clo-ma">Câu {q.thuTu} · {q.maClo}{!q.noiDung.includes(q.tenClo) && <> — {q.tenClo}</>}</div>
            <div className="clo-cauhoi">{q.noiDung}</div>
            <div className="muted small">
              Không thuộc phạm vi chấm của {tenNhom.charAt(0).toLowerCase() + tenNhom.slice(1)} — tỷ lệ đồng chấm của nhóm bằng 0 nên hệ thống bỏ qua mọi
              điểm gửi lên cho CLO này và ghi nhật ký (CBR-09).
            </div>
          </div>
        ))}
      </div>

      <div className={`card mb ${suaDuoc && daThuNop && thieuNhanXet ? 'clo-row-loi' : ''}`}>
        <label className="field">
          <span>Nhận xét chung *</span>
          <textarea className="textarea" rows={4} value={nhanXetChung} disabled={!suaDuoc} maxLength={5000}
                    onChange={(e) => { setNhanXetChung(e.target.value); setDoi(true); setThongBao(undefined); }} />
        </label>
        {suaDuoc && daThuNop && thieuNhanXet && <div className="field-error small">Nhận xét chung là bắt buộc khi nộp phiếu</div>}
      </div>

      {suaDuoc && (
        <div className="action-bar">
          <span className="muted small">
            Đã chấm {soXong}/{cauHois.length} CLO{doi && ' · có thay đổi chưa lưu'}
          </span>
          <div className="action-bar-buttons">
            <button className="btn btn-phu" disabled={dangGui || !doi} onClick={() => void chay(async () => { await luu(); })}>
              {dangGui ? 'Đang lưu…' : 'Lưu nháp'}
            </button>
            <button className="btn btn-chinh" disabled={dangGui} onClick={bamNop}>Nộp phiếu</button>
          </div>
        </div>
      )}
      {suaDuoc && daThuNop && !hopLeDeNop && (
        <div className="alert alert-vang mt">
          Chưa nộp được: {[
            soXong < cauHois.length && `còn ${cauHois.length - soXong} CLO thiếu hoặc sai khoảng điểm`,
            thieuNhanXet && 'chưa có nhận xét chung',
          ].filter(Boolean).join('; ')}.
        </div>
      )}

      <ConfirmDialog mo={hoiNop} tieuDe="Nộp phiếu đánh giá?" nhanXacNhan="Nộp phiếu" nguyHiem dangXuLy={dangGui}
                     onHuy={() => setHoiNop(false)} onXacNhan={() => void nop()}>
        <p>
          Nộp xong phiếu bị <b>khóa</b>; muốn sửa phải đề nghị giáo vụ mở lại (CBR-12). Điểm của bạn được giữ kín với người
          chấm còn lại cho đến khi cả hai cùng nộp (BR-08.7).
        </p>
        <table className="table table-gon">
          <tbody>
            {cauHois.map((q) => (
              <tr key={q.maClo}>
                <td>{q.maClo}</td>
                <td>Mức {o[q.maClo]?.muc}</td>
                <td className="num">{o[q.maClo]?.diem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ConfirmDialog>
    </div>
  );
}
