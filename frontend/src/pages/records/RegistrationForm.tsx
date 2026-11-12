import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { hostOrgApi } from '../../api/hostOrgs';
import { recordApi } from '../../api/records';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { NHAN_HINH_THUC_LAM_VIEC, NHAN_HINH_THUC_THUC_TAP } from '../../utils/constants';
import { ngay } from '../../utils/format';
import type { CanBo, DonVi } from '../../types/hostOrg';
import type { HinhThucLamViec, HinhThucThucTap, HoSo, HoSoRequest } from '../../types/record';
import type { Dot } from '../../types/term';
import ProposeHostOrgDialog from './ProposeHostOrgDialog';
import RequiredEvidence from './RequiredEvidence';

interface Props {
  /** Bản nháp đã lưu; không có ⇒ phiếu mới trong `dot`. */
  hoSo?: HoSo;
  dot: Dot;
  /** Phiếu mới và có nhiều đợt đang nhận đăng ký ⇒ cho chọn đợt. */
  dsDot?: Dot[];
  onDoiDot?: (dotId: number) => void;
  onDaLuu: (hoSo: HoSo, message?: string) => void;
  onDaGui: (hoSo: HoSo, message?: string) => void;
  /** Backend báo đã có hồ sơ trong đợt (CBR-01, UC04 7a) ⇒ trang tải lại để mở hồ sơ hiện có. */
  onDaCoHoSo: (message: string) => void;
}

interface FormState {
  hinhThucThucTap?: HinhThucThucTap;
  donViId?: number;
  canBoDvhdId?: number;
  boPhan: string;
  deTai: string;
  hinhThucLamViec: HinhThucLamViec;
  soTuanThamGia: string;
  mucTieu: string;
  sanPhamDuKien: string;
}

const HINH_THUC = Object.keys(NHAN_HINH_THUC_THUC_TAP) as HinhThucThucTap[];

/** Mô tả ngắn từng hình thức theo Điều 4 — chỉ để sinh viên chọn đúng, không dùng để kiểm tra. */
const MO_TA_HINH_THUC: Record<HinhThucThucTap, string> = {
  DOANH_NGHIEP: 'Làm việc tại doanh nghiệp, cơ quan, tổ chức',
  NGHIEN_CUU: 'Tham gia đề tài, nhóm nghiên cứu',
  KHOI_NGHIEP: 'Thực hiện dự án khởi nghiệp',
  CONG_DONG: 'Hoạt động phục vụ cộng đồng',
  NOI_BO: 'Làm việc tại đơn vị trong trường',
  QUOC_TE: 'Thực tập ở nước ngoài, từ 6 tuần trở lên',
};

function tuHoSo(h: HoSo | undefined, dot: Dot): FormState {
  return {
    hinhThucThucTap: h?.hinhThucThucTap,
    donViId: h?.donVi?.id,
    canBoDvhdId: h?.canBoDvhd?.id,
    boPhan: h?.boPhan ?? '',
    deTai: h?.deTai ?? '',
    hinhThucLamViec: h?.hinhThucLamViec ?? 'TRUC_TIEP',
    soTuanThamGia: String(h?.soTuanThamGia ?? dot.soTuan),
    mucTieu: h?.mucTieu ?? '',
    sanPhamDuKien: h?.sanPhamDuKien ?? '',
  };
}

/** Ô trống gửi undefined để backend hiểu là "chưa nhập" — bản nháp được phép thiếu. */
function sangRequest(f: FormState, dotId: number): HoSoRequest {
  const so = f.soTuanThamGia.trim() === '' ? undefined : Number(f.soTuanThamGia);
  return {
    dotId,
    hinhThucThucTap: f.hinhThucThucTap as HinhThucThucTap,
    donViId: f.donViId,
    canBoDvhdId: f.canBoDvhdId,
    boPhan: f.boPhan.trim() || undefined,
    deTai: f.deTai.trim() || undefined,
    hinhThucLamViec: f.hinhThucLamViec,
    soTuanThamGia: so !== undefined && Number.isFinite(so) ? so : undefined,
    mucTieu: f.mucTieu.trim() || undefined,
    sanPhamDuKien: f.sanPhamDuKien.trim() || undefined,
  };
}

/**
 * SCR-11 — phiếu đăng ký TTTN-01 (#42, #43, #44). Sinh viên chọn hình thức, ĐVHD đã duyệt và cán bộ còn hạn mức,
 * nhập nội dung, tích cam kết rồi gửi. Mọi điều kiện (đủ thông tin, CBR-01/02/03, quốc tế ≥ 6 tuần) do backend kiểm.
 */
export default function RegistrationForm({ hoSo, dot, dsDot, onDoiDot, onDaLuu, onDaGui, onDaCoHoSo }: Props) {
  const [f, setF] = useState<FormState>(() => tuHoSo(hoSo, dot));
  const [banLuu, setBanLuu] = useState<HoSo | undefined>(hoSo);
  const [dsDonVi, setDsDonVi] = useState<DonVi[]>([]);
  const [dsCanBo, setDsCanBo] = useState<CanBo[] | null>(null);
  const [taiCanBoLai, setTaiCanBoLai] = useState(0);
  const [camKet, setCamKet] = useState(false);
  const [loi, setLoi] = useState<unknown>(null);
  const [loiNen, setLoiNen] = useState<unknown>(null);
  const [dangXuLy, setDangXuLy] = useState<'luu' | 'gui' | null>(null);
  const [hoiGui, setHoiGui] = useState(false);
  const [moDeXuat, setMoDeXuat] = useState(false);
  const [daDeXuat, setDaDeXuat] = useState<DonVi | null>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);

  useEffect(() => {
    let conHieuLuc = true;
    hostOrgApi.danhSach({ status: 'DA_DUYET' })
      .then((x) => { if (conHieuLuc) setDsDonVi(x); })
      .catch((e) => { if (conHieuLuc) setLoiNen(e); });
    return () => { conHieuLuc = false; };
  }, []);

  useEffect(() => {
    if (!f.donViId) { setDsCanBo(null); return; }
    let conHieuLuc = true;
    setDsCanBo(null);
    hostOrgApi.canBo(f.donViId)
      .then((x) => { if (conHieuLuc) setDsCanBo(x); })
      .catch((e) => { if (conHieuLuc) setLoiNen(e); });
    return () => { conHieuLuc = false; };
  }, [f.donViId, taiCanBoLai]);

  const dat = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((x) => ({ ...x, [k]: v }));
  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);

  const donVi = dsDonVi.find((d) => d.id === f.donViId);
  // Đơn vị / cán bộ đã lưu trong nháp nhưng nay không còn trong danh sách (bị loại, hết hạn mức) — vẫn hiện để SV biết phải chọn lại.
  const donViCu = banLuu?.donVi && banLuu.donVi.id === f.donViId && !donVi ? banLuu.donVi : null;
  const canBo = dsCanBo?.find((c) => c.id === f.canBoDvhdId);
  const canBoCu = banLuu?.canBoDvhd && banLuu.canBoDvhd.id === f.canBoDvhdId && dsCanBo && !canBo ? banLuu.canBoDvhd : null;

  const luu = async () => {
    const req = sangRequest(f, banLuu?.dot.id ?? dot.id);
    const r = banLuu ? await recordApi.capNhat(banLuu.id, req) : await recordApi.tao(req);
    setBanLuu(r.data);
    return r;
  };

  const xuLyLoi = (e: unknown) => {
    if (e instanceof ApiError && e.code === 'DUPLICATE_RESOURCE' && !banLuu) {
      onDaCoHoSo(e.message);
      return;
    }
    setLoi(e);
    // UC04 7b: cán bộ vừa đủ hạn mức ⇒ tải lại danh sách để SV chọn người khác.
    if (e instanceof ApiError && e.code === 'QUOTA_EXCEEDED') setTaiCanBoLai((n) => n + 1);
  };

  const luuNhap = async () => {
    setLoi(null);
    setThongBao(null);
    setDangXuLy('luu');
    try {
      const r = await luu();
      setThongBao(r.message ?? 'Đã lưu bản nháp hồ sơ');
      onDaLuu(r.data, r.message);
    } catch (e) {
      xuLyLoi(e);
    } finally {
      setDangXuLy(null);
    }
  };

  const guiDangKy = async () => {
    setLoi(null);
    setThongBao(null);
    setDangXuLy('gui');
    let daLuu: HoSo | undefined;
    try {
      daLuu = (await luu()).data;
      const r = await recordApi.gui(daLuu.id);
      setHoiGui(false);
      onDaGui(r.data, r.message);
    } catch (e) {
      setHoiGui(false);
      if (daLuu) onDaLuu(daLuu);
      xuLyLoi(e);
    } finally {
      setDangXuLy(null);
    }
  };

  const chan = (e: FormEvent) => e.preventDefault();

  return (
    <>
      <form className="form" onSubmit={chan} noValidate>
        <ErrorAlert error={loiNen} />

        <div className="card">
          <h2 className="section-title mt0">Đợt thực tập</h2>
          {!banLuu && dsDot && dsDot.length > 1 ? (
            <label className="field field-inline">
              <span>Đợt đang nhận đăng ký</span>
              <select value={dot.id} onChange={(e) => onDoiDot?.(Number(e.target.value))}>
                {dsDot.map((d) => <option key={d.id} value={d.id}>{d.maDot} — {d.ten}</option>)}
              </select>
            </label>
          ) : null}
          <div className="info-grid mt">
            <div><span className="muted">Mã đợt</span>{dot.maDot}</div>
            <div><span className="muted">Tên đợt</span>{dot.ten}</div>
            <div><span className="muted">Thời gian</span>{ngay(dot.ngayBatDau)} – {ngay(dot.ngayKetThuc)}</div>
            <div><span className="muted">Thời lượng</span>{dot.soTuan} tuần</div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mt0">1. Hình thức thực tập *</h2>
          <div className="chon-hinh-thuc" role="radiogroup" aria-label="Hình thức thực tập">
            {HINH_THUC.map((h) => (
              <label key={h} className={`chon-o${f.hinhThucThucTap === h ? ' chon-o-chon' : ''}`}>
                <input type="radio" name="hinhThucThucTap" value={h} checked={f.hinhThucThucTap === h}
                       onChange={() => dat('hinhThucThucTap', h)} />
                <span>
                  <b>{NHAN_HINH_THUC_THUC_TAP[h]}</b>
                  <span className="muted small">{MO_TA_HINH_THUC[h]}</span>
                </span>
              </label>
            ))}
          </div>
          {loiTruong('hinhThucThucTap') && <small className="field-error">{loiTruong('hinhThucThucTap')}</small>}
          <RequiredEvidence recordId={banLuu?.id} hinhThucDaLuu={banLuu?.hinhThucThucTap}
                            hinhThucDangChon={f.hinhThucThucTap} />
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="section-title mt0">2. Đơn vị và cán bộ hướng dẫn *</h2>
            <button type="button" className="btn btn-phu btn-nho" onClick={() => setMoDeXuat(true)}>Đề xuất đơn vị mới</button>
          </div>
          {daDeXuat && (
            <div className="alert alert-xanh mb">
              Đã gửi đề xuất "{daDeXuat.ten}" (mã {daDeXuat.maDvhd}), đang chờ giáo vụ duyệt. Đơn vị sẽ hiện trong danh
              sách khi được phê duyệt; bạn có thể lưu nháp phần còn lại trong lúc chờ.
            </div>
          )}
          <div className="luoi-2">
            <label className="field">
              <span>Đơn vị hướng dẫn (đã được Khoa phê duyệt)</span>
              <select value={f.donViId ?? ''}
                      onChange={(e) => setF((x) => ({ ...x, donViId: e.target.value ? Number(e.target.value) : undefined, canBoDvhdId: undefined }))}>
                <option value="">— Chọn đơn vị —</option>
                {donViCu && <option value={donViCu.id} disabled>{donViCu.ten} (không còn trong danh mục)</option>}
                {dsDonVi.map((d) => <option key={d.id} value={d.id}>{d.ten} · {d.linhVuc}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Cán bộ hướng dẫn (còn nhận sinh viên)</span>
              <select value={f.canBoDvhdId ?? ''} disabled={!f.donViId || dsCanBo === null}
                      onChange={(e) => dat('canBoDvhdId', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">{!f.donViId ? '— Chọn đơn vị trước —' : dsCanBo === null ? 'Đang tải…' : '— Chọn cán bộ —'}</option>
                {canBoCu && <option value={canBoCu.id} disabled>{canBoCu.hoTen} (hiện không nhận thêm sinh viên)</option>}
                {dsCanBo?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.hoTen}{c.chucVu ? ` — ${c.chucVu}` : ''} · đang nhận {c.soDangHuongDan}/{c.soSvToiDa}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {donViCu && <p className="hint hint-loi">Đơn vị đã lưu không còn trong danh mục được duyệt — vui lòng chọn đơn vị khác.</p>}
          {canBoCu && <p className="hint hint-loi">Cán bộ {canBoCu.hoTen} hiện không nhận thêm sinh viên — vui lòng chọn cán bộ khác.</p>}
          {f.donViId && dsCanBo?.length === 0 && (
            <p className="hint hint-loi">Đơn vị này hiện không còn cán bộ nhận thêm sinh viên trong đợt — vui lòng chọn đơn vị khác.</p>
          )}
          {donVi && (
            <div className="info-grid mt">
              <div><span className="muted">Địa chỉ</span>{donVi.diaChi}</div>
              <div><span className="muted">Người đại diện</span>{donVi.nguoiDaiDien}</div>
              <div><span className="muted">Liên hệ</span>{[donVi.dienThoai, donVi.email].filter(Boolean).join(' · ') || '—'}</div>
              {canBo && (
                <div>
                  <span className="muted">Cán bộ đã chọn</span>
                  {canBo.hoTen}{canBo.soNamKinhNghiem != null && ` · ${canBo.soNamKinhNghiem} năm kinh nghiệm`}
                  {canBo.email && <span className="muted small">{canBo.email}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title mt0">3. Nội dung thực tập</h2>
          <div className="form-grid">
            <label className="field">
              <span>Bộ phận làm việc</span>
              <input value={f.boPhan} onChange={(e) => dat('boPhan', e.target.value)} maxLength={200} />
              {loiTruong('boPhan') && <small className="field-error">{loiTruong('boPhan')}</small>}
            </label>
            <label className="field">
              <span>Hình thức làm việc</span>
              <select value={f.hinhThucLamViec} onChange={(e) => dat('hinhThucLamViec', e.target.value as HinhThucLamViec)}>
                {Object.entries(NHAN_HINH_THUC_LAM_VIEC).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Số tuần tham gia *</span>
              <input type="number" min={1} max={52} value={f.soTuanThamGia}
                     className={loiTruong('soTuanThamGia') ? 'input-loi' : undefined}
                     onChange={(e) => dat('soTuanThamGia', e.target.value)} />
              {loiTruong('soTuanThamGia') && <small className="field-error">{loiTruong('soTuanThamGia')}</small>}
              {f.hinhThucThucTap === 'QUOC_TE' && <small className="muted">Thực tập quốc tế phải từ 6 tuần trở lên (Điều 4 khoản 6).</small>}
            </label>
          </div>
          <label className="field mt">
            <span>Đề tài / nhiệm vụ thực tập *</span>
            <input value={f.deTai} onChange={(e) => dat('deTai', e.target.value)} maxLength={300} />
            {loiTruong('deTai') && <small className="field-error">{loiTruong('deTai')}</small>}
          </label>
          <label className="field mt">
            <span>Mục tiêu thực tập</span>
            <textarea className="textarea" rows={3} value={f.mucTieu} maxLength={4000}
                      onChange={(e) => dat('mucTieu', e.target.value)} />
            {loiTruong('mucTieu') && <small className="field-error">{loiTruong('mucTieu')}</small>}
          </label>
          <label className="field mt">
            <span>Sản phẩm dự kiến</span>
            <textarea className="textarea" rows={3} value={f.sanPhamDuKien} maxLength={4000}
                      onChange={(e) => dat('sanPhamDuKien', e.target.value)} />
            {loiTruong('sanPhamDuKien') && <small className="field-error">{loiTruong('sanPhamDuKien')}</small>}
          </label>
        </div>

        <div className="card">
          <ErrorAlert error={loi} />
          {thongBao && <div className="alert alert-xanh" role="status">{thongBao}</div>}
          <label className="cam-ket">
            <input type="checkbox" checked={camKet} onChange={(e) => setCamKet(e.target.checked)} />
            <span>
              Tôi cam kết các thông tin khai báo là đúng sự thật; thực hiện đầy đủ Quy định tổ chức và đánh giá thực tập tốt
              nghiệp của Trường và nội quy của đơn vị hướng dẫn trong thời gian thực tập.
            </span>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-phu" disabled={dangXuLy !== null} onClick={() => void luuNhap()}>
              {dangXuLy === 'luu' ? 'Đang lưu…' : 'Lưu nháp'}
            </button>
            <button type="button" className="btn btn-chinh" disabled={!camKet || dangXuLy !== null}
                    title={camKet ? undefined : 'Tích ô cam kết trước khi gửi'} onClick={() => setHoiGui(true)}>
              Gửi đăng ký
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog mo={hoiGui} tieuDe="Gửi phiếu đăng ký?" nhanXacNhan="Gửi đăng ký" dangXuLy={dangXuLy === 'gui'}
                     onXacNhan={() => void guiDangKy()} onHuy={() => setHoiGui(false)}>
        <p>
          Phiếu được gửi tới {canBo ? <b>{canBo.hoTen}</b> : 'cán bộ hướng dẫn'}
          {donVi ? <> — {donVi.ten}</> : null} để xác nhận tiếp nhận.
        </p>
        <p className="muted">
          Sau khi gửi bạn không sửa được phiếu, trừ khi ĐVHD hoặc GVHD trả hồ sơ về kèm lý do.
        </p>
      </ConfirmDialog>
      <ProposeHostOrgDialog mo={moDeXuat} onHuy={() => setMoDeXuat(false)}
                            onDaGui={(d) => { setMoDeXuat(false); setDaDeXuat(d); }} />
    </>
  );
}
