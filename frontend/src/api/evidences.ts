import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { DoiChieuMinhChung } from '../types/evidence';

/** Endpoint minh chứng #64–#68 (UC07). */
export const evidenceApi = {
  /** #65 — danh mục bắt buộc theo hình thức thực tập của hồ sơ, kèm Đủ / Thiếu. */
  doiChieu: (recordId: number) =>
    api.get<ApiResponse<DoiChieuMinhChung>>(`/internship_records/${recordId}/evidences/checklist`).then(layData),
};
