import { useAuth } from '../../auth/AuthContext';
import { nhanMenu, type MucMenu } from '../../menu';

/** Giữ chỗ cho màn hình chưa làm — thay bằng trang thật trong pages/<module>/ khi người phụ trách làm tới. */
export default function PlaceholderPage({ muc }: { muc: MucMenu }) {
  const { nguoiDung } = useAuth();
  return (
    <div>
      <h1 className="page-title">{nguoiDung ? nhanMenu(muc, nguoiDung.vaiTro) : muc.path}</h1>
      <div className="card empty">
        <muc.icon size={40} strokeWidth={1.5} className="empty-icon" aria-hidden="true" />
        <div className="empty-title">Chức năng đang được xây dựng</div>
        <div className="muted">Chức năng này sẽ sớm được hoàn thiện.</div>
      </div>
    </div>
  );
}
