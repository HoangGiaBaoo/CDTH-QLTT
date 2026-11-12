import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { panelApi } from '../../api/panels';
import { recordApi } from '../../api/records';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import TermSelect, { useTermPicker } from '../../components/TermSelect';
import { NHAN_HINH_THUC_LAM_VIEC } from '../../utils/constants';
import { ngayGio } from '../../utils/format';
import type { ToDanhGia } from '../../types/panel';
import { HO_SO_XEP_TO } from './thanhPhan';

/**
 * SCR-19 — danh sách Tổ đánh giá của đợt (#77). Giáo vụ thấy mọi tổ + số SV chưa xếp tổ, thành lập tổ mới;
 * giảng viên / cán bộ chỉ thấy tổ mình tham gia.
 */
export default function PanelListPage() {
  const navigate = useNavigate();
  const { nguoiDung } = useAuth();
  const laAdmin = nguoiDung?.vaiTro === 'ADMIN';
  const { dsDot, termId, setTermId, loi: loiDot } = useTermPicker();
  const [ds, setDs] = useState<ToDanhGia[] | null>(null);
  const [chuaXep, setChuaXep] = useState<number | null>(null);
  const [loi, setLoi] = useState<unknown>(null);

  useEffect(() => {
    if (!termId) return;
    let conHieuLuc = true;
    setDs(null);
    setLoi(null);
    (async () => {
      const cacTo = await panelApi.danhSach(termId);
      // Số SV đủ điều kiện xếp tổ mà chưa thuộc tổ nào — để giáo vụ biết còn phải lập thêm tổ.
      const hs = laAdmin ? await recordApi.danhSach({ termId }) : [];
      if (!conHieuLuc) return;
      const daXep = new Set(cacTo.flatMap((t) => t.hoSos.map((h) => h.hoSoId)));
      setDs(cacTo);
      setChuaXep(laAdmin ? hs.filter((h) => HO_SO_XEP_TO.includes(h.trangThai) && !daXep.has(h.id)).length : null);
    })().catch((e) => { if (conHieuLuc) { setLoi(e); setDs([]); } });
    return () => { conHieuLuc = false; };
  }, [termId, laAdmin]);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Tổ đánh giá</h1>
        {laAdmin && termId && (
          <Link className="btn btn-chinh" to={`/panels/new?termId=${termId}`}>+ Thành lập tổ</Link>
        )}
      </div>
      <ErrorAlert error={loiDot} />
      <div className="toolbar">
        <TermSelect dsDot={dsDot} termId={termId} onChange={setTermId} />
      </div>
      {laAdmin && chuaXep !== null && chuaXep > 0 && (
        <div className="alert alert-vang mb">
          Còn {chuaXep} sinh viên đủ điều kiện đánh giá cuối kỳ chưa được xếp vào Tổ đánh giá nào.
        </div>
      )}
      <ErrorAlert error={loi} />

      {!termId ? null : !ds ? <Loading /> : ds.length === 0 ? (
        <div className="card empty">
          <div className="muted">{laAdmin ? 'Đợt này chưa có Tổ đánh giá nào.' : 'Bạn chưa thuộc Tổ đánh giá nào của đợt này.'}</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table table-click table-giua">
            <thead>
              <tr>
                <th>Tổ</th>
                <th>Thời gian báo cáo</th>
                <th>Địa điểm · hình thức</th>
                <th>Thành viên</th>
                <th>Sinh viên</th>
                <th>Thành phần</th>
              </tr>
            </thead>
            <tbody>
              {ds.map((t) => {
                const chuTich = t.thanhViens.find((x) => x.laChuTich);
                const vang = t.thanhViens.filter((x) => x.vangMat).length;
                return (
                  <tr key={t.id} tabIndex={0} onClick={() => navigate(`/panels/${t.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/panels/${t.id}`)}>
                    <td className="nowrap"><b>Tổ #{t.id}</b></td>
                    <td className="nowrap">{ngayGio(t.thoiGianBaoCao)}</td>
                    <td>{t.diaDiem ?? '—'} · {NHAN_HINH_THUC_LAM_VIEC[t.hinhThuc ?? 'TRUC_TIEP']}</td>
                    <td>
                      {t.thanhViens.length} người{vang > 0 && <span className="text-vang"> ({vang} vắng)</span>}
                      {chuTich && <div className="muted small">Chủ tịch: {chuTich.hoTen}</div>}
                    </td>
                    <td>
                      {t.hoSos.length} SV
                      <div className="muted small">{t.hoSos.map((h) => h.hoTen).join(', ')}</div>
                    </td>
                    <td>
                      {t.canhBao?.length
                        ? <span className="badge badge-do" title={t.canhBao.join('\n')}>Chưa đạt ({t.canhBao.length})</span>
                        : <span className="badge badge-xanh-la">Đạt CBR-14</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
