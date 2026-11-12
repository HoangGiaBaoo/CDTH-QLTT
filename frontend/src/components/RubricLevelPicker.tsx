import { diem } from '../utils/format';

export interface MucChon {
  muc: number;
  diemMin: number;
  diemMax: number;
  moTaHanhVi: string;
}

/** Đổi điểm sang đơn vị 0,01 để so sánh khoảng không bị sai số dấu phẩy động (chỉ để hiển thị; backend kiểm lại). */
const xu = (n: number) => Math.round(n * 100);

/**
 * Điểm có thuộc khoảng của mức không: nửa mở [min; max), riêng mức cao nhất đóng [min; max] (Điều 13 khoản 2,
 * CBR-10). Cùng quy tắc với RubricUtils.xacDinhMuc ở backend.
 */
export function thuocKhoang(d: number, m: MucChon, mucCaoNhat: number): boolean {
  return xu(d) >= xu(m.diemMin) && (m.muc === mucCaoNhat ? xu(d) <= xu(m.diemMax) : xu(d) < xu(m.diemMax));
}

export function moTaKhoang(m: MucChon, mucCaoNhat: number): string {
  return m.muc === mucCaoNhat
    ? `từ ${diem(m.diemMin)} đến ${diem(m.diemMax)}`
    : `từ ${diem(m.diemMin)} đến dưới ${diem(m.diemMax)}`;
}

interface Props {
  cacMuc: MucChon[];
  value?: number;
  onChange?: (muc: number) => void;
  disabled?: boolean;
  /** Tên để đọc màn hình, ví dụ "CLO1". */
  nhan: string;
}

/** Chọn mức rubric 0–4 của một CLO; dưới nút hiện mô tả hành vi của mức đang chọn (SCR-18/20). */
export default function RubricLevelPicker({ cacMuc, value, onChange, disabled, nhan }: Props) {
  const ds = [...cacMuc].sort((a, b) => a.muc - b.muc);
  const cao = Math.max(...ds.map((m) => m.muc));
  const dangChon = ds.find((m) => m.muc === value);
  return (
    <div className="rubric-picker">
      <div className="rubric-levels" role="radiogroup" aria-label={`Mức đạt ${nhan}`}>
        {ds.map((m) => (
          <button key={m.muc} type="button" role="radio" aria-checked={value === m.muc} disabled={disabled}
                  className={`rubric-level ${value === m.muc ? 'rubric-level-chon' : ''}`}
                  onClick={() => onChange?.(m.muc)}>
            <span className="rubric-level-so">Mức {m.muc}</span>
            <span className="rubric-level-khoang">
              {diem(m.diemMin)}–{m.muc === cao ? diem(m.diemMax) : `<${diem(m.diemMax)}`}
            </span>
          </button>
        ))}
      </div>
      {dangChon && <div className="rubric-mota">{dangChon.moTaHanhVi}</div>}
    </div>
  );
}
