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
  yeuCauBoSung?: string;
}
