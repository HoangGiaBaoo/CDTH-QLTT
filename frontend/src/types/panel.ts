import type { VaiTro } from './auth';
import type { NhomNguoiCham } from './assessment';
import type { TrangThaiHoSo } from './record';

/** dto/panel/ToDanhGiaResponse.java (UC09, #77–#81). */
export interface ThanhVienTo {
  id: number;
  nguoiDungId: number;
  hoTen: string;
  vaiTro: VaiTro;
  nhom: NhomNguoiCham;
  laChuTich: boolean;
  /** Thành viên vắng mặt bị loại khỏi trung bình và không chấm được (CBR-15). */
  vangMat: boolean;
}

export interface ToDanhGia {
  id: number;
  dotId: number;
  maDot: string;
  ngayThanhLap?: string;
  thoiGianBaoCao?: string;
  diaDiem?: string;
  hinhThuc?: string;
  ghiChuPheDuyet?: string;
  duongDanGhiHinh?: string;
  thanhViens: ThanhVienTo[];
  hoSos: { hoSoId: number; maSv: string; hoTen: string; lop?: string; trangThai: TrangThaiHoSo }[];
  canhBao?: string[];
}

/** Body #79 — nhóm người chấm phải khớp vai trò: giảng viên ⇒ GVHD, cán bộ ĐVHD ⇒ DVHD. */
export interface TaoToRequest {
  dotId: number;
  hoSoIds: number[];
  thanhViens: { nguoiDungId: number; nhom: NhomNguoiCham; laChuTich: boolean }[];
  /** LocalDateTime "2026-11-20T08:00". */
  thoiGianBaoCao?: string;
  diaDiem?: string;
  hinhThuc?: string;
  ghiChuPheDuyet?: string;
}

/** Body #80 — trường để trống thì giữ nguyên. */
export interface CapNhatToRequest {
  thoiGianBaoCao?: string;
  diaDiem?: string;
  hinhThuc?: string;
  ghiChuPheDuyet?: string;
  duongDanGhiHinh?: string;
}

/** Body #81. */
export interface VangMatRequest {
  vangMat: boolean;
  lyDo: string;
  thayTheNguoiDungId?: number;
  thayTheNhom?: NhomNguoiCham;
}
