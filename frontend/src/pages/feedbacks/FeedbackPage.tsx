import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { feedbackApi } from '../../api/feedbacks';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import Form08a from './Form08a';
import Form08b from './Form08b';
import { TuNhanThucCard, Xem08a, Xem08b } from './PhieuDaGui';
import type { PhanHoi } from '../../types/feedback';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { Dot } from '../../types/term';

/** Phiếu phản hồi mở từ khi báo cáo đủ hai xác nhận (Chờ đánh giá); sau công bố vẫn gửi được — cùng PhanHoiService.DUOC_GUI. */
const DUOC_GUI: TrangThaiHoSo[] = ['CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH'];

/** `/records/:recordId/feedbacks` — lối từ ô Phản hồi của SCR-12. */
export function FeedbackRoute() {
  const id = Number(useParams().recordId);
  return <FeedbackPage key={id} recordId={id} />;
}

/**
 * SCR-23 — Phản hồi TTTN-08a / TTTN-08b (UC12, #94–#97). Sinh viên gửi 08b (đánh giá chất lượng, tự đánh giá 7 CLO,
 * HPself tính thử #95) và xem chỉ số tự nhận thức sau công bố (#97); cán bộ hướng dẫn ĐVHD gửi 08a; GVHD, giáo vụ xem
 * hai phiếu theo phạm vi quyền (#94 không trả phần đánh giá chất lượng của sinh viên — chỉ thống kê ẩn danh).
 * `recordId` trống ⇒ hồ sơ của sinh viên đang đăng nhập.
 */
export default function FeedbackPage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const tuKetQua = (useLocation().state as { tuKetQua?: string } | null)?.tuKetQua;
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [ds, setDs] = useState<PhanHoi[] | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();

  const layHoSo = useCallback(() => (recordId ? recordApi.chiTiet(recordId) : recordApi.cuaToi()), [recordId]);

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = await layHoSo();
      const [d, p] = await Promise.all([termApi.chiTiet(h.dot.id), feedbackApi.theoHoSo(h.id)]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      setDs(p);
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [layHoSo]);

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';
  const laCanBo = nguoiDung?.vaiTro === 'CAN_BO_DVHD' && hoSo?.canBoDvhd?.nguoiDungId === nguoiDung.id;
  const laGvhd = nguoiDung?.vaiTro === 'GIANG_VIEN' && hoSo?.gvhd?.nguoiDungId === nguoiDung.id;

  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;
  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {laSv ? 'Phiếu phản hồi TTTN-08b' : nguoiDung?.vaiTro === 'CAN_BO_DVHD' ? 'Phiếu phản hồi TTTN-08a' : 'Phản hồi TTTN-08a / 08b'}
          </h1>
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
            <div className="muted">Phiếu phản hồi TTTN-08b được gửi ở cuối đợt thực tập, sau khi báo cáo được xác nhận.</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || !ds) return <div>{tieuDe}<Loading /></div>;

  const p08a = ds.find((p) => p.loai === 'TTTN_08A');
  const p08b = ds.find((p) => p.loai === 'TTTN_08B');
  const guiDuoc = DUOC_GUI.includes(hoSo.trangThai);
  const daCongBo = p08b?.chiSoTuNhanThuc != null;

  const daGui = (p: PhanHoi, message?: string) => {
    setThongBao(`${message ?? 'Đã gửi phiếu phản hồi'} ${p.loai === 'TTTN_08A' ? 'TTTN-08a' : 'TTTN-08b'} lúc ${ngayGio(p.ngayGui)}.`);
    setDs((x) => [...(x ?? []).filter((y) => y.loai !== p.loai), p]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const huongDan = ((): { loai: string; noiDung: ReactNode } | null => {
    if (!guiDuoc && !p08a && !p08b) {
      return { loai: 'vang', noiDung: 'Phiếu phản hồi mở khi hồ sơ sang giai đoạn đánh giá cuối kỳ — báo cáo TTTN-06 đã đủ xác nhận '
        + 'của cán bộ ĐVHD và GVHD (Điều 10 khoản 2).' };
    }
    if (laSv) {
      if (!p08b) {
        return { loai: 'xanh-duong', noiDung: 'Điền đủ phần A, B, C và cam kết rồi gửi phiếu. Phần D tự tính điểm học phần từ mức bạn '
          + 'tự đánh giá để bạn xem lại trước khi gửi. Bạn xem được kết quả học phần sau khi kết quả được công bố và đã gửi phiếu này.' };
      }
      return { loai: 'xanh', noiDung: <>Bạn đã gửi phiếu TTTN-08b. <Link to="/my-result">Xem kết quả học phần</Link> (khi đã công bố).</> };
    }
    if (laCanBo && !p08a) {
      return { loai: 'xanh-duong', noiDung: 'Đánh giá mức độ đáp ứng của sinh viên theo sáu tiêu chí (mức 0–4), thêm ý kiến bổ sung nếu có, '
        + 'rồi gửi phiếu. Phiếu là minh chứng bắt buộc khi xét công nhận học phần.' };
    }
    return null;
  })();

  const thongTinChung = (
    <section className="card mb" aria-labelledby="ph-i">
      <h2 id="ph-i" className="the-tieu-de">I. Thông tin chung</h2>
      <dl className="tt-ds">
        {([
          ['Họ và tên sinh viên', hoSo.sinhVien.hoTen],
          ['Mã số sinh viên', hoSo.sinhVien.maSv],
          ['Lớp', hoSo.sinhVien.lop],
          ['Đơn vị hướng dẫn', hoSo.donVi?.ten],
          ['Cán bộ hướng dẫn tại ĐVHD', hoSo.canBoDvhd?.hoTen],
          ['Giảng viên hướng dẫn', hoSo.gvhd?.hoTen],
          ['Thời gian thực tập', `${ngay(dot.ngayBatDau)} – ${ngay(dot.ngayKetThuc)}`],
        ] as [string, string | undefined][]).map(([nhan, gt]) => (
          <div key={nhan}><dt>{nhan}:</dt><dd>{gt || '—'}</dd></div>
        ))}
      </dl>
    </section>
  );

  const chuaGui = (ten: string) => (
    <section className="card mb empty">
      <div className="empty-title">{ten}</div>
    </section>
  );

  let noiDung: ReactNode;
  if (laSv) {
    noiDung = p08b ? (
      <>
        <Xem08b p={p08b} />
        {daCongBo ? <TuNhanThucCard phanHoiId={p08b.id} />
          : <p className="hint mb">Chỉ số tự nhận thức năng lực (so sánh phần tự đánh giá với kết quả chính thức) có sau khi kết quả được công bố.</p>}
        {p08a && <Xem08a p={p08a} />}
      </>
    ) : guiDuoc ? <Form08b hoSoId={hoSo.id} onDaGui={daGui} /> : null;
  } else if (nguoiDung?.vaiTro === 'CAN_BO_DVHD') {
    noiDung = p08a ? <Xem08a p={p08a} />
      : laCanBo && guiDuoc ? <Form08a hoSoId={hoSo.id} tenSinhVien={hoSo.sinhVien.hoTen} onDaGui={daGui} />
        : guiDuoc ? chuaGui('Cán bộ hướng dẫn tại ĐVHD chưa gửi phiếu TTTN-08a.') : null;
  } else {
    noiDung = guiDuoc || p08a || p08b ? (
      <>
        {p08a ? <Xem08a p={p08a} /> : chuaGui('Cán bộ hướng dẫn tại ĐVHD chưa gửi phiếu TTTN-08a.')}
        {p08b ? <Xem08b p={p08b} /> : chuaGui('Sinh viên chưa gửi phiếu TTTN-08b.')}
        {laGvhd && p08b && daCongBo && <TuNhanThucCard phanHoiId={p08b.id} />}
      </>
    ) : null;
  }

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      {laSv && tuKetQua && !p08b && <div className="alert alert-vang mb">{tuKetQua}.</div>}
      {huongDan && <div className={`alert alert-${huongDan.loai} mb`}>{huongDan.noiDung}</div>}
      {thongTinChung}
      {noiDung}
    </div>
  );
}
