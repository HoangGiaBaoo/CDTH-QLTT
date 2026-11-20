import { api, layData } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { ThongBao } from '../types/notification';

/** Endpoint thông báo #101–#102 — mỗi người chỉ nhận thông báo của mình (backend lọc theo người đăng nhập). */
export const notificationApi = {
  /** #101 — `unread` ⇒ chỉ thông báo chưa đọc; `total` của trang dùng làm số trên chuông. */
  danhSach: (loc: { unread?: boolean; page?: number; size?: number } = {}) =>
    api.get<ApiResponse<PageResponse<ThongBao>>>('/notifications', { params: loc }).then(layData),

  /** #102 */
  daDoc: (id: number) => api.put<ApiResponse<ThongBao>>(`/notifications/${id}/read`).then(layData),
};
