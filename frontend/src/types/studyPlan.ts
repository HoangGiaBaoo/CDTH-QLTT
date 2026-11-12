/** dto/studyplan/KeHoachResponse.java (UC06, #52–#56). */
export type TrangThaiKeHoach = 'NHAP' | 'CHO_XAC_NHAN' | 'DA_KHOA';

export interface KeHoach {
  id: number;
  hoSoId: number;
  trangThai: TrangThaiKeHoach;
  /** Ngày làm việc thứ 5 kể từ ngày bắt đầu đợt (Đ6 k3a); gửi sau ngày này ⇒ `nopMuon` (BR-06.3). */
  hanNop: string;
  ngayNop?: string;
  nopMuon?: boolean;
  xacNhanDvhd?: string;
  xacNhanGvhd?: string;
  /** N dòng tuần + 1 dòng Tổng kết (`laTongKet`). */
  cacMuc: {
    id: number;
    tuan: number;
    laTongKet: boolean;
    mucTieu?: string;
    ketQuaMongDoi?: string;
    hinhThucMinhChung?: string;
  }[];
}

/** Body #53 — lưu nháp; dòng nào gửi lên thì ghi đè dòng đó (`tuan` của dòng Tổng kết = số tuần + 1). */
export interface CapNhatKeHoachRequest {
  cacMuc: { tuan: number; mucTieu?: string; ketQuaMongDoi?: string; hinhThucMinhChung?: string }[];
}
