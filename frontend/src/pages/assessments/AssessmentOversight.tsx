import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessments';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import TermSelect, { useTermPicker } from '../../components/TermSelect';
import { NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_PHIEU } from '../../utils/constants';
import { diem, ngayGio } from '../../utils/format';
import type { CanhBaoLech, Phieu, TrangThaiPhieu } from '../../types/assessment';

/**
 * SCR-18 dưới quyền giám sát của giáo vụ (UC08 luồng mở lại): xem mọi phiếu (#69), mở chi tiết để mở lại (#75),
 * cảnh báo cặp nhóm lệch trên 2,0 điểm ở cùng CLO (#76, BR-08.9 — chỉ cảnh báo, không chặn).
 */
export default function AssessmentOversight() {
  const navigate = useNavigate();
  const { dsDot, termId, setTermId, loi: loiDot } = useTermPicker();
  const [stage, setStage] = useState<number | ''>('');
  const [trangThai, setTrangThai] = useState<TrangThaiPhieu | ''>('');
  const [ds, setDs] = useState<Phieu[] | null>(null);
  const [lech, setLech] = useState<CanhBaoLech[] | null>(null);
  const [loi, setLoi] = useState<unknown>(null);

  useEffect(() => {
    if (!termId) return;
    setDs(null);
    setLoi(null);
    let conHieuLuc = true;
    assessmentApi.danhSach({ termId, stage: stage || undefined, status: trangThai || undefined })
      .then((x) => conHieuLuc && setDs(x))
      .catch((e) => { if (conHieuLuc) { setLoi(e); setDs([]); } });
    return () => { conHieuLuc = false; };
  }, [termId, stage, trangThai]);

  useEffect(() => {
    if (!termId) return;
    setLech(null);
    assessmentApi.canhBaoLech(termId).then(setLech).catch(() => setLech([]));
  }, [termId]);

  const dem = (t: TrangThaiPhieu) => ds?.filter((p) => p.trangThai === t).length ?? 0;

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Giám sát phiếu đánh giá</h1>
      </div>
      <ErrorAlert error={loiDot} />
      <div className="toolbar">
        <TermSelect dsDot={dsDot} termId={termId} onChange={setTermId} />
        <label className="field field-inline">
          <span>Chặng</span>
          <select value={stage} onChange={(e) => setStage(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Cả hai chặng</option>
            <option value="1">Chặng 1 — giữa kỳ</option>
            <option value="2">Chặng 2 — cuối kỳ</option>
          </select>
        </label>
        <label className="field field-inline">
          <span>Trạng thái phiếu</span>
          <select value={trangThai} onChange={(e) => setTrangThai(e.target.value as TrangThaiPhieu | '')}>
            <option value="">Tất cả</option>
            {Object.entries(NHAN_TRANG_THAI_PHIEU).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      {lech && lech.length > 0 && (
        <div className="card mb">
          <h2 className="section-title mt0">Cảnh báo lệch điểm giữa hai nhóm ({lech.length})</h2>
          <p className="hint mt0">
            Trung bình nhóm ĐVHD và nhóm GVHD chênh nhau trên 2,0 điểm ở cùng một CLO (BR-08.9, Điều 20 khoản 3). Hệ thống chỉ
            cảnh báo — giáo vụ xem xét, cần thì mở lại phiếu.
          </p>
          <div className="table-wrap">
            <table className="table table-gon">
              <thead>
                <tr>
                  <th>Sinh viên</th><th className="num">Chặng</th><th>CLO</th>
                  <th className="num">TB ĐVHD</th><th className="num">TB GVHD</th><th className="num">Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {lech.map((l) => (
                  <tr key={`${l.hoSoId}-${l.chang}-${l.maClo}`}>
                    <td>{l.maSv} · {l.hoTen}</td>
                    <td className="num">{l.chang}</td>
                    <td>{l.maClo}</td>
                    <td className="num">{diem(l.tbDvhd)}</td>
                    <td className="num">{diem(l.tbGvhd)}</td>
                    <td className="num text-do"><b>{l.chenhLech.toLocaleString('vi-VN')}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ErrorAlert error={loi} />
      {ds && (
        <p className="muted small">
          {ds.length} phiếu · đã nộp {dem('DA_NOP')} · nháp {dem('NHAP')} · mở lại {dem('MO_LAI')}
        </p>
      )}
      {!termId ? null : !ds ? <Loading /> : ds.length === 0 ? (
        <div className="card empty"><div className="muted">Chưa có phiếu nào phù hợp.</div></div>
      ) : (
        <div className="table-wrap">
          <table className="table table-click table-giua">
            <thead>
              <tr>
                <th>Sinh viên</th><th className="num">Chặng</th><th>Người chấm</th><th>Nhóm</th>
                <th>Trạng thái</th><th>Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              {ds.map((p) => (
                <tr key={p.id} tabIndex={0} onClick={() => navigate(`/assessments/${p.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/assessments/${p.id}`)}>
                  <td>{p.maSv} · {p.hoTenSinhVien}</td>
                  <td className="num">{p.chang}</td>
                  <td>{p.hoTenNguoiCham}</td>
                  <td>{NHAN_NHOM_NGUOI_CHAM[p.nhom]}</td>
                  <td><StatusBadge value={p.trangThai} labels={NHAN_TRANG_THAI_PHIEU} /></td>
                  <td className="nowrap">{ngayGio(p.ngayNop)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
