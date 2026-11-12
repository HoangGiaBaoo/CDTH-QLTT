import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { CapNhatToRequest, TaoToRequest, ToDanhGia, VangMatRequest } from '../types/panel';

/** Endpoint Tổ đánh giá #77–#81 (UC09). */
export const panelApi = {
  /** #77 — thành viên chỉ thấy tổ mình tham gia. */
  danhSach: (termId?: number) => api.get<ApiResponse<ToDanhGia[]>>('/panels', { params: { termId } }).then(layData),

  /** #78 — sinh viên chỉ xem tổ có hồ sơ của mình. */
  chiTiet: (panelId: number) => api.get<ApiResponse<ToDanhGia>>(`/panels/${panelId}`).then(layData),

  /** #79 — backend kiểm CBR-14 trên thành viên, gửi NT-11 tới thành viên và sinh viên. */
  tao: (req: TaoToRequest) => api.post<ApiResponse<ToDanhGia>>('/panels', req).then(layPhanHoi),

  /** #80 — trực tuyến phải có ghi chú phê duyệt của Trưởng Khoa (Đ10 k3b). */
  capNhat: (panelId: number, req: CapNhatToRequest) =>
    api.put<ApiResponse<ToDanhGia>>(`/panels/${panelId}`, req).then(layPhanHoi),

  /** #81 — vắng mặt / có mặt lại, kèm người thay thế thì thành phần mới phải đạt CBR-14. */
  doiVangMat: (panelId: number, memberId: number, req: VangMatRequest) =>
    api.put<ApiResponse<ToDanhGia>>(`/panels/${panelId}/members/${memberId}/absence`, req).then(layPhanHoi),
};
