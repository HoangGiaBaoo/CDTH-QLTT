import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { termApi } from '../../api/terms';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_DOT } from '../../utils/constants';
import { ngay } from '../../utils/format';
import { THU_TU_TRANG_THAI_DOT, type Dot, type TrangThaiDot } from '../../types/term';
import TermForm from './TermForm';

/** SCR-09 — danh sách đợt TTTN, tạo đợt mới (UC03 bước 1–5, #26, #28). */
export default function TermListPage() {
  const navigate = useNavigate();
  const [ds, setDs] = useState<Dot[] | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [trangThai, setTrangThai] = useState<TrangThaiDot | ''>('');
  const [namHoc, setNamHoc] = useState('');
  const [moForm, setMoForm] = useState(false);

  const tai = useCallback(async () => {
    setLoi(null);
    try {
      setDs(await termApi.danhSach({ status: trangThai || undefined }));
    } catch (e) {
      setLoi(e);
      setDs([]);
    }
  }, [trangThai]);

  useEffect(() => { void tai(); }, [tai]);

  // Lọc năm học ngay trên máy để không gọi lại API mỗi lần gõ phím.
  const hienThi = ds?.filter((d) => !namHoc.trim() || d.namHoc.includes(namHoc.trim()));

  const tao = async (req: Parameters<typeof termApi.tao>[0]) => {
    const { data, message } = await termApi.tao(req);
    // Chuyển sang SCR-10 để giáo vụ rà bảng CLO, trọng số (UC03 bước 6) — kèm cảnh báo cấu hình nếu có.
    navigate(`/terms/${data.id}`, { state: { thongBao: message, canhBao: data.canhBao } });
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Đợt thực tập</h1>
        {!moForm && <button className="btn btn-chinh" onClick={() => setMoForm(true)}>+ Tạo đợt mới</button>}
      </div>

      {moForm && (
        <div className="card mb">
          <h2 className="section-title mt0">Tạo đợt thực tập mới</h2>
          <TermForm onLuu={tao} onHuy={() => setMoForm(false)} />
        </div>
      )}

      <div className="toolbar">
        <label className="field field-inline">
          <span>Trạng thái</span>
          <select value={trangThai} onChange={(e) => setTrangThai(e.target.value as TrangThaiDot | '')}>
            <option value="">Tất cả</option>
            {THU_TU_TRANG_THAI_DOT.map((t) => <option key={t} value={t}>{NHAN_TRANG_THAI_DOT[t]}</option>)}
          </select>
        </label>
        <label className="field field-inline">
          <span>Năm học</span>
          <input value={namHoc} onChange={(e) => setNamHoc(e.target.value)} placeholder="2026-2027" />
        </label>
      </div>

      <ErrorAlert error={loi} />
      {!hienThi ? <Loading /> : hienThi.length === 0 ? (
        <div className="card empty"><div className="muted">Chưa có đợt thực tập nào phù hợp.</div></div>
      ) : (
        <div className="table-wrap">
          <table className="table table-click">
            <thead>
              <tr>
                <th>Mã đợt</th>
                <th>Tên đợt</th>
                <th>Học kỳ</th>
                <th>Thời gian</th>
                <th className="num">Số tuần</th>
                <th>Hạn nộp báo cáo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {hienThi.map((d) => (
                <tr key={d.id} onClick={() => navigate(`/terms/${d.id}`)} tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/terms/${d.id}`)}>
                  <td className="nowrap"><b>{d.maDot}</b></td>
                  <td>{d.ten}</td>
                  <td className="nowrap">{d.hocKy} · {d.namHoc}</td>
                  <td className="nowrap">{ngay(d.ngayBatDau)} – {ngay(d.ngayKetThuc)}</td>
                  <td className="num">{d.soTuan}</td>
                  <td className="nowrap">{ngay(d.hanNopBaoCao)}</td>
                  <td><StatusBadge value={d.trangThai} labels={NHAN_TRANG_THAI_DOT} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
