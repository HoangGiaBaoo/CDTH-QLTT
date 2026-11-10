import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { menuCua, nhanMenu } from '../../menu';
import { NHAN_CHUONG_TRINH, NHAN_VAI_TRO } from '../../utils/constants';

/** Trang tổng quan: thông tin vai trò từ #2 và lối tắt tới các màn của vai trò. */
export default function HomePage() {
  const { nguoiDung } = useAuth();
  if (!nguoiDung) return null;
  const { sinhVien, giangVien, canBoDvhd } = nguoiDung;

  return (
    <div>
      <h1 className="page-title">Xin chào, {nguoiDung.hoTen}</h1>
      <div className="card">
        <div className="info-grid">
          <div><span className="muted">Vai trò</span>{NHAN_VAI_TRO[nguoiDung.vaiTro]}</div>
          <div><span className="muted">Tên đăng nhập</span>{nguoiDung.tenDangNhap}</div>
          <div><span className="muted">Email</span>{nguoiDung.email}</div>
          {sinhVien && <>
            <div><span className="muted">Mã sinh viên</span>{sinhVien.maSv}</div>
            <div><span className="muted">Lớp</span>{sinhVien.lop ?? '—'}</div>
            <div><span className="muted">Chương trình</span>{NHAN_CHUONG_TRINH[sinhVien.chuongTrinhDaoTao]}</div>
          </>}
          {giangVien && <>
            <div><span className="muted">Mã giảng viên</span>{giangVien.maGv}</div>
            <div><span className="muted">Bộ môn</span>{giangVien.boMon ?? '—'}</div>
            <div><span className="muted">Hạn mức hướng dẫn</span>{giangVien.soSvToiDa} sinh viên / đợt</div>
          </>}
          {canBoDvhd && <>
            <div><span className="muted">Đơn vị</span>{canBoDvhd.tenDonVi}</div>
            <div><span className="muted">Chức vụ</span>{canBoDvhd.chucVu ?? '—'}</div>
            <div><span className="muted">Hạn mức hướng dẫn</span>{canBoDvhd.soSvToiDa} sinh viên / đợt</div>
          </>}
        </div>
      </div>

      <h2 className="section-title">Chức năng</h2>
      <div className="tile-grid">
        {menuCua(nguoiDung.vaiTro).filter((m) => m.path !== '/').map((m) => (
          <Link key={m.path} to={m.path} className="tile">
            <div className="tile-title">{nhanMenu(m, nguoiDung.vaiTro)}</div>
            {m.moTa && <div className="tile-desc">{m.moTa}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
