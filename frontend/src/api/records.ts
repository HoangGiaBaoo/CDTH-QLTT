import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { HoSo, TrangThaiHoSo } from '../types/record';

/**
 * Endpoint hồ sơ thực tập (UC04, #39–#47) — module của người B. Hiện mới có #39, #41 mà SCR-18 cần;
 * B bổ sung các hàm còn lại khi làm SCR-11/12.
 */
export const recordApi = {
  /** #39 — GV chỉ nhận SV mình hướng dẫn, cán bộ chỉ SV mình phụ trách. */
  danhSach: (loc: { termId?: number; status?: TrangThaiHoSo; internshipType?: string } = {}) =>
    api.get<ApiResponse<HoSo[]>>('/internship_records', { params: loc }).then(layData),

  /** #41 */
  chiTiet: (recordId: number) => api.get<ApiResponse<HoSo>>(`/internship_records/${recordId}`).then(layData),
};
