import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card empty">
      <div className="empty-title">Không tìm thấy trang</div>
      <Link to="/" className="btn btn-phu">Về trang tổng quan</Link>
    </div>
  );
}
