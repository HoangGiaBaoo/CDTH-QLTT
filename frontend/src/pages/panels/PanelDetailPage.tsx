import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { panelApi } from '../../api/panels';
import { userApi } from '../../api/users';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_HINH_THUC_LAM_VIEC, NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { ngay, ngayGio } from '../../utils/format';
import type { NguoiDung } from '../../types/auth';
import type { CapNhatToRequest, ThanhVienTo, ToDanhGia } from '../../types/panel';

/** "2026-11-12T08:00:00" ⇒ "2026-11-12T08:00" cho ô datetime-local. */
const choONhap = (x?: string) => (x ? x.slice(0, 16) : '');

/**
 * SCR-19 — chi tiết Tổ đánh giá (#78): thành viên theo nhóm, sinh viên, buổi đánh giá. Giáo vụ sửa thông tin buổi
 * (#80) và đánh dấu vắng mặt / bổ sung người thay thế (#81, UC09 luồng thay thế). Đây cũng là đích của NT-11.
 */
export default function PanelDetailPage() {
  const id = Number(useParams().panelId);
  const { nguoiDung } = useAuth();
  const laAdmin = nguoiDung?.vaiTro === 'ADMIN';
  const location = useLocation();
  const navigate = useNavigate();
  const [to, setTo] = useState<ToDanhGia | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string | undefined>((location.state as { thongBao?: string } | null)?.thongBao);
  const [sua, setSua] = useState<CapNhatToRequest | null>(null);
  const [vang, setVang] = useState<null | { tv: ThanhVienTo; lyDo: string; thayThe: string }>(null);
  const [ungVien, setUngVien] = useState<NguoiDung[]>([]);
  const [dangGui, setDangGui] = useState(false);

  const tai = useCallback(() => {
    setLoiTai(null);
    panelApi.chiTiet(id).then(setTo).catch(setLoiTai);
  }, [id]);
  useEffect(tai, [tai]);

  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Người thay thế: giảng viên và cán bộ đang hoạt động (chỉ giáo vụ gọi được #5).
  useEffect(() => {
    if (!laAdmin) return;
    Promise.all([
      userApi.danhSach({ role: 'GIANG_VIEN', status: 'HOAT_DONG', size: 200 }),
      userApi.danhSach({ role: 'CAN_BO_DVHD', status: 'HOAT_DONG', size: 200 }),
    ]).then(([gv, cb]) => setUngVien([...gv.items, ...cb.items])).catch(() => setUngVien([]));
  }, [laAdmin]);

  if (loiTai) return <div><Link to="/panels" className="back-link">← Danh sách tổ</Link><ErrorAlert error={loiTai} /></div>;
  if (!to) return <Loading />;

  const toi = to.thanhViens.find((t) => t.nguoiDungId === nguoiDung?.id);
  const choCham = !!toi && !toi.vangMat;

  const chay = async (lam: () => Promise<void>) => {
    setLoi(null);
    setDangGui(true);
    try {
      await lam();
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const luuThongTin = () => sua && chay(async () => {
    const { data, message } = await panelApi.capNhat(to.id, {
      ...sua, diaDiem: sua.diaDiem?.trim(), ghiChuPheDuyet: sua.ghiChuPheDuyet?.trim(), duongDanGhiHinh: sua.duongDanGhiHinh?.trim(),
      thoiGianBaoCao: sua.thoiGianBaoCao || undefined,
    });
    setTo(data);
    setSua(null);
    setThongBao(message);
  });

  const luuVangMat = () => vang && chay(async () => {
    const nguoiThay = ungVien.find((u) => u.id === Number(vang.thayThe));
    // Lỗi (ví dụ người thay thế làm tổ sai CBR-14) hiện ở đầu trang ⇒ đóng hộp thoại cả khi thất bại.
    setVang(null);
    const { data, message } = await panelApi.doiVangMat(to.id, vang.tv.id, {
      vangMat: !vang.tv.vangMat,
      lyDo: vang.lyDo.trim(),
      thayTheNguoiDungId: nguoiThay?.id,
      // Nhóm của người thay thế theo vai trò: giảng viên ⇒ GVHD, cán bộ ⇒ ĐVHD.
      thayTheNhom: nguoiThay ? (nguoiThay.vaiTro === 'GIANG_VIEN' ? 'GVHD' : 'DVHD') : undefined,
    });
    setTo(data);
    setThongBao(message);
  });

  const nhom = (n: 'GVHD' | 'DVHD') => to.thanhViens.filter((t) => t.nhom === n);
  const daTrongTo = new Set(to.thanhViens.map((t) => t.nguoiDungId));

  return (
    <div>
      <Link to="/panels" className="back-link">← Danh sách tổ</Link>
      <div className="page-head">
        <h1 className="page-title">
          Tổ đánh giá #{to.id} · {to.maDot}
          {to.canhBao?.length
            ? <span className="badge badge-do">Thành phần chưa đạt</span>
            : <span className="badge badge-xanh-la">Đạt CBR-14</span>}
        </h1>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      {!!to.canhBao?.length && (
        <div className="alert alert-vang mb">
          <b>Thành phần tổ (tính trên thành viên có mặt) chưa đạt điều kiện:</b>
          <ul className="alert-list">{to.canhBao.map((c) => <li key={c}>{c}</li>)}</ul>
          Nếu nhóm ĐVHD không còn ai có mặt, hệ thống dừng tính điểm với mã THIEU_PHIEU_DVHD — cần bổ sung người thay thế.
        </div>
      )}
      <ErrorAlert error={loi} />

      {/* Buổi đánh giá */}
      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">Buổi đánh giá</h2>
          {laAdmin && !sua && (
            <button className="btn btn-phu btn-nho" onClick={() => setSua({
              thoiGianBaoCao: choONhap(to.thoiGianBaoCao), diaDiem: to.diaDiem ?? '', hinhThuc: to.hinhThuc ?? 'TRUC_TIEP',
              ghiChuPheDuyet: to.ghiChuPheDuyet ?? '', duongDanGhiHinh: to.duongDanGhiHinh ?? '',
            })}>Sửa</button>
          )}
        </div>
        {sua ? (
          <div className="form">
            <div className="form-grid">
              <label className="field"><span>Thời gian báo cáo</span>
                <input type="datetime-local" value={sua.thoiGianBaoCao} onChange={(e) => setSua({ ...sua, thoiGianBaoCao: e.target.value })} />
              </label>
              <label className="field"><span>Địa điểm</span>
                <input value={sua.diaDiem} maxLength={200} onChange={(e) => setSua({ ...sua, diaDiem: e.target.value })} />
              </label>
              <label className="field"><span>Hình thức</span>
                <select value={sua.hinhThuc} onChange={(e) => setSua({ ...sua, hinhThuc: e.target.value })}>
                  <option value="TRUC_TIEP">Trực tiếp</option>
                  <option value="TRUC_TUYEN">Trực tuyến</option>
                </select>
              </label>
              <label className="field"><span>Ghi chú phê duyệt{sua.hinhThuc === 'TRUC_TUYEN' && ' *'}</span>
                <input value={sua.ghiChuPheDuyet} maxLength={500} onChange={(e) => setSua({ ...sua, ghiChuPheDuyet: e.target.value })} />
              </label>
              <label className="field"><span>Đường dẫn tệp ghi hình</span>
                <input value={sua.duongDanGhiHinh} maxLength={500} onChange={(e) => setSua({ ...sua, duongDanGhiHinh: e.target.value })} />
              </label>
            </div>
            {sua.hinhThuc === 'TRUC_TUYEN' && (
              <p className="hint">Đánh giá trực tuyến phải có ghi chú phê duyệt của Trưởng Khoa (Điều 10 khoản 3 điểm b).</p>
            )}
            <div className="form-actions">
              <button className="btn btn-phu" onClick={() => setSua(null)} disabled={dangGui}>Hủy</button>
              <button className="btn btn-chinh" onClick={() => void luuThongTin()} disabled={dangGui}>
                {dangGui ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
          </div>
        ) : (
          <div className="info-grid">
            <div><span className="muted">Ngày thành lập</span>{ngay(to.ngayThanhLap)}</div>
            <div><span className="muted">Thời gian báo cáo</span>{ngayGio(to.thoiGianBaoCao)}</div>
            <div><span className="muted">Địa điểm</span>{to.diaDiem ?? '—'}</div>
            <div><span className="muted">Hình thức</span>{NHAN_HINH_THUC_LAM_VIEC[to.hinhThuc ?? 'TRUC_TIEP']}</div>
            {to.ghiChuPheDuyet && <div><span className="muted">Ghi chú phê duyệt</span>{to.ghiChuPheDuyet}</div>}
            {to.duongDanGhiHinh && <div><span className="muted">Tệp ghi hình</span>{to.duongDanGhiHinh}</div>}
          </div>
        )}
      </div>

      {/* Thành viên theo nhóm */}
      <div className="card mb">
        <h2 className="section-title mt0">Thành viên</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead><tr><th>Nhóm</th><th>Thành viên</th><th>Vai trò trong tổ</th><th>Có mặt</th>{laAdmin && <th />}</tr></thead>
            <tbody>
              {(['GVHD', 'DVHD'] as const).flatMap((n) => nhom(n).map((t, i) => (
                <tr key={t.id} className={t.vangMat ? 'row-mo' : undefined}>
                  {i === 0 && <td rowSpan={nhom(n).length}><b>{NHAN_NHOM_NGUOI_CHAM[n]}</b><div className="muted small">{nhom(n).filter((x) => !x.vangMat).length} có mặt</div></td>}
                  <td>{t.hoTen}{t.nguoiDungId === nguoiDung?.id && <span className="muted"> (bạn)</span>}</td>
                  <td>{t.laChuTich ? <b>Chủ tịch</b> : 'Thành viên'}</td>
                  <td>{t.vangMat ? <span className="badge badge-vang">Vắng mặt</span> : <span className="badge badge-xanh-la">Có mặt</span>}</td>
                  {laAdmin && (
                    <td className="actions">
                      <button className="btn btn-phu btn-nho" onClick={() => setVang({ tv: t, lyDo: '', thayThe: '' })}>
                        {t.vangMat ? 'Có mặt lại' : 'Đánh dấu vắng'}
                      </button>
                    </td>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <p className="hint">Phiếu của thành viên vắng mặt bị loại khỏi trung bình nhóm khi tính điểm chặng 2 (CBR-15).</p>
      </div>

      {/* Sinh viên */}
      <div className="card mb">
        <h2 className="section-title mt0">Sinh viên ({to.hoSos.length})</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead><tr><th>Mã SV</th><th>Họ tên</th><th>Lớp</th><th>Hồ sơ</th>{choCham && <th />}</tr></thead>
            <tbody>
              {to.hoSos.map((h) => (
                <tr key={h.hoSoId}>
                  <td className="nowrap">{h.maSv}</td>
                  <td>{h.hoTen}</td>
                  <td>{h.lop ?? '—'}</td>
                  <td><StatusBadge value={h.trangThai} labels={NHAN_TRANG_THAI_HO_SO} /></td>
                  {choCham && (
                    <td className="actions">
                      <Link className="btn btn-chinh btn-nho" to={`/assessments/form?recordId=${h.hoSoId}&stage=2`}>Chấm chặng 2</Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog mo={!!vang} tieuDe={vang?.tv.vangMat ? `Đánh dấu ${vang.tv.hoTen} có mặt lại?` : `Đánh dấu ${vang?.tv.hoTen} vắng mặt?`}
                     nhanXacNhan="Lưu" dangXuLy={dangGui} khoaXacNhan={!vang?.lyDo.trim()} tuFocusNut={false}
                     onHuy={() => setVang(null)} onXacNhan={() => void luuVangMat()}>
        {vang && (
          <>
            <p>
              {vang.tv.vangMat
                ? 'Thành viên được tính lại vào trung bình nhóm.'
                : 'Phiếu của thành viên vắng mặt bị loại khỏi trung bình nhóm. Bổ sung người thay thế nếu thành phần tổ không còn đạt.'}
              {' '}Thay đổi được ghi nhật ký (Điều 14 khoản 4 điểm c).
            </p>
            <label className="field">
              <span>Lý do *</span>
              <textarea className="textarea" rows={2} maxLength={500} value={vang.lyDo} autoFocus
                        onChange={(e) => setVang({ ...vang, lyDo: e.target.value })} />
            </label>
            {!vang.tv.vangMat && (
              <label className="field mt">
                <span>Người thay thế (không bắt buộc)</span>
                <select value={vang.thayThe} onChange={(e) => setVang({ ...vang, thayThe: e.target.value })}>
                  <option value="">— Không bổ sung —</option>
                  {ungVien.filter((u) => !daTrongTo.has(u.id)).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.hoTen} — {u.vaiTro === 'GIANG_VIEN' ? 'nhóm GVHD' : `nhóm ĐVHD${u.canBoDvhd ? `, ${u.canBoDvhd.tenDonVi}` : ''}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
