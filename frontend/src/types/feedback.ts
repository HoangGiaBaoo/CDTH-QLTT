/**
 * dto/feedback/PhanHoiResponse.java (UC12, #94–#97). Đúng một trong `phieu08a` / `phieu08b` có giá trị theo `loai`;
 * người xem không phải chính SV thì 08b không có phần A và ý kiến mở. Chi tiết hai phiếu khai báo ở SCR-23.
 */
export type LoaiPhanHoi = 'TTTN_08A' | 'TTTN_08B';

export interface PhanHoi {
  id: number;
  hoSoId: number;
  loai: LoaiPhanHoi;
  nguoiGui?: string;
  ngayGui: string;
  hpSelf?: number | string;
  chiSoTuNhanThuc?: number | string;
}
