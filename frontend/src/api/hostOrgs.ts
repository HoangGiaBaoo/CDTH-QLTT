import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type {
  CanBo, CapNhatCanBoRequest, DonVi, DonViRequest, KetQuaPheDuyet, PheDuyetRequest, ThemCanBoRequest, TrangThaiPheDuyet,
} from '../types/hostOrg';

/** Endpoint đơn vị hướng dẫn #17–#25 (UC02). */
export const hostOrgApi = {
  /** #17 — sinh viên chỉ nhận đơn vị Đã duyệt (CBR-02). */
  danhSach: (loc: { status?: TrangThaiPheDuyet; keyword?: string } = {}) =>
    api.get<ApiResponse<DonVi[]>>('/host_organizations', { params: loc }).then(layData),

  /** #18 */
  chiTiet: (orgId: number) => api.get<ApiResponse<DonVi>>(`/host_organizations/${orgId}`).then(layData),

  /** #19 — luôn vào Chờ duyệt; sinh viên dùng để đề xuất đơn vị chưa có trong danh mục. */
  tao: (req: DonViRequest) => api.post<ApiResponse<DonVi>>('/host_organizations', req).then(layPhanHoi),

  /** #20 */
  capNhat: (orgId: number, req: DonViRequest) =>
    api.put<ApiResponse<DonVi>>(`/host_organizations/${orgId}`, req).then(layPhanHoi),

  /** #21 — duyệt kích hoạt tài khoản cán bộ và trả mật khẩu ban đầu một lần. */
  pheDuyet: (orgId: number, req: PheDuyetRequest) =>
    api.put<ApiResponse<KetQuaPheDuyet>>(`/host_organizations/${orgId}/approval`, req).then(layPhanHoi),

  /** #22 — xóa mềm; đã có hồ sơ gắn vào ⇒ RESOURCE_IN_USE. */
  xoa: (orgId: number) => api.delete<ApiResponse<void>>(`/host_organizations/${orgId}`).then(layPhanHoi),

  /** #23 — sinh viên chỉ nhận cán bộ đang hoạt động và còn hạn mức trong đợt (CBR-03). */
  canBo: (orgId: number) => api.get<ApiResponse<CanBo[]>>(`/host_organizations/${orgId}/supervisors`).then(layData),

  /** #24 — kinh nghiệm < 3 năm ⇒ BUSINESS_RULE_VIOLATION (CBR-05). */
  themCanBo: (orgId: number, req: ThemCanBoRequest) =>
    api.post<ApiResponse<CanBo>>(`/host_organizations/${orgId}/supervisors`, req).then(layPhanHoi),

  /** #25 */
  capNhatCanBo: (supervisorId: number, req: CapNhatCanBoRequest) =>
    api.put<ApiResponse<CanBo>>(`/supervisors/${supervisorId}`, req).then(layPhanHoi),
};
