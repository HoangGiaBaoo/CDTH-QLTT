import { useEffect, useState } from 'react';
import { termApi } from '../../api/terms';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import type { CauHoi, Chang, Clo } from '../../types/term';

/**
 * Bộ câu hỏi đánh giá của 2 chặng (#37) và ma trận CLO × chặng: CLO đánh giá ở 1 chặng được chuẩn hóa trọng số
 * chặng (CBR-23, ví dụ CLO7 chỉ ở chặng 2); CLO không ở chặng nào làm hệ thống dừng tính điểm (CLO_CHUA_DUOC_DANH_GIA).
 */
export default function QuestionSection({ chang, clos }: { chang: Chang[]; clos: Clo[] }) {
  const [cauHoi, setCauHoi] = useState<Record<number, CauHoi[]> | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [changXem, setChangXem] = useState<number | null>(null);

  const khoa = chang.map((c) => c.id).join(',');
  useEffect(() => {
    if (!khoa) return;
    const ids = khoa.split(',').map(Number);
    Promise.all(ids.map((id) => termApi.danhSachCauHoi(id)))
      .then((ds) => {
        setCauHoi(Object.fromEntries(ids.map((id, i) => [id, ds[i]])));
        setChangXem((x) => x ?? ids[0]);
      })
      .catch((e) => { setLoi(e); setCauHoi({}); });
  }, [khoa]);

  const soCau = (cloId: number, changId: number) =>
    (cauHoi?.[changId] ?? []).filter((q) => q.chuanDauRaId === cloId).length;

  return (
    <div className="card mb">
      <h2 className="section-title mt0">Bộ câu hỏi đánh giá</h2>
      <ErrorAlert error={loi} />
      {!cauHoi ? <Loading /> : (
        <>
          <div className="table-wrap">
            <table className="table table-gon matrix">
              <thead>
                <tr>
                  <th>CLO</th>
                  {chang.map((c) => <th key={c.id} className="center">Chặng {c.thuTu}</th>)}
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {clos.map((clo) => {
                  const soChang = chang.filter((c) => soCau(clo.id, c.id) > 0).length;
                  return (
                    <tr key={clo.id}>
                      <td className="nowrap"><b>{clo.maClo}</b> <span className="muted">{clo.ten}</span></td>
                      {chang.map((c) => {
                        const n = soCau(clo.id, c.id);
                        return <td key={c.id} className="center">{n > 0 ? `✓ ${n} câu` : <span className="muted">—</span>}</td>;
                      })}
                      <td className="small">
                        {soChang === 0 && <span className="text-do">Chưa được đánh giá ở chặng nào — không tính được điểm</span>}
                        {soChang === 1 && chang.length > 1 && (
                          <span className="text-vang">Chỉ ở 1 chặng — trọng số chặng được chuẩn hóa (CBR-23)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="tabs mt">
            {chang.map((c) => (
              <button key={c.id} className={`tab ${changXem === c.id ? 'tab-active' : ''}`} onClick={() => setChangXem(c.id)}>
                {c.ten} ({cauHoi[c.id]?.length ?? 0} câu)
              </button>
            ))}
          </div>
          {changXem !== null && (
            <table className="table table-gon">
              <thead>
                <tr><th className="num">#</th><th>Câu hỏi</th><th>CLO</th></tr>
              </thead>
              <tbody>
                {(cauHoi[changXem] ?? []).map((q) => (
                  <tr key={q.id}>
                    <td className="num">{q.thuTu}</td>
                    <td>{q.noiDung}</td>
                    <td className="nowrap">{q.maClo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
