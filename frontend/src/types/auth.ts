export type VaiTro = 'ADMIN' | 'GIANG_VIEN' | 'CAN_BO_DVHD' | 'SINH_VIEN';
export type TrangThaiTaiKhoan = 'HOAT_DONG' | 'VO_HIEU_HOA';
export type ChuongTrinhDaoTao = 'CHUAN' | 'CLC_STEM';

export interface SinhVienTomTat {
  id: number;
  maSv: string;
  lop?: string;
  khoaHoc?: string;
  nganh?: string;
  khoaVien?: string;
  chuongTrinhDaoTao: ChuongTrinhDaoTao;
}

export interface GiangVienTomTat {
  id: number;
  maGv: string;
  boMon?: string;
  khoaVien?: string;
  hocHamHocVi?: string;
  soSvToiDa: number;
}

export interface CanBoTomTat {
  id: number;
  donViId: number;
  tenDonVi: string;
  chucVu?: string;
  soNamKinhNghiem: number;
  soSvToiDa: number;
}

/** dto/user/NguoiDungResponse.java — không bao giờ có mật khẩu băm, số lần sai, thời điểm khóa. */
export interface NguoiDung {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  ngayTao?: string;
  sinhVien?: SinhVienTomTat;
  giangVien?: GiangVienTomTat;
  canBoDvhd?: CanBoTomTat;
}

/** #1 — dto/auth/DangNhapRequest.java */
export interface DangNhapRequest {
  tenDangNhap: string;
  matKhau: string;
}

/** #1 — dto/auth/DangNhapResponse.java; hetHan là Instant ISO-8601. */
export interface DangNhapResponse {
  token: string;
  hetHan: string;
  nguoiDung: NguoiDung;
}
