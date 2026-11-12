import type { HinhThucThucTap, TrangThaiHoSo } from './record';

/** dto/assignment/*.java (UC05, #48–#51). */

/** #48, #50, #51 — một dòng phân công. */
export interface PhanCong {
  id: number;
  hoSoId: number;
  trangThaiHoSo: TrangThaiHoSo;
  hinhThucThucTap: HinhThucThucTap;
  sinhVienId: number;
  maSv: string;
  hoTenSinhVien: string;
  lop?: string;
  giangVienId: number;
  maGv: string;
  hoTenGiangVien: string;
  emailGiangVien?: string;
  ngayPhanCong: string;
  /** Có khi đã đổi GVHD (#51). */
  lyDoThayDoi?: string;
}

/** #49 — hai cột của SCR-13. */
export interface UngVienPhanCong {
  sinhViens: {
    hoSoId: number;
    sinhVienId: number;
    maSv: string;
    hoTen: string;
    lop?: string;
    donVi?: string;
    hinhThucThucTap: HinhThucThucTap;
  }[];
  /** Chỉ giảng viên đang hoạt động; số đã nhận đếm theo đợt (CBR-04). */
  giangViens: GiangVienHanMuc[];
}

export interface GiangVienHanMuc {
  id: number;
  maGv: string;
  hoTen: string;
  boMon?: string;
  daNhan: number;
  soSvToiDa: number;
  conNhan: number;
}

/** Body #50. */
export interface PhanCongRequest {
  giangVienId: number;
  hoSoIds: number[];
}

/** Body #51 — lý do bắt buộc. */
export interface DoiGvhdRequest {
  giangVienId: number;
  lyDo: string;
}
