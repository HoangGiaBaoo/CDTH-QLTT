import type { ReactNode } from 'react';
import Brand from '../components/Brand';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand"><Brand /></div>
        {children}
      </div>
      <div className="auth-subtitle">Khoa Công nghệ thông tin · Trường Đại học Xây dựng Hà Nội</div>
    </div>
  );
}
