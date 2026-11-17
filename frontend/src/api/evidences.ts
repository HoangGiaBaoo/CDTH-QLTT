import { api, layData, layPhanHoi } from './client';
import type { ApiResponse } from '../types/api';
import type { DoiChieuMinhChung, MinhChung, TaiLenMinhChungRequest } from '../types/evidence';
import { tenTepTuHeader } from '../utils/taiTep';

/** Endpoint minh chứng #64–#68 (UC07). */
export const evidenceApi = {
  /** #64 — mới nhất trước; lọc theo mã loại (`type`) và tuần (`week`). */
  danhSach: (recordId: number, loc: { type?: string; week?: number } = {}) =>
    api.get<ApiResponse<MinhChung[]>>(`/internship_records/${recordId}/evidences`, { params: loc }).then(layData),

  /** #65 — danh mục bắt buộc theo hình thức thực tập của hồ sơ, kèm Đủ / Thiếu. */
  doiChieu: (recordId: number) =>
    api.get<ApiResponse<DoiChieuMinhChung>>(`/internship_records/${recordId}/evidences/checklist`).then(layData),

  /**
   * #66 — multipart; backend kiểm đuôi + content-type + 20 MB (CBR-24) ⇒ FILE_TOO_LARGE / UNSUPPORTED_FILE_TYPE.
   * Tệp 20 MB qua mạng chậm lâu hơn timeout chung 30 giây nên nới riêng cho lệnh này.
   */
  taiLen: (req: TaiLenMinhChungRequest, onTienDo?: (phanTram: number) => void) => {
    const form = new FormData();
    form.append('recordId', String(req.recordId));
    form.append('type', req.type);
    if (req.week !== undefined) form.append('week', String(req.week));
    form.append('file', req.file);
    return api.post<ApiResponse<MinhChung>>('/evidences', form, {
      timeout: 10 * 60 * 1000,
      onUploadProgress: (e) => { if (onTienDo && e.total) onTienDo(Math.round((e.loaded * 100) / e.total)); },
    }).then(layPhanHoi);
  },

  /** #67 — tải tệp qua endpoint có kiểm quyền (thư mục uploads không phục vụ tĩnh). */
  taiVe: async (evidenceId: number, tenMacDinh: string) => {
    const res = await api.get<Blob>(`/evidences/${evidenceId}/file`, { responseType: 'blob', timeout: 10 * 60 * 1000 });
    return { blob: res.data, tenTep: tenTepTuHeader(res.headers['content-disposition']) ?? tenMacDinh };
  },

  /** #68 — chỉ khi hồ sơ đang thực tập / chờ đánh giá và chưa chốt điểm; đã khóa ⇒ RESOURCE_LOCKED (UC07 8a). */
  xoa: (evidenceId: number) => api.delete<ApiResponse<void>>(`/evidences/${evidenceId}`).then(layPhanHoi),
};
