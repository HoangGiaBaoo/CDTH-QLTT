/** Kiểu khớp DTO backend dto/term/*.java (UC03, #26–#38). BigDecimal backend trả ra là number. */

export type TrangThaiDot = 'KHOI_TAO' | 'DANG_NHAN_DANG_KY' | 'DANG_THUC_HIEN' | 'DA_KET_THUC';
export type TrangThaiChang = 'CHUA_MO' | 'DANG_MO' | 'DA_DONG' | 'DA_TONG_HOP';

/** Thứ tự trạng thái đợt — backend chỉ cho đi tiến từng bước (#30). */
export const THU_TU_TRANG_THAI_DOT: TrangThaiDot[] = ['KHOI_TAO', 'DANG_NHAN_DANG_KY', 'DANG_THUC_HIEN', 'DA_KET_THUC'];

export interface Dot {
  id: number;
  maDot: string;
  ten: string;
  hocKy: string;
  namHoc: string;
  khoaVien?: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soTuan: number;
  hanNopBaoCao?: string;
  trangThai: TrangThaiDot;
  /** Chỉ có khi tạo đợt / mở đăng ký: lỗi cấu hình và cảnh báo CBR-23 (CLO chỉ đánh giá ở 1 chặng). */
  canhBao?: string[];
}

/** Body #29; #28 thêm `maDot`. */
export interface DotRequest {
  ten: string;
  hocKy: string;
  namHoc: string;
  khoaVien?: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  hanNopBaoCao?: string;
}

export interface TaoDotRequest extends DotRequest {
  maDot: string;
}

export interface Chang {
  id: number;
  dotId: number;
  thuTu: number;
  ten: string;
  tuanThucHien: number;
  /** Phân số 0,300 / 0,700 (không phải phần trăm). */
  trongSoW: number;
  ngayMo?: string;
  ngayDong?: string;
  trangThai: TrangThaiChang;
}

export interface Clo {
  id: number;
  dotId: number;
  maClo: string;
  ten: string;
  moTa?: string;
  /** Phần trăm, Σ 7 CLO = 100 (CBR-07). */
  trongSoAlpha: number;
  /** Phần trăm, ĐVHD + GVHD = 100 (CBR-08). */
  tyLeDvhd: number;
  tyLeGvhd: number;
}

/** Body #34 — đổi α một CLO phải gửi kèm α mới của các CLO khác để Σα vẫn bằng 100 (quyết định 10.13). */
export interface CapNhatCloRequest {
  trongSoAlpha: number;
  tyLeDvhd: number;
  tyLeGvhd: number;
  dieuChinhAlphaKhac?: { cloId: number; trongSoAlpha: number }[];
}

export interface MucRubric {
  id: number;
  chuanDauRaId: number;
  muc: number;
  diemMin: number;
  diemMax: number;
  moTaHanhVi: string;
}

export interface CauHoi {
  id: number;
  changId: number;
  thuTu: number;
  noiDung: string;
  chuanDauRaId: number;
  maClo: string;
  tenClo: string;
}
