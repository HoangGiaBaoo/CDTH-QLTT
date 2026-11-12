import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { assignmentApi } from '../../api/assignments';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import TermSelect from '../../components/TermSelect';
import { NHAN_HINH_THUC_THUC_TAP, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngayGio } from '../../utils/format';
import type { PhanCong, UngVienPhanCong } from '../../types/assignment';
import type { Dot } from '../../types/term';
import ChangeLecturerDialog from './ChangeLecturerDialog';
import LecturerPicker from './LecturerPicker';

/**
 * `/assignments` — SCR-13 cho giáo vụ. Đây cũng là đích của NT-04 gửi giảng viên và sinh viên: họ được đưa sang màn
 * của mình (GV: danh sách SV hướng dẫn để duyệt hồ sơ; SV: hồ sơ đăng ký có tên GVHD).
 */
export default function AssignmentPage() {
  const { nguoiDung } = useAuth();
  if (nguoiDung?.vaiTro === 'GIANG_VIEN') return <Navigate to="/records" replace />;
  if (nguoiDung?.vaiTro === 'SINH_VIEN') return <Navigate to="/my-record" replace />;
  return <PhanCongGiaoVu />;
}

/** Đợt mặc định: đợt đang thực hiện, rồi đợt đang nhận đăng ký (cán bộ đã xác nhận trong lúc mở đăng ký). */
function dotMacDinh(ds: Dot[]): number | undefined {
  return (ds.find((d) => d.trangThai === 'DANG_THUC_HIEN') ?? ds.find((d) => d.trangThai === 'DANG_NHAN_DANG_KY') ?? ds[0])?.id;
}

/**
 * SCR-13 — Phân công GVHD (UC05). Hai cột như đặc tả bước 2: SV đã được ĐVHD xác nhận mà chưa có GVHD (#49) và giảng
 * viên kèm đã nhận / hạn mức; chọn nhiều SV + một giảng viên ⇒ #50 trong một giao dịch. Bên dưới là danh sách đã phân
 * công của đợt (#48) với Đổi GVHD (#51).
 */
function PhanCongGiaoVu() {
  const [params, setParams] = useSearchParams();
  const [dsDot, setDsDot] = useState<Dot[] | null>(null);
  const [uv, setUv] = useState<UngVienPhanCong | null>(null);
  const [ds, setDs] = useState<PhanCong[] | null>(null);
  const [lanTai, setLanTai] = useState(0);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [chonSv, setChonSv] = useState<Set<number>>(new Set());
  const [chonGv, setChonGv] = useState<number>();
  const [timSv, setTimSv] = useState('');
  const [hoi, setHoi] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [locGv, setLocGv] = useState('');
  const [timDa, setTimDa] = useState('');
  const [doi, setDoi] = useState<PhanCong | null>(null);

  const termId = params.get('dot') ? Number(params.get('dot')) : dsDot ? dotMacDinh(dsDot) : undefined;

  useEffect(() => {
    termApi.danhSach()
      .then((x) => setDsDot(x.filter((d) => d.trangThai !== 'KHOI_TAO')))
      .catch((e) => { setLoi(e); setDsDot([]); });
  }, []);

  useEffect(() => {
    if (!termId) return;
    let conHieuLuc = true;
    Promise.all([assignmentApi.ungVien(termId), assignmentApi.danhSach(termId)])
      .then(([u, d]) => {
        if (!conHieuLuc) return;
        setUv(u);
        setDs(d);
        // Bỏ khỏi lựa chọn những SV không còn chờ (vừa được phân công, hoặc đợt khác).
        const conCho = new Set(u.sinhViens.map((s) => s.hoSoId));
        setChonSv((cu) => new Set([...cu].filter((id) => conCho.has(id))));
      })
      .catch((e) => { if (conHieuLuc) { setLoi(e); setUv({ sinhViens: [], giangViens: [] }); setDs([]); } });
    return () => { conHieuLuc = false; };
  }, [termId, lanTai]);

  const doiDot = (id: number) => {
    setUv(null);
    setDs(null);
    setLoi(null);
    setThongBao(undefined);
    setChonSv(new Set());
    setChonGv(undefined);
    setParams({ dot: String(id) }, { replace: true });
  };

  const svHienThi = useMemo(() => {
    const k = timSv.trim().toLowerCase();
    return (uv?.sinhViens ?? []).filter((s) => !k || s.maSv.toLowerCase().includes(k) || s.hoTen.toLowerCase().includes(k)
      || (s.donVi?.toLowerCase().includes(k) ?? false));
  }, [uv, timSv]);
  const chonHet = svHienThi.length > 0 && svHienThi.every((s) => chonSv.has(s.hoSoId));
  const batChon = (id: number) => setChonSv((cu) => {
    const moi = new Set(cu);
    if (moi.has(id)) moi.delete(id); else moi.add(id);
    return moi;
  });

  const gv = uv?.giangViens.find((g) => g.id === chonGv);
  const vuotHanMuc = !!gv && chonSv.size > gv.conNhan;

  const daHienThi = useMemo(() => {
    const k = timDa.trim().toLowerCase();
    return (ds ?? []).filter((p) => (!locGv || String(p.giangVienId) === locGv)
      && (!k || p.maSv.toLowerCase().includes(k) || p.hoTenSinhVien.toLowerCase().includes(k)));
  }, [ds, locGv, timDa]);
  const gvTrongDs = useMemo(() => {
    const m = new Map<number, string>();
    (ds ?? []).forEach((p) => m.set(p.giangVienId, `${p.hoTenGiangVien} (${p.maGv})`));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'vi'));
  }, [ds]);

  const phanCong = async () => {
    if (!gv) return;
    setHoi(false);
    setDangGui(true);
    setLoi(null);
    setThongBao(undefined);
    try {
      const { data, message } = await assignmentApi.phanCong({ giangVienId: gv.id, hoSoIds: [...chonSv] });
      setThongBao(`${message ?? `Đã phân công ${data.length} sinh viên`} cho ${gv.hoTen}. Giảng viên và sinh viên đã nhận thông báo.`);
      setChonSv(new Set());
      setChonGv(undefined);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
      // Hạn mức có thể đã đổi do thao tác khác — tải lại số liệu cả khi lỗi; lựa chọn giữ nguyên để chọn lại GV.
      setLanTai((n) => n + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const conCho = (uv?.giangViens ?? []).reduce((t, g) => t + g.conNhan, 0);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Phân công giảng viên hướng dẫn</h1>
      </div>
      <div className="toolbar">
        <TermSelect dsDot={dsDot ?? []} termId={termId} onChange={doiDot} />
      </div>
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <ErrorAlert error={loi} />
      {loi instanceof ApiError && loi.code === 'QUOTA_EXCEEDED' && (
        <p className="hint mb">Không sinh viên nào được phân công (cả lô bị hủy — UC05 4a). Chọn giảng viên còn đủ chỗ hoặc bớt sinh viên rồi phân công lại.</p>
      )}

      {!termId ? (dsDot ? <div className="card empty"><div className="muted">Chưa có đợt thực tập nào.</div></div> : <Loading />)
        : !uv || !ds ? <Loading /> : (
          <>
            <div className="stat-row mb">
              <div className={`stat${uv.sinhViens.length ? ' stat-vang' : ''}`}><b>{uv.sinhViens.length}</b><span>sinh viên chờ phân công</span></div>
              <div className="stat stat-xanh-duong"><b>{ds.length}</b><span>sinh viên đã có GVHD</span></div>
              <div className="stat"><b>{uv.giangViens.filter((g) => g.conNhan > 0).length}/{uv.giangViens.length}</b><span>giảng viên còn nhận</span></div>
              <div className="stat"><b>{conCho}</b><span>chỗ hướng dẫn còn trống</span></div>
            </div>

            <div className="pc-luoi">
              <div className="card">
                <div className="card-head">
                  <h2 className="section-title">Sinh viên chưa có GVHD</h2>
                  <span className="muted small">Đã được ĐVHD xác nhận tiếp nhận</span>
                </div>
                {uv.sinhViens.length === 0 ? (
                  <p className="muted center">Không còn sinh viên nào chờ phân công trong đợt này.</p>
                ) : (
                  <>
                    <label className="field mb-nho">
                      <input placeholder="Tìm mã SV, họ tên, đơn vị…" value={timSv} onChange={(e) => setTimSv(e.target.value)}
                             aria-label="Tìm sinh viên chờ phân công" />
                    </label>
                    <div className="table-wrap">
                      <table className="table table-gon table-giua">
                        <thead>
                          <tr>
                            <th>
                              <input type="checkbox" aria-label="Chọn tất cả sinh viên đang hiện" checked={chonHet}
                                     onChange={() => setChonSv((cu) => {
                                       const moi = new Set(cu);
                                       svHienThi.forEach((s) => (chonHet ? moi.delete(s.hoSoId) : moi.add(s.hoSoId)));
                                       return moi;
                                     })} />
                            </th>
                            <th>Mã SV</th>
                            <th>Sinh viên</th>
                            <th>Đơn vị hướng dẫn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {svHienThi.map((s) => (
                            <tr key={s.hoSoId} className={chonSv.has(s.hoSoId) ? 'row-chon' : undefined}
                                onClick={() => batChon(s.hoSoId)}>
                              <td onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" aria-label={`Chọn ${s.maSv}`} checked={chonSv.has(s.hoSoId)}
                                       onChange={() => batChon(s.hoSoId)} />
                              </td>
                              <td className="nowrap">{s.maSv}</td>
                              <td>
                                {s.hoTen}
                                {s.lop && <div className="muted small">{s.lop}</div>}
                              </td>
                              <td className="small">
                                {s.donVi ?? '—'}
                                <div className="muted">{NHAN_HINH_THUC_THUC_TAP[s.hinhThucThucTap] ?? s.hinhThucThucTap}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {svHienThi.length === 0 && <p className="muted center">Không có sinh viên khớp từ khóa.</p>}
                  </>
                )}
              </div>

              <div className="card">
                <div className="card-head">
                  <h2 className="section-title">Giảng viên</h2>
                  <span className="muted small">Đã nhận / hạn mức trong đợt</span>
                </div>
                <LecturerPicker ds={uv.giangViens} chon={chonGv} onChon={setChonGv} soCan={chonSv.size} ten="gv-phan-cong" />
              </div>
            </div>

            {uv.sinhViens.length > 0 && (
              <div className={`card pc-thanh${vuotHanMuc ? ' pc-thanh-vang' : ''}`}>
                <div>
                  <b>{chonSv.size}</b> sinh viên đã chọn
                  {gv ? <> → <b>{gv.hoTen}</b> (còn nhận {gv.conNhan})</> : <span className="muted"> · chưa chọn giảng viên</span>}
                  {vuotHanMuc && (
                    <div className="small text-vang mt-nho">
                      Vượt hạn mức: hệ thống sẽ không phân công sinh viên nào trong lô này (Điều 6 khoản 2 điểm b).
                    </div>
                  )}
                </div>
                <button className="btn btn-chinh" disabled={chonSv.size === 0 || !gv || dangGui} onClick={() => setHoi(true)}>
                  {dangGui ? 'Đang phân công…' : 'Phân công'}
                </button>
              </div>
            )}

            <div className="card-head mt">
              <h2 className="section-title">Đã phân công ({ds.length})</h2>
            </div>
            {ds.length === 0 ? (
              <div className="card empty"><div className="muted">Đợt này chưa có phân công nào.</div></div>
            ) : (
              <>
                <div className="toolbar">
                  <label className="field field-inline">
                    <span>Giảng viên</span>
                    <select value={locGv} onChange={(e) => setLocGv(e.target.value)}>
                      <option value="">Tất cả</option>
                      {gvTrongDs.map(([id, ten]) => <option key={id} value={id}>{ten}</option>)}
                    </select>
                  </label>
                  <label className="field field-inline">
                    <span>Tìm</span>
                    <input placeholder="Mã SV, họ tên…" value={timDa} onChange={(e) => setTimDa(e.target.value)} />
                  </label>
                </div>
                <div className="table-wrap">
                  <table className="table table-giua">
                    <thead>
                      <tr>
                        <th>Mã SV</th>
                        <th>Sinh viên</th>
                        <th>GVHD</th>
                        <th>Ngày phân công</th>
                        <th>Hồ sơ</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {daHienThi.map((p) => (
                        <tr key={p.id}>
                          <td className="nowrap">{p.maSv}</td>
                          <td>
                            <Link to={`/records/${p.hoSoId}`}>{p.hoTenSinhVien}</Link>
                            {p.lop && <div className="muted small">{p.lop}</div>}
                          </td>
                          <td>
                            {p.hoTenGiangVien}
                            <div className="muted small">{p.maGv}</div>
                            {p.lyDoThayDoi && <div className="small text-vang">Đã đổi GVHD: {p.lyDoThayDoi}</div>}
                          </td>
                          <td className="nowrap small">{ngayGio(p.ngayPhanCong)}</td>
                          <td><StatusBadge value={p.trangThaiHoSo} labels={NHAN_TRANG_THAI_HO_SO} /></td>
                          <td className="actions">
                            <button className="btn btn-phu btn-nho" onClick={() => setDoi(p)}>Đổi GVHD</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {daHienThi.length === 0 && <p className="muted center">Không có phân công khớp bộ lọc.</p>}
              </>
            )}
            <p className="hint">
              Mỗi sinh viên có đúng một GVHD trong đợt; số sinh viên của mỗi giảng viên không vượt hạn mức riêng (CBR-04).
              Kết quả phân công được công bố ngay cho giảng viên và sinh viên (Điều 6 khoản 2 điểm c); giảng viên duyệt hồ sơ ở
              mục Sinh viên hướng dẫn.
            </p>
          </>
        )}

      <ConfirmDialog
        mo={hoi}
        tieuDe={`Phân công ${chonSv.size} sinh viên cho ${gv?.hoTen ?? ''}?`}
        nhanXacNhan="Phân công"
        dangXuLy={dangGui}
        onXacNhan={() => void phanCong()}
        onHuy={() => setHoi(false)}
      >
        <ul className="alert-list mb-nho">
          {(uv?.sinhViens ?? []).filter((s) => chonSv.has(s.hoSoId)).map((s) => (
            <li key={s.hoSoId}>{s.maSv} — {s.hoTen}</li>
          ))}
        </ul>
        <p>
          Cả lô được lưu trong một giao dịch: một sinh viên không hợp lệ hoặc vượt hạn mức thì không sinh viên nào được
          phân công. Lưu xong, kết quả công bố ngay và giảng viên nhận thông báo để duyệt hồ sơ.
        </p>
      </ConfirmDialog>

      <ChangeLecturerDialog
        pc={doi}
        dsGv={uv?.giangViens ?? []}
        onHuy={() => setDoi(null)}
        onXong={(message) => {
          setDoi(null);
          setLoi(null);
          setThongBao(message ?? 'Đã đổi giảng viên hướng dẫn');
          setLanTai((n) => n + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
