import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { statisticsApi } from '../../api/statistics';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import TermSelect, { useTermPicker } from '../../components/TermSelect';
import { ngayGio } from '../../utils/format';
import { luuTep } from '../../utils/taiTep';
import type { BaoCaoThongKe, GiaTriO, MaBaoCao } from '../../types/statistics';
import { chiSo, DANH_GIA, oBaoCao } from './hienThi';
import { CloPassChart, LevelDistributionChart, ProgressMeters } from './ReportCharts';

/** Sáu báo cáo của UC13 — tên tab ngắn; tên đầy đủ lấy từ backend (`tenBaoCao`). */
const BAO_CAO: { ma: MaBaoCao; nhan: string }[] = [
  { ma: 'RP-01', nhan: 'Kết quả toàn đợt' },
  { ma: 'RP-02', nhan: 'Tỷ lệ đạt CLO' },
  { ma: 'RP-03', nhan: 'Tiến độ chấm' },
  { ma: 'RP-04', nhan: 'Minh chứng' },
  { ma: 'RP-05', nhan: 'Tự nhận thức' },
  { ma: 'RP-06', nhan: 'Phản hồi' },
];

function OBang({ v }: { v: GiaTriO }) {
  const dg = typeof v === 'string' ? DANH_GIA[v] : undefined;
  if (dg) return <span className={`badge ${dg.lop}`}>{dg.dau} {v}</span>;
  return <>{oBaoCao(v)}</>;
}

/**
 * SCR-25 — thống kê toàn đợt cho giáo vụ (#98, #99, UC13): chọn đợt và loại RP-01…RP-06, xem chỉ số tổng hợp,
 * biểu đồ (RP-02, RP-03) và bảng; xuất Excel cùng dữ liệu. Mọi con số do backend tổng hợp.
 */
export default function StatisticsPage() {
  const [params, setParams] = useSearchParams();
  const ma = (BAO_CAO.find((b) => b.ma === params.get('rp'))?.ma ?? 'RP-01') as MaBaoCao;
  const { dsDot, termId, setTermId, loi: loiDot } = useTermPicker();
  const [bc, setBc] = useState<BaoCaoThongKe | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [dangXuat, setDangXuat] = useState(false);

  useEffect(() => {
    if (!termId) return;
    let conHieuLuc = true;
    setBc(null);
    setLoi(null);
    statisticsApi.baoCao(ma, termId)
      .then((x) => { if (conHieuLuc) setBc(x); })
      .catch((e) => { if (conHieuLuc) setLoi(e); });
    return () => { conHieuLuc = false; };
  }, [ma, termId]);

  const chonTab = (m: MaBaoCao) => setParams((p) => { p.set('rp', m); return p; }, { replace: true });

  const xuat = async () => {
    if (!bc) return;
    setLoi(null);
    setDangXuat(true);
    try {
      const { blob, tenTep } = await statisticsApi.xuatExcel(ma, termId, `${bc.maBaoCao}_${bc.maDot}.xlsx`);
      luuTep(blob, tenTep);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangXuat(false);
    }
  };

  const chiSoDon = bc ? Object.entries(bc.tongHop).filter(([, v]) => !Array.isArray(v)) as [string, GiaTriO][] : [];
  const danhSach = bc ? Object.entries(bc.tongHop).filter(([, v]) => Array.isArray(v)) as [string, string[]][] : [];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Thống kê</h1>
        <button className="btn btn-phu" onClick={() => void xuat()} disabled={!bc || dangXuat}>
          {dangXuat ? 'Đang xuất…' : 'Xuất Excel'}
        </button>
      </div>
      <ErrorAlert error={loiDot} />
      <div className="toolbar">
        <TermSelect dsDot={dsDot} termId={termId} onChange={setTermId} />
      </div>
      <div className="tabs mb" role="tablist">
        {BAO_CAO.map((b) => (
          <button key={b.ma} role="tab" aria-selected={b.ma === ma} className={`tab${b.ma === ma ? ' tab-active' : ''}`}
                  onClick={() => chonTab(b.ma)}>
            {b.ma} · {b.nhan}
          </button>
        ))}
      </div>
      <ErrorAlert error={loi} />

      {!termId ? null : !bc ? (loi ? null : <Loading />) : (
        <>
          <div className="card mb">
            <div className="card-head">
              <h2 className="section-title mt0">{bc.maBaoCao} — {bc.tenBaoCao}</h2>
              <span className="muted small">{bc.maDot} · lập lúc {ngayGio(bc.thoiDiemLap)}</span>
            </div>
            <div className="chi-so-ds">
              {chiSoDon.map(([nhan, v]) => (
                <div key={nhan} className={`chi-so${typeof v === 'string' && v.length > 16 ? ' chi-so-dai' : ''}`}>
                  <span className="muted small">{nhan}</span>
                  <b><OBangChiSo nhan={nhan} v={v} /></b>
                </div>
              ))}
            </div>
          </div>

          {bc.maBaoCao === 'RP-02' && bc.dong.length > 0 && (
            <div className="bd-luoi mb">
              <div className="card"><CloPassChart bc={bc} /></div>
              <div className="card"><LevelDistributionChart bc={bc} /></div>
            </div>
          )}
          {bc.maBaoCao === 'RP-03' && bc.dong.length > 0 && <div className="card mb"><ProgressMeters bc={bc} /></div>}

          <div className="card mb">
            {bc.dong.length === 0 ? (
              <p className="muted mt0">
                {bc.maBaoCao === 'RP-04' ? 'Mọi hồ sơ đã duyệt đều đủ minh chứng bắt buộc.' : 'Chưa có dữ liệu cho báo cáo này.'}
              </p>
            ) : (
              <div className="table-wrap">
                <table className="table table-gon table-giua bang-thong-ke">
                  <thead><tr>{bc.cot.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {bc.dong.map((d, r) => (
                      <tr key={r}>
                        {d.map((v, i) => (
                          <td key={i} className={typeof v === 'number' ? 'num' : typeof v === 'string' && v.length > 24 ? 'o-dai' : undefined}>
                            <OBang v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <ul className="ghi-chu">{bc.ghiChu.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>

          {danhSach.map(([nhan, ds]) => (
            <div key={nhan} className="card mb">
              <h2 className="section-title mt0">{nhan} ({ds.length})</h2>
              {ds.length === 0 ? <p className="muted mt0">Không có ý kiến.</p>
                : <ul className="y-kien">{ds.map((y, i) => <li key={i}>{y}</li>)}</ul>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function OBangChiSo({ nhan, v }: { nhan: string; v: GiaTriO }) {
  const dg = typeof v === 'string' ? DANH_GIA[v] : undefined;
  if (dg) return <span className={`badge ${dg.lop}`}>{dg.dau} {v}</span>;
  return <>{chiSo(nhan, v)}</>;
}
