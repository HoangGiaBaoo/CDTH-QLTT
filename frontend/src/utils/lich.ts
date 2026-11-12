import type { Dot } from '../types/term';

/** "2026-09-07" → Date giờ địa phương (không qua UTC để khỏi lệch một ngày). */
function sangNgay(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

const ddMM = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Khoảng ngày của tuần thứ `tuan` tính từ ngày bắt đầu đợt, không vượt ngày kết thúc — chỉ để SV dễ hình dung. */
export function khoangTuan(dot: Dot, tuan: number): string {
  const dau = sangNgay(dot.ngayBatDau);
  dau.setDate(dau.getDate() + (tuan - 1) * 7);
  const cuoi = new Date(dau);
  cuoi.setDate(cuoi.getDate() + 6);
  const ketThuc = sangNgay(dot.ngayKetThuc);
  return `${ddMM(dau)} – ${ddMM(cuoi > ketThuc ? ketThuc : cuoi)}`;
}

export interface HanConLai {
  quaHan: boolean;
  homNayLaHan: boolean;
  /** Số ngày làm việc từ hôm nay tới hạn, tính cả hai đầu. */
  soNgay: number;
}

/**
 * Đếm ngày làm việc còn lại tới hạn nộp kế hoạch — chỉ để nhắc. Hạn do backend tính (5 ngày làm việc từ ngày bắt
 * đầu đợt, Điều 6 khoản 3 điểm a) và backend quyết định nhãn Nộp muộn; ở đây cũng chỉ bỏ thứ 7, chủ nhật như backend.
 */
export function hanConLai(hanNop: string, homNay = new Date()): HanConLai {
  const han = sangNgay(hanNop);
  const ngay = new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate());
  if (ngay > han) return { quaHan: true, homNayLaHan: false, soNgay: 0 };
  let soNgay = 0;
  for (const d = new Date(ngay); d <= han; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) soNgay++;
  }
  return { quaHan: false, homNayLaHan: ngay.getTime() === han.getTime(), soNgay };
}

/** Tuần thứ mấy của đợt chứa `ngay` (tuần 1 bắt đầu từ ngày bắt đầu đợt); > `soTuan` nghĩa là sau ngày kết thúc. */
export function tuanCua(dot: Dot, ngay: string): number {
  const ms = sangNgay(ngay).getTime() - sangNgay(dot.ngayBatDau).getTime();
  return Math.floor(Math.round(ms / 86_400_000) / 7) + 1;
}

const THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/** "Thứ 2" … "Chủ nhật" của một ngày yyyy-MM-dd. */
export function thu(ngay: string): string {
  return THU[sangNgay(ngay).getDay()];
}

/** Hôm nay dạng yyyy-MM-dd theo giờ máy (giá trị cho `<input type="date">`). */
export function homNayIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Số ngày lịch từ `ngay` tới hôm nay. */
export function soNgayTruoc(ngay: string, homNay = new Date()): number {
  const h = new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate());
  return Math.round((h.getTime() - sangNgay(ngay).getTime()) / 86_400_000);
}
