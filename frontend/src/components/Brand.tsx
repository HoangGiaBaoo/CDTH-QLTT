import { GraduationCap } from 'lucide-react';

/** Nhận diện hệ thống ở thanh trên và trang đăng nhập: dấu xanh than + tên trường hai dòng như cổng sinh viên HUCE. */
export default function Brand() {
  return (
    <div className="brand">
      <span className="brand-dau" aria-hidden="true"><GraduationCap size={24} strokeWidth={1.75} /></span>
      <span className="brand-chu">
        <span className="brand-truong">Trường Đại học Xây dựng Hà Nội</span>
        <span className="brand-he">Quản lý thực tập tốt nghiệp</span>
      </span>
    </div>
  );
}
