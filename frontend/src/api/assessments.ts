import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { BieuMau, CanhBaoLech, Phieu, PhieuRequest, TrangThaiPhieu } from '../types/assessment';

/** Endpoint #69–#76 (docs/02-api.md mục UC08). Quyền sở hữu và BR-08.7 do backend chặn — giao diện chỉ tiện lợi. */
export const assessmentApi = {
  /** #69 — người chấm chỉ nhận phiếu của mình; giáo vụ nhận toàn bộ. */
  danhSach: (loc: { termId?: number; stage?: number; status?: TrangThaiPhieu } = {}) =>
    api.get<ApiResponse<Phieu[]>>('/assessments', { params: loc }).then(layData),

  /** #70 */
  bieuMau: (recordId: number, stage: number) =>
    api.get<ApiResponse<BieuMau>>('/assessments/form', { params: { recordId, stage } }).then(layData),

  /** #71 — phiếu người khác cùng chặng chỉ xem được khi cả hai đã nộp (BR-08.7). */
  chiTiet: (assessmentId: number) => api.get<ApiResponse<Phieu>>(`/assessments/${assessmentId}`).then(layData),

  /** #72 — tạo phiếu nháp; mỗi người chấm một phiếu cho một SV trong một chặng (CBR-11). */
  tao: (req: PhieuRequest & { hoSoId: number; chang: number }) =>
    api.post<ApiResponse<Phieu>>('/assessments', req).then(layPhanHoi),

  /** #73 */
  capNhat: (assessmentId: number, req: PhieuRequest) =>
    api.put<ApiResponse<Phieu>>(`/assessments/${assessmentId}`, req).then(layPhanHoi),

  /** #74 — kiểm đủ CLO, nhận xét chung, điểm thuộc khoảng của mức (CBR-10); nộp xong bị khóa. */
  nop: (assessmentId: number) => api.put<ApiResponse<Phieu>>(`/assessments/${assessmentId}/submit`).then(layPhanHoi),

  /** #75 — chỉ giáo vụ, lý do bắt buộc (CBR-12). */
  moLai: (assessmentId: number, lyDo: string) =>
    api.put<ApiResponse<Phieu>>(`/assessments/${assessmentId}/reopen`, { lyDo }).then(layPhanHoi),

  /** #76 — cặp nhóm lệch trên 2,0 điểm ở cùng CLO (BR-08.9), chỉ cảnh báo. */
  canhBaoLech: (termId?: number) =>
    api.get<ApiResponse<CanhBaoLech[]>>('/assessments/deviation_warnings', { params: { termId } }).then(layData),
};
