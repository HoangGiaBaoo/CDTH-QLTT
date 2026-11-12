/** dto/studyplan/KeHoachResponse.java (UC06, #52–#56). */
export type TrangThaiKeHoach = 'NHAP' | 'CHO_XAC_NHAN' | 'DA_KHOA';

export interface KeHoach {
  id: number;
  hoSoId: number;
  trangThai: TrangThaiKeHoach;
  /** 5 ngày làm việc kể từ khi GVHD duyệt hồ sơ (BR-06.3). */
  hanNop?: string;
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
