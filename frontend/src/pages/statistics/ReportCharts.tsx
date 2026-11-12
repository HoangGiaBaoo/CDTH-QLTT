import type { BaoCaoThongKe } from '../../types/statistics';
import { oBaoCao, so, viTriCot } from './hienThi';

/**
 * Thang thứ bậc một màu xanh, nhạt → đậm cho Mức thấp → cao (bảng màu tham chiếu, bước 250…650; đã chạy
 * validate_palette --ordinal: đơn điệu độ sáng, bước nhạt nhất vẫn ≥ 2:1 trên nền trắng).
 */
const THANG_MUC = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281'];

const phanTram = (x: number) => `${oBaoCao(Math.round(x * 10) / 10)}%`;

/** RP-02 — tỷ lệ SV đạt ngưỡng ở từng CLO so với mục tiêu (cột "Mục tiêu (%)" của báo cáo, Đ24 k2). */
export function CloPassChart({ bc }: { bc: BaoCaoThongKe }) {
  const [iClo, iTyLe, iMucTieu, iSoSv, iSoDat] = ['CLO', 'Tỷ lệ đạt (%)', 'Mục tiêu (%)', 'Số SV', 'Số SV đạt ngưỡng']
    .map((t) => viTriCot(bc, t));
  if ([iClo, iTyLe, iMucTieu].some((i) => i < 0)) return null;
  const mucTieu = so(bc.dong[0]?.[iMucTieu]);

  return (
    <figure className="bieu-do">
      <figcaption>
        <b>Tỷ lệ sinh viên đạt ngưỡng theo CLO</b>
        {mucTieu !== null && <span className="muted small"> — vạch đứng: mục tiêu {phanTram(mucTieu)}</span>}
      </figcaption>
      <div className="bd-hang-ds">
        {bc.dong.map((d) => {
          const tyLe = so(d[iTyLe]);
          const mt = so(d[iMucTieu]);
          const dat = tyLe !== null && mt !== null && tyLe >= mt;
          return (
            <div key={String(d[iClo])} className="bd-hang" tabIndex={0}>
              <span className="bd-nhan">{d[iClo]}</span>
              <div className="bd-ray">
                {tyLe !== null && <div className="bd-cot" style={{ width: `${Math.min(tyLe, 100)}%` }} />}
                {mt !== null && <div className="bd-vach" style={{ left: `${Math.min(mt, 100)}%` }} aria-hidden />}
                <div className="bd-tip" role="tooltip">
                  <b>{tyLe === null ? 'Chưa có dữ liệu' : phanTram(tyLe)}</b>
                  <span>{d[iClo]} · {oBaoCao(d[iSoDat])}/{oBaoCao(d[iSoSv])} SV đạt ngưỡng</span>
                </div>
              </div>
              <span className="bd-so">
                {tyLe === null ? '—' : phanTram(tyLe)}
                {tyLe !== null && <span className={dat ? 'text-dat' : 'text-do'}> {dat ? '✓' : '✗'}</span>}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bd-truc" aria-hidden><span>0%</span><span>50%</span><span>100%</span></div>
    </figure>
  );
}

/** RP-02 — phân bố năm mức của từng CLO (cột chồng 100%), cột "Mức N" lấy từ báo cáo. */
export function LevelDistributionChart({ bc }: { bc: BaoCaoThongKe }) {
  const iClo = viTriCot(bc, 'CLO');
  const cotMuc = bc.cot.map((t, i) => ({ t, i })).filter((x) => /^Mức \d+$/.test(x.t));
  if (iClo < 0 || cotMuc.length === 0) return null;
  const mau = (k: number) => THANG_MUC[Math.round((k * (THANG_MUC.length - 1)) / Math.max(cotMuc.length - 1, 1))];

  return (
    <figure className="bieu-do">
      <figcaption><b>Phân bố mức đạt theo CLO</b></figcaption>
      <ul className="bd-chu-giai">
        {cotMuc.map((m, k) => <li key={m.t}><span className="bd-o-mau" style={{ background: mau(k) }} />{m.t}</li>)}
      </ul>
      <div className="bd-hang-ds">
        {bc.dong.map((d) => {
          const dem = cotMuc.map((m) => so(d[m.i]) ?? 0);
          const tong = dem.reduce((a, b) => a + b, 0);
          return (
            <div key={String(d[iClo])} className="bd-hang">
              <span className="bd-nhan">{d[iClo]}</span>
              <div className="bd-ray bd-ray-chong">
                {tong === 0 ? <span className="muted small">Chưa có dữ liệu</span> : cotMuc.map((m, k) => dem[k] > 0 && (
                  <div key={m.t} className="bd-doan" tabIndex={0} style={{ width: `${(dem[k] / tong) * 100}%`, background: mau(k) }}>
                    <div className="bd-tip" role="tooltip">
                      <b>{dem[k]} SV · {phanTram((dem[k] / tong) * 100)}</b>
                      <span>{d[iClo]} · {m.t}</span>
                    </div>
                  </div>
                ))}
              </div>
              <span className="bd-so muted">{tong} SV</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** RP-03 — phiếu đã nộp trên số phiếu cần có, mỗi chặng × nhóm người chấm một thanh. */
export function ProgressMeters({ bc }: { bc: BaoCaoThongKe }) {
  const [iChang, iNhom, iCanCo, iDaNop, iTyLe] = ['Chặng', 'Nhóm người chấm', 'Phiếu cần có', 'Đã nộp', 'Tỷ lệ đã nộp (%)']
    .map((t) => viTriCot(bc, t));
  if ([iChang, iNhom, iCanCo, iDaNop].some((i) => i < 0)) return null;

  return (
    <figure className="bieu-do">
      <figcaption><b>Tiến độ nộp phiếu</b></figcaption>
      <div className="meter-ds">
        {bc.dong.map((d) => {
          const tyLe = so(d[iTyLe]);
          return (
            <div key={`${d[iChang]}-${d[iNhom]}`} className="meter-hang">
              <div className="meter-nhan">
                <span>{d[iChang]} · nhóm {d[iNhom]}</span>
                <span className="meter-so"><b>{oBaoCao(d[iDaNop])}</b>/{oBaoCao(d[iCanCo])} phiếu{tyLe !== null && ` · ${phanTram(tyLe)}`}</span>
              </div>
              <div className="meter-ray"><div className="meter-dat" style={{ width: `${Math.min(tyLe ?? 0, 100)}%` }} /></div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
