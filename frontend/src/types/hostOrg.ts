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

/** Body #21 — từ chối / loại bắt buộc có lý do (UC02 5a, 5b). */
export interface PheDuyetRequest {
  quyetDinh: Exclude<TrangThaiPheDuyet, 'CHO_DUYET'>;
  lyDo?: string;
}

/** #21 — PheDuyetDonViResponse: tài khoản cán bộ vừa kích hoạt kèm mật khẩu ban đầu (chỉ trả một lần). */
export interface KetQuaPheDuyet {
  donVi: DonVi;
  taiKhoanDuocKichHoat: { canBoId: number; tenDangNhap: string; hoTen: string; matKhauBanDau: string }[];
}

/** Body #24 — tài khoản cán bộ tạo kèm; đơn vị đã duyệt thì kích hoạt ngay. */
export interface ThemCanBoRequest {
  tenDangNhap: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  chucVu?: string;
  soNamKinhNghiem: number;
  soSvToiDa?: number;
}

/** Body #25 */
export interface CapNhatCanBoRequest {
  chucVu?: string;
  soNamKinhNghiem: number;
  soSvToiDa: number;
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
  /** #24 khi đơn vị đã duyệt — mật khẩu ban đầu, chỉ trả một lần. */
  matKhauBanDau?: string;
}
