import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_CHUONG_TRINH, NHAN_HINH_THUC_THUC_TAP, NHAN_TRANG_THAI_DOT, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay } from '../../utils/format';
import type { VaiTro } from '../../types/auth';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { Dot } from '../../types/term';

/** Thứ tự tab trạng thái theo vòng đời hồ sơ. */
const THU_TU: TrangThaiHoSo[] = [
  'NHAP', 'CHO_DVHD', 'CHO_GVHD', 'DANG_THUC_TAP', 'CHO_DANH_GIA', 'HOAN_THANH', 'KHONG_HOAN_THANH', 'GIAN_DOAN', 'TU_CHOI',
];

const TAT_CA = 'tat-ca';

/** Hồ sơ đang chờ chính người xem làm việc của UC04 (danh sách #39 của GV / cán bộ chỉ gồm SV của họ). */
function choToi(h: HoSo, vaiTro: VaiTro): boolean {
  return (vaiTro === 'CAN_BO_DVHD' && h.trangThai === 'CHO_DVHD') || (vaiTro === 'GIANG_VIEN' && h.trangThai === 'CHO_GVHD');
}

/** Đợt mặc định: giáo vụ quản lý theo đợt (đợt đang thực hiện, rồi đợt đang nhận đăng ký); GV / cán bộ xem mọi SV của mình. */
function dotMacDinh(ds: Dot[], vaiTro: VaiTro): string {
  if (vaiTro !== 'ADMIN') return TAT_CA;
  const d = ds.find((x) => x.trangThai === 'DANG_THUC_HIEN') ?? ds.find((x) => x.trangThai === 'DANG_NHAN_DANG_KY') ?? ds[0];
  return d ? String(d.id) : TAT_CA;
}

/**
 * SCR-12 — danh sách hồ sơ thực tập (#39). Giáo vụ thấy mọi hồ sơ; giảng viên chỉ SV mình là GVHD, cán bộ ĐVHD chỉ SV
 * mình hướng dẫn (backend lọc). Lọc trạng thái / hình thức làm ngay trên danh sách của đợt để tab có số đếm.
 * Bộ lọc giữ trong URL để quay lại từ trang chi tiết không mất.
 */
export default function RecordListPage() {
  const { nguoiDung } = useAuth();
  const vaiTro = nguoiDung!.vaiTro;
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [dsDot, setDsDot] = useState<Dot[] | null>(null);
  const [ds, setDs] = useState<HoSo[] | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const thongBao = (location.state as { thongBao?: string } | null)?.thongBao;

  const dotChon = params.get('dot') ?? (dsDot ? dotMacDinh(dsDot, vaiTro) : null);
  const locTrangThai = params.get('trangThai') ?? '';
  const locHinhThuc = params.get('hinhThuc') ?? '';
  const tuKhoa = params.get('q') ?? '';

  const datLoc = (khoa: string, giaTri: string) => {
    const moi = new URLSearchParams(params);
    if (!moi.has('dot') && dotChon) moi.set('dot', dotChon);
    if (giaTri) moi.set(khoa, giaTri); else moi.delete(khoa);
    setParams(moi, { replace: true });
  };

  useEffect(() => {
    termApi.danhSach()
      .then((x) => setDsDot(x.filter((d) => d.trangThai !== 'KHOI_TAO')))
      .catch((e) => { setLoi(e); setDsDot([]); });
  }, []);

  useEffect(() => {
    if (dotChon === null) return;
    let conHieuLuc = true;
    setDs(null);
    recordApi.danhSach(dotChon === TAT_CA ? {} : { termId: Number(dotChon) })
      .then((x) => { if (conHieuLuc) setDs(x); })
      .catch((e) => { if (conHieuLuc) { setLoi(e); setDs([]); } });
    return () => { conHieuLuc = false; };
  }, [dotChon]);

  const theoHinhThuc = useMemo(() => {
    const k = tuKhoa.trim().toLowerCase();
    return (ds ?? []).filter((h) => (!locHinhThuc || h.hinhThucThucTap === locHinhThuc)
      && (!k || h.sinhVien.maSv.toLowerCase().includes(k) || h.sinhVien.hoTen.toLowerCase().includes(k)
        || (h.donVi?.ten.toLowerCase().includes(k) ?? false)));
  }, [ds, locHinhThuc, tuKhoa]);
  const hienThi = theoHinhThuc.filter((h) => !locTrangThai || h.trangThai === locTrangThai);
  const dem = (t: TrangThaiHoSo) => theoHinhThuc.filter((h) => h.trangThai === t).length;
  const tabs = THU_TU.filter((t) => dem(t) > 0 || t === locTrangThai);

  const soChoToi = (ds ?? []).filter((h) => choToi(h, vaiTro)).length;
  const soChoPhanCong = vaiTro === 'ADMIN' ? (ds ?? []).filter((h) => h.trangThai === 'CHO_GVHD' && !h.gvhd).length : 0;
  const hienDot = dotChon === TAT_CA;
  const hienCanBo = vaiTro !== 'CAN_BO_DVHD';
  const hienGvhd = vaiTro !== 'GIANG_VIEN';

  const moHoSo = (id: number) => navigate(`/records/${id}`);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">{vaiTro === 'ADMIN' ? 'Hồ sơ thực tập' : 'Sinh viên hướng dẫn'}</h1>
      </div>
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <ErrorAlert error={loi} />

      <div className="toolbar">
        <label className="field field-inline">
          <span>Đợt thực tập</span>
          <select value={dotChon ?? ''} disabled={!dsDot} onChange={(e) => datLoc('dot', e.target.value)}>
            <option value={TAT_CA}>Tất cả đợt</option>
            {(dsDot ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.maDot} — {NHAN_TRANG_THAI_DOT[d.trangThai]}</option>
            ))}
          </select>
        </label>
        <label className="field field-inline">
          <span>Hình thức</span>
          <select value={locHinhThuc} onChange={(e) => datLoc('hinhThuc', e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(NHAN_HINH_THUC_THUC_TAP).map(([ma, nhan]) => <option key={ma} value={ma}>{nhan}</option>)}
          </select>
        </label>
        <label className="field field-inline">
          <span>Tìm</span>
          <input placeholder="Mã SV, họ tên, đơn vị…" value={tuKhoa} onChange={(e) => datLoc('q', e.target.value)} />
        </label>
      </div>

      {soChoToi > 0 && (
        <div className="alert alert-vang mb" role="status">
          <div className="alert-hang">
            <span>
              {vaiTro === 'CAN_BO_DVHD'
                ? `Có ${soChoToi} sinh viên chờ bạn xác nhận tiếp nhận.`
                : `Có ${soChoToi} hồ sơ chờ bạn phê duyệt.`}
            </span>
            {locTrangThai !== (vaiTro === 'CAN_BO_DVHD' ? 'CHO_DVHD' : 'CHO_GVHD') && (
              <button className="btn btn-phu btn-nho"
                      onClick={() => datLoc('trangThai', vaiTro === 'CAN_BO_DVHD' ? 'CHO_DVHD' : 'CHO_GVHD')}>
                Xem các hồ sơ này
              </button>
            )}
          </div>
        </div>
      )}
      {soChoPhanCong > 0 && (
        <div className="alert alert-vang mb" role="status">
          <div className="alert-hang">
            <span>Có {soChoPhanCong} hồ sơ đã được ĐVHD xác nhận, chờ phân công giảng viên hướng dẫn.</span>
            <Link to={dotChon && dotChon !== TAT_CA ? `/assignments?dot=${dotChon}` : '/assignments'} className="btn btn-phu btn-nho">
              Phân công GVHD
            </Link>
          </div>
        </div>
      )}

      {!ds ? <Loading /> : ds.length === 0 ? (
        <div className="card empty">
          <div className="muted">
            {vaiTro === 'ADMIN' ? `${hienDot ? 'Chưa' : 'Đợt này chưa'} có hồ sơ thực tập nào.`
              : `Bạn chưa có sinh viên nào${hienDot ? '' : ' trong đợt này'}${vaiTro === 'GIANG_VIEN' ? ' được phân công hướng dẫn' : ''}.`}
          </div>
        </div>
      ) : (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={!locTrangThai} className={`tab${!locTrangThai ? ' tab-active' : ''}`}
                    onClick={() => datLoc('trangThai', '')}>
              Tất cả <span className="tab-dem">{theoHinhThuc.length}</span>
            </button>
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={locTrangThai === t}
                      className={`tab${locTrangThai === t ? ' tab-active' : ''}`} onClick={() => datLoc('trangThai', t)}>
                {NHAN_TRANG_THAI_HO_SO[t]} <span className="tab-dem">{dem(t)}</span>
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table className="table table-click table-giua">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Sinh viên</th>
                  {hienDot && <th>Đợt</th>}
                  <th>Hình thức</th>
                  {hienCanBo && <th>Đơn vị / cán bộ hướng dẫn</th>}
                  {hienGvhd && <th>GVHD</th>}
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {hienThi.map((h) => (
                  <tr key={h.id} tabIndex={0} className={choToi(h, vaiTro) ? 'row-doi' : undefined}
                      onClick={() => moHoSo(h.id)} onKeyDown={(e) => e.key === 'Enter' && moHoSo(h.id)}>
                    <td className="nowrap">{h.sinhVien.maSv}</td>
                    <td>
                      {h.sinhVien.hoTen}
                      <div className="muted small">
                        {[h.sinhVien.lop, NHAN_CHUONG_TRINH[h.sinhVien.chuongTrinhDaoTao]].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    {hienDot && <td className="nowrap small">{h.dot.maDot}</td>}
                    <td className="small">{NHAN_HINH_THUC_THUC_TAP[h.hinhThucThucTap] ?? h.hinhThucThucTap}</td>
                    {hienCanBo && (
                      <td className="small">
                        {h.donVi?.ten ?? '—'}
                        {h.canBoDvhd && <div className="muted">{h.canBoDvhd.hoTen}</div>}
                      </td>
                    )}
                    {hienGvhd && (
                      <td className="small nowrap">
                        {h.gvhd?.hoTen ?? (h.trangThai === 'CHO_GVHD' ? <span className="text-vang">Chưa phân công</span> : '—')}
                      </td>
                    )}
                    <td className="nowrap small">{ngay(h.ngayGui)}</td>
                    <td>
                      <StatusBadge value={h.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />
                      {choToi(h, vaiTro) && (
                        <div className="small text-vang mt-nho">
                          {vaiTro === 'CAN_BO_DVHD' ? 'Chờ bạn xác nhận' : 'Chờ bạn phê duyệt'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hienThi.length === 0 && <p className="muted center">Không có hồ sơ khớp bộ lọc.</p>}
          <p className="hint">
            Bấm một dòng để xem phiếu TTTN-01
            {vaiTro === 'CAN_BO_DVHD' ? ', xác nhận tiếp nhận hoặc từ chối kèm lý do'
              : vaiTro === 'GIANG_VIEN' ? ', phê duyệt hoặc từ chối kèm lý do'
                : ', chuyển Gián đoạn / khôi phục (Điều 15 khoản 4)'}
            ; từ đó mở kế hoạch, nhật ký, tiến độ, minh chứng, báo cáo và phản hồi của sinh viên.
          </p>
        </>
      )}
    </div>
  );
}
