import { Link } from 'react-router-dom';
import { NHAN_HINH_THUC_LAM_VIEC, NHAN_HINH_THUC_THUC_TAP } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { HoSo } from '../../types/record';
import type { Dot } from '../../types/term';
import RequiredEvidence from './RequiredEvidence';
import { daDuocDuyet, viecTiepTheo } from './vongDoi';

/** Lối tắt sang các màn của sinh viên khi hồ sơ đã được duyệt (đường dẫn khớp menu.ts). */
const LOI_TAT: { path: string; nhan: string; moTa: string; khi: (h: HoSo) => boolean }[] = [
  { path: '/my-record/plan', nhan: 'Kế hoạch học tập', moTa: 'Lập kế hoạch TTTN-02 theo tuần', khi: () => true },
  { path: '/my-record/logbook', nhan: 'Nhật ký thực tập', moTa: 'Ghi việc làm hằng ngày', khi: () => true },
  { path: '/my-record/progress', nhan: 'Tiến độ tuần', moTa: 'Tự đánh giá tiến độ từng tuần', khi: () => true },
  { path: '/my-record/evidence', nhan: 'Minh chứng', moTa: 'Tải tệp, đối chiếu Đủ / Thiếu', khi: () => true },
  { path: '/my-record/report', nhan: 'Báo cáo TTTN-06', moTa: 'Nộp báo cáo thực tập', khi: () => true },
  {
    path: '/my-record/feedback', nhan: 'Phản hồi 08b', moTa: 'Đánh giá chất lượng, tự đánh giá CLO',
    khi: (h) => ['CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH'].includes(h.trangThai),
  },
  {
    path: '/my-result', nhan: 'Kết quả của tôi', moTa: 'Điểm 7 CLO và điều kiện công nhận',
    khi: (h) => h.trangThai === 'HOAN_THANH' || h.trangThai === 'KHONG_HOAN_THANH',
  },
];

/** SCR-11 khi hồ sơ đã gửi: chỉ xem phiếu TTTN-01, việc tiếp theo và danh mục minh chứng. */
export default function RecordSummary({ hoSo, dot }: { hoSo: HoSo; dot: Dot }) {
  const viec = viecTiepTheo(hoSo);
  const duyet = daDuocDuyet(hoSo.trangThai);

  return (
    <>
      {viec && (
        <div className={`alert ${hoSo.trangThai === 'GIAN_DOAN' ? 'alert-vang' : 'alert-xanh'} mb`} role="status">{viec}</div>
      )}

      <div className="card mb">
        <h2 className="section-title mt0">Phiếu đăng ký TTTN-01</h2>
        <div className="info-grid">
          <div><span className="muted">Đợt</span>{dot.maDot} · {ngay(dot.ngayBatDau)} – {ngay(dot.ngayKetThuc)}</div>
          <div><span className="muted">Hình thức thực tập</span>{NHAN_HINH_THUC_THUC_TAP[hoSo.hinhThucThucTap] ?? hoSo.hinhThucThucTap}</div>
          <div><span className="muted">Đơn vị hướng dẫn</span>{hoSo.donVi ? `${hoSo.donVi.ten} (${hoSo.donVi.maDvhd})` : '—'}</div>
          <div>
            <span className="muted">Cán bộ hướng dẫn</span>{hoSo.canBoDvhd?.hoTen ?? '—'}
            {hoSo.canBoDvhd?.email && <span className="muted small">{hoSo.canBoDvhd.email}</span>}
          </div>
          <div>
            <span className="muted">Giảng viên hướng dẫn</span>{hoSo.gvhd?.hoTen ?? 'Chưa phân công'}
            {hoSo.gvhd?.email && <span className="muted small">{hoSo.gvhd.email}</span>}
          </div>
          <div><span className="muted">Bộ phận làm việc</span>{hoSo.boPhan ?? '—'}</div>
          <div><span className="muted">Hình thức làm việc</span>{hoSo.hinhThucLamViec ? NHAN_HINH_THUC_LAM_VIEC[hoSo.hinhThucLamViec] : '—'}</div>
          <div><span className="muted">Số tuần tham gia</span>{hoSo.soTuanThamGia ?? '—'}</div>
          <div><span className="muted">Ngày gửi</span>{ngayGio(hoSo.ngayGui)}</div>
        </div>
        <div className="info-grid mt ngan-tren">
          <div className="o-rong"><span className="muted">Đề tài / nhiệm vụ</span>{hoSo.deTai ?? '—'}</div>
          {hoSo.mucTieu && <div><span className="muted">Mục tiêu</span><span className="pre-line">{hoSo.mucTieu}</span></div>}
          {hoSo.sanPhamDuKien && (
            <div><span className="muted">Sản phẩm dự kiến</span><span className="pre-line">{hoSo.sanPhamDuKien}</span></div>
          )}
        </div>
      </div>

      <div className="card mb">
        <RequiredEvidence recordId={hoSo.id} hinhThucDaLuu={hoSo.hinhThucThucTap} hienTrangThai={duyet} />
      </div>

      {duyet && (
        <div className="tile-grid">
          {LOI_TAT.filter((l) => l.khi(hoSo)).map((l) => (
            <Link key={l.path} to={l.path} className="tile">
              <div className="tile-title">{l.nhan}</div>
              <div className="tile-desc">{l.moTa}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
