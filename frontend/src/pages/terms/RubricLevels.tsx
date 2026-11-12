import { useEffect, useState } from 'react';
import { termApi } from '../../api/terms';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { diem } from '../../utils/format';
import type { Clo, MucRubric } from '../../types/term';

/** Khoảng điểm của mức: nửa mở [min; max), riêng mức cao nhất đóng [8,5; 10] (Điều 12 khoản 3). */
export function khoangDiem(m: MucRubric, mucCaoNhat: number): string {
  return `[${diem(m.diemMin)}; ${diem(m.diemMax)}${m.muc === mucCaoNhat ? ']' : ')'}`;
}

/** 5 mức rubric của một CLO (#35); giáo vụ sửa mô tả hành vi (#36), không đổi số mức và khoảng điểm (UC03 6b). */
export default function RubricLevels({ clo, chiXem }: { clo: Clo; chiXem: boolean }) {
  const [ds, setDs] = useState<MucRubric[] | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangSua, setDangSua] = useState<number | null>(null);
  const [moTa, setMoTa] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [daLuu, setDaLuu] = useState<string>();

  useEffect(() => {
    termApi.danhSachMucRubric(clo.id).then(setDs).catch((e) => { setLoi(e); setDs([]); });
  }, [clo.id]);

  if (!ds) return <Loading />;
  const mucCaoNhat = Math.max(...ds.map((m) => m.muc));

  const luu = async (m: MucRubric) => {
    setLoi(null);
    setDangLuu(true);
    try {
      const { data, message } = await termApi.capNhatMucRubric(m.id, moTa.trim());
      setDs((x) => x?.map((y) => (y.id === data.id ? data : y)) ?? null);
      setDangSua(null);
      setDaLuu(message);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="rubric">
      <div className="muted small mb-nho">
        Rubric {clo.maClo} — số mức và khoảng điểm cố định theo Quy định (Điều 12 khoản 3 điểm h); Khoa chỉ điều chỉnh mô
        tả hành vi theo đặc thù ngành.
      </div>
      <ErrorAlert error={loi} />
      {daLuu && <div className="alert alert-xanh mb-nho">{daLuu}</div>}
      <table className="table table-gon">
        <thead>
          <tr>
            <th>Mức</th>
            <th className="nowrap">Khoảng điểm</th>
            <th>Mô tả hành vi</th>
            {!chiXem && <th />}
          </tr>
        </thead>
        <tbody>
          {ds.map((m) => (
            <tr key={m.id}>
              <td className="num"><b>{m.muc}</b></td>
              <td className="nowrap">{khoangDiem(m, mucCaoNhat)}</td>
              <td>
                {dangSua === m.id ? (
                  <textarea className="textarea" rows={3} value={moTa} onChange={(e) => setMoTa(e.target.value)}
                            maxLength={2000} autoFocus aria-label={`Mô tả hành vi mức ${m.muc}`} />
                ) : (
                  <span className="pre-line">{m.moTaHanhVi}</span>
                )}
              </td>
              {!chiXem && (
                <td className="actions">
                  {dangSua === m.id ? (
                    <>
                      <button className="btn btn-phu btn-nho" onClick={() => setDangSua(null)} disabled={dangLuu}>Hủy</button>
                      <button className="btn btn-chinh btn-nho" onClick={() => void luu(m)} disabled={dangLuu || !moTa.trim()}>
                        {dangLuu ? 'Đang lưu…' : 'Lưu'}
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-phu btn-nho" disabled={dangSua !== null}
                            onClick={() => { setDangSua(m.id); setMoTa(m.moTaHanhVi); setDaLuu(undefined); }}>
                      Sửa mô tả
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
