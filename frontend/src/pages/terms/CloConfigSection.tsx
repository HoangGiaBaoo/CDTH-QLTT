import { Fragment, useEffect, useState } from 'react';
import { termApi } from '../../api/terms';
import ErrorAlert from '../../components/ErrorAlert';
import { phanTram } from '../../utils/format';
import type { Clo } from '../../types/term';
import RubricLevels from './RubricLevels';

interface Props {
  clos: Clo[];
  /** Đợt đã kết thúc ⇒ chỉ xem. */
  chiXem: boolean;
  onCapNhat: (clos: Clo[], message?: string) => void;
}

interface Nhap { alpha: string; dvhd: string }

/** Ô nhập chấp nhận cả dấu phẩy kiểu Việt Nam. */
function so(s: string): number {
  const n = Number(s.replace(',', '.').trim());
  return s.trim() === '' || !Number.isFinite(n) ? NaN : n;
}

function chuoi(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 2, useGrouping: false });
}

/** So sánh theo đơn vị 0,01 — chỉ để hiển thị cảnh báo; backend kiểm lại bằng BigDecimal (CBR-07, CBR-08). */
function bang(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100);
}

/**
 * Bảng 7 CLO: trọng số α và tỷ lệ đồng chấm ĐVHD / GVHD (UC03 bước 6–7, #33–#34), mở rộng từng dòng để xem /
 * sửa mô tả hành vi 5 mức rubric (#35–#36).
 */
export default function CloConfigSection({ clos, chiXem, onCapNhat }: Props) {
  const [nhap, setNhap] = useState<Record<number, Nhap>>({});
  const [moRubric, setMoRubric] = useState<number | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const datLai = (ds: Clo[]) =>
    setNhap(Object.fromEntries(ds.map((c) => [c.id, { alpha: chuoi(c.trongSoAlpha), dvhd: chuoi(c.tyLeDvhd) }])));

  useEffect(() => datLai(clos), [clos]);

  const giaTri = (c: Clo) => {
    const x = nhap[c.id];
    return x ? { alpha: so(x.alpha), dvhd: so(x.dvhd) } : { alpha: c.trongSoAlpha, dvhd: c.tyLeDvhd };
  };
  const tongAlpha = clos.reduce((t, c) => t + (giaTri(c).alpha || 0), 0);
  const thayDoi = clos.filter((c) => {
    const v = giaTri(c);
    return !bang(v.alpha, c.trongSoAlpha) || !bang(v.dvhd, c.tyLeDvhd);
  });
  const oSai = (n: number) => !Number.isFinite(n) || n < 0 || n > 100;
  const coOSai = clos.some((c) => oSai(giaTri(c).alpha) || oSai(giaTri(c).dvhd));

  const sua = (id: number, k: keyof Nhap, v: string) => setNhap((x) => ({ ...x, [id]: { ...x[id], [k]: v } }));

  /**
   * #34 nhận tỷ lệ đồng chấm của MỘT CLO và α mới của các CLO khác (dieuChinhAlphaKhac, quyết định 10.13).
   * Lần gọi đầu mang mọi thay đổi α để Σα = 100 được kiểm một lần; CLO đổi tỷ lệ còn lại gửi tiếp từng cái.
   */
  const luu = async () => {
    setLoi(null);
    setDangLuu(true);
    try {
      const doiTyLe = thayDoi.filter((c) => !bang(giaTri(c).dvhd, c.tyLeDvhd));
      const chinh = doiTyLe[0] ?? thayDoi[0];
      const yeuCau = (c: Clo) => ({ trongSoAlpha: giaTri(c).alpha, tyLeDvhd: giaTri(c).dvhd, tyLeGvhd: 100 - giaTri(c).dvhd });
      let kq = await termApi.capNhatClo(chinh.id, {
        ...yeuCau(chinh),
        dieuChinhAlphaKhac: thayDoi
          .filter((c) => c.id !== chinh.id && !bang(giaTri(c).alpha, c.trongSoAlpha))
          .map((c) => ({ cloId: c.id, trongSoAlpha: giaTri(c).alpha })),
      });
      for (const c of doiTyLe.slice(1)) {
        kq = await termApi.capNhatClo(c.id, yeuCau(c));
      }
      onCapNhat(kq.data, kq.message);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangLuu(false);
    }
  };

  const tongDung = bang(tongAlpha, 100);

  return (
    <div className="card mb">
      <h2 className="section-title mt0">Chuẩn đầu ra, trọng số và tỷ lệ đồng chấm</h2>
      <p className="hint mt0">
        α là trọng số CLO trong điểm học phần (Điều 9 khoản 2, tổng 7 CLO bằng 100). Tỷ lệ đồng chấm ĐVHD / GVHD áp sau
        khi đã lấy trung bình trong từng nhóm người chấm (Điều 14 khoản 3). Chỉ sửa được khi đợt chưa có phiếu đánh giá
        nào được nộp.
      </p>
      <ErrorAlert error={loi} />
      <div className="table-wrap">
        <table className="table table-giua">
          <thead>
            <tr>
              <th>CLO</th>
              <th>Nội dung</th>
              <th className="num">α (%)</th>
              <th className="num">ĐVHD (%)</th>
              <th className="num">GVHD (%)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {clos.map((c) => {
              const v = giaTri(c);
              const x = nhap[c.id];
              return (
                <Fragment key={c.id}>
                  <tr className={thayDoi.includes(c) ? 'row-doi' : undefined}>
                    <td className="nowrap"><b>{c.maClo}</b></td>
                    <td>
                      {c.ten}
                      {c.moTa && <div className="muted small">{c.moTa}</div>}
                    </td>
                    <td className="num">
                      {chiXem || !x ? phanTram(c.trongSoAlpha) : (
                        <input className={`input-so ${oSai(v.alpha) ? 'input-loi' : ''}`} inputMode="decimal"
                               value={x.alpha} onChange={(e) => sua(c.id, 'alpha', e.target.value)}
                               aria-label={`Trọng số α của ${c.maClo}`} />
                      )}
                    </td>
                    <td className="num">
                      {chiXem || !x ? phanTram(c.tyLeDvhd) : (
                        <input className={`input-so ${oSai(v.dvhd) ? 'input-loi' : ''}`} inputMode="decimal"
                               value={x.dvhd} onChange={(e) => sua(c.id, 'dvhd', e.target.value)}
                               aria-label={`Tỷ lệ ĐVHD của ${c.maClo}`} />
                      )}
                    </td>
                    {/* GVHD = 100 − ĐVHD nên tổng mỗi CLO luôn bằng 100 (CBR-08). */}
                    <td className="num">{oSai(v.dvhd) ? '—' : phanTram(100 - v.dvhd)}</td>
                    <td className="actions">
                      <button className="btn btn-phu btn-nho" onClick={() => setMoRubric(moRubric === c.id ? null : c.id)}
                              aria-expanded={moRubric === c.id}>
                        Rubric {moRubric === c.id ? '▴' : '▾'}
                      </button>
                    </td>
                  </tr>
                  {moRubric === c.id && (
                    <tr className="row-expand">
                      <td colSpan={6}><RubricLevels clo={c} chiXem={chiXem} /></td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><b>Tổng α</b></td>
              <td className={`num ${tongDung ? '' : 'text-do'}`}><b>{phanTram(tongAlpha)}</b></td>
              <td colSpan={3}>{!tongDung && <span className="text-do">Tổng α phải bằng 100 (Điều 9 khoản 2)</span>}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!chiXem && (
        <div className="form-actions">
          <button className="btn btn-phu" onClick={() => datLai(clos)} disabled={dangLuu || thayDoi.length === 0}>
            Hoàn tác
          </button>
          <button className="btn btn-chinh" onClick={() => void luu()} disabled={dangLuu || thayDoi.length === 0 || coOSai}>
            {dangLuu ? 'Đang lưu…' : `Lưu trọng số${thayDoi.length ? ` (${thayDoi.length} CLO)` : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
