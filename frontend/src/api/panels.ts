import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { ToDanhGia } from '../types/panel';

/** Endpoint Tổ đánh giá #77–#81 (UC09). SCR-19 bổ sung tạo / sửa / vắng mặt. */
export const panelApi = {
  /** #77 — thành viên chỉ thấy tổ mình tham gia. */
  danhSach: (termId?: number) => api.get<ApiResponse<ToDanhGia[]>>('/panels', { params: { termId } }).then(layData),

  /** #78 */
  chiTiet: (panelId: number) => api.get<ApiResponse<ToDanhGia>>(`/panels/${panelId}`).then(layData),
};
