import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostOrgApi } from '../../api/hostOrgs';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_PHE_DUYET } from '../../utils/constants';
import type { DonVi, DonViRequest, TrangThaiPheDuyet } from '../../types/hostOrg';
import HostOrgForm from './HostOrgForm';

const TRANG_THAI: TrangThaiPheDuyet[] = ['CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DA_LOAI'];

/** SCR-07 — danh mục đơn vị hướng dẫn: lọc theo trạng thái phê duyệt, tìm kiếm, thêm đơn vị (UC02, #17, #19). */
export default function HostOrgListPage() {
  const navigate = useNavigate();
  const [ds, setDs] = useState<DonVi[] | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [trangThai, setTrangThai] = useState<TrangThaiPheDuyet | ''>('');
  const [oTim, setOTim] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');
  const [moForm, setMoForm] = useState(false);

  const tai = useCallback(async () => {
    setLoi(null);
    try {
      setDs(await hostOrgApi.danhSach({ status: trangThai || undefined, keyword: tuKhoa || undefined }));
    } catch (e) {
      setLoi(e);
      setDs([]);
    }
  }, [trangThai, tuKhoa]);

  useEffect(() => { void tai(); }, [tai]);

  const tim = (e: FormEvent) => {
    e.preventDefault();
    setTuKhoa(oTim.trim());
  };

  const them = async (req: DonViRequest) => {
    const { data, message } = await hostOrgApi.tao(req);
    // Sang SCR-08 để bổ sung cán bộ hướng dẫn rồi phê duyệt.
    navigate(`/host-orgs/${data.id}`, { state: { thongBao: message } });
  };

  const soChoDuyet = ds?.filter((d) => d.trangThaiPheDuyet === 'CHO_DUYET').length ?? 0;

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Đơn vị hướng dẫn</h1>
        {!moForm && <button className="btn btn-chinh" onClick={() => setMoForm(true)}>+ Thêm đơn vị</button>}
      </div>

      {moForm && (
        <div className="card mb">
          <h2 className="section-title mt0">Thêm đơn vị hướng dẫn</h2>
          <HostOrgForm onLuu={them} onHuy={() => setMoForm(false)} />
        </div>
      )}

      <form className="toolbar" onSubmit={tim}>
        <label className="field field-inline">
          <span>Trạng thái</span>
          <select value={trangThai} onChange={(e) => setTrangThai(e.target.value as TrangThaiPheDuyet | '')}>
            <option value="">Tất cả</option>
            {TRANG_THAI.map((t) => <option key={t} value={t}>{NHAN_TRANG_THAI_PHE_DUYET[t]}</option>)}
          </select>
        </label>
        <label className="field field-inline dv-tim">
          <span>Tìm kiếm</span>
          <input value={oTim} onChange={(e) => setOTim(e.target.value)} placeholder="Tên, mã hoặc lĩnh vực" />
        </label>
        <button className="btn btn-phu">Tìm</button>
      </form>

      {!trangThai && soChoDuyet > 0 && (
        <div className="alert alert-vang alert-hang mb">
          <span>Có <b>{soChoDuyet}</b> đơn vị đang chờ phê duyệt.</span>
          <button type="button" className="btn btn-phu btn-nho" onClick={() => setTrangThai('CHO_DUYET')}>Xem các đơn vị này</button>
        </div>
      )}

      <ErrorAlert error={loi} />
      {!ds ? <Loading /> : ds.length === 0 ? (
        <div className="card empty"><div className="muted">Không có đơn vị nào phù hợp.</div></div>
      ) : (
        <div className="table-wrap">
          <table className="table table-click dv-bang">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên đơn vị</th>
                <th>Lĩnh vực</th>
                <th>Người đại diện</th>
                <th className="num">Cán bộ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {ds.map((d) => (
                <tr key={d.id} onClick={() => navigate(`/host-orgs/${d.id}`)} tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/host-orgs/${d.id}`)}>
                  <td className="nowrap"><b>{d.maDvhd}</b></td>
                  <td>
                    <div className="dv-ten">{d.ten}</div>
                    <div className="muted small">{d.diaChi}</div>
                  </td>
                  <td>{d.linhVuc}</td>
                  <td>{d.nguoiDaiDien}</td>
                  <td className="num dv-so-cb">{d.soCanBo ?? 0}<span className="dv-nhan-cb"> cán bộ</span></td>
                  <td className="dv-tt"><StatusBadge value={d.trangThaiPheDuyet} labels={NHAN_TRANG_THAI_PHE_DUYET} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
