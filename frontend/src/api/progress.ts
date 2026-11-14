import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type {
  CapNhatNhatKyRequest, CapNhatTienDoRequest, NhacNho, NhatKy, NhatKyRequest, TienDo, XacNhanTienDoRequest,
} from '../types/progress';

/** Endpoint nhật ký và tiến độ tuần #57–#63 (UC07). */
export const progressApi = {
  /** #57 — lọc theo khoảng ngày `from`, `to` (yyyy-MM-dd); mới nhất trước. */
  nhatKy: (recordId: number, loc: { from?: string; to?: string } = {}) =>
    api.get<ApiResponse<NhatKy[]>>(`/internship_records/${recordId}/logbooks`, { params: loc }).then(layData),

  /** #58 — mỗi hồ sơ một bản ghi mỗi ngày, chỉ trong 7 ngày gần nhất (BR-07.1, BR-07.2). */
  ghiNhatKy: (req: NhatKyRequest) => api.post<ApiResponse<NhatKy>>('/logbooks', req).then(layPhanHoi),

  /** #59 — chỉ sửa trong 7 ngày gần nhất (BR-07.2). */
  suaNhatKy: (logbookId: number, req: CapNhatNhatKyRequest) =>
    api.put<ApiResponse<NhatKy>>(`/logbooks/${logbookId}`, req).then(layPhanHoi),

  /** #60 — GV nhắc SV quá 5 ngày chưa ghi (NT-09); `hoSoIds` trống ⇒ mọi SV đang thực tập của GV, backend tự lọc. */
  nhacNho: (hoSoIds?: number[]) =>
    api.post<ApiResponse<NhacNho[]>>('/logbooks/reminders', hoSoIds ? { hoSoIds } : {}).then(layPhanHoi),

  /** #61 — bảng TTTN-03, mỗi tuần của đợt một dòng. */
  tienDo: (recordId: number) =>
    api.get<ApiResponse<TienDo[]>>(`/internship_records/${recordId}/weekly_progress`).then(layData),

  /** #62 — SV cập nhật dòng tuần; dòng đã được cán bộ ĐVHD xác nhận ⇒ RESOURCE_LOCKED. */
  capNhatTienDo: (progressId: number, req: CapNhatTienDoRequest) =>
    api.put<ApiResponse<TienDo>>(`/weekly_progress/${progressId}`, req).then(layPhanHoi),

  /** #63 — cán bộ ĐVHD xác nhận (khóa dòng) hoặc yêu cầu bổ sung kèm nội dung (NT-08 tới SV, UC07 6a). */
  xacNhanTuan: (progressId: number, req: XacNhanTienDoRequest) =>
    api.put<ApiResponse<TienDo>>(`/weekly_progress/${progressId}/confirmation`, req).then(layPhanHoi),
};
