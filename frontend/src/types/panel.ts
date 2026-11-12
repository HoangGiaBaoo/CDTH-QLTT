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
