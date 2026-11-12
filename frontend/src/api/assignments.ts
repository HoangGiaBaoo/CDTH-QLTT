import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { DoiGvhdRequest, PhanCong, PhanCongRequest, UngVienPhanCong } from '../types/assignment';

/** Endpoint phân công GVHD #48–#51 (UC05). Không truyền `termId` ⇒ backend lấy đợt đang mở. */
export const assignmentApi = {
  /** #48 — giáo vụ thấy cả đợt; GV chỉ SV của mình; SV chỉ GVHD của mình (BR-05.4). */
  danhSach: (termId?: number) =>
    api.get<ApiResponse<PhanCong[]>>('/assignments', { params: { termId } }).then(layData),

  /** #49 — SV đã được ĐVHD xác nhận mà chưa có GVHD + giảng viên kèm đã nhận / hạn mức. */
  ungVien: (termId?: number) =>
    api.get<ApiResponse<UngVienPhanCong>>('/assignments/candidates', { params: { termId } }).then(layData),

  /** #50 — cả lô trong một giao dịch: một hồ sơ sai hoặc vượt hạn mức ⇒ không phân công hồ sơ nào (UC05 4a). */
  phanCong: (req: PhanCongRequest) => api.post<ApiResponse<PhanCong[]>>('/assignments', req).then(layPhanHoi),

  /** #51 — chặn khi GV cũ đã nộp phiếu đánh giá (RESOURCE_LOCKED); ghi nhật ký. */
  doiGvhd: (assignmentId: number, req: DoiGvhdRequest) =>
    api.put<ApiResponse<PhanCong>>(`/assignments/${assignmentId}`, req).then(layPhanHoi),
};
