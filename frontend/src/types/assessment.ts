import type { HoSo } from './record';
import type { TrangThaiChang } from './term';

/** Kiểu khớp dto/assessment/*.java (UC08, UC09 — #69–#76). */

export type TrangThaiPhieu = 'NHAP' | 'DA_NOP' | 'MO_LAI';
export type NhomNguoiCham = 'GVHD' | 'DVHD';

export interface DiemClo {
  maClo: string;
  tenClo?: string;
  mucDat: number;
  diem: number;
  nhanXet?: string;
}

export interface Phieu {
  id: number;
  hoSoId: number;
  maSv: string;
  hoTenSinhVien: string;
  chang: number;
  tenChang: string;
  nguoiChamId: number;
  hoTenNguoiCham: string;
  nhom: NhomNguoiCham;
  trangThai: TrangThaiPhieu;
  nhanXetChung?: string;
  ngayNop?: string;
  lyDoMoLai?: string;
  /** Danh sách #69 không kèm điểm; chi tiết #71 có. */
  diemClos?: DiemClo[];
}

export interface MucBieuMau {
  muc: number;
  diemMin: number;
  diemMax: number;
  moTaHanhVi: string;
  /** Điểm giữa khoảng — điền sẵn khi chọn mức (UC08 bước 5). */
  diemGoiY: number;
}

export interface CauHoiBieuMau {
  thuTu: number;
  noiDung: string;
  maClo: string;
  tenClo: string;
  cacMuc: MucBieuMau[];
}

/** #70 — nhóm ĐVHD không có câu hỏi của CLO có tỷ lệ ĐVHD = 0 (CLO7, CBR-09). */
export interface BieuMau {
  hoSo: HoSo;
  chang: number;
  tenChang: string;
  trangThaiChang: TrangThaiChang;
  ngayMo?: string;
  ngayDong?: string;
  nhom: NhomNguoiCham;
  phieuId?: number;
  cauHois: CauHoiBieuMau[];
}

export interface PhieuRequest {
  nhanXetChung?: string;
  diemClos: { maClo: string; mucDat: number; diem: number; nhanXet?: string }[];
}

export interface CanhBaoLech {
  hoSoId: number;
  maSv: string;
  hoTen: string;
  chang: number;
  maClo: string;
  tbDvhd: number;
  tbGvhd: number;
  chenhLech: number;
}
