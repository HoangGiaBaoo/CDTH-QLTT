import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { BaoCao, NopBaoCaoRequest } from '../types/report';
import { tenTepTuHeader } from '../utils/taiTep';

/** Endpoint báo cáo TTTN-06 #89–#93 (UC11). */
export const reportApi = {
  /** #89 — mọi phiên bản đã nộp, mới nhất trước; `laMoiNhat` đánh dấu bản đang hiệu lực. */
  danhSach: (recordId: number) =>
    api.get<ApiResponse<BaoCao[]>>(`/internship_records/${recordId}/reports`).then(layData),

  /**
   * #90 — multipart; mỗi lần nộp là một phiên bản mới. Backend kiểm pdf/docx + content-type + 20 MB (UC11 3a), gắn
   * Nộp muộn (5a), chặn khi bản mới nhất đã có xác nhận (6a). Timeout riêng như #66.
   */
  nop: (req: NopBaoCaoRequest, onTienDo?: (phanTram: number) => void) => {
    const form = new FormData();
    form.append('recordId', String(req.recordId));
    form.append('checklistConfirmed', String(req.checklistConfirmed));
    form.append('file', req.file);
    return api.post<ApiResponse<BaoCao>>('/reports', form, {
      timeout: 10 * 60 * 1000,
      onUploadProgress: (e) => { if (onTienDo && e.total) onTienDo(Math.round((e.loaded * 100) / e.total)); },
    }).then(layPhanHoi);
  },

  /** #91 — tải tệp qua endpoint có kiểm quyền (thư mục uploads không phục vụ tĩnh). */
  taiVe: async (reportId: number, tenMacDinh: string) => {
    const res = await api.get<Blob>(`/reports/${reportId}/file`, { responseType: 'blob', timeout: 10 * 60 * 1000 });
    return { blob: res.data, tenTep: tenTepTuHeader(res.headers['content-disposition']) ?? tenMacDinh };
  },

  /** #92 — cán bộ ĐVHD trước, GVHD sau; đủ hai ⇒ hồ sơ Chờ đánh giá cuối kỳ (Đ10 k2). */
  xacNhan: (reportId: number) =>
    api.put<ApiResponse<BaoCao>>(`/reports/${reportId}/confirmation`).then(layPhanHoi),

  /** #93 — GVHD xóa hai xác nhận của bản mới nhất để SV nộp phiên bản khác (BR-11.4). */
  moLai: (reportId: number) =>
    api.put<ApiResponse<BaoCao>>(`/reports/${reportId}/reopen`).then(layPhanHoi),
};
