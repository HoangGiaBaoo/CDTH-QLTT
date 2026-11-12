import { useState } from 'react';
import { diem } from '../../utils/format';

export interface DiemTruc {
  maClo: string;
  ten: string;
  diemClo: number | null;
  muc: number | null;
}

const KICH_THUOC = 360;
const TAM = KICH_THUOC / 2;
const BAN_KINH = 118;
/** Thang điểm 10 của học phần — chỉ để dựng lưới biểu đồ, không dùng tính toán. */
const DIEM_TOI_DA = 10;
const VONG = [2, 4, 6, 8, 10];

/** Trục thứ i: bắt đầu ở đỉnh, đi theo chiều kim đồng hồ. */
function diemTren(i: number, n: number, giaTri: number): [number, number] {
  const goc = -Math.PI / 2 + (2 * Math.PI * i) / n;
  const r = (Math.max(0, Math.min(giaTri, DIEM_TOI_DA)) / DIEM_TOI_DA) * BAN_KINH;
  return [TAM + r * Math.cos(goc), TAM + r * Math.sin(goc)];
}

const thanhChuoi = (ds: [number, number][]) => ds.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/**
 * SCR-24 — radar bảy trục điểm CLO (UC13 bước 4). Một chuỗi nên không cần chú giải; số liệu đầy đủ nằm ở bảng điểm
 * ngay bên dưới (bản xem dạng bảng), tooltip chỉ là tiện lợi khi rê chuột hoặc dùng phím Tab.
 */
export default function CloRadar({ truc }: { truc: DiemTruc[] }) {
  const [chon, setChon] = useState<number | null>(null);
  const n = truc.length;
  if (n < 3) return null;

  const dinh = truc.map((t, i) => diemTren(i, n, t.diemClo ?? 0));
  const moTa = truc.map((t) => `${t.maClo} ${diem(t.diemClo)}`).join('; ');
  const dangChon = chon === null ? null : truc[chon];

  return (
    <div className="radar">
      <svg viewBox={`0 0 ${KICH_THUOC} ${KICH_THUOC}`} role="img" aria-label={`Biểu đồ radar điểm chuẩn đầu ra: ${moTa}`}>
        {VONG.map((v) => (
          <polygon key={v} className="radar-luoi" points={thanhChuoi(truc.map((_, i) => diemTren(i, n, v)))} />
        ))}
        {truc.map((t, i) => {
          const [x, y] = diemTren(i, n, DIEM_TOI_DA);
          return <line key={t.maClo} className="radar-truc" x1={TAM} y1={TAM} x2={x} y2={y} />;
        })}
        {/* Nhãn thang đặt ở khe giữa trục cuối và trục đầu để không đè lên điểm dữ liệu nằm trên trục. */}
        {VONG.map((v) => {
          const goc = -Math.PI / 2 - Math.PI / n;
          const r = (v / DIEM_TOI_DA) * BAN_KINH * Math.cos(Math.PI / n);
          return (
            <text key={v} className="radar-thang" x={TAM + r * Math.cos(goc)} y={TAM + r * Math.sin(goc) + 3} textAnchor="middle">{v}</text>
          );
        })}

        <polygon className="radar-vung" points={thanhChuoi(dinh)} />

        {truc.map((t, i) => {
          const goc = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const [x, y] = [TAM + (BAN_KINH + 20) * Math.cos(goc), TAM + (BAN_KINH + 20) * Math.sin(goc)];
          const neo = Math.cos(goc) > 0.3 ? 'start' : Math.cos(goc) < -0.3 ? 'end' : 'middle';
          return (
            <text key={t.maClo} className={`radar-nhan${chon === i ? ' radar-nhan-chon' : ''}`} x={x} y={y + 4} textAnchor={neo}>
              {t.maClo}
            </text>
          );
        })}

        {dinh.map(([x, y], i) => (
          <g key={truc[i].maClo}>
            <circle className={`radar-diem${chon === i ? ' radar-diem-chon' : ''}`} cx={x} cy={y} r={chon === i ? 5.5 : 4} />
            {/* Vùng bấm/rê lớn hơn điểm vẽ để dễ trúng. */}
            <circle className="radar-cham" cx={x} cy={y} r={14} tabIndex={0}
                    aria-label={`${truc[i].maClo}: ${diem(truc[i].diemClo)} điểm, Mức ${truc[i].muc ?? '—'}`}
                    onMouseEnter={() => setChon(i)} onMouseLeave={() => setChon(null)}
                    onFocus={() => setChon(i)} onBlur={() => setChon(null)} />
          </g>
        ))}
      </svg>
      {dangChon && chon !== null && (
        <div className="radar-tip" style={{
          left: `${(dinh[chon][0] / KICH_THUOC) * 100}%`, top: `${(dinh[chon][1] / KICH_THUOC) * 100}%`,
        }}>
          <b>{diem(dangChon.diemClo)}</b>
          <span>{dangChon.maClo} · Mức {dangChon.muc ?? '—'}</span>
          <span className="radar-tip-ten">{dangChon.ten}</span>
        </div>
      )}
    </div>
  );
}
