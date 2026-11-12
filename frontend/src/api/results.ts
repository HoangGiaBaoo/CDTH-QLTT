import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type {
  BangTongHop, CongBoRequest, CongBoResponse, KetQuaSinhVien, KetQuaTomTat, NhanXetKetQuaRequest, XacNhanKetQuaRequest,
} from '../types/result';
import { tenTepTuHeader } from '../utils/taiTep';

/** Endpoint kết quả học phần #82–#88 (UC10). */
export const resultApi = {
  /** #82 — giáo vụ cả đợt; GV và cán bộ chỉ SV mình hướng dẫn hoặc trong Tổ mình tham gia. */
  danhSach: (termId?: number) =>
    api.get<ApiResponse<KetQuaTomTat[]>>('/results', { params: { termId } }).then(layData),

  /** #83 — cán bộ nhận bảng TTTN-07 đầy đủ (sinh viên nhận dạng rút gọn, dùng ở SCR-24). */
  chiTiet: (recordId: number) => api.get<ApiResponse<BangTongHop>>(`/results/${recordId}`).then(layData),

  /** #83 gọi bằng vai trò sinh viên (SCR-24): chưa công bố hoặc chưa gửi 08b ⇒ BUSINESS_RULE_VIOLATION (BR-12.5). */
  cuaSinhVien: (recordId: number) => api.get<ApiResponse<KetQuaSinhVien>>(`/results/${recordId}`).then(layData),

  /** #84 — chạy lại thuật toán; thiếu phiếu ⇒ THIEU_PHIEU_DVHD / THIEU_PHIEU_GVHD, ghi nhật ký HP trước và sau. */
  tinhLai: (recordId: number) =>
    api.post<ApiResponse<BangTongHop>>(`/results/${recordId}/calculate`).then(layPhanHoi),

  /** #85 — chỉ GVHD của SV; điểm thưởng vượt trần ⇒ VALIDATION_ERROR (Đ18 k4). */
  nhanXet: (recordId: number, req: NhanXetKetQuaRequest) =>
    api.put<ApiResponse<BangTongHop>>(`/results/${recordId}/review`, req).then(layPhanHoi),

  /** #86 — giáo vụ xác nhận, duyệt điểm thưởng; minh chứng của hồ sơ bị khóa (CBR-22). */
  xacNhan: (recordId: number, req: XacNhanKetQuaRequest) =>
    api.put<ApiResponse<BangTongHop>>(`/results/${recordId}/confirm`, req).then(layPhanHoi),

  /** #87 — hồ sơ chuyển Hoàn thành / Không hoàn thành, gửi NT-14 tới sinh viên. */
  congBo: (req: CongBoRequest) => api.put<ApiResponse<CongBoResponse>>('/results/publish', req).then(layPhanHoi),

  /** #88 — tệp Word đúng bố cục mẫu TTTN-07. */
  xuatTTTN07: async (recordId: number, tenMacDinh: string) => {
    const res = await api.get<Blob>(`/results/${recordId}/export`, { responseType: 'blob' });
    return { blob: res.data, tenTep: tenTepTuHeader(res.headers['content-disposition']) ?? tenMacDinh };
  },
};
