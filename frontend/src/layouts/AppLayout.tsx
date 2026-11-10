import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { menuCua, nhanMenu } from '../menu';
import { NHAN_VAI_TRO } from '../utils/constants';

/** Khung chung sau đăng nhập: menu trái theo vai trò, thanh trên có tên người dùng và đăng xuất. */
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
      <aside className={`sidebar ${moMenu ? 'sidebar-mo' : ''}`}>
        <div className="sidebar-brand">QLTT</div>
        <nav onClick={() => setMoMenu(false)}>
          {menuCua(nguoiDung.vaiTro).map((m) => (
            <NavLink key={m.path} to={m.path} end className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}>
              {nhanMenu(m, nguoiDung.vaiTro)}
            </NavLink>
          ))}
        </nav>
      </aside>
      {moMenu && <div className="sidebar-backdrop" onClick={() => setMoMenu(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMoMenu((x) => !x)} aria-label="Mở menu">☰</button>
          <div className="topbar-spacer" />
          {/* Chuông thông báo (#100–#101) — người A gắn vào đây. */}
          <div className="topbar-user">
            <div className="topbar-name">{nguoiDung.hoTen}</div>
            <div className="topbar-role">{NHAN_VAI_TRO[nguoiDung.vaiTro]}</div>
          </div>
          <button className="btn btn-phu" onClick={thoat}>Đăng xuất</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
