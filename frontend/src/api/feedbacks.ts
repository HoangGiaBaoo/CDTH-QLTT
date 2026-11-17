import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { GuiPhanHoiRequest, HpSelf, PhanHoi, TuDanhGiaClo, TuNhanThuc } from '../types/feedback';

/** Endpoint phản hồi 08a/08b #94–#97 (UC12). */
export const feedbackApi = {
  /** #94 — theo phạm vi quyền: cán bộ ĐVHD không thấy 08b; SV chỉ thấy 08a sau khi kết quả công bố. */
  theoHoSo: (recordId: number) =>
    api.get<ApiResponse<PhanHoi[]>>(`/internship_records/${recordId}/feedbacks`).then(layData),

  /** #95 — tính thử HPself; gửi danh sách rỗng để lấy 7 CLO của đợt (tên, α) dựng bảng tự đánh giá. */
  xemTruocHpSelf: (hoSoId: number, tuDanhGia: TuDanhGiaClo[]) =>
    api.post<ApiResponse<HpSelf>>('/feedbacks/self_score_preview', { hoSoId, tuDanhGia }).then(layData),

  /** #96 — mỗi hồ sơ một phiếu mỗi loại; gửi xong không sửa được. */
  gui: (req: GuiPhanHoiRequest) => api.post<ApiResponse<PhanHoi>>('/feedbacks', req).then(layPhanHoi),

  /** #97 — chỉ SV và GVHD của SV, sau khi kết quả chính thức được công bố. */
  tuNhanThuc: (feedbackId: number) =>
    api.get<ApiResponse<TuNhanThuc>>(`/feedbacks/${feedbackId}/self_awareness`).then(layData),
};
