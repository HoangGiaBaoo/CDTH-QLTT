import type { ChuongTrinhDaoTao } from './auth';

/** dto/record/HoSoResponse.java, HoSoRequest.java (UC04, #39–#47). */
export type TrangThaiHoSo =
  | 'NHAP' | 'CHO_DVHD' | 'CHO_GVHD' | 'DANG_THUC_TAP' | 'CHO_DANH_GIA'
  | 'HOAN_THANH' | 'KHONG_HOAN_THANH' | 'GIAN_DOAN' | 'TU_CHOI';

/** Sáu hình thức theo Điều 4. */
export type HinhThucThucTap = 'DOANH_NGHIEP' | 'NGHIEN_CUU' | 'KHOI_NGHIEP' | 'CONG_DONG' | 'NOI_BO' | 'QUOC_TE';
export type HinhThucLamViec = 'TRUC_TIEP' | 'TRUC_TUYEN';

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
  hinhThucThucTap: HinhThucThucTap;
  donVi?: { id: number; maDvhd: string; ten: string };
  canBoDvhd?: NguoiTomTat;
  gvhd?: NguoiTomTat;
  boPhan?: string;
  deTai?: string;
  hinhThucLamViec?: HinhThucLamViec;
  soTuanThamGia?: number;
  mucTieu?: string;
  sanPhamDuKien?: string;
  trangThai: TrangThaiHoSo;
  lyDoTuChoi?: string;
  ngayGui?: string;
}

/** Body #42, #43 — bản nháp được thiếu đơn vị / cán bộ / đề tài; đủ thông tin chỉ bắt buộc khi gửi (#44). */
export interface HoSoRequest {
  /** Bỏ trống ⇒ đợt đang mở đăng ký. */
  dotId?: number;
  hinhThucThucTap: HinhThucThucTap;
  donViId?: number;
  canBoDvhdId?: number;
  boPhan?: string;
  deTai?: string;
  hinhThucLamViec?: HinhThucLamViec;
  soTuanThamGia?: number;
  mucTieu?: string;
  sanPhamDuKien?: string;
}

/** Body #45 (cán bộ ĐVHD) và #46 (GVHD) — từ chối thì `lyDo` bắt buộc, hồ sơ về Bản nháp. */
export interface QuyetDinhRequest {
  dongY: boolean;
  lyDo?: string;
}

/** Body #47 — `gianDoan = true`: chuyển Gián đoạn (Đ15 k4); false: khôi phục. Lý do luôn bắt buộc. */
export interface DoiTrangThaiHoSoRequest {
  gianDoan: boolean;
  lyDo: string;
}
