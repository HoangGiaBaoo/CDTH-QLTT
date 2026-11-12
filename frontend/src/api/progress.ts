import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { NhatKy, TienDo } from '../types/progress';

/** Endpoint nhật ký và tiến độ tuần #57–#63 (UC07). */
export const progressApi = {
  /** #57 — lọc theo khoảng ngày `from`, `to` (yyyy-MM-dd). */
  nhatKy: (recordId: number, loc: { from?: string; to?: string } = {}) =>
    api.get<ApiResponse<NhatKy[]>>(`/internship_records/${recordId}/logbooks`, { params: loc }).then(layData),

  /** #61 — bảng TTTN-03, mỗi tuần của đợt một dòng. */
  tienDo: (recordId: number) =>
    api.get<ApiResponse<TienDo[]>>(`/internship_records/${recordId}/weekly_progress`).then(layData),
};
