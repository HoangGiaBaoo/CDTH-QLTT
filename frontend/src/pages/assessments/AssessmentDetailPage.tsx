import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { assessmentApi } from '../../api/assessments';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_NHOM_NGUOI_CHAM, NHAN_TRANG_THAI_PHIEU } from '../../utils/constants';
import { ngayGio } from '../../utils/format';
import type { Phieu } from '../../types/assessment';

/**
 * Xem một phiếu theo id (#71). Người chấm mở phiếu của chính mình (ví dụ từ thông báo NT-13 "phiếu bị mở lại")
 * ⇒ chuyển sang trang chấm. Giáo vụ xem và mở lại phiếu đã nộp kèm lý do bắt buộc (#75, CBR-12).
 * Phiếu của người chấm khác: backend chỉ trả khi cả hai đã nộp (BR-08.7), không thì ACCESS_DENIED.
 */
export default function AssessmentDetailPage() {
  const id = Number(useParams().assessmentId);
  const { nguoiDung } = useAuth();
  const [p, setP] = useState<Phieu | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [moHoi, setMoHoi] = useState(false);
  const [lyDo, setLyDo] = useState('');
  const [dangGui, setDangGui] = useState(false);

  const tai = useCallback(() => {
    setLoiTai(null);
    assessmentApi.chiTiet(id).then(setP).catch(setLoiTai);
  }, [id]);
  useEffect(tai, [tai]);

  const laAdmin = nguoiDung?.vaiTro === 'ADMIN';
  const quayLai = <Link to="/assessments" className="back-link">← {laAdmin ? 'Giám sát phiếu' : 'Danh sách chấm'}</Link>;

  if (loiTai) return <div>{quayLai}<ErrorAlert error={loiTai} /></div>;
  if (!p) return <Loading />;
  if (!laAdmin && p.nguoiChamId === nguoiDung?.id) {
    return <Navigate to={`/assessments/form?recordId=${p.hoSoId}&stage=${p.chang}`} replace />;
  }

  const moLai = async () => {
    setLoi(null);
    setDangGui(true);
    try {
      const { data, message } = await assessmentApi.moLai(p.id, lyDo.trim());
      setP(data);
      setThongBao(message);
      setMoHoi(false);
      setLyDo('');
    } catch (e) {
      setLoi(e);
      setMoHoi(false);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div>
      {quayLai}
      <div className="page-head">
        <h1 className="page-title">
          Phiếu #{p.id} — {p.hoTenSinhVien} <StatusBadge value={p.trangThai} labels={NHAN_TRANG_THAI_PHIEU} />
        </h1>
        {laAdmin && p.trangThai === 'DA_NOP' && (
          <button className="btn btn-phu" onClick={() => setMoHoi(true)}>Mở lại phiếu</button>
        )}
      </div>
      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      <ErrorAlert error={loi} />

      <div className="card mb">
        <div className="info-grid">
          <div><span className="muted">Sinh viên</span>{p.maSv} · {p.hoTenSinhVien}</div>
          <div><span className="muted">Chặng</span>{p.tenChang}</div>
          <div><span className="muted">Người chấm</span>{p.hoTenNguoiCham}</div>
          <div><span className="muted">Nhóm</span>{NHAN_NHOM_NGUOI_CHAM[p.nhom]}</div>
          <div><span className="muted">Ngày nộp</span>{ngayGio(p.ngayNop)}</div>
          {p.lyDoMoLai && <div><span className="muted">Lý do mở lại gần nhất</span>{p.lyDoMoLai}</div>}
        </div>
      </div>

      <div className="table-wrap mb">
        <table className="table">
          <thead>
            <tr><th>CLO</th><th className="num">Mức</th><th className="num">Điểm</th><th>Nhận xét</th></tr>
          </thead>
          <tbody>
            {(p.diemClos ?? []).length === 0 && (
              <tr><td colSpan={4} className="muted">Phiếu chưa có điểm nào.</td></tr>
            )}
            {(p.diemClos ?? []).map((d) => (
              <tr key={d.maClo}>
                <td><b>{d.maClo}</b> <span className="muted">{d.tenClo}</span></td>
                <td className="num">{d.mucDat}</td>
                {/* Điểm người chấm nhập có thể 2 chữ số thập phân — hiện nguyên, không làm tròn. */}
                <td className="num">{d.diem.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</td>
                <td className="pre-line">{d.nhanXet ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="muted small">Nhận xét chung</div>
        <div className="pre-line">{p.nhanXetChung ?? '—'}</div>
      </div>

      <ConfirmDialog mo={moHoi} tieuDe="Mở lại phiếu đã nộp?" nhanXacNhan="Mở lại" dangXuLy={dangGui}
                     khoaXacNhan={!lyDo.trim()} tuFocusNut={false}
                     onHuy={() => setMoHoi(false)} onXacNhan={() => void moLai()}>
        <p>
          Phiếu chuyển sang <b>Mở lại</b> để {p.hoTenNguoiCham} sửa. Hệ thống ghi nhật ký điểm cũ từng CLO, người thực hiện,
          thời điểm (CBR-12); kết quả học phần (nếu đã tính) quay về Chưa tính và được tính lại khi phiếu được nộp lại.
        </p>
        <label className="field">
          <span>Lý do mở lại *</span>
          <textarea className="textarea" rows={3} maxLength={500} value={lyDo} onChange={(e) => setLyDo(e.target.value)}
                    autoFocus />
        </label>
        {!lyDo.trim() && <small className="muted">Bắt buộc nhập lý do.</small>}
      </ConfirmDialog>
    </div>
  );
}
