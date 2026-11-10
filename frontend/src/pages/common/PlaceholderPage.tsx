import { useAuth } from '../../auth/AuthContext';
import { nhanMenu, type MucMenu } from '../../menu';

/** Giữ chỗ cho màn hình chưa làm — thay bằng trang thật trong pages/<module>/ khi người phụ trách làm tới. */
export default function PlaceholderPage({ muc }: { muc: MucMenu }) {
  const { nguoiDung } = useAuth();
  return (
    <div>
      <h1 className="page-title">{nguoiDung ? nhanMenu(muc, nguoiDung.vaiTro) : muc.path}</h1>
      <div className="card empty">
        <div className="empty-title">Màn hình đang được xây dựng</div>
        <div className="muted">
          {muc.scr && <>{muc.scr} · </>}
          {muc.phuTrach && <>Phụ trách: người {muc.phuTrach}</>}
        </div>
        {muc.moTa && <p>{muc.moTa}</p>}
      </div>
    </div>
  );
}
