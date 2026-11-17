import { diem, phanTram, so2 } from '../../utils/format';
import type { HpSelf } from '../../types/feedback';

/**
 * Phần D phiếu TTTN-08b — đúng các cột của biểu mẫu: (1) mức tự đánh giá, (2) quy đổi thang 10 (điểm giữa khoảng
 * của mức), (3) trọng số α, (4) CLO×α; dòng cuối (5) HPself = Σ(4), làm tròn 0,1. Số liệu do #95 tính.
 */
export default function BangHpSelf({ hp }: { hp: HpSelf }) {
  return (
    <div className="table-wrap">
      <table className="table table-gon ph-bang-d">
        <thead>
          <tr>
            <th>CLO</th>
            <th className="center">Mức tự đánh giá (1)</th>
            <th className="num">Quy đổi thang 10 (2)</th>
            <th className="num">Trọng số α (3)</th>
            <th className="num">CLO×α (4)</th>
          </tr>
        </thead>
        <tbody>
          {hp.cacClo.map((c) => (
            <tr key={c.maClo}>
              <td><b>{c.maClo}</b></td>
              <td className="center">{c.muc ?? '—'}</td>
              <td className="num">{diem(c.diemQuyDoi)}</td>
              <td className="num">{phanTram(c.alpha)}</td>
              <td className="num">{so2(c.diemNhanAlpha)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}><b>Điểm học phần tự đánh giá — HPself (5)</b></td>
            <td className="num"><b className="ph-hp">{diem(hp.hpSelf)}</b></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
