import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { DangNhapRequest, DangNhapResponse, NguoiDung } from '../types/auth';

/** Endpoint #1–#4 (docs/02-api.md mục 1). */
export const authApi = {
  /** #1 */
  dangNhap: (req: DangNhapRequest) =>
    api.post<ApiResponse<DangNhapResponse>>('/auth/login', req).then(layData),

  /** #2 */
  layThongTinToi: () => api.get<ApiResponse<NguoiDung>>('/auth/me').then(layData),

  /** #3 */
  capNhatHoSo: (req: { hoTen: string; email: string; dienThoai?: string }) =>
    api.put<ApiResponse<NguoiDung>>('/auth/profile', req).then(layData),

  /** #4 — đổi xong backend buộc đăng nhập lại. */
  doiMatKhau: (req: { matKhauHienTai: string; matKhauMoi: string }) =>
    api.put<ApiResponse<void>>('/auth/change_password', req).then((r) => r.data),
};
