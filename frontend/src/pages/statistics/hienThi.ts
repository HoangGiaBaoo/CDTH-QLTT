import {
  NHAN_HINH_THUC_THUC_TAP, NHAN_TRANG_THAI_HO_SO, NHAN_TRANG_THAI_KET_QUA,
} from '../../utils/constants';
import type { BaoCaoThongKe, GiaTriO } from '../../types/statistics';

/** Báo cáo trả mã enum thô (HOAN_THANH, DOANH_NGHIEP…) — đổi sang nhãn tiếng Việt khi hiển thị trên màn hình. */
const NHAN_ENUM: Record<string, string> = {
  ...NHAN_TRANG_THAI_HO_SO, ...NHAN_TRANG_THAI_KET_QUA, ...NHAN_HINH_THUC_THUC_TAP,
};

const SO = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

/** Một ô báo cáo: số kiểu Việt Nam (93,3), enum ⇒ nhãn, null ⇒ "—". Chỉ hiển thị, không tính toán. */
export function oBaoCao(v: GiaTriO | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') return SO.format(v);
  return NHAN_ENUM[v] ?? v;
}

/** Chỉ số tổng hợp: nhãn có "(%)" thì thêm dấu %. */
export function chiSo(nhan: string, v: GiaTriO): string {
  const s = oBaoCao(v);
  return s !== '—' && typeof v === 'number' && nhan.includes('(%)') ? `${s}%` : s;
}

/** Đọc cột theo tiêu đề do backend đặt (ThongKeService) — báo cáo không có cột đó thì trả -1 để biểu đồ tự ẩn. */
export function viTriCot(bc: BaoCaoThongKe, ten: string): number {
  return bc.cot.indexOf(ten);
}

export function so(v: GiaTriO | undefined): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Kết luận so với mục tiêu Đ24 k2 do backend ghi sẵn — tô theo nhóm màu trạng thái, luôn kèm ký hiệu và chữ. */
export const DANH_GIA: Record<string, { lop: string; dau: string }> = {
  'Đạt mục tiêu': { lop: 'badge-xanh-la', dau: '✓' },
  'Chưa đạt mục tiêu': { lop: 'badge-do', dau: '✗' },
  'Chưa có dữ liệu': { lop: 'badge-xam', dau: '–' },
};
