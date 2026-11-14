/** dto/progress/*.java (UC07, #57–#63). */

/** #57 — một ngày nhật ký; `suaDuoc` chỉ trong 7 ngày gần nhất (BR-07.2). */
export interface NhatKy {
  id: number;
  hoSoId: number;
  ngay: string;
  noiDung: string;
  /** BigDecimal — chỉ hiển thị. */
  soGio?: number | string;
  ketQua?: string;
  ngayTao: string;
  suaDuoc: boolean;
}

/** Body #58 — `hoSoId` bỏ trống thì backend lấy hồ sơ đang thực tập của SV; `soGio` 0–24, một chữ số thập phân. */
export interface NhatKyRequest {
  hoSoId?: number;
  ngay: string;
  noiDung: string;
  soGio?: number;
  ketQua?: string;
}

/** Body #59 — ngày của bản ghi không đổi được. */
export type CapNhatNhatKyRequest = Omit<NhatKyRequest, 'hoSoId' | 'ngay'>;

/** Phần tử kết quả #60 — SV đã được nhắc; `ngayGhiCuoi` trống là chưa ghi lần nào. */
export interface NhacNho {
  hoSoId: number;
  maSv: string;
  hoTen: string;
  ngayGhiCuoi?: string;
}

/** #61 — một dòng bảng tiến độ TTTN-03. */
export interface TienDo {
  id: number;
  hoSoId: number;
  tuan: number;
  congViecDuocGiao?: string;
  ketQuaThucHien?: string;
  phanTramHoanThanh?: number;
  daXacNhan: boolean;
  ngayXacNhan?: string;
  /** Nội dung cán bộ ĐVHD yêu cầu bổ sung gần nhất (UC07 6a); xóa khi cán bộ xác nhận dòng. */
  yeuCauBoSung?: string;
}

/** Body #62 — gửi cả ba trường (trường trống ⇒ backend lưu rỗng); `phanTramHoanThanh` 0–100. */
export interface CapNhatTienDoRequest {
  congViecDuocGiao?: string;
  ketQuaThucHien?: string;
  phanTramHoanThanh?: number;
}

/** Body #63 — `dongY = false` là yêu cầu bổ sung, bắt buộc `yeuCauBoSung` (tối đa 500 ký tự). */
export interface XacNhanTienDoRequest {
  dongY: boolean;
  yeuCauBoSung?: string;
}
