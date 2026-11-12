import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { panelApi } from '../../api/panels';
import { recordApi } from '../../api/records';
import { userApi } from '../../api/users';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import TermSelect, { useTermPicker } from '../../components/TermSelect';
import { NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import type { NguoiDung } from '../../types/auth';
import type { NhomNguoiCham } from '../../types/assessment';
import type { HoSo } from '../../types/record';
import { HO_SO_XEP_TO, kiemThanhPhan, type ThanhVienNhap } from './thanhPhan';

interface ThanhVienChon extends ThanhVienNhap { hoTen: string; moTa?: string }

function moTaNguoi(u: NguoiDung): string | undefined {
  return u.canBoDvhd?.tenDonVi ?? u.giangVien?.boMon ?? undefined;
}

/**
 * SCR-19 — thành lập Tổ đánh giá (UC09 bước 1–5, #79): chọn SV báo cáo cùng buổi, thêm thành viên theo nhóm,
 * chọn chủ tịch, nhập thời gian / địa điểm / hình thức. Bảng kiểm CBR-14 cập nhật ngay khi chọn.
 */
export default function PanelCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { dsDot, termId: termMacDinh, loi: loiDot } = useTermPicker();
  const [termId, setTermId] = useState<number | undefined>(Number(params.get('termId')) || undefined);
  const [hoSoTrong, setHoSoTrong] = useState<HoSo[] | null>(null);
  const [chon, setChon] = useState<Set<number>>(new Set());
  const [giangVien, setGiangVien] = useState<NguoiDung[]>([]);
  const [canBo, setCanBo] = useState<NguoiDung[]>([]);
  const [thanhVien, setThanhVien] = useState<ThanhVienChon[]>([]);
  const [gvThem, setGvThem] = useState('');
  const [cbThem, setCbThem] = useState('');
  const [thoiGian, setThoiGian] = useState('');
  const [diaDiem, setDiaDiem] = useState('');
  const [hinhThuc, setHinhThuc] = useState('TRUC_TIEP');
  const [ghiChu, setGhiChu] = useState('');
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => { if (!termId && termMacDinh) setTermId(termMacDinh); }, [termId, termMacDinh]);

  // Người có thể thêm vào tổ: tài khoản đang hoạt động (backend chặn tài khoản vô hiệu hóa).
  useEffect(() => {
    Promise.all([
      userApi.danhSach({ role: 'GIANG_VIEN', status: 'HOAT_DONG', size: 200 }),
      userApi.danhSach({ role: 'CAN_BO_DVHD', status: 'HOAT_DONG', size: 200 }),
    ]).then(([gv, cb]) => { setGiangVien(gv.items); setCanBo(cb.items); }).catch(setLoi);
  }, []);

  // SV đủ điều kiện xếp tổ (Đ10 k2) và chưa thuộc tổ nào của đợt.
  useEffect(() => {
    if (!termId) return;
    let conHieuLuc = true;
    setHoSoTrong(null);
    setChon(new Set());
    Promise.all([recordApi.danhSach({ termId }), panelApi.danhSach(termId)])
      .then(([hs, cacTo]) => {
        if (!conHieuLuc) return;
        const daXep = new Set(cacTo.flatMap((t) => t.hoSos.map((h) => h.hoSoId)));
        setHoSoTrong(hs.filter((h) => HO_SO_XEP_TO.includes(h.trangThai) && !daXep.has(h.id)));
      })
      .catch((e) => { if (conHieuLuc) { setLoi(e); setHoSoTrong([]); } });
    return () => { conHieuLuc = false; };
  }, [termId]);

  const hoSoChon = useMemo(() => (hoSoTrong ?? []).filter((h) => chon.has(h.id)), [hoSoTrong, chon]);
  const dieuKien = kiemThanhPhan(thanhVien, hoSoChon.map((h) => ({
    hoTen: h.sinhVien.hoTen, gvhdNguoiDungId: h.gvhd?.nguoiDungId, canBoNguoiDungId: h.canBoDvhd?.nguoiDungId,
  })));
  const datHet = hoSoChon.length > 0 && dieuKien.every((d) => d.dat);

  const doiChon = (id: number) => setChon((s) => {
    const m = new Set(s);
    if (m.has(id)) m.delete(id); else m.add(id);
    return m;
  });

  const them = (ds: ThanhVienChon[]) => setThanhVien((cu) => {
    // Hai SV có cùng GVHD / cán bộ thì người đó chỉ vào tổ một lần.
    const moi = ds.reduce<ThanhVienChon[]>(
      (acc, t) => (acc.some((x) => x.nguoiDungId === t.nguoiDungId) ? acc : [...acc, t]), cu);
    if (moi.some((x) => x.laChuTich)) return moi;
    // Chưa có chủ tịch ⇒ mặc định giảng viên đầu tiên; giáo vụ đổi được.
    const dau = moi.findIndex((x) => x.nhom === 'GVHD');
    return moi.map((x, i) => (i === dau ? { ...x, laChuTich: true } : x));
  });

  const nguoi = (u: NguoiDung, nhom: NhomNguoiCham): ThanhVienChon =>
    ({ nguoiDungId: u.id, hoTen: u.hoTen, moTa: moTaNguoi(u), nhom, laChuTich: false });

  /** Điều 10 khoản 3a: tổ phải có GVHD và cán bộ ĐVHD đã hướng dẫn từng SV — thêm nhanh từ hồ sơ đã chọn. */
  const themTuHoSo = () => them(hoSoChon.flatMap((h) => [
    ...(h.gvhd ? [{ nguoiDungId: h.gvhd.nguoiDungId, hoTen: h.gvhd.hoTen, moTa: `GVHD của ${h.sinhVien.hoTen}`, nhom: 'GVHD' as const, laChuTich: false }] : []),
    ...(h.canBoDvhd ? [{ nguoiDungId: h.canBoDvhd.nguoiDungId, hoTen: h.canBoDvhd.hoTen, moTa: `Cán bộ của ${h.sinhVien.hoTen}`, nhom: 'DVHD' as const, laChuTich: false }] : []),
  ]));

  const thanhLap = async () => {
    setLoi(null);
    if (!termId) return;
    setDangGui(true);
    try {
      const { data, message } = await panelApi.tao({
        dotId: termId,
        hoSoIds: hoSoChon.map((h) => h.id),
        thanhViens: thanhVien.map(({ nguoiDungId, nhom, laChuTich }) => ({ nguoiDungId, nhom, laChuTich })),
        thoiGianBaoCao: thoiGian || undefined,
        diaDiem: diaDiem.trim() || undefined,
        hinhThuc,
        ghiChuPheDuyet: ghiChu.trim() || undefined,
      });
      navigate(`/panels/${data.id}`, { state: { thongBao: message } });
    } catch (e) {
      setLoi(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDangGui(false);
    }
  };

  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);
  const idsDaCo = new Set(thanhVien.map((t) => t.nguoiDungId));

  return (
    <div>
      <Link to="/panels" className="back-link">← Danh sách tổ</Link>
      <div className="page-head"><h1 className="page-title">Thành lập Tổ đánh giá</h1></div>
      <ErrorAlert error={loiDot} />
      <ErrorAlert error={loi} />

      <div className="toolbar mt">
        <TermSelect dsDot={dsDot} termId={termId} onChange={setTermId} />
      </div>

      {/* 1. Sinh viên */}
      <div className="card mb">
        <h2 className="section-title mt0">1. Sinh viên báo cáo cùng buổi ({chon.size} đã chọn)</h2>
        {!hoSoTrong ? <Loading /> : hoSoTrong.length === 0 ? (
          <p className="muted">Không còn sinh viên nào đủ điều kiện mà chưa được xếp tổ.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table-gon table-giua">
              <thead>
                <tr><th /><th>Mã SV</th><th>Họ tên</th><th>Hồ sơ</th><th>GVHD</th><th>Cán bộ ĐVHD</th></tr>
              </thead>
              <tbody>
                {hoSoTrong.map((h) => (
                  <tr key={h.id}>
                    <td><input type="checkbox" checked={chon.has(h.id)} onChange={() => doiChon(h.id)} aria-label={`Chọn ${h.sinhVien.hoTen}`} /></td>
                    <td className="nowrap">{h.sinhVien.maSv}</td>
                    <td>{h.sinhVien.hoTen}</td>
                    <td><StatusBadge value={h.trangThai} labels={NHAN_TRANG_THAI_HO_SO} /></td>
                    <td>{h.gvhd?.hoTen ?? <span className="text-do">Chưa phân công</span>}</td>
                    <td>{h.canBoDvhd?.hoTen ?? '—'}<div className="muted small">{h.donVi?.ten}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Thành viên */}
      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">2. Thành viên ({thanhVien.length})</h2>
          <button className="btn btn-phu btn-nho" onClick={themTuHoSo} disabled={hoSoChon.length === 0}>
            Thêm GVHD và cán bộ ĐVHD của SV đã chọn
          </button>
        </div>
        <div className="toolbar">
          <label className="field field-inline">
            <span>Thêm giảng viên (nhóm GVHD)</span>
            <select value={gvThem} onChange={(e) => setGvThem(e.target.value)}>
              <option value="">— Chọn giảng viên —</option>
              {giangVien.filter((u) => !idsDaCo.has(u.id)).map((u) => (
                <option key={u.id} value={u.id}>{u.hoTen}{moTaNguoi(u) ? ` — ${moTaNguoi(u)}` : ''}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-phu" disabled={!gvThem} onClick={() => {
            const u = giangVien.find((x) => x.id === Number(gvThem));
            if (u) them([nguoi(u, 'GVHD')]);
            setGvThem('');
          }}>Thêm</button>
          <label className="field field-inline">
            <span>Thêm cán bộ ĐVHD (nhóm ĐVHD)</span>
            <select value={cbThem} onChange={(e) => setCbThem(e.target.value)}>
              <option value="">— Chọn cán bộ —</option>
              {canBo.filter((u) => !idsDaCo.has(u.id)).map((u) => (
                <option key={u.id} value={u.id}>{u.hoTen}{moTaNguoi(u) ? ` — ${moTaNguoi(u)}` : ''}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-phu" disabled={!cbThem} onClick={() => {
            const u = canBo.find((x) => x.id === Number(cbThem));
            if (u) them([nguoi(u, 'DVHD')]);
            setCbThem('');
          }}>Thêm</button>
        </div>
        {thanhVien.length > 0 && (
          <table className="table table-gon table-giua">
            <thead><tr><th>Thành viên</th><th>Nhóm người chấm</th><th className="center">Chủ tịch</th><th /></tr></thead>
            <tbody>
              {thanhVien.map((t) => (
                <tr key={t.nguoiDungId}>
                  <td>{t.hoTen}{t.moTa && <div className="muted small">{t.moTa}</div>}</td>
                  <td>{NHAN_NHOM_NGUOI_CHAM[t.nhom]}</td>
                  <td className="center">
                    <input type="radio" name="chuTich" checked={t.laChuTich} aria-label={`Chủ tịch: ${t.hoTen}`}
                           onChange={() => setThanhVien((ds) => ds.map((x) => ({ ...x, laChuTich: x.nguoiDungId === t.nguoiDungId })))} />
                  </td>
                  <td className="actions">
                    <button className="btn btn-phu btn-nho"
                            onClick={() => setThanhVien((ds) => ds.filter((x) => x.nguoiDungId !== t.nguoiDungId))}>Bỏ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <ul className="checklist">
          {dieuKien.map((d) => (
            <li key={d.noiDung} className={d.dat ? 'ck-dat' : 'ck-chua'}>{d.dat ? '✓' : '✗'} {d.noiDung}</li>
          ))}
        </ul>
        <p className="hint">
          Điều 10 khoản 3 điểm a (CBR-14). Điểm chặng 2 lấy trung bình trong từng nhóm người chấm trước khi áp tỷ lệ đồng
          chấm, nên số người mỗi nhóm không làm lệch tỷ lệ (CBR-15).
        </p>
      </div>

      {/* 3. Buổi đánh giá */}
      <div className="card mb">
        <h2 className="section-title mt0">3. Buổi đánh giá</h2>
        <div className="form-grid">
          <label className="field">
            <span>Thời gian báo cáo</span>
            <input type="datetime-local" value={thoiGian} onChange={(e) => setThoiGian(e.target.value)} />
            {loiTruong('thoiGianBaoCao') && <small className="field-error">{loiTruong('thoiGianBaoCao')}</small>}
          </label>
          <label className="field">
            <span>Địa điểm</span>
            <input value={diaDiem} maxLength={200} onChange={(e) => setDiaDiem(e.target.value)} placeholder="Phòng 304 nhà A1" />
          </label>
          <label className="field">
            <span>Hình thức</span>
            <select value={hinhThuc} onChange={(e) => setHinhThuc(e.target.value)}>
              <option value="TRUC_TIEP">Trực tiếp</option>
              <option value="TRUC_TUYEN">Trực tuyến</option>
            </select>
          </label>
          {hinhThuc === 'TRUC_TUYEN' && (
            <label className="field">
              <span>Ghi chú phê duyệt của Trưởng Khoa *</span>
              <input value={ghiChu} maxLength={500} onChange={(e) => setGhiChu(e.target.value)}
                     placeholder="Đã được Trưởng Khoa phê duyệt ngày …" />
            </label>
          )}
        </div>
        {hinhThuc === 'TRUC_TUYEN' && (
          <p className="hint">Đánh giá trực tuyến phải có phê duyệt của Trưởng Khoa (Điều 10 khoản 3 điểm b).</p>
        )}
      </div>

      <div className="action-bar">
        <span className="muted small">
          {hoSoChon.length === 0 ? 'Chưa chọn sinh viên.'
            : datHet ? 'Thành phần tổ đạt đủ điều kiện.'
              : `${dieuKien.filter((d) => !d.dat).length} điều kiện chưa đạt — hệ thống sẽ chặn khi thành lập.`}
        </span>
        <div className="action-bar-buttons">
          <Link to="/panels" className="btn btn-phu">Hủy</Link>
          <button className="btn btn-chinh" onClick={() => void thanhLap()}
                  disabled={dangGui || hoSoChon.length === 0 || thanhVien.length === 0}>
            {dangGui ? 'Đang lưu…' : 'Thành lập tổ'}
          </button>
        </div>
      </div>
    </div>
  );
}
