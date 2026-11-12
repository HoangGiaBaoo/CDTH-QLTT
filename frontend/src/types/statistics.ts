/**
 * dto/stats/BaoCaoThongKeResponse.java (#98) — mọi loại RP-01 … RP-06 cùng một dạng bảng để giao diện và bản Excel
 * (#99) dùng chung. Giá trị ô là số hoặc chuỗi; `tongHop` giữ thứ tự hiển thị (nhãn tiếng Việt → giá trị).
 */
export type MaBaoCao = 'RP-01' | 'RP-02' | 'RP-03' | 'RP-04' | 'RP-05' | 'RP-06';

export type GiaTriO = string | number | null;

export interface BaoCaoThongKe {
  maBaoCao: MaBaoCao;
  tenBaoCao: string;
  dotId: number;
  maDot: string;
  tenDot: string;
  thoiDiemLap: string;
  cot: string[];
  dong: GiaTriO[][];
  /** Phần lớn là số/chuỗi; "Ý kiến của sinh viên (ẩn danh)" ở RP-06 là mảng chuỗi. */
  tongHop: Record<string, GiaTriO | string[]>;
  ghiChu: string[];
}
