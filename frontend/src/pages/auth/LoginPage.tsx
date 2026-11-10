import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import AuthLayout from '../../layouts/AuthLayout';

/** Tài khoản seed V3/V4 — chỉ hiện ở chế độ dev để chạy demo nhanh; mật khẩu chung Qltt@2026. */
const TAI_KHOAN_DEMO = [
  ['giaovu', 'Giáo vụ'],
  ['gv.tung', 'Giảng viên'],
  ['cb.son', 'Cán bộ ĐVHD'],
  ['sv.an', 'Sinh viên'],
];

/** #1 — sai 5 lần liên tiếp bị khóa 15 phút; thông báo không nói rõ sai tên hay sai mật khẩu (do backend trả). */
export default function LoginPage() {
  const { nguoiDung, dangNhap } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const dich = (location.state as { from?: string } | null)?.from ?? '/';
  if (nguoiDung) return <Navigate to={dich} replace />;

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      await dangNhap(tenDangNhap.trim(), matKhau);
      navigate(dich, { replace: true });
    } catch (err) {
      setLoi(err);
    } finally {
      setDangGui(false);
    }
  };

  const loiTruong = (truong: string) => (loi instanceof ApiError ? loi.loiTruong(truong) : undefined);

  return (
    <AuthLayout>
      <form onSubmit={gui} className="form" noValidate>
        <h1 className="form-title">Đăng nhập</h1>
        {params.get('hetPhien') && !loi && (
          <div className="alert alert-vang">Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.</div>
        )}
        <ErrorAlert error={loi} />
        <label className="field">
          <span>Tên đăng nhập</span>
          <input value={tenDangNhap} onChange={(e) => setTenDangNhap(e.target.value)} autoComplete="username" autoFocus />
          {loiTruong('tenDangNhap') && <small className="field-error">{loiTruong('tenDangNhap')}</small>}
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <input type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} autoComplete="current-password" />
          {loiTruong('matKhau') && <small className="field-error">{loiTruong('matKhau')}</small>}
        </label>
        <button className="btn btn-chinh btn-full" disabled={dangGui}>
          {dangGui ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
      {import.meta.env.DEV && (
        <div className="demo-accounts">
          <div className="demo-title">Tài khoản demo (mật khẩu Qltt@2026)</div>
          <div className="demo-list">
            {TAI_KHOAN_DEMO.map(([tdn, nhan]) => (
              <button key={tdn} type="button" className="btn btn-phu btn-nho"
                      onClick={() => { setTenDangNhap(tdn); setMatKhau('Qltt@2026'); }}>
                {nhan}: {tdn}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
