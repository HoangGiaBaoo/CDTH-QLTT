/** dto/notification/ThongBaoResponse.java (#101, #102). `maSuKien` là mã nội bộ — không hiển thị. */
export interface ThongBao {
  id: number;
  maSuKien: string;
  noiDung: string;
  /** Đường dẫn trong giao diện tới việc cần làm (ví dụ /records/12); có thể trống. */
  duongDan?: string;
  daDoc: boolean;
  ngayTao: string;
}
