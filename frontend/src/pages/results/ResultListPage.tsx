import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultApi } from '../../api/results';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import TermSelect, { useTermPicker } from '../../components/TermSelect';
import { NHAN_CHUONG_TRINH, NHAN_KET_LUAN, NHAN_TRANG_THAI_KET_QUA } from '../../utils/constants';
import { diem } from '../../utils/format';
import type { KetQuaTomTat, TrangThaiKetQua } from '../../types/result';

const THU_TU_KET_QUA: TrangThaiKetQua[] = ['CHUA_TINH', 'DA_TINH', 'DA_XAC_NHAN', 'DA_CONG_BO'];

/** Công bố được khi giáo vụ đã xác nhận và hồ sơ vẫn đang chờ đánh giá (UC10 bước 10). */
const congBoDuoc = (k: KetQuaTomTat) => k.trangThai === 'DA_XAC_NHAN' && k.trangThaiHoSo === 'CHO_DANH_GIA';

/**
 * SCR-21 — bảng kết quả toàn đợt (#82, RP-01). Giáo vụ thấy cả đợt và công bố theo danh sách hoặc cả đợt (#87);
 * giảng viên / cán bộ chỉ thấy SV mình hướng dẫn hoặc trong Tổ mình tham gia. Bấm dòng để mở bảng TTTN-07.
 */
export default function ResultListPage() {
  const navigate = useNavigate();
  const { nguoiDung } = useAuth();
  const laAdmin = nguoiDung?.vaiTro === 'ADMIN';
  const { dsDot, termId, setTermId, loi: loiDot, dot } = useTermPicker();
  const [ds, setDs] = useState<KetQuaTomTat[] | null>(null);
  const [lanTai, setLanTai] = useState(0);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [locTrangThai, setLocTrangThai] = useState('');
  const [locKetLuan, setLocKetLuan] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');
  const [chon, setChon] = useState<Set<number>>(new Set());
  const [hoi, setHoi] = useState<null | 'chon' | 'dot'>(null);
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    if (!termId) return;
    let conHieuLuc = true;
    setDs(null);
    resultApi.danhSach(termId)
      .then((x) => { if (conHieuLuc) { setDs(x); setChon(new Set()); } })
      .catch((e) => { if (conHieuLuc) { setLoi(e); setDs([]); } });
    return () => { conHieuLuc = false; };
  }, [termId, lanTai]);

  const doiDot = (id: number) => {
    setLoi(null);
    setThongBao(undefined);
    setTermId(id);
  };

  // Cột CLO lấy từ dữ liệu trả về (đợt có cấu hình CLO riêng, không viết cứng ở giao diện).
  const maClos = useMemo(() => [...new Set((ds ?? []).flatMap((k) => Object.keys(k.diemClo)))]
    .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true })), [ds]);

  const hienThi = useMemo(() => {
    const k = tuKhoa.trim().toLowerCase();
    return (ds ?? []).filter((x) => (!locTrangThai || x.trangThai === locTrangThai)
      && (!locKetLuan || x.ketLuan === locKetLuan)
      && (!k || x.maSv.toLowerCase().includes(k) || x.hoTen.toLowerCase().includes(k)));
  }, [ds, locTrangThai, locKetLuan, tuKhoa]);

  const dem = (tt: TrangThaiKetQua) => (ds ?? []).filter((x) => x.trangThai === tt).length;
  const soDat = (ds ?? []).filter((x) => x.ketLuan === 'DAT').length;
  const soKhongDat = (ds ?? []).filter((x) => x.ketLuan === 'KHONG_DAT').length;
  const choCongBo = (ds ?? []).filter(congBoDuoc);
  const chonDuoc = hienThi.filter(congBoDuoc);
  const chonHet = chonDuoc.length > 0 && chonDuoc.every((x) => chon.has(x.hoSoId));

  const batChon = (id: number) => setChon((cu) => {
    const moi = new Set(cu);
    if (moi.has(id)) moi.delete(id); else moi.add(id);
    return moi;
  });

  const congBo = async () => {
    const loai = hoi;
    setHoi(null);
    setLoi(null);
    setThongBao(undefined);
    setDangGui(true);
    try {
      const { data, message } = await resultApi.congBo(loai === 'chon' ? { termId, hoSoIds: [...chon] } : { termId });
      setThongBao(message + (data.soChuaXacNhan ? `. Còn ${data.soChuaXacNhan} hồ sơ chưa có kết quả đã xác nhận.` : ''));
      setLanTai((n) => n + 1);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const moHoSo = (id: number) => navigate(`/results/${id}`);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Kết quả học phần</h1>
        {laAdmin && termId && (
          <div className="action-bar-buttons">
            <button className="btn btn-phu" disabled={chon.size === 0 || dangGui} onClick={() => setHoi('chon')}>
              Công bố đã chọn ({chon.size})
            </button>
            <button className="btn btn-chinh" disabled={dangGui} onClick={() => setHoi('dot')}>Công bố cả đợt</button>
          </div>
        )}
      </div>
      <ErrorAlert error={loiDot} />
      <div className="toolbar">
        <TermSelect dsDot={dsDot} termId={termId} onChange={doiDot} />
        <label className="field field-inline">
          <span>Kết quả</span>
          <select value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value)}>
            <option value="">Tất cả</option>
            {THU_TU_KET_QUA.map((t) => <option key={t} value={t}>{NHAN_TRANG_THAI_KET_QUA[t]}</option>)}
          </select>
        </label>
        <label className="field field-inline">
          <span>Kết luận</span>
          <select value={locKetLuan} onChange={(e) => setLocKetLuan(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="DAT">Đạt</option>
            <option value="KHONG_DAT">Không đạt</option>
          </select>
        </label>
        <label className="field field-inline">
          <span>Tìm</span>
          <input placeholder="Mã SV, họ tên…" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />
        </label>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      <ErrorAlert error={loi} />

      {!termId ? null : !ds ? <Loading /> : ds.length === 0 ? (
        <div className="card empty">
          <div className="muted">
            {laAdmin ? 'Đợt này chưa có hồ sơ nào ở giai đoạn thực tập.' : 'Bạn chưa có sinh viên nào trong đợt này (hướng dẫn hoặc trong Tổ đánh giá).'}
          </div>
        </div>
      ) : (
        <>
          <div className="stat-row mb">
            <div className="stat"><b>{ds.length}</b><span>hồ sơ</span></div>
            <div className="stat"><b>{dem('CHUA_TINH')}</b><span>chưa tính</span></div>
            <div className="stat stat-vang"><b>{dem('DA_TINH')}</b><span>đã tính, chờ xác nhận</span></div>
            <div className="stat stat-xanh-duong"><b>{dem('DA_XAC_NHAN')}</b><span>đã xác nhận, chờ công bố</span></div>
            <div className="stat stat-xanh-la"><b>{dem('DA_CONG_BO')}</b><span>đã công bố</span></div>
            <div className="stat"><b>{soDat} / {soKhongDat}</b><span>Đạt / Không đạt</span></div>
          </div>

          <div className="table-wrap">
            <table className="table table-click table-giua table-gon">
              <thead>
                <tr>
                  {laAdmin && (
                    <th title="Chọn kết quả đã xác nhận để công bố">
                      <input type="checkbox" aria-label="Chọn tất cả kết quả công bố được" checked={chonHet}
                             disabled={chonDuoc.length === 0}
                             onChange={() => setChon(chonHet ? new Set() : new Set(chonDuoc.map((x) => x.hoSoId)))} />
                    </th>
                  )}
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>GVHD</th>
                  {maClos.map((m) => <th key={m} className="num">{m}</th>)}
                  <th className="num">Thưởng</th>
                  <th className="num">HP</th>
                  <th>Kết luận</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {hienThi.map((k) => (
                  <tr key={k.hoSoId} tabIndex={0} onClick={() => moHoSo(k.hoSoId)}
                      onKeyDown={(e) => e.key === 'Enter' && moHoSo(k.hoSoId)}>
                    {laAdmin && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" aria-label={`Chọn ${k.maSv}`} disabled={!congBoDuoc(k)}
                               checked={chon.has(k.hoSoId)} onChange={() => batChon(k.hoSoId)} />
                      </td>
                    )}
                    <td className="nowrap">{k.maSv}</td>
                    <td className="nowrap">
                      {k.hoTen}
                      <div className="muted small">{[k.lop, NHAN_CHUONG_TRINH[k.chuongTrinh] ?? k.chuongTrinh].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td className="nowrap small">{k.giangVienHuongDan ?? '—'}</td>
                    {maClos.map((m) => <td key={m} className="num">{diem(k.diemClo[m])}</td>)}
                    <td className="num">{k.diemThuong ? diem(k.diemThuong) : '—'}</td>
                    <td className="num">
                      <b>{diem(k.diemHp)}</b>
                      {k.mucDat != null && <div className="muted small">Mức {k.mucDat}</div>}
                    </td>
                    <td>{k.ketLuan ? <StatusBadge value={k.ketLuan} labels={NHAN_KET_LUAN} /> : '—'}</td>
                    <td><StatusBadge value={k.trangThai} labels={NHAN_TRANG_THAI_KET_QUA} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hienThi.length === 0 && <p className="muted center">Không có hồ sơ khớp bộ lọc.</p>}
          <p className="hint">
            Điểm do hệ thống tính theo Điều 13–15, làm tròn 0,1 ở bước cuối. Bấm một dòng để xem bảng tổng hợp TTTN-07
            {laAdmin ? ', tính lại, xác nhận hoặc xuất biểu mẫu.' : '; GVHD rà soát và nhập nhận xét ở đó (UC10 bước 8).'}
          </p>
        </>
      )}

      <ConfirmDialog
        mo={hoi !== null}
        tieuDe={hoi === 'chon' ? `Công bố ${chon.size} kết quả đã chọn?` : `Công bố kết quả cả đợt ${dot?.maDot ?? ''}?`}
        nhanXacNhan="Công bố"
        nguyHiem
        dangXuLy={dangGui}
        onXacNhan={() => void congBo()}
        onHuy={() => setHoi(null)}
      >
        <p>
          {hoi === 'chon'
            ? 'Mọi hồ sơ đã chọn phải đã được xác nhận; sai một hồ sơ thì không hồ sơ nào được công bố.'
            : `Công bố mọi kết quả đã xác nhận của đợt (hiện có ${choCongBo.length} kết quả chờ công bố).`}
        </p>
        <p>
          Hồ sơ chuyển <b>Hoàn thành</b> hoặc <b>Không hoàn thành</b> theo kết luận Điều 15 khoản 3; sinh viên nhận thông
          báo NT-14 và xem được kết quả sau khi gửi phiếu TTTN-08b. Không hoàn tác được.
        </p>
      </ConfirmDialog>
    </div>
  );
}
