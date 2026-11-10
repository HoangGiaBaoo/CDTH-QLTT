import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="card empty">
      <div className="empty-title">Bạn không có quyền truy cập chức năng này</div>
      <Link to="/" className="btn btn-phu">Về trang tổng quan</Link>
    </div>
  );
}
