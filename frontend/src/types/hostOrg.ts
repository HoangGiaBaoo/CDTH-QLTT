/** dto/hostorg/*.java (UC02, #17–#25). */
export type TrangThaiPheDuyet = 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI' | 'DA_LOAI';

export interface DonVi {
  id: number;
  maDvhd: string;
  ten: string;
  diaChi: string;
  linhVuc: string;
  nguoiDaiDien: string;
  dienThoai?: string;
  email?: string;
  trangThaiPheDuyet: TrangThaiPheDuyet;
  lyDo?: string;
  ngayPheDuyet?: string;
  soCanBo?: number;
}

/** Body #19 (#20). Mã ĐVHD bỏ trống ⇒ backend tự sinh. */
export interface DonViRequest {
  maDvhd?: string;
  ten: string;
  diaChi: string;
  linhVuc: string;
  nguoiDaiDien: string;
  dienThoai?: string;
  email?: string;
}

/** #23 — bản cho sinh viên không có tên đăng nhập, trạng thái tài khoản (CanBoResponse.choSinhVien). */
export interface CanBo {
  id: number;
  nguoiDungId?: number;
  tenDangNhap?: string;
  hoTen: string;
  email?: string;
  dienThoai?: string;
  trangThaiTaiKhoan?: string;
  donViId: number;
  tenDonVi: string;
  chucVu?: string;
  soNamKinhNghiem?: number;
  soSvToiDa: number;
  soDangHuongDan: number;
}
