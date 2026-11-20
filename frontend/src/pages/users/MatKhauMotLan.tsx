import type { ReactNode } from 'react';

interface Props {
  tieuDe: string;
  tenDangNhap: string;
  matKhau: string;
  children?: ReactNode;
}

/** Khung hiện mật khẩu ban đầu / mật khẩu đặt lại — backend chỉ trả một lần, CSDL chỉ lưu bản băm (#7, #10). */
export default function MatKhauMotLan({ tieuDe, tenDangNhap, matKhau, children }: Props) {
  return (
    <div className="alert alert-xanh-duong mb tk-mat-khau" role="status">
      <b>{tieuDe}</b> Mật khẩu chỉ hiện một lần — hãy ghi lại để gửi cho người dùng; người dùng nên đổi mật khẩu sau lần
      đăng nhập đầu tiên.
      <dl>
        <div><dt>Tên đăng nhập</dt><dd><code>{tenDangNhap}</code></dd></div>
        <div><dt>Mật khẩu</dt><dd><code>{matKhau}</code></dd></div>
      </dl>
      {children}
    </div>
  );
}
