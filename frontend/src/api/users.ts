import { api, layData } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { NguoiDung, TrangThaiTaiKhoan, VaiTro } from '../types/auth';

/** Endpoint tài khoản #5–#10 (UC01). SCR-03 bổ sung tạo / sửa / khóa / đặt lại mật khẩu. */
export const userApi = {
  /** #5 — chỉ ADMIN; phân trang, mặc định 15 dòng. */
  danhSach: (loc: { role?: VaiTro; status?: TrangThaiTaiKhoan; keyword?: string; page?: number; size?: number } = {}) =>
    api.get<ApiResponse<PageResponse<NguoiDung>>>('/users', { params: loc }).then(layData),
};
