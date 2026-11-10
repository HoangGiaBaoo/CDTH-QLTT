/** Định dạng hiển thị kiểu Việt Nam (skill giao-dien-react › Định dạng hiển thị). Không dùng để tính toán. */

const SO_1 = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Điểm: 1 chữ số thập phân, dấu phẩy — 7,7. Backend đã làm tròn; ở đây chỉ hiển thị. */
export function diem(x: number | string | null | undefined): string {
  if (x === null || x === undefined || x === '') return '—';
  const n = typeof x === 'string' ? Number(x) : x;
  return Number.isFinite(n) ? SO_1.format(n) : '—';
}

/** Trọng số / tỷ lệ phần trăm: 20%. */
export function phanTram(x: number | string | null | undefined): string {
  if (x === null || x === undefined || x === '') return '—';
  return `${Number(x).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
}

function haiSo(n: number): string {
  return n.toString().padStart(2, '0');
}

/** dd/MM/yyyy — nhận LocalDate "2026-11-10" hoặc LocalDateTime/Instant. */
export function ngay(x: string | null | undefined): string {
  if (!x) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(x);
  if (!m) return x;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** dd/MM/yyyy HH:mm theo giờ máy người dùng. */
export function ngayGio(x: string | null | undefined): string {
  if (!x) return '—';
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return x;
  return `${haiSo(d.getDate())}/${haiSo(d.getMonth() + 1)}/${d.getFullYear()} ${haiSo(d.getHours())}:${haiSo(d.getMinutes())}`;
}
