/** dto/report/BaoCaoResponse.java (UC11, #89–#93) — không có đường dẫn lưu trữ, tải tệp qua #91. */
export interface BaoCao {
  id: number;
  hoSoId: number;
  phienBan: number;
  tenFile: string;
  ngayNop: string;
  nopMuon: boolean;
  soNgayTre: number;
  xacNhanDvhd?: string;
  xacNhanGvhd?: string;
  laMoiNhat: boolean;
  daDuXacNhan: boolean;
}
