import { api, layData } from './client';
import type { ApiResponse } from '../types/api';
import type { BaoCaoThongKe, MaBaoCao } from '../types/statistics';
import { tenTepTuHeader } from '../utils/taiTep';

/** Endpoint thống kê #98–#99 (UC13) — chỉ giáo vụ. */
export const statisticsApi = {
  /** #98 — bỏ trống termId = đợt đang mở. */
  baoCao: (loai: MaBaoCao, termId?: number) =>
    api.get<ApiResponse<BaoCaoThongKe>>(`/statistics/${loai}`, { params: { termId } }).then(layData),

  /** #99 — cùng dữ liệu với #98, xuất .xlsx. */
  xuatExcel: async (loai: MaBaoCao, termId: number | undefined, tenMacDinh: string) => {
    const res = await api.get<Blob>(`/statistics/${loai}/export`, { params: { termId }, responseType: 'blob' });
    return { blob: res.data, tenTep: tenTepTuHeader(res.headers['content-disposition']) ?? tenMacDinh };
  },
};
