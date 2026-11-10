import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">QLTT</div>
          <div>
            <div className="auth-title">Quản lý thực tập tốt nghiệp</div>
            <div className="auth-subtitle">Trường Đại học Xây dựng Hà Nội · Khoa Công nghệ thông tin</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
