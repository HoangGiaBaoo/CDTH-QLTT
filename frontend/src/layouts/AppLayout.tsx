import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Brand from '../components/Brand';
import NotificationBell from '../components/NotificationBell';
import { MENU, menuCua, nhanMenu } from '../menu';
import { NHAN_VAI_TRO } from '../utils/constants';

/**
 * Mục menu sáng cả khi đang ở trang con (/terms/5) — trừ '/' và mục có mục menu khác nằm dưới
 * (/my-record vs /my-record/plan) thì phải khớp chính xác.
 */
function khopChinhXac(path: string): boolean {
  return path === '/' || MENU.some((x) => x.path.startsWith(`${path}/`));
}

/** Chữ cái đầu của tên gọi (từ cuối họ tên) cho avatar ở thanh trên. */
function chuCaiDau(hoTen: string): string {
  return hoTen.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() ?? '?';
}

/**
 * Khung chung sau đăng nhập theo bố cục cổng sinh viên HUCE: thanh trên trắng (tên trường, người dùng, đăng xuất),
 * menu trái theo vai trò, nội dung trên nền xám xanh.
 */
export default function AppLayout() {
  const { nguoiDung, dangXuat } = useAuth();
  const navigate = useNavigate();
  const [moMenu, setMoMenu] = useState(false);
  if (!nguoiDung) return null;

  const thoat = () => {
    dangXuat();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setMoMenu((x) => !x)} aria-label="Mở menu"><Menu size={22} /></button>
        <Link to="/" className="topbar-brand"><Brand /></Link>
        <div className="topbar-spacer" />
        <NotificationBell />
        <div className="topbar-user">
          <span className="topbar-avatar" aria-hidden="true">{chuCaiDau(nguoiDung.hoTen)}</span>
          <div>
            <div className="topbar-name">{nguoiDung.hoTen}</div>
            <div className="topbar-role">{NHAN_VAI_TRO[nguoiDung.vaiTro]}</div>
          </div>
        </div>
        <button className="btn btn-phu btn-nho topbar-thoat" onClick={thoat} aria-label="Đăng xuất">
          <LogOut size={16} aria-hidden="true" /><span className="topbar-thoat-chu">Đăng xuất</span>
        </button>
      </header>
      <div className="app-body">
        <aside className={`sidebar ${moMenu ? 'sidebar-mo' : ''}`}>
          <nav onClick={() => setMoMenu(false)}>
            {menuCua(nguoiDung.vaiTro).map((m) => (
              <NavLink key={m.path} to={m.path} end={khopChinhXac(m.path)} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}>
                <m.icon size={18} className="nav-icon" aria-hidden="true" />
                <span>{nhanMenu(m, nguoiDung.vaiTro)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        {moMenu && <div className="sidebar-backdrop" onClick={() => setMoMenu(false)} />}
        <div className="main">
          <main className="content">
            <Outlet />
          </main>
          <footer className="app-footer">Khoa Công nghệ thông tin · Trường Đại học Xây dựng Hà Nội</footer>
        </div>
      </div>
    </div>
  );
}
