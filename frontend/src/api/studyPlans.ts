import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { KeHoach } from '../types/studyPlan';

/** Endpoint kế hoạch học tập #52–#56 (UC06). */
export const studyPlanApi = {
  /** #52 — chưa có kế hoạch (GVHD chưa duyệt) ⇒ RESOURCE_NOT_FOUND. */
  theoHoSo: (recordId: number) =>
    api.get<ApiResponse<KeHoach>>(`/internship_records/${recordId}/study_plan`).then(layData),
};
