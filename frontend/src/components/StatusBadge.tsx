import { MAU_TRANG_THAI } from '../utils/constants';

interface Props {
  /** Giá trị enum backend, ví dụ CHO_DVHD. */
  value: string | null | undefined;
  /** Bảng nhãn của enum tương ứng trong utils/constants.ts. */
  labels: Record<string, string>;
}

/** Nhãn trạng thái màu cố định toàn ứng dụng. */
export default function StatusBadge({ value, labels }: Props) {
  if (!value) return <span className="badge badge-xam">—</span>;
  return <span className={`badge badge-${MAU_TRANG_THAI[value] ?? 'xam'}`}>{labels[value] ?? value}</span>;
}
