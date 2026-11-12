import { diem, phanTram, so2 } from '../../utils/format';
import type { BangTongHop } from '../../types/result';

/**
 * Hai chặng của mẫu TTTN-07, đúng như bản xuất Word (XuatBangTongHopWord.haiChang): lấy hai chặng đầu có điểm;
 * kết quả chưa tính thì in khung chặng 1, 2 để bố cục không đổi.
 */
function haiChang(b: BangTongHop): [number, number] {
  const ds = [...new Set(b.cacClo.flatMap((d) => Object.keys(d.theoChang).map(Number)))].sort((x, y) => x - y);
  return ds.length >= 2 ? [ds[0], ds[1]] : [1, 2];
}

/**
 * Mục II — bảng điểm chi tiết theo từng CLO, cột (1)…(9) đúng bố cục mẫu TTTN-07. Mọi con số do backend tính:
 * cột (1)–(6), (9) là giá trị trung gian làm tròn 2 chữ số chỉ để hiển thị; cột (7) là CLOᵢ đã làm tròn 0,1.
 */
export default function CloScoreTable({ bang }: { bang: BangTongHop }) {
  const [c1, c2] = haiChang(bang);
  const thuong = bang.diemThuong > 0;

  return (
    <>
      <div className="table-wrap">
        <table className="table bang-tttn07">
          <thead>
            <tr>
              <th rowSpan={2}>CLO</th>
              <th rowSpan={2} className="cot-mota">Mô tả năng lực đầu ra</th>
              <th colSpan={3}>Điểm chặng {c1}</th>
              <th colSpan={3}>Điểm chặng {c2}</th>
              <th rowSpan={2}>Điểm CLOᵢ<br />(7)</th>
              <th rowSpan={2}>Trọng số αᵢ<br />(8)</th>
              <th rowSpan={2}>Quy đổi CLOᵢ×αᵢ<br />(9)</th>
            </tr>
            <tr>
              <th>ĐVHD<br />(1)</th>
              <th>GVHD<br />(2)</th>
              <th>TB chặng {c1}<br />(3)</th>
              <th>ĐVHD<br />(4)</th>
              <th>GVHD<br />(5)</th>
              <th>TB chặng {c2}<br />(6)</th>
            </tr>
          </thead>
          <tbody>
            {bang.cacClo.map((d) => {
              const o = [d.theoChang[c1], d.theoChang[c2]];
              return (
                <tr key={d.maClo}>
                  <td className="nowrap"><b>{d.maClo}</b></td>
                  <td className="cot-mota">{d.ten}</td>
                  {o.flatMap((x, k) => [
                    <td key={`${k}-dv`} className="so">{x ? so2(x.dvhd) : '—'}</td>,
                    <td key={`${k}-gv`} className="so">{x ? so2(x.gvhd) : '—'}</td>,
                    <td key={`${k}-tb`} className="so so-tb">{x ? so2(x.tb) : '—'}</td>,
                  ])}
                  <td className="so so-clo">
                    <b>{diem(d.diemClo)}</b>
                    {d.muc != null && <div className="muted small">Mức {d.muc}</div>}
                  </td>
                  <td className="so">{phanTram(d.alpha)}</td>
                  <td className="so">{so2(d.diemQuyDoi)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={10} className="num">
                <b>Điểm học phần (HP)</b> = Σ cột (9){thuong && <> + điểm thưởng {diem(bang.diemThuong)}</>}, chặn trần 10, làm tròn 0,1
              </td>
              <td className="so"><b className="hp-o">{diem(bang.diemHp)}</b></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <ul className="ghi-chu">
        <li>(1), (2): chặng {c1} tổng hợp từ phiếu đánh giá giữa kỳ (TTTN-04) của cán bộ ĐVHD và GVHD.</li>
        <li>(4), (5): chặng {c2} tổng hợp từ phiếu cuối kỳ (TTTN-05) của thành viên Tổ đánh giá có mặt — lấy trung bình trong từng nhóm người chấm trước (CBR-15).</li>
        <li>(3), (6): điểm chặng theo tỷ lệ đồng chấm GVHD/ĐVHD riêng của từng CLO (Điều 13 khoản 3, Điều 14 khoản 3).</li>
        <li>(7): CLOᵢ theo Điều 14 khoản 1; CLO chỉ được đánh giá ở một chặng (CLO7) thì trọng số chặng được chuẩn hóa về 100%. "—": chặng không đánh giá CLO đó hoặc nhóm có tỷ lệ 0.</li>
        <li>(9): tính trên CLOᵢ chưa làm tròn để tổng cột khớp điểm học phần; chỉ làm tròn ở bước cuối (CBR-18).</li>
      </ul>
    </>
  );
}
