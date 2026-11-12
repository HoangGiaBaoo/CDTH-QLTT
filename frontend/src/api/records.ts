import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { HoSo, HoSoRequest, TrangThaiHoSo } from '../types/record';

/** Endpoint hồ sơ thực tập (UC04, #39–#47). */
export const recordApi = {
  /** #39 — GV chỉ nhận SV mình hướng dẫn, cán bộ chỉ SV mình phụ trách. */
  danhSach: (loc: { termId?: number; status?: TrangThaiHoSo; internshipType?: string } = {}) =>
    api.get<ApiResponse<HoSo[]>>('/internship_records', { params: loc }).then(layData),

  /** #40 — hồ sơ của SV trong đợt đang chạy, không có thì hồ sơ gần nhất (SCR-24 dùng). */
  cuaToi: () => api.get<ApiResponse<HoSo>>('/internship_records/me').then(layData),

  /** #41 */
  chiTiet: (recordId: number) => api.get<ApiResponse<HoSo>>(`/internship_records/${recordId}`).then(layData),

  /** #42 — tạo bản nháp TTTN-01; đã có hồ sơ trong đợt ⇒ DUPLICATE_RESOURCE (CBR-01). */
  tao: (req: HoSoRequest) => api.post<ApiResponse<HoSo>>('/internship_records', req).then(layPhanHoi),

  /** #43 — chỉ khi Bản nháp. */
  capNhat: (recordId: number, req: HoSoRequest) =>
    api.put<ApiResponse<HoSo>>(`/internship_records/${recordId}`, req).then(layPhanHoi),

  /** #44 — backend kiểm đủ thông tin, CBR-02, CBR-03, quốc tế ≥ 6 tuần; chuyển Chờ ĐVHD và báo cán bộ (NT-01). */
  gui: (recordId: number) => api.put<ApiResponse<HoSo>>(`/internship_records/${recordId}/submit`).then(layPhanHoi),
};
