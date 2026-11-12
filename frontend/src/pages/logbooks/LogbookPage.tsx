import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { progressApi } from '../../api/progress';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import { homNayIso, khoangTuan, soNgayTruoc, thu, tuanCua } from '../../utils/lich';
import type { NhatKy } from '../../types/progress';
import type { HoSo, TrangThaiHoSo } from '../../types/record';
import type { Dot } from '../../types/term';
import RemindLogbook, { KetQuaNhacNho, type KetQuaNhac } from './RemindLogbook';

type Form = { ngay: string; noiDung: string; soGio: string; ketQua: string };
const formTrong = (d: string): Form => ({ ngay: d, noiDung: '', soGio: '', ketQua: '' });
const tuBanGhi = (n: NhatKy): Form => ({
  ngay: n.ngay, noiDung: n.noiDung, soGio: n.soGio === undefined || n.soGio === null ? '' : String(n.soGio), ketQua: n.ketQua ?? '',
});
const sangReq = (f: Form) => ({
  noiDung: f.noiDung, soGio: f.soGio === '' ? undefined : Number(f.soGio), ketQua: f.ketQua.trim() || undefined,
});
const soGio = (n: NhatKy) => (n.soGio === undefined || n.soGio === null || n.soGio === '' ? 0 : Number(n.soGio));
const hienGio = (x: number) => x.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const loiO = (e: unknown, truong: string) => (e instanceof ApiError ? e.loiTruong(truong) : undefined);
const moiNhatTruoc = (a: NhatKy, b: NhatKy) => b.ngay.localeCompare(a.ngay);
/** Ghi đúng ngày ⇒ chỉ giờ; ghi bù ngày sau ⇒ kèm ngày ghi để người xem nhận ra. */
const luocGhi = (n: NhatKy) => {
  const [ngayGhi, gioGhi] = ngayGio(n.ngayTao).split(' ');
  return ngayGhi === ngay(n.ngay) ? `ghi lúc ${gioGhi}` : `ghi bù ${ngayGhi.slice(0, 5)} ${gioGhi}`;
};
const TRUOC_THUC_TAP: TrangThaiHoSo[] = ['NHAP', 'CHO_DVHD', 'CHO_GVHD', 'TU_CHOI'];

/** `/records/:recordId/logbooks` — đích NT-09 (SV) và lối từ SCR-12 (cán bộ, GV, giáo vụ). */
export function LogbookRoute() {
  const id = Number(useParams().recordId);
  return <LogbookPage key={id} recordId={id} />;
}

/**
 * SCR-15 — Nhật ký thực tập (UC07, #57–#60). SV thêm nhật ký ngày (#58) và sửa bản ghi còn trong hạn (#59 — nút Sửa
 * theo cờ `suaDuoc` backend trả); người khác chỉ xem; GVHD nhắc ghi (#60). `recordId` trống ⇒ hồ sơ của SV (#40).
 * Một bản ghi mỗi ngày và hạn 7 ngày (BR-07.1, BR-07.2) do backend kiểm; giao diện chỉ báo trước ngày đã có bản ghi.
 */
export default function LogbookPage({ recordId }: { recordId?: number }) {
  const { nguoiDung } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [ds, setDs] = useState<NhatKy[] | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [locTuan, setLocTuan] = useState<number | null>(null);
  const [moi, setMoi] = useState<Form>(formTrong(homNayIso()));
  const [loiMoi, setLoiMoi] = useState<unknown>(null);
  const [sua, setSua] = useState<{ id: number; f: Form } | null>(null);
  const [loiSua, setLoiSua] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState<string>();
  const [nhac, setNhac] = useState<KetQuaNhac | null>(null);

  useEffect(() => {
    let conHieuLuc = true;
    (async () => {
      const h = recordId ? await recordApi.chiTiet(recordId) : await recordApi.cuaToi();
      const [d, n] = await Promise.all([termApi.chiTiet(h.dot.id), progressApi.nhatKy(h.id)]);
      if (!conHieuLuc) return;
      setHoSo(h);
      setDot(d);
      setDs([...n].sort(moiNhatTruoc));
    })().catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [recordId]);

  /** Nhóm theo tuần của đợt, tuần mới nhất trước. */
  const nhom = useMemo(() => {
    if (!ds || !dot) return [];
    const m = new Map<number, NhatKy[]>();
    ds.forEach((n) => { const t = tuanCua(dot, n.ngay); m.set(t, [...(m.get(t) ?? []), n]); });
    return [...m.entries()].sort((a, b) => b[0] - a[0]).map(([tuan, cacNgay]) => ({ tuan, cacNgay }));
  }, [ds, dot]);

  const laSv = nguoiDung?.vaiTro === 'SINH_VIEN';
  const laGvhd = nguoiDung?.vaiTro === 'GIANG_VIEN' && hoSo?.gvhd?.nguoiDungId === nguoiDung.id;
  const quayLai = laSv
    ? <Link to="/my-record" className="back-link">← Hồ sơ thực tập của tôi</Link>
    : hoSo && <Link to={`/records/${hoSo.id}`} className="back-link">← Hồ sơ của {hoSo.sinhVien.hoTen}</Link>;
  const tieuDe = (
    <>
      {quayLai}
      <div className="page-head">
        <div>
          <h1 className="page-title">Nhật ký thực tập</h1>
          {hoSo && !laSv && <div className="muted small">{hoSo.sinhVien.hoTen} — {hoSo.sinhVien.maSv} · đợt {hoSo.dot.maDot}</div>}
        </div>
        {hoSo && (
          <div className="action-bar-buttons">
            {laGvhd && hoSo.trangThai === 'DANG_THUC_TAP' && (
              <RemindLogbook hoSo={{ id: hoSo.id, hoTen: hoSo.sinhVien.hoTen }} onXong={(kq) => { setThongBao(undefined); setNhac(kq); }} />
            )}
            <StatusBadge value={hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />
          </div>
        )}
      </div>
    </>
  );

  if (loiTai) {
    const chuaCoHoSo = laSv && loiTai instanceof ApiError && loiTai.code === 'RESOURCE_NOT_FOUND';
    return (
      <div>
        {tieuDe}
        {chuaCoHoSo ? (
          <div className="card empty">
            <div className="empty-title">{loiTai.message}</div>
            <div className="muted">Nhật ký được ghi khi hồ sơ đã được GVHD phê duyệt và chuyển sang Đang thực tập.</div>
            <Link to="/my-record" className="btn btn-chinh">Đăng ký thực tập</Link>
          </div>
        ) : <ErrorAlert error={loiTai} />}
      </div>
    );
  }
  if (!hoSo || !dot || !ds) return <div>{tieuDe}<Loading /></div>;

  const ghiDuoc = laSv && hoSo.trangThai === 'DANG_THUC_TAP';
  const homNay = homNayIso();
  const tuanNay = tuanCua(dot, homNay);
  const tongGio = ds.reduce((s, n) => s + soGio(n), 0);
  const ganNhat = ds[0];
  const trung = ds.find((n) => n.ngay === moi.ngay);
  const hienThi = locTuan === null ? nhom : nhom.filter((g) => g.tuan === locTuan);
  const tenTuan = (t: number) => (t > dot.soTuan ? 'Sau ngày kết thúc đợt' : `Tuần ${t}`);

  const ghi = async (e: FormEvent) => {
    e.preventDefault();
    setDangGui(true);
    setLoiMoi(null);
    setThongBao(undefined);
    setNhac(null);
    try {
      const { data, message } = await progressApi.ghiNhatKy({ hoSoId: hoSo.id, ngay: moi.ngay, ...sangReq(moi) });
      setDs((cu) => [...(cu ?? []), data].sort(moiNhatTruoc));
      setMoi(formTrong(homNay));
      setThongBao(message);
    } catch (err) {
      setLoiMoi(err);
    } finally {
      setDangGui(false);
    }
  };

  const luuSua = async () => {
    if (!sua) return;
    setDangGui(true);
    setLoiSua(null);
    setThongBao(undefined);
    try {
      const { data, message } = await progressApi.suaNhatKy(sua.id, sangReq(sua.f));
      setDs((cu) => (cu ?? []).map((n) => (n.id === data.id ? data : n)));
      setSua(null);
      setThongBao(message);
    } catch (err) {
      setLoiSua(err);
    } finally {
      setDangGui(false);
    }
  };

  const moSua = (n: NhatKy) => {
    setLoiSua(null);
    setSua({ id: n.id, f: tuBanGhi(n) });
    setLocTuan((cu) => (cu === null || cu === tuanCua(dot, n.ngay) ? cu : null));
    setTimeout(() => document.getElementById(`nk-${n.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0);
  };
  const doiSua = (truong: keyof Form, v: string) => setSua((s) => (s ? { ...s, f: { ...s.f, [truong]: v } } : s));

  const huongDan = (() => {
    if (!laSv) return null;
    if (ghiDuoc) return 'Ghi nhật ký hằng ngày: mỗi ngày một bản ghi; chỉ ghi thêm và sửa được trong 7 ngày gần nhất (Điều 19 khoản 1 điểm c).';
    if (TRUOC_THUC_TAP.includes(hoSo.trangThai)) return 'Nhật ký được ghi khi hồ sơ đã được GVHD phê duyệt và chuyển sang Đang thực tập.';
    return 'Hồ sơ không còn ở trạng thái Đang thực tập nên nhật ký chỉ còn để xem.';
  })();

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <KetQuaNhacNho kq={nhac} />
      {huongDan && <div className={`alert ${ghiDuoc ? 'alert-xanh-duong' : 'alert-vang'} mb`}>{huongDan}</div>}

      <div className="stat-row mb">
        <div className="stat stat-xanh-duong"><b>{ds.length}</b><span>ngày đã ghi nhật ký</span></div>
        <div className="stat"><b>{hienGio(tongGio)}</b><span>tổng số giờ</span></div>
        <div className="stat">
          <b className="stat-chu">{ganNhat ? ngay(ganNhat.ngay) : 'Chưa ghi'}</b>
          <span>{ganNhat ? `ghi gần nhất · ${soNgayTruoc(ganNhat.ngay) === 0 ? 'hôm nay' : `${soNgayTruoc(ganNhat.ngay)} ngày trước`}` : 'chưa có bản ghi nào'}</span>
        </div>
        <div className="stat">
          <b className="stat-chu">{tuanNay < 1 ? 'Chưa bắt đầu' : tuanNay > dot.soTuan ? 'Đã kết thúc' : `Tuần ${tuanNay}/${dot.soTuan}`}</b>
          <span>đợt {ngay(dot.ngayBatDau)} – {ngay(dot.ngayKetThuc)}</span>
        </div>
      </div>

      {ghiDuoc && (
        <form className="card mb" onSubmit={(e) => void ghi(e)} noValidate>
          <h2 className="section-title mt0">Thêm nhật ký</h2>
          <ErrorAlert error={loiMoi} />
          <div className="nk-form">
            <label className="field">
              <span>Ngày *</span>
              <input type="date" value={moi.ngay} min={dot.ngayBatDau} max={homNay}
                     className={loiO(loiMoi, 'ngay') ? 'input-loi' : undefined}
                     onChange={(e) => setMoi({ ...moi, ngay: e.target.value })} />
              {moi.ngay && <small className="muted">{thu(moi.ngay)} · {tenTuan(tuanCua(dot, moi.ngay))}</small>}
              {loiO(loiMoi, 'ngay') && <small className="field-error">{loiO(loiMoi, 'ngay')}</small>}
            </label>
            <label className="field">
              <span>Số giờ</span>
              <input type="number" min={0} max={24} step={0.1} value={moi.soGio} placeholder="Ví dụ 8"
                     className={loiO(loiMoi, 'soGio') ? 'input-loi' : undefined}
                     onChange={(e) => setMoi({ ...moi, soGio: e.target.value })} />
              {loiO(loiMoi, 'soGio') && <small className="field-error">{loiO(loiMoi, 'soGio')}</small>}
            </label>
          </div>
          {trung && (
            <p className="hint nk-trung">
              Ngày {ngay(trung.ngay)} đã có nhật ký — mỗi ngày chỉ một bản ghi.{' '}
              {trung.suaDuoc && <button type="button" className="btn btn-phu btn-nho" onClick={() => moSua(trung)}>Sửa bản ghi ngày này</button>}
            </p>
          )}
          <label className="field mt">
            <span>Nội dung công việc *</span>
            <textarea className={`textarea${loiO(loiMoi, 'noiDung') ? ' input-loi' : ''}`} rows={3} maxLength={5000}
                      value={moi.noiDung} onChange={(e) => setMoi({ ...moi, noiDung: e.target.value })} />
            {loiO(loiMoi, 'noiDung') && <small className="field-error">{loiO(loiMoi, 'noiDung')}</small>}
          </label>
          <label className="field mt">
            <span>Kết quả</span>
            <textarea className="textarea" rows={2} maxLength={5000} value={moi.ketQua}
                      onChange={(e) => setMoi({ ...moi, ketQua: e.target.value })} />
          </label>
          <div className="form-actions mt">
            <button type="submit" className="btn btn-chinh" disabled={dangGui}>{dangGui && !sua ? 'Đang ghi…' : 'Ghi nhật ký'}</button>
          </div>
        </form>
      )}

      <div className="card-head">
        <h2 className="section-title mt0">Nhật ký theo tuần</h2>
      </div>
      {ds.length === 0 ? (
        <div className="card empty">
          <div className="empty-title">Chưa có nhật ký nào</div>
          {!laSv && <div className="muted">Sinh viên chưa ghi nhật ký ngày nào.</div>}
        </div>
      ) : (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={locTuan === null} className={`tab${locTuan === null ? ' tab-active' : ''}`}
                    onClick={() => setLocTuan(null)}>Tất cả<span className="tab-dem">{ds.length}</span></button>
            {[...nhom].reverse().map((g) => (
              <button key={g.tuan} role="tab" aria-selected={locTuan === g.tuan}
                      className={`tab${locTuan === g.tuan ? ' tab-active' : ''}`} onClick={() => setLocTuan(g.tuan)}>
                {g.tuan > dot.soTuan ? 'Sau đợt' : `Tuần ${g.tuan}`}<span className="tab-dem">{g.cacNgay.length}</span>
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table className="table nhat-ky">
              <thead>
                <tr>
                  <th className="nk-ngay">Ngày</th>
                  <th className="nk-gio">Số giờ</th>
                  <th>Nội dung công việc</th>
                  <th>Kết quả</th>
                  {ghiDuoc && <th className="nk-tt" aria-label="Thao tác" />}
                </tr>
              </thead>
              <tbody>
                {hienThi.map((g) => (
                  <Fragment key={g.tuan}>
                    <tr className="nk-tuan">
                      <td colSpan={ghiDuoc ? 5 : 4}>
                        <b>{tenTuan(g.tuan)}</b>
                        {g.tuan <= dot.soTuan && <span className="muted"> · {khoangTuan(dot, g.tuan)}</span>}
                        <span className="muted"> · {g.cacNgay.length} ngày · {hienGio(g.cacNgay.reduce((s, n) => s + soGio(n), 0))} giờ</span>
                      </td>
                    </tr>
                    {g.cacNgay.map((n) => (sua?.id === n.id ? (
                      <tr key={n.id} id={`nk-${n.id}`} className="nk-dang-sua">
                        <td className="nk-ngay"><b>{thu(n.ngay)}</b><div>{ngay(n.ngay)}</div></td>
                        <td className="nk-gio">
                          <input type="number" min={0} max={24} step={0.1} className={`input-so${loiO(loiSua, 'soGio') ? ' input-loi' : ''}`}
                                 aria-label="Số giờ" value={sua.f.soGio} onChange={(e) => doiSua('soGio', e.target.value)} />
                          {loiO(loiSua, 'soGio') && <small className="field-error">{loiO(loiSua, 'soGio')}</small>}
                        </td>
                        <td>
                          <textarea className={`textarea${loiO(loiSua, 'noiDung') ? ' input-loi' : ''}`} rows={3} maxLength={5000}
                                    aria-label="Nội dung công việc" value={sua.f.noiDung} onChange={(e) => doiSua('noiDung', e.target.value)} />
                          {loiO(loiSua, 'noiDung') && <small className="field-error">{loiO(loiSua, 'noiDung')}</small>}
                        </td>
                        <td>
                          <textarea className="textarea" rows={3} maxLength={5000} aria-label="Kết quả" value={sua.f.ketQua}
                                    onChange={(e) => doiSua('ketQua', e.target.value)} />
                        </td>
                        <td className="nk-tt">
                          <div className="nk-nut">
                            <button type="button" className="btn btn-chinh btn-nho" disabled={dangGui} onClick={() => void luuSua()}>Lưu</button>
                            <button type="button" className="btn btn-phu btn-nho" disabled={dangGui} onClick={() => setSua(null)}>Hủy</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={n.id}>
                        <td className="nk-ngay">
                          <b>{thu(n.ngay)}</b><div>{ngay(n.ngay)}</div>
                          <div className="muted small" title={`Ghi lúc ${ngayGio(n.ngayTao)}`}>{luocGhi(n)}</div>
                        </td>
                        <td className="nk-gio">{soGio(n) ? hienGio(soGio(n)) : <span className="muted">—</span>}</td>
                        <td className="pre-line">{n.noiDung}</td>
                        <td className="pre-line">{n.ketQua ?? <span className="muted">—</span>}</td>
                        {ghiDuoc && (
                          <td className="nk-tt">
                            {n.suaDuoc
                              ? <button type="button" className="btn btn-phu btn-nho" disabled={dangGui} onClick={() => moSua(n)}>Sửa</button>
                              : <span className="muted small" title="Chỉ sửa được trong 7 ngày gần nhất (BR-07.2)">Đã khóa</span>}
                          </td>
                        )}
                      </tr>
                    )))}
                    {sua && loiSua !== null && g.cacNgay.some((n) => n.id === sua.id) && (
                      <tr className="nk-dang-sua"><td colSpan={5}><ErrorAlert error={loiSua} /></td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
