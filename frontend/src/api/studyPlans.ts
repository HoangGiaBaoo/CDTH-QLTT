import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { CapNhatKeHoachRequest, KeHoach } from '../types/studyPlan';

/** Endpoint kế hoạch học tập #52–#56 (UC06). */
export const studyPlanApi = {
  /** #52 — chưa có kế hoạch (GVHD chưa duyệt) ⇒ RESOURCE_NOT_FOUND. */
  theoHoSo: (recordId: number) =>
    api.get<ApiResponse<KeHoach>>(`/internship_records/${recordId}/study_plan`).then(layData),

  /** #53 — SV, chỉ khi Bản nháp và hồ sơ Đang thực tập. */
  capNhat: (planId: number, req: CapNhatKeHoachRequest) =>
    api.put<ApiResponse<KeHoach>>(`/study_plans/${planId}`, req).then(layPhanHoi),

  /** #54 — kiểm đủ 3 nội dung mỗi dòng; quá hạn vẫn nhận, gắn Nộp muộn (BR-06.3); báo cán bộ + GVHD (NT-07). */
  gui: (planId: number) => api.put<ApiResponse<KeHoach>>(`/study_plans/${planId}/submit`).then(layPhanHoi),

  /** #55 — cán bộ ĐVHD và GVHD của hồ sơ; đủ hai xác nhận ⇒ Đã khóa. */
  xacNhan: (planId: number) => api.put<ApiResponse<KeHoach>>(`/study_plans/${planId}/confirmation`).then(layPhanHoi),

  /** #56 — GVHD mở lại (BR-06.4): về Bản nháp, xóa cả hai xác nhận, ghi nhật ký. */
  moLai: (planId: number) => api.put<ApiResponse<KeHoach>>(`/study_plans/${planId}/reopen`).then(layPhanHoi),
};
