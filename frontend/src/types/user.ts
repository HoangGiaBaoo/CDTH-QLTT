import type { ChuongTrinhDaoTao, NguoiDung, VaiTro } from './auth';

/** dto/user/TaoNguoiDungRequest.java (#7) — chỉ khối hồ sơ khớp vai trò được dùng; bỏ trống mật khẩu ⇒ hệ thống sinh. */
export interface TaoNguoiDungRequest {
  tenDangNhap: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  vaiTro: VaiTro;
  matKhau?: string;
  sinhVien?: HoSoSinhVien;
  giangVien?: HoSoGiangVien;
  canBoDvhd?: HoSoCanBo;
}

export interface HoSoSinhVien {
  maSv: string;
  lop?: string;
  khoaHoc?: string;
  nganh?: string;
  khoaVien?: string;
  chuongTrinhDaoTao: ChuongTrinhDaoTao;
}

export interface HoSoGiangVien {
  maGv: string;
  boMon?: string;
  khoaVien?: string;
  hocHamHocVi?: string;
  soSvToiDa?: number;
}

export interface HoSoCanBo {
  donViId: number;
  chucVu?: string;
  soNamKinhNghiem: number;
  soSvToiDa?: number;
}

/** #7, #10 — mật khẩu ban đầu chỉ trả về một lần. */
export interface TaoNguoiDungResponse {
  nguoiDung: NguoiDung;
  matKhauBanDau: string;
}

/** #8 */
export interface CapNhatNguoiDungRequest {
  hoTen: string;
  email: string;
  dienThoai?: string;
}

/** #13 */
export type CapNhatSinhVienRequest = HoSoSinhVien;

/** #16 */
export interface CapNhatGiangVienRequest {
  boMon?: string;
  khoaVien?: string;
  hocHamHocVi?: string;
  soSvToiDa: number;
}
