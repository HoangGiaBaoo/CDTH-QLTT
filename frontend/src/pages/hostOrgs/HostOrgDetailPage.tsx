import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { hostOrgApi } from '../../api/hostOrgs';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_PHE_DUYET, NHAN_TRANG_THAI_TAI_KHOAN } from '../../utils/constants';
import { ngay } from '../../utils/format';
import type { CanBo, DonVi, DonViRequest, KetQuaPheDuyet, PheDuyetRequest } from '../../types/hostOrg';
import HostOrgForm from './HostOrgForm';
import SupervisorDialog from './SupervisorDialog';

type QuyetDinh = PheDuyetRequest['quyetDinh'];

/** Nút quyết định hợp lệ theo trạng thái hiện tại — khớp DonViHuongDanService.pheDuyet (UC02 bước 5–7, 5a, 5b). */
const QUYET_DINH: Record<DonVi['trangThaiPheDuyet'], QuyetDinh[]> = {
  CHO_DUYET: ['DA_DUYET', 'TU_CHOI'],
  TU_CHOI: ['DA_DUYET'],
  DA_LOAI: ['DA_DUYET'],
  DA_DUYET: ['DA_LOAI'],
};

const NHAN_NUT: Record<QuyetDinh, string> = {
  DA_DUYET: 'Phê duyệt',
  TU_CHOI: 'Từ chối',
  DA_LOAI: 'Loại khỏi danh mục',
};

const HE_QUA: Record<QuyetDinh, string> = {
  DA_DUYET: 'Đơn vị vào danh mục để sinh viên chọn khi đăng ký. Tài khoản của các cán bộ hướng dẫn chưa hoạt động sẽ '
    + 'được kích hoạt và cấp mật khẩu ban đầu.',
  TU_CHOI: 'Đơn vị không được đưa vào danh mục. Có thể phê duyệt lại sau khi đơn vị bổ sung đủ điều kiện.',
  DA_LOAI: 'Sinh viên không chọn được đơn vị này cho đăng ký mới; hồ sơ đang thực tập tại đơn vị vẫn giữ nguyên hiệu lực.',
};

/** SCR-08 — chi tiết ĐVHD: thông tin, phê duyệt / từ chối / loại, cán bộ hướng dẫn (UC02, #18, #20–#25). */
export default function HostOrgDetailPage() {
  const orgId = Number(useParams().orgId);
  const location = useLocation();
  const navigate = useNavigate();
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [canBos, setCanBos] = useState<CanBo[]>([]);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string | undefined>(
    (location.state as { thongBao?: string } | null)?.thongBao,
  );
  const [taiKhoanMoi, setTaiKhoanMoi] = useState<KetQuaPheDuyet['taiKhoanDuocKichHoat']>([]);
  const [suaThongTin, setSuaThongTin] = useState(false);
  const [quyetDinh, setQuyetDinh] = useState<QuyetDinh | null>(null);
  const [lyDo, setLyDo] = useState('');
  const [hoiXoa, setHoiXoa] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hopCanBo, setHopCanBo] = useState<{ canBo?: CanBo } | null>(null);

  const tai = useCallback(async () => {
    setLoiTai(null);
    try {
      const [d, c] = await Promise.all([hostOrgApi.chiTiet(orgId), hostOrgApi.canBo(orgId)]);
      setDonVi(d);
      setCanBos(c);
    } catch (e) {
      setLoiTai(e);
    }
  }, [orgId]);

  useEffect(() => { void tai(); }, [tai]);

  // Thông điệp lúc vừa thêm đơn vị ở SCR-07 chỉ hiện một lần.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loiTai) return <><Link to="/host-orgs" className="back-link">← Danh sách đơn vị</Link><ErrorAlert error={loiTai} /></>;
  if (!donVi) return <Loading />;

  const bao = (message?: string) => {
    setLoi(null);
    setThongBao(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const luuThongTin = async (req: DonViRequest) => {
    const { data, message } = await hostOrgApi.capNhat(donVi.id, req);
    setDonVi(data);
    setSuaThongTin(false);
    bao(message);
  };

  const moQuyetDinh = (q: QuyetDinh) => {
    setLyDo('');
    setQuyetDinh(q);
  };

  const guiQuyetDinh = async () => {
    if (!quyetDinh) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      const { data, message } = await hostOrgApi.pheDuyet(donVi.id, { quyetDinh, lyDo: lyDo.trim() || undefined });
      setDonVi(data.donVi);
      setTaiKhoanMoi(data.taiKhoanDuocKichHoat);
      setCanBos(await hostOrgApi.canBo(donVi.id));
      bao(message);
    } catch (e) {
      setLoi(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDangXuLy(false);
      setQuyetDinh(null);
    }
  };

  const xoa = async () => {
    setDangXuLy(true);
    setLoi(null);
    try {
      await hostOrgApi.xoa(donVi.id);
      navigate('/host-orgs', { replace: true });
    } catch (e) {
      setLoi(e);
      setHoiXoa(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDangXuLy(false);
    }
  };

  const daLuuCanBo = async (cb: CanBo, message?: string) => {
    setHopCanBo(null);
    // Thêm cán bộ vào đơn vị đã duyệt ⇒ tài khoản kích hoạt ngay, mật khẩu ban đầu trả một lần.
    if (cb.matKhauBanDau && cb.tenDangNhap) {
      setTaiKhoanMoi([{ canBoId: cb.id, tenDangNhap: cb.tenDangNhap, hoTen: cb.hoTen, matKhauBanDau: cb.matKhauBanDau }]);
    } else {
      setTaiKhoanMoi([]);
    }
    setCanBos(await hostOrgApi.canBo(donVi.id));
    setDonVi(await hostOrgApi.chiTiet(donVi.id));
    bao(message);
  };

  const canLyDo = quyetDinh !== null && quyetDinh !== 'DA_DUYET';
  const dongCanBo = donVi.trangThaiPheDuyet === 'TU_CHOI' || donVi.trangThaiPheDuyet === 'DA_LOAI';

  return (
    <div>
      <Link to="/host-orgs" className="back-link">← Danh sách đơn vị</Link>
      <div className="page-head">
        <h1 className="page-title">
          {donVi.ten} <StatusBadge value={donVi.trangThaiPheDuyet} labels={NHAN_TRANG_THAI_PHE_DUYET} />
        </h1>
        <div className="dv-quyet-dinh">
          {QUYET_DINH[donVi.trangThaiPheDuyet].map((q) => (
            <button key={q} className={`btn ${q === 'DA_DUYET' ? 'btn-chinh' : 'btn-phu'}`} onClick={() => moQuyetDinh(q)}>
              {donVi.trangThaiPheDuyet !== 'CHO_DUYET' && q === 'DA_DUYET' ? 'Phê duyệt lại' : NHAN_NUT[q]}
            </button>
          ))}
        </div>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      {taiKhoanMoi.length > 0 && (
        <div className="alert alert-xanh-duong mb">
          <b>Tài khoản cán bộ đã được kích hoạt.</b> Mật khẩu ban đầu chỉ hiện một lần — hãy ghi lại để gửi cho cán bộ;
          cán bộ nên đổi mật khẩu sau lần đăng nhập đầu tiên.
          <table className="table table-gon dv-mat-khau mt">
            <thead><tr><th>Cán bộ</th><th>Tên đăng nhập</th><th>Mật khẩu ban đầu</th></tr></thead>
            <tbody>
              {taiKhoanMoi.map((t) => (
                <tr key={t.canBoId}>
                  <td>{t.hoTen}</td>
                  <td><code>{t.tenDangNhap}</code></td>
                  <td><code>{t.matKhauBanDau}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ErrorAlert error={loi} />

      {donVi.trangThaiPheDuyet === 'CHO_DUYET' && canBos.length === 0 && (
        <div className="alert alert-vang mb">
          Đơn vị chưa có cán bộ hướng dẫn. Cần thêm tối thiểu một cán bộ trước khi phê duyệt.
        </div>
      )}

      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">Thông tin đơn vị</h2>
          {!suaThongTin && <button className="btn btn-phu btn-nho" onClick={() => setSuaThongTin(true)}>Sửa</button>}
        </div>
        {suaThongTin ? (
          <HostOrgForm donVi={donVi} onLuu={luuThongTin} onHuy={() => setSuaThongTin(false)} />
        ) : (
          <div className="info-grid">
            <div><span className="muted">Mã đơn vị</span>{donVi.maDvhd}</div>
            <div><span className="muted">Lĩnh vực</span>{donVi.linhVuc}</div>
            <div><span className="muted">Địa chỉ</span>{donVi.diaChi}</div>
            <div><span className="muted">Người đại diện</span>{donVi.nguoiDaiDien}</div>
            <div><span className="muted">Điện thoại</span>{donVi.dienThoai ?? '—'}</div>
            <div><span className="muted">Email</span>{donVi.email ?? '—'}</div>
            {donVi.ngayPheDuyet && (
              <div><span className="muted">Ngày quyết định</span>{ngay(donVi.ngayPheDuyet)}</div>
            )}
            {donVi.lyDo && <div><span className="muted">Lý do</span>{donVi.lyDo}</div>}
          </div>
        )}
      </div>

      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">Cán bộ hướng dẫn ({canBos.length})</h2>
          {!dongCanBo && (
            <button className="btn btn-chinh btn-nho" onClick={() => setHopCanBo({})}>+ Thêm cán bộ</button>
          )}
        </div>
        {canBos.length === 0 ? (
          <div className="muted">Chưa có cán bộ hướng dẫn nào.</div>
        ) : (
          <div className="table-wrap">
            <table className="table table-giua dv-cb">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Tên đăng nhập</th>
                  <th>Chức vụ</th>
                  <th className="num">Kinh nghiệm</th>
                  <th className="num">Đang hướng dẫn</th>
                  <th>Tài khoản</th>
                  <th className="actions" aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {canBos.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.hoTen}</b>
                      {c.email && <div className="muted small">{c.email}</div>}
                    </td>
                    <td className="nowrap">{c.tenDangNhap}</td>
                    <td>{c.chucVu ?? '—'}</td>
                    <td className="num">{c.soNamKinhNghiem ?? '—'} năm</td>
                    <td className="num">
                      <span className={c.soDangHuongDan >= c.soSvToiDa ? 'text-vang' : undefined}>
                        {c.soDangHuongDan} / {c.soSvToiDa}
                      </span>
                      <span className="dv-nhan-hm"> sinh viên</span>
                    </td>
                    <td><StatusBadge value={c.trangThaiTaiKhoan} labels={NHAN_TRANG_THAI_TAI_KHOAN} /></td>
                    <td className="actions">
                      <button className="btn btn-phu btn-nho" onClick={() => setHopCanBo({ canBo: c })}>Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="hint">Số đang hướng dẫn tính trong đợt thực tập đang chạy, trên hạn mức của từng cán bộ.</p>
      </div>

      <div className="dv-xoa">
        <button className="btn btn-phu btn-nho" onClick={() => setHoiXoa(true)}>Xóa đơn vị</button>
      </div>

      <ConfirmDialog mo={quyetDinh !== null} tieuDe={quyetDinh ? `${NHAN_NUT[quyetDinh]} đơn vị "${donVi.ten}"?` : ''}
                     nhanXacNhan={quyetDinh ? NHAN_NUT[quyetDinh] : ''} nguyHiem={canLyDo} dangXuLy={dangXuLy}
                     khoaXacNhan={canLyDo && !lyDo.trim()} tuFocusNut={!canLyDo}
                     onXacNhan={() => void guiQuyetDinh()} onHuy={() => setQuyetDinh(null)}>
        {quyetDinh && <p>{HE_QUA[quyetDinh]}</p>}
        {canLyDo && (
          <label className="field">
            <span>Lý do *</span>
            <textarea className="textarea" rows={3} value={lyDo} onChange={(e) => setLyDo(e.target.value)}
                      maxLength={500} autoFocus />
          </label>
        )}
      </ConfirmDialog>

      <ConfirmDialog mo={hoiXoa} tieuDe={`Xóa đơn vị "${donVi.ten}"?`} nhanXacNhan="Xóa đơn vị" nguyHiem
                     dangXuLy={dangXuLy} onXacNhan={() => void xoa()} onHuy={() => setHoiXoa(false)}>
        <p>
          Đơn vị bị ẩn khỏi danh mục. Đơn vị đã có hồ sơ thực tập gắn vào thì không xóa được — khi đó dùng
          "Loại khỏi danh mục".
        </p>
      </ConfirmDialog>

      <SupervisorDialog mo={hopCanBo !== null} donViId={donVi.id} canBo={hopCanBo?.canBo}
                        onHuy={() => setHopCanBo(null)} onDaLuu={(cb, m) => void daLuuCanBo(cb, m)} />
    </div>
  );
}
