import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type {
  CapNhatCloRequest, CauHoi, Chang, Clo, Dot, DotRequest, MucRubric, TaoDotRequest, TrangThaiChang, TrangThaiDot,
} from '../types/term';

/** Endpoint #26–#37 (docs/02-api.md mục UC03). */
export const termApi = {
  /** #26 */
  danhSach: (loc: { academicYear?: string; semester?: string; status?: TrangThaiDot } = {}) =>
    api.get<ApiResponse<Dot[]>>('/terms', { params: loc }).then(layData),

  /** #27 */
  chiTiet: (termId: number) => api.get<ApiResponse<Dot>>(`/terms/${termId}`).then(layData),

  /** #28 — backend sinh 2 chặng, nhân bản 7 CLO, 35 mức rubric, 13 câu hỏi. */
  tao: (req: TaoDotRequest) => api.post<ApiResponse<Dot>>('/terms', req).then(layPhanHoi),

  /** #29 — đổi ngày kết thúc thì backend tính lại mốc chặng 2 và gửi NT-15. */
  capNhat: (termId: number, req: DotRequest) => api.put<ApiResponse<Dot>>(`/terms/${termId}`, req).then(layPhanHoi),

  /** #30 */
  doiTrangThai: (termId: number, trangThai: TrangThaiDot) =>
    api.put<ApiResponse<Dot>>(`/terms/${termId}/status`, { trangThai }).then(layPhanHoi),

  /** #31 */
  danhSachChang: (termId: number) => api.get<ApiResponse<Chang[]>>(`/terms/${termId}/stages`).then(layData),

  /** #32 — mở/đóng thủ công; backend kiểm CBR-13 (chặng 1 từ đầu tuần 4, chặng 2 sau ngày kết thúc). */
  doiTrangThaiChang: (stageId: number, trangThai: Extract<TrangThaiChang, 'DANG_MO' | 'DA_DONG'>) =>
    api.put<ApiResponse<Chang>>(`/stages/${stageId}/status`, { trangThai }).then(layPhanHoi),

  /** #33 */
  danhSachClo: (termId: number) => api.get<ApiResponse<Clo[]>>(`/terms/${termId}/clos`).then(layData),

  /** #34 — trả lại cả 7 CLO sau khi sửa. */
  capNhatClo: (cloId: number, req: CapNhatCloRequest) =>
    api.put<ApiResponse<Clo[]>>(`/clos/${cloId}`, req).then(layPhanHoi),

  /** #35 */
  danhSachMucRubric: (cloId: number) => api.get<ApiResponse<MucRubric[]>>(`/clos/${cloId}/rubric_levels`).then(layData),

  /** #36 — chỉ sửa mô tả hành vi, không đổi số mức và khoảng điểm (BR-03.7). */
  capNhatMucRubric: (levelId: number, moTaHanhVi: string) =>
    api.put<ApiResponse<MucRubric>>(`/rubric_levels/${levelId}`, { moTaHanhVi }).then(layPhanHoi),

  /** #37 */
  danhSachCauHoi: (stageId: number) => api.get<ApiResponse<CauHoi[]>>(`/stages/${stageId}/questions`).then(layData),
};
