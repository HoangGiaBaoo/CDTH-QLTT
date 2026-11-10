import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import ForbiddenPage from '../pages/common/ForbiddenPage';
import type { VaiTro } from '../types/auth';
import { useAuth } from './AuthContext';

interface Props {
  /** Bỏ trống = mọi vai trò đã đăng nhập. */
  roles?: VaiTro[];
  children: ReactNode;
}

/** Chặn route theo vai trò — chỉ là tiện lợi trên giao diện; backend vẫn trả 403 nếu gọi thẳng API. */
export default function RequireRole({ roles, children }: Props) {
  const { nguoiDung, dangTai } = useAuth();
  const location = useLocation();
  if (dangTai) return <Loading text="Đang kiểm tra phiên đăng nhập…" />;
  if (!nguoiDung) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(nguoiDung.vaiTro)) return <ForbiddenPage />;
  return <>{children}</>;
}
