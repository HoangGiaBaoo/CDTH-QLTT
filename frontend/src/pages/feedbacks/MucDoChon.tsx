import { nhanMuc } from './bieuMau';

interface Props {
  cacMuc: { muc: number; nhan: string }[];
  value?: number | null;
  onChange: (muc: number) => void;
  /** Tên đọc màn hình, ví dụ "Mức hài lòng: Sự phù hợp…". */
  nhan: string;
  loi?: boolean;
  disabled?: boolean;
}

/** Hàng nút chọn mức (0–4 hoặc 1–5) kiểu radio; dưới hàng nút hiện nhãn của mức đang chọn. */
export default function MucDoChon({ cacMuc, value, onChange, nhan, loi, disabled }: Props) {
  return (
    <div>
      <div className={`ph-muc${loi ? ' ph-muc-loi' : ''}`} role="radiogroup" aria-label={nhan} aria-invalid={loi || undefined}>
        {cacMuc.map((m) => (
          <button key={m.muc} type="button" role="radio" aria-checked={value === m.muc} title={m.nhan} disabled={disabled}
                  className={value === m.muc ? 'ph-muc-chon' : undefined} onClick={() => onChange(m.muc)}>
            {m.muc}
          </button>
        ))}
      </div>
      <div className="ph-muc-nhan">{value != null ? nhanMuc(cacMuc, value) : loi ? 'Chưa chọn mức' : ''}</div>
    </div>
  );
}
