import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { termApi } from '../../api/terms';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import type { HoSo } from '../../types/record';
import type { Dot } from '../../types/term';
import RecordInfo from './RecordInfo';
import RecordStepper from './RecordStepper';
import RecordTracking from './RecordTracking';
import RequiredEvidence from './RequiredEvidence';
import { GIAN_DOAN_DUOC, daDuocDuyet, tinhTrangChoCanBo } from './vongDoi';

type ThaoTac = 'XAC_NHAN' | 'TU_CHOI_DVHD' | 'DUYET' | 'TU_CHOI_GVHD' | 'GIAN_DOAN' | 'KHOI_PHUC';

interface CauHinh {
  nhanNut: string;
  tieuDe: string;
  /** Lý do bắt buộc (từ chối #45/#46, mọi thao tác #47). */
  canLyDo: boolean;
  nguyHiem?: boolean;
  noiDung: (h: HoSo, dot: Dot) => ReactNode;
  goi: (id: number, lyDo: string) => Promise<{ data: HoSo; message?: string }>;
}

const CAU_HINH: Record<ThaoTac, CauHinh> = {
  XAC_NHAN: {
    nhanNut: 'Xác nhận tiếp nhận',
    tieuDe: 'Xác nhận tiếp nhận sinh viên?',
    canLyDo: false,
    noiDung: (h) => (
      <>
        <p>Bạn đồng ý hướng dẫn <b>{h.sinhVien.hoTen}</b> ({h.sinhVien.maSv}) tại {h.donVi?.ten ?? 'đơn vị'}.</p>
        <p>
          Hồ sơ chiếm một chỗ trong hạn mức sinh viên của bạn ở đợt này (Điều 7 khoản 2 điểm c), chuyển sang
          <b> Chờ GVHD duyệt</b> và giáo vụ được báo để phân công giảng viên hướng dẫn.
        </p>
      </>
    ),
    goi: (id) => recordApi.xacNhanTiepNhan(id, { dongY: true }),
  },
  TU_CHOI_DVHD: {
    nhanNut: 'Từ chối',
    tieuDe: 'Từ chối tiếp nhận sinh viên?',
    canLyDo: true,
    nguyHiem: true,
    noiDung: () => <p>Hồ sơ trở về <b>Bản nháp</b>; sinh viên nhận thông báo kèm lý do để sửa hoặc chọn đơn vị khác.</p>,
    goi: (id, lyDo) => recordApi.xacNhanTiepNhan(id, { dongY: false, lyDo }),
  },
  DUYET: {
    nhanNut: 'Phê duyệt',
    tieuDe: 'Phê duyệt hồ sơ thực tập?',
    canLyDo: false,
    noiDung: (h, dot) => (
      <>
        <p>Hồ sơ của <b>{h.sinhVien.hoTen}</b> chuyển sang <b>Đang thực tập</b>.</p>
        <p>
          Hệ thống tạo khung kế hoạch học tập TTTN-02 ({dot.soTuan} tuần + dòng Tổng kết) và bảng tiến độ {dot.soTuan} tuần;
          sinh viên nhận thông báo để lập kế hoạch (hạn nộp: 5 ngày làm việc kể từ ngày bắt đầu đợt, Điều 6 khoản 3 điểm a).
        </p>
      </>
    ),
    goi: (id) => recordApi.pheDuyet(id, { dongY: true }),
  },
  TU_CHOI_GVHD: {
    nhanNut: 'Từ chối',
    tieuDe: 'Từ chối hồ sơ thực tập?',
    canLyDo: true,
    nguyHiem: true,
    noiDung: () => (
      <p>
        Hồ sơ trở về <b>Bản nháp</b>, phân công của bạn bị hủy và hồ sơ thôi chiếm hạn mức của cán bộ ĐVHD; sinh viên và
        cán bộ nhận thông báo kèm lý do. Sau đó bạn không còn xem được hồ sơ này.
      </p>
    ),
    goi: (id, lyDo) => recordApi.pheDuyet(id, { dongY: false, lyDo }),
  },
  GIAN_DOAN: {
    nhanNut: 'Chuyển Gián đoạn',
    tieuDe: 'Chuyển hồ sơ sang Gián đoạn?',
    canLyDo: true,
    nguyHiem: true,
    noiDung: () => (
      <p>
        Dùng khi sinh viên phải dừng thực tập vì lý do bất khả kháng (Điều 15 khoản 4). Hồ sơ tạm dừng ở giai đoạn hiện
        tại; khôi phục sau sẽ đưa hồ sơ về đúng giai đoạn đang dở. Thao tác được ghi nhật ký kèm lý do.
      </p>
    ),
    goi: (id, lyDo) => recordApi.doiTrangThai(id, { gianDoan: true, lyDo }),
  },
  KHOI_PHUC: {
    nhanNut: 'Khôi phục',
    tieuDe: 'Khôi phục hồ sơ?',
    canLyDo: true,
    noiDung: () => (
      <p>
        Hồ sơ trở về giai đoạn đang dở: chưa có kế hoạch ⇒ <b>Chờ GVHD duyệt</b>; báo cáo đã đủ hai xác nhận ⇒
        <b> Chờ đánh giá</b>; còn lại ⇒ <b>Đang thực tập</b>.
      </p>
    ),
    goi: (id, lyDo) => recordApi.doiTrangThai(id, { gianDoan: false, lyDo }),
  },
};

/**
 * SCR-12 — chi tiết hồ sơ cho cán bộ ĐVHD, giảng viên, giáo vụ (`/records/:id`, đích NT-01/02/05/06). Nút chỉ hiện
 * cho đúng người ở đúng trạng thái (UC04 bước 8, 10; Đ15 k4) — backend vẫn kiểm lại quyền và trạng thái.
 */
export default function RecordDetailPage({ recordId }: { recordId: number }) {
  const { nguoiDung } = useAuth();
  const navigate = useNavigate();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [hoi, setHoi] = useState<ThaoTac | null>(null);
  const [lyDo, setLyDo] = useState('');
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    setHoSo(null);
    setLoiTai(null);
    recordApi.chiTiet(recordId)
      .then(async (h) => {
        const d = await termApi.chiTiet(h.dot.id);
        if (conHieuLuc) { setHoSo(h); setDot(d); }
      })
      .catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [recordId]);

  const tieuDe = (
    <>
      <Link to="/records" className="back-link">← Danh sách hồ sơ</Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">{hoSo ? `${hoSo.sinhVien.hoTen} — ${hoSo.sinhVien.maSv}` : 'Hồ sơ thực tập'}</h1>
          {hoSo && <div className="muted small">Hồ sơ thực tập · đợt {hoSo.dot.maDot}</div>}
        </div>
        {hoSo && <StatusBadge value={hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />}
      </div>
    </>
  );

  if (!hoSo || !dot || !nguoiDung) return <div>{tieuDe}{loiTai ? <ErrorAlert error={loiTai} /> : <Loading />}</div>;

  const vaiTro = nguoiDung.vaiTro;
  const laCanBoCuaHoSo = vaiTro === 'CAN_BO_DVHD' && hoSo.canBoDvhd?.nguoiDungId === nguoiDung.id;
  const laGvhd = vaiTro === 'GIANG_VIEN' && hoSo.gvhd?.nguoiDungId === nguoiDung.id;
  const thaoTac: ThaoTac[] =
    laCanBoCuaHoSo && hoSo.trangThai === 'CHO_DVHD' ? ['XAC_NHAN', 'TU_CHOI_DVHD']
      : laGvhd && hoSo.trangThai === 'CHO_GVHD' ? ['DUYET', 'TU_CHOI_GVHD']
        : vaiTro === 'ADMIN' && GIAN_DOAN_DUOC.includes(hoSo.trangThai) ? ['GIAN_DOAN']
          : vaiTro === 'ADMIN' && hoSo.trangThai === 'GIAN_DOAN' ? ['KHOI_PHUC'] : [];
  // Giáo vụ cũng chỉ có thao tác "phụ" (gián đoạn) — việc chính của giáo vụ ở bước này là phân công (SCR-13).
  const viecCuaToi = thaoTac.length > 0 && vaiTro !== 'ADMIN';
  const choPhanCong = vaiTro === 'ADMIN' && hoSo.trangThai === 'CHO_GVHD' && !hoSo.gvhd;
  const tinhTrang = tinhTrangChoCanBo(hoSo);
  const cauHinh = hoi ? CAU_HINH[hoi] : null;

  const moHoi = (t: ThaoTac) => { setLyDo(''); setHoi(t); };

  const thucHien = async () => {
    if (!hoi) return;
    const t = hoi;
    setDangGui(true);
    setLoi(null);
    setThongBao(undefined);
    try {
      const { data, message } = await CAU_HINH[t].goi(hoSo.id, lyDo.trim());
      setHoi(null);
      if (t === 'TU_CHOI_GVHD') {
        // Phân công đã bị hủy ⇒ giảng viên không còn quyền xem hồ sơ (#41), quay về danh sách.
        navigate('/records', { state: { thongBao: `${message ?? 'Đã từ chối hồ sơ'} — hồ sơ của ${data.sinhVien.hoTen} đã trả về sinh viên.` } });
        return;
      }
      setHoSo(data);
      setThongBao(message);
    } catch (e) {
      setHoi(null);
      setLoi(e);
    } finally {
      setDangGui(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nutThaoTac = (
    <div className="action-bar-buttons">
      {thaoTac.map((t) => (
        <button key={t} className={`btn ${CAU_HINH[t].nguyHiem ? 'btn-phu' : 'btn-chinh'}`} disabled={dangGui}
                onClick={() => moHoi(t)}>
          {CAU_HINH[t].nhanNut}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {tieuDe}
      {thongBao && <div className="alert alert-xanh mb" role="status">{thongBao}</div>}
      <ErrorAlert error={loi} />
      {loi instanceof ApiError && loi.code === 'QUOTA_EXCEEDED' && laCanBoCuaHoSo && (
        <p className="hint">
          Bạn đã nhận đủ số sinh viên tối đa của đợt này. Hãy từ chối kèm lý do để sinh viên chọn cán bộ khác, hoặc liên hệ
          giáo vụ nếu cần điều chỉnh hạn mức.
        </p>
      )}

      <RecordStepper trangThai={hoSo.trangThai} />

      {viecCuaToi ? (
        <div className="card mb viec-can-lam">
          <div className="card-head">
            <div>
              <h2 className="section-title">
                {laCanBoCuaHoSo ? 'Xác nhận tiếp nhận sinh viên' : 'Phê duyệt hồ sơ thực tập'}
              </h2>
              <div className="muted small mt-nho">
                {laCanBoCuaHoSo
                  ? 'Xem phiếu đăng ký bên dưới rồi xác nhận tiếp nhận, hoặc từ chối kèm lý do (UC04 bước 8).'
                  : 'Bạn đã được phân công hướng dẫn sinh viên này. Phê duyệt, hoặc từ chối kèm lý do (UC04 bước 10).'}
              </div>
            </div>
            {nutThaoTac}
          </div>
        </div>
      ) : (
        tinhTrang && (
          <div className={`alert ${hoSo.trangThai === 'GIAN_DOAN' ? 'alert-vang' : 'alert-xanh-duong'} mb`} role="status">
            <div className="alert-hang">
              <span>{tinhTrang}</span>
              {choPhanCong && <Link to="/assignments" className="btn btn-chinh btn-nho">Phân công GVHD</Link>}
              {vaiTro === 'ADMIN' && thaoTac.length > 0 && nutThaoTac}
            </div>
          </div>
        )
      )}

      <RecordInfo hoSo={hoSo} dot={dot} hienSinhVien />

      {daDuocDuyet(hoSo.trangThai) ? (
        <RecordTracking hoSo={hoSo} vaiTro={vaiTro} />
      ) : (
        <div className="card mb">
          <RequiredEvidence recordId={hoSo.id} hinhThucDaLuu={hoSo.hinhThucThucTap} xemHoSoSinhVien />
        </div>
      )}

      <ConfirmDialog
        mo={!!cauHinh}
        tieuDe={cauHinh?.tieuDe ?? ''}
        nhanXacNhan={cauHinh?.nhanNut}
        nguyHiem={cauHinh?.nguyHiem}
        dangXuLy={dangGui}
        khoaXacNhan={!!cauHinh?.canLyDo && !lyDo.trim()}
        tuFocusNut={!cauHinh?.canLyDo}
        onXacNhan={() => void thucHien()}
        onHuy={() => setHoi(null)}
      >
        {cauHinh?.noiDung(hoSo, dot)}
        {cauHinh?.canLyDo && (
          <label className="field mt">
            <span>Lý do *</span>
            <textarea className="textarea" rows={3} maxLength={500} value={lyDo} autoFocus
                      onChange={(e) => setLyDo(e.target.value)} />
          </label>
        )}
      </ConfirmDialog>
    </div>
  );
}
