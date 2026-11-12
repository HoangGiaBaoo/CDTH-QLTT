import type { ChuongTrinhDaoTao } from './auth';

/**
 * dto/record/HoSoResponse.java (UC04, #39–#41). Người B mở rộng khi làm SCR-11/12 — người A dùng ở SCR-18/20
 * để hiện hồ sơ tóm tắt của sinh viên được chấm.
 */
export type TrangThaiHoSo =
  | 'NHAP' | 'CHO_DVHD' | 'CHO_GVHD' | 'DANG_THUC_TAP' | 'CHO_DANH_GIA'
  | 'HOAN_THANH' | 'KHONG_HOAN_THANH' | 'GIAN_DOAN' | 'TU_CHOI';

export interface NguoiTomTat {
  id: number;
  nguoiDungId: number;
  hoTen: string;
  email?: string;
}

export interface HoSo {
  id: number;
  sinhVien: { id: number; maSv: string; hoTen: string; lop?: string; chuongTrinhDaoTao: ChuongTrinhDaoTao };
  dot: { id: number; maDot: string; ten: string };
  hinhThucThucTap: string;
  donVi?: { id: number; maDvhd: string; ten: string };
  canBoDvhd?: NguoiTomTat;
  gvhd?: NguoiTomTat;
  boPhan?: string;
  deTai?: string;
  hinhThucLamViec?: string;
  soTuanThamGia?: number;
  mucTieu?: string;
  sanPhamDuKien?: string;
  trangThai: TrangThaiHoSo;
  lyDoTuChoi?: string;
  ngayGui?: string;
}
