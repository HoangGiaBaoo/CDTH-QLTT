import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import type { TrangThaiHoSo } from '../../types/record';
import { VONG_DOI_HO_SO, viTriVongDoi } from './vongDoi';

/** Thanh bước vòng đời hồ sơ (SCR-11, SCR-12). Gián đoạn không nằm trên thanh — trang gọi tự hiện cảnh báo riêng. */
export default function RecordStepper({ trangThai }: { trangThai: TrangThaiHoSo }) {
  const viTri = viTriVongDoi(trangThai);
  if (viTri < 0) return null;
  return (
    <div className="card mb">
      <ol className="stepper">
        {VONG_DOI_HO_SO.map((b, i) => (
          <li key={b.nhan} className={i < viTri ? 'step-xong' : i === viTri ? 'step-hien-tai' : ''}>
            <span className="step-so">{i + 1}</span>
            {b.ma.includes(trangThai) ? NHAN_TRANG_THAI_HO_SO[trangThai] : b.nhan}
          </li>
        ))}
      </ol>
    </div>
  );
}
