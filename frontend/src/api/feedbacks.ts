import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { PhanHoi } from '../types/feedback';

/** Endpoint phản hồi 08a/08b #94–#97 (UC12). */
export const feedbackApi = {
  /** #94 — theo phạm vi quyền: cán bộ ĐVHD không thấy 08b; SV chỉ thấy 08a sau khi kết quả công bố. */
  theoHoSo: (recordId: number) =>
    api.get<ApiResponse<PhanHoi[]>>(`/internship_records/${recordId}/feedbacks`).then(layData),
};
