import { NHAN_CHUONG_TRINH, NHAN_HINH_THUC_LAM_VIEC, NHAN_HINH_THUC_THUC_TAP } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { HoSo } from '../../types/record';
import type { Dot } from '../../types/term';

/**
 * Phiếu đăng ký TTTN-01 ở chế độ chỉ xem — SV xem phiếu đã gửi (SCR-11), cán bộ / giáo vụ xem hồ sơ (SCR-12,
 * `hienSinhVien` thêm khối thông tin sinh viên).
 */
export default function RecordInfo({ hoSo, dot, hienSinhVien }: { hoSo: HoSo; dot: Dot; hienSinhVien?: boolean }) {
  const sv = hoSo.sinhVien;
  return (
    <div className="card mb">
      {hienSinhVien && (
        <>
          <h2 className="section-title mt0">Sinh viên</h2>
          <div className="info-grid mb">
            <div><span className="muted">Họ tên</span>{sv.hoTen}</div>
            <div><span className="muted">Mã sinh viên</span>{sv.maSv}</div>
            <div><span className="muted">Lớp</span>{sv.lop ?? '—'}</div>
            <div><span className="muted">Chương trình đào tạo</span>{NHAN_CHUONG_TRINH[sv.chuongTrinhDaoTao] ?? sv.chuongTrinhDaoTao}</div>
          </div>
        </>
      )}
      <h2 className={`section-title mt0${hienSinhVien ? ' ngan-tren' : ''}`}>Phiếu đăng ký TTTN-01</h2>
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
  );
}
