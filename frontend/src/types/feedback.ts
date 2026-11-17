/**
 * dto/feedback/*.java (UC12, #94–#97). Đúng một trong `phieu08a` / `phieu08b` có giá trị theo `loai`;
 * người xem không phải chính SV thì 08b không có phần A (`chatLuong`, `yKienKhac`) và `yKienMo` (RP-06).
 */
export type LoaiPhanHoi = 'TTTN_08A' | 'TTTN_08B';

/** Một tiêu chí TTTN-08a mục 1 — mức 0–4. `noiDung` do backend điền theo biểu mẫu. */
export interface DanhGiaTieuChi {
  stt: number;
  noiDung?: string;
  muc: number;
  nhanXet?: string;
}

/** Một nội dung TTTN-08b phần A.1 — mức hài lòng 1–5. */
export interface DanhGiaHaiLong {
  stt: number;
  noiDung?: string;
  mucHaiLong: number;
  ghiChu?: string;
}

/** Một dòng TTTN-08b phần B. `diemQuyDoi` = điểm giữa khoảng của mức, do backend điền khi lưu. */
export interface TuDanhGiaClo {
  maClo: string;
  muc?: number | null;
  diemQuyDoi?: number | string;
  minhChung?: string;
}

/** TTTN-08b phần C — bốn câu theo đúng thứ tự trên biểu mẫu. */
export interface TuLuan {
  kyNangHocDuoc?: string;
  khoKhan?: string;
  keHoachCaiThien?: string;
  deXuat?: string;
}

export interface Phieu08a {
  tieuChi: DanhGiaTieuChi[];
}

export interface Phieu08b {
  chatLuong?: DanhGiaHaiLong[] | null;
  yKienKhac?: string | null;
  tuDanhGia: TuDanhGiaClo[];
  tuLuan?: TuLuan;
  camKet?: boolean;
}

export interface PhanHoi {
  id: number;
  hoSoId: number;
  loai: LoaiPhanHoi;
  nguoiGui?: string;
  ngayGui: string;
  phieu08a?: Phieu08a | null;
  phieu08b?: Phieu08b | null;
  yKienMo?: string | null;
  hpSelf?: number | string | null;
  chiSoTuNhanThuc?: number | string | null;
}

/** #96 — cán bộ ĐVHD gửi 08a kèm `phieu08a`; sinh viên gửi 08b kèm `phieu08b`. */
export interface GuiPhanHoiRequest {
  hoSoId: number;
  loai: LoaiPhanHoi;
  phieu08a?: Phieu08a;
  phieu08b?: Phieu08b;
  yKienMo?: string;
}

/** #95 — phần D: cột (1) mức, (2) điểm quy đổi, (3) α, (4) CLO×α; `hpSelf` rỗng khi còn CLO chưa chọn mức. */
export interface DongHpSelf {
  maClo: string;
  ten?: string;
  muc?: number | null;
  diemQuyDoi?: number | string | null;
  alpha: number | string;
  diemNhanAlpha?: number | string | null;
}

export interface HpSelf {
  cacClo: DongHpSelf[];
  hpSelf?: number | string | null;
  cloConThieu: string[];
}

/** #97 — `chiSo` = TB |mức tự đánh giá − mức chính thức| (≥ 0); `xuHuong` dương = tự đánh giá cao hơn. */
export interface SoSanhClo {
  maClo: string;
  ten?: string;
  mucTuDanhGia: number;
  mucChinhThuc: number;
  doLech: number;
}

export interface TuNhanThuc {
  phanHoiId: number;
  hoSoId: number;
  cacClo: SoSanhClo[];
  chiSo?: number | string | null;
  xuHuong?: number | string | null;
  hpSelf?: number | string | null;
  diemHpChinhThuc?: number | string | null;
  nhanDinh?: string | null;
}
