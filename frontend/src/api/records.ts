import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { DoiTrangThaiHoSoRequest, HoSo, HoSoRequest, QuyetDinhRequest, TrangThaiHoSo } from '../types/record';

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

  /** #45 — cán bộ của hồ sơ, khi Chờ ĐVHD. Xác nhận ⇒ chiếm 1 chỗ hạn mức (có thể QUOTA_EXCEEDED), Chờ GVHD, NT-03. */
  xacNhanTiepNhan: (recordId: number, req: QuyetDinhRequest) =>
    api.put<ApiResponse<HoSo>>(`/internship_records/${recordId}/host_confirmation`, req).then(layPhanHoi),

  /** #46 — GVHD đã được phân công, khi Chờ GVHD. Duyệt ⇒ Đang thực tập + khung kế hoạch và tiến độ tuần (NT-06). */
  pheDuyet: (recordId: number, req: QuyetDinhRequest) =>
    api.put<ApiResponse<HoSo>>(`/internship_records/${recordId}/lecturer_approval`, req).then(layPhanHoi),

  /** #47 — giáo vụ chuyển Gián đoạn / khôi phục (Đ15 k4). */
  doiTrangThai: (recordId: number, req: DoiTrangThaiHoSoRequest) =>
    api.put<ApiResponse<HoSo>>(`/internship_records/${recordId}/status`, req).then(layPhanHoi),
};
