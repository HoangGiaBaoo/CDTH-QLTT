import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { BaoCao } from '../types/report';

/** Endpoint báo cáo TTTN-06 #89–#93 (UC11). */
export const reportApi = {
  /** #89 — mọi phiên bản đã nộp, `laMoiNhat` đánh dấu bản đang hiệu lực. */
  danhSach: (recordId: number) =>
    api.get<ApiResponse<BaoCao[]>>(`/internship_records/${recordId}/reports`).then(layData),
};
