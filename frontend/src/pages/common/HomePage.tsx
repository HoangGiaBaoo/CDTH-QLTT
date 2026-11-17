import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { menuCua, nhanMenu } from '../../menu';
import type { VaiTro } from '../../types/auth';
import { NHAN_CHUONG_TRINH, NHAN_VAI_TRO } from '../../utils/constants';

const TIEU_DE: Record<VaiTro, string> = {
  ADMIN: 'Thông tin tài khoản',
  GIANG_VIEN: 'Thông tin giảng viên',
  CAN_BO_DVHD: 'Thông tin cán bộ hướng dẫn',
  SINH_VIEN: 'Thông tin sinh viên',
};

/**
 * Trang tổng quan theo bố cục trang chủ cổng sinh viên HUCE: thẻ thông tin người dùng (lấy từ #2) và
 * các ô chức năng có biểu tượng dẫn tới màn của vai trò.
 */
export default function HomePage() {
  const { nguoiDung } = useAuth();
  if (!nguoiDung) return null;
  const { sinhVien, giangVien, canBoDvhd } = nguoiDung;

  const dong: [string, string | null | undefined][] = [];
  if (sinhVien) dong.push(['Mã sinh viên', sinhVien.maSv]);
  if (giangVien) dong.push(['Mã giảng viên', giangVien.maGv]);
  dong.push(['Họ tên', nguoiDung.hoTen]);
  if (sinhVien) dong.push(['Lớp', sinhVien.lop], ['Chương trình', NHAN_CHUONG_TRINH[sinhVien.chuongTrinhDaoTao]]);
  if (giangVien) dong.push(['Bộ môn', giangVien.boMon], ['Hạn mức hướng dẫn', `${giangVien.soSvToiDa} sinh viên / đợt`]);
  if (canBoDvhd) {
    dong.push(['Đơn vị', canBoDvhd.tenDonVi], ['Chức vụ', canBoDvhd.chucVu],
      ['Hạn mức hướng dẫn', `${canBoDvhd.soSvToiDa} sinh viên / đợt`]);
  }
  dong.push(['Vai trò', NHAN_VAI_TRO[nguoiDung.vaiTro]], ['Tên đăng nhập', nguoiDung.tenDangNhap], ['Email', nguoiDung.email]);
  const chuCai = nguoiDung.hoTen.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() ?? '?';

  return (
    <div>
      <section className="card">
        <h1 className="page-title the-tieu-de">{TIEU_DE[nguoiDung.vaiTro]}</h1>
        <div className="tt-than">
          <div className="tt-avatar" aria-hidden="true">{chuCai}</div>
          <dl className="tt-ds">
            {dong.map(([nhan, giaTri]) => (
              <div key={nhan}><dt>{nhan}:</dt><dd>{giaTri ?? '—'}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <h2 className="section-title">Chức năng</h2>
      <div className="tile-grid-icon">
        {menuCua(nguoiDung.vaiTro).filter((m) => m.path !== '/').map((m) => (
          <Link key={m.path} to={m.path} className="tile tile-icon">
            <m.icon size={34} strokeWidth={1.5} aria-hidden="true" />
            <div className="tile-title">{nhanMenu(m, nguoiDung.vaiTro)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
