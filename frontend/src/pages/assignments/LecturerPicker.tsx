import type { GiangVienHanMuc } from '../../types/assignment';

interface Props {
  ds: GiangVienHanMuc[];
  chon?: number;
  onChon: (id: number) => void;
  /** Số SV định phân công — dùng để báo trước khi không đủ chỗ. */
  soCan: number;
  /** `name` của nhóm radio (trang có thể có hai nhóm: phân công và đổi GVHD). */
  ten: string;
  /** Bỏ giảng viên hiện tại khi đổi GVHD. */
  boQua?: number;
}

/**
 * Danh sách giảng viên kèm "đã nhận / hạn mức" của đợt (#49, CBR-04). Không đủ chỗ thì chỉ báo trước, không khóa —
 * backend là nơi chặn (QUOTA_EXCEEDED, hủy cả lô theo UC05 4a).
 */
export default function LecturerPicker({ ds, chon, onChon, soCan, ten, boQua }: Props) {
  const hienThi = ds.filter((g) => g.id !== boQua);
  if (hienThi.length === 0) return <p className="muted">Không có giảng viên nào đang hoạt động.</p>;
  return (
    <div className="gv-ds" role="radiogroup">
      {hienThi.map((g) => {
        const tyLe = g.soSvToiDa > 0 ? Math.min(100, (g.daNhan / g.soSvToiDa) * 100) : 100;
        const khongDu = soCan > 0 && soCan > g.conNhan;
        return (
          <label key={g.id} className={`gv-o${chon === g.id ? ' gv-o-chon' : ''}`}>
            <input type="radio" name={ten} checked={chon === g.id} onChange={() => onChon(g.id)} />
            <span className="gv-noi-dung">
              <span className="gv-dong">
                <b>{g.hoTen}</b>
                <span className="meter-so"><b>{g.daNhan}</b>/{g.soSvToiDa}</span>
              </span>
              <span className="muted small">{[g.maGv, g.boMon].filter(Boolean).join(' · ')}</span>
              <span className="meter-ray" aria-hidden>
                <span className={`meter-dat${g.conNhan === 0 ? ' meter-day' : ''}`} style={{ width: `${tyLe}%` }} />
              </span>
              <span className={`small ${khongDu ? 'text-vang' : 'muted'}`}>
                {g.conNhan === 0 ? 'Đã đủ hạn mức' : `Còn nhận ${g.conNhan} sinh viên`}
                {khongDu && g.conNhan > 0 && ` — không đủ cho ${soCan} sinh viên đã chọn`}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
