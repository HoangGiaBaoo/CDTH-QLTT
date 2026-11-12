import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { CanBo, DonVi, DonViRequest, TrangThaiPheDuyet } from '../types/hostOrg';

/** Endpoint đơn vị hướng dẫn #17–#25 (UC02). */
export const hostOrgApi = {
  /** #17 — sinh viên chỉ nhận đơn vị Đã duyệt (CBR-02). */
  danhSach: (loc: { status?: TrangThaiPheDuyet; keyword?: string } = {}) =>
    api.get<ApiResponse<DonVi[]>>('/host_organizations', { params: loc }).then(layData),

  /** #18 */
  chiTiet: (orgId: number) => api.get<ApiResponse<DonVi>>(`/host_organizations/${orgId}`).then(layData),

  /** #19 — luôn vào Chờ duyệt; sinh viên dùng để đề xuất đơn vị chưa có trong danh mục. */
  tao: (req: DonViRequest) => api.post<ApiResponse<DonVi>>('/host_organizations', req).then(layPhanHoi),

  /** #23 — sinh viên chỉ nhận cán bộ đang hoạt động và còn hạn mức trong đợt (CBR-03). */
  canBo: (orgId: number) => api.get<ApiResponse<CanBo[]>>(`/host_organizations/${orgId}/supervisors`).then(layData),
};
