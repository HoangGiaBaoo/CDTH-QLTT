import { api, layData, layPhanHoi } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { NguoiDung, TrangThaiTaiKhoan, VaiTro } from '../types/auth';
import type {
  CapNhatGiangVienRequest, CapNhatNguoiDungRequest, CapNhatSinhVienRequest, TaoNguoiDungRequest, TaoNguoiDungResponse,
} from '../types/user';

/** Endpoint tài khoản #5–#10 và hồ sơ sinh viên / giảng viên #13, #16 (UC01). */
export const userApi = {
  /** #5 — chỉ ADMIN; phân trang, mặc định 15 dòng. */
  danhSach: (loc: { role?: VaiTro; status?: TrangThaiTaiKhoan; keyword?: string; page?: number; size?: number } = {}) =>
    api.get<ApiResponse<PageResponse<NguoiDung>>>('/users', { params: loc }).then(layData),

  /** #6 — kèm hồ sơ mở rộng theo vai trò. */
  chiTiet: (userId: number) => api.get<ApiResponse<NguoiDung>>(`/users/${userId}`).then(layData),

  /** #7 — tài khoản + hồ sơ theo vai trò trong một giao dịch; mật khẩu ban đầu trả về một lần. */
  tao: (req: TaoNguoiDungRequest) =>
    api.post<ApiResponse<TaoNguoiDungResponse>>('/users', req).then(layPhanHoi),

  /** #8 — chỉ họ tên, email, điện thoại; vai trò không đổi sau khi tạo. */
  capNhat: (userId: number, req: CapNhatNguoiDungRequest) =>
    api.put<ApiResponse<NguoiDung>>(`/users/${userId}`, req).then(layPhanHoi),

  /** #9 — không xóa tài khoản (CBR-22); đang hướng dẫn SV trong đợt đang chạy ⇒ RESOURCE_IN_USE. */
  doiTrangThai: (userId: number, trangThai: TrangThaiTaiKhoan) =>
    api.put<ApiResponse<NguoiDung>>(`/users/${userId}/status`, { trangThai }).then(layPhanHoi),

  /** #10 — mật khẩu mới trả về một lần, mở khóa đăng nhập sai. */
  datLaiMatKhau: (userId: number) =>
    api.put<ApiResponse<TaoNguoiDungResponse>>(`/users/${userId}/reset_password`).then(layPhanHoi),

  /** #13 — chương trình đào tạo quyết định ngưỡng đạt CLO1, CLO2 (CBR-19). */
  capNhatSinhVien: (studentId: number, req: CapNhatSinhVienRequest) =>
    api.put<ApiResponse<unknown>>(`/students/${studentId}`, req).then(layPhanHoi),

  /** #16 — hạn mức hướng dẫn trong khoảng Quy định (CBR-04), backend kiểm. */
  capNhatGiangVien: (lecturerId: number, req: CapNhatGiangVienRequest) =>
    api.put<ApiResponse<unknown>>(`/lecturers/${lecturerId}`, req).then(layPhanHoi),
};
