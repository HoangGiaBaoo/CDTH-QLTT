import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { termApi } from '../../api/terms';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_TRANG_THAI_CHANG, NHAN_TRANG_THAI_DOT } from '../../utils/constants';
import { ngay, phanTram } from '../../utils/format';
import { THU_TU_TRANG_THAI_DOT, type Chang, type Clo, type Dot, type TrangThaiDot } from '../../types/term';
import CloConfigSection from './CloConfigSection';
import QuestionSection from './QuestionSection';
import TermForm from './TermForm';

/** Giải thích hệ quả của từng bước chuyển trạng thái đợt — hiện trong hộp thoại xác nhận (#30 chỉ đi tiến). */
const HE_QUA: Partial<Record<TrangThaiDot, string>> = {
  DANG_NHAN_DANG_KY: 'Hệ thống kiểm cấu hình chấm điểm trước khi mở: tổng α của 7 CLO bằng 100, tỷ lệ đồng chấm mỗi CLO '
    + 'bằng 100, mỗi CLO được đánh giá ở ít nhất một chặng (CBR-07, CBR-08, CBR-23). Sau khi mở, sinh viên gửi được phiếu TTTN-01.',
  DANG_THUC_HIEN: 'Đợt bước vào giai đoạn thực tập. Chặng 1 tự mở vào đầu tuần thứ 4, chặng 2 tự mở sau ngày kết thúc '
    + '(Điều 10 khoản 2); giáo vụ vẫn có thể mở thủ công nếu đủ điều kiện.',
  DA_KET_THUC: 'Đợt kết thúc: không sửa được thông tin đợt nữa.',
};

interface ThongBao { loai: 'xanh' | 'vang'; noiDung: string[] }

/** SCR-10 — chi tiết đợt: thông tin, trạng thái, 2 chặng, cấu hình 7 CLO + rubric, bộ câu hỏi (UC03, #27–#37). */
export default function TermDetailPage() {
  const termId = Number(useParams().termId);
  const location = useLocation();
  const navigate = useNavigate();
  const [dot, setDot] = useState<Dot | null>(null);
  const [chang, setChang] = useState<Chang[]>([]);
  const [clos, setClos] = useState<Clo[]>([]);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [suaThongTin, setSuaThongTin] = useState(false);
  const [xacNhan, setXacNhan] = useState<null | { tieuDe: string; noiDung: string; nhan: string; lam: () => Promise<void> }>(null);
  const [dangXuLy, setDangXuLy] = useState(false);

  // Vừa tạo đợt ở SCR-09 ⇒ mang theo thông điệp thành công + cảnh báo cấu hình (CBR-23).
  const tuTaoDot = location.state as { thongBao?: string; canhBao?: string[] } | null;
  const [thongBao, setThongBao] = useState<ThongBao[]>(() => {
    const ds: ThongBao[] = [];
    if (tuTaoDot?.thongBao) ds.push({ loai: 'xanh', noiDung: [tuTaoDot.thongBao] });
    if (tuTaoDot?.canhBao?.length) ds.push({ loai: 'vang', noiDung: tuTaoDot.canhBao });
    return ds;
  });

  const bao = (message?: string, canhBao?: string[]) => {
    const ds: ThongBao[] = [];
    if (message) ds.push({ loai: 'xanh', noiDung: [message] });
    if (canhBao?.length) ds.push({ loai: 'vang', noiDung: canhBao });
    setThongBao(ds);
  };

  const tai = useCallback(async () => {
    setLoiTai(null);
    try {
      const [d, c, cl] = await Promise.all([
        termApi.chiTiet(termId), termApi.danhSachChang(termId), termApi.danhSachClo(termId),
      ]);
      setDot(d);
      setChang(c);
      setClos(cl);
    } catch (e) {
      setLoiTai(e);
    }
  }, [termId]);

  useEffect(() => { void tai(); }, [tai]);

  // Thông điệp lúc vừa tạo đợt chỉ hiện một lần — xóa state để tải lại trang không hiện lại.
  useEffect(() => {
    if (tuTaoDot) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loiTai) return <ErrorAlert error={loiTai} />;
  if (!dot) return <Loading />;

  const viTri = THU_TU_TRANG_THAI_DOT.indexOf(dot.trangThai);
  const tiepTheo = THU_TU_TRANG_THAI_DOT[viTri + 1];
  const daKetThuc = dot.trangThai === 'DA_KET_THUC';
  const choMoChang = dot.trangThai === 'DANG_THUC_HIEN' || daKetThuc;

  const chay = async (lam: () => Promise<void>) => {
    setDangXuLy(true);
    setLoi(null);
    try {
      await lam();
      setXacNhan(null);
    } catch (e) {
      setLoi(e);
      setXacNhan(null);
    } finally {
      setDangXuLy(false);
      // Thông báo / lỗi hiện ở đầu trang — cuộn lên để người dùng thấy kết quả thao tác ở chặng phía dưới.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hoiChuyenTrangThai = () => tiepTheo && setXacNhan({
    tieuDe: `Chuyển đợt sang "${NHAN_TRANG_THAI_DOT[tiepTheo]}"?`,
    noiDung: `${HE_QUA[tiepTheo] ?? ''} Trạng thái đợt chỉ đi tiến, không quay lại được.`,
    nhan: 'Chuyển trạng thái',
    lam: async () => {
      const { data, message } = await termApi.doiTrangThai(dot.id, tiepTheo);
      setDot(data);
      bao(message, data.canhBao);
    },
  });

  const hoiDoiChang = (c: Chang, mo: boolean) => setXacNhan({
    tieuDe: `${mo ? 'Mở' : 'Đóng'} ${c.ten}?`,
    noiDung: mo
      ? `Mở thủ công, bổ sung cho lịch tự động. Hệ thống kiểm điều kiện mở chặng (CBR-13) và gửi thông báo tới `
        + `${c.thuTu === 1 ? 'GVHD và cán bộ ĐVHD (NT-10)' : 'người liên quan (NT-12)'}.`
      : 'Người chấm sẽ không nhập được phiếu của chặng này cho đến khi chặng được mở lại.',
    nhan: mo ? 'Mở chặng' : 'Đóng chặng',
    lam: async () => {
      const { data, message } = await termApi.doiTrangThaiChang(c.id, mo ? 'DANG_MO' : 'DA_DONG');
      setChang((ds) => ds.map((x) => (x.id === data.id ? data : x)));
      bao(message);
    },
  });

  const luuThongTin = async (req: Parameters<typeof termApi.capNhat>[1]) => {
    const { data, message } = await termApi.capNhat(dot.id, req);
    setDot(data);
    setSuaThongTin(false);
    // Đổi ngày ⇒ backend tính lại mốc các chặng chưa mở; tải lại để thấy ngày mở mới.
    setChang(await termApi.danhSachChang(dot.id));
    bao(message);
  };

  return (
    <div>
      <Link to="/terms" className="back-link">← Danh sách đợt</Link>
      <div className="page-head">
        <h1 className="page-title">{dot.maDot} <StatusBadge value={dot.trangThai} labels={NHAN_TRANG_THAI_DOT} /></h1>
      </div>

      {thongBao.map((t, i) => (
        <div key={i} className={`alert alert-${t.loai} mb`}>
          {t.noiDung.length === 1 ? t.noiDung[0] : <ul className="alert-list">{t.noiDung.map((n) => <li key={n}>{n}</li>)}</ul>}
        </div>
      ))}
      <ErrorAlert error={loi} />

      {/* Trạng thái đợt */}
      <div className="card mb">
        <ol className="stepper">
          {THU_TU_TRANG_THAI_DOT.map((t, i) => (
            <li key={t} className={i < viTri ? 'step-xong' : i === viTri ? 'step-hien-tai' : ''}>
              <span className="step-so">{i + 1}</span>{NHAN_TRANG_THAI_DOT[t]}
            </li>
          ))}
        </ol>
        {tiepTheo && (
          <div className="stepper-action">
            <button className="btn btn-chinh" onClick={hoiChuyenTrangThai}>
              Chuyển sang: {NHAN_TRANG_THAI_DOT[tiepTheo]}
            </button>
          </div>
        )}
      </div>

      {/* Thông tin đợt */}
      <div className="card mb">
        <div className="card-head">
          <h2 className="section-title mt0">Thông tin đợt</h2>
          {!suaThongTin && !daKetThuc && (
            <button className="btn btn-phu btn-nho" onClick={() => setSuaThongTin(true)}>Sửa</button>
          )}
        </div>
        {suaThongTin ? (
          <TermForm dot={dot} onLuu={luuThongTin} onHuy={() => setSuaThongTin(false)} />
        ) : (
          <div className="info-grid">
            <div><span className="muted">Tên đợt</span>{dot.ten}</div>
            <div><span className="muted">Học kỳ · Năm học</span>{dot.hocKy} · {dot.namHoc}</div>
            <div><span className="muted">Khoa / Viện</span>{dot.khoaVien ?? '—'}</div>
            <div><span className="muted">Thời gian</span>{ngay(dot.ngayBatDau)} – {ngay(dot.ngayKetThuc)} ({dot.soTuan} tuần)</div>
            <div><span className="muted">Hạn nộp báo cáo</span>{ngay(dot.hanNopBaoCao)}</div>
          </div>
        )}
      </div>

      {/* Hai chặng đánh giá */}
      <div className="card mb">
        <h2 className="section-title mt0">Chặng đánh giá</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead>
              <tr>
                <th>Chặng</th>
                <th className="num">Tuần</th>
                <th className="num">Trọng số W</th>
                <th>Ngày mở</th>
                <th>Ngày đóng</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chang.map((c) => (
                <tr key={c.id}>
                  <td>{c.ten}</td>
                  <td className="num">{c.tuanThucHien}</td>
                  <td className="num">{phanTram(c.trongSoW * 100)}</td>
                  <td className="nowrap">{ngay(c.ngayMo)}</td>
                  <td className="nowrap">{ngay(c.ngayDong)}</td>
                  <td><StatusBadge value={c.trangThai} labels={NHAN_TRANG_THAI_CHANG} /></td>
                  <td className="actions">
                    {c.trangThai === 'DANG_MO' && (
                      <button className="btn btn-phu btn-nho" onClick={() => hoiDoiChang(c, false)}>Đóng chặng</button>
                    )}
                    {(c.trangThai === 'CHUA_MO' || c.trangThai === 'DA_DONG') && (
                      <button className="btn btn-phu btn-nho" onClick={() => hoiDoiChang(c, true)} disabled={!choMoChang}
                              title={choMoChang ? undefined : 'Chỉ mở chặng khi đợt đang thực hiện'}>
                        Mở chặng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">
          Trọng số chặng cố định 30% / 70% (Điều 13 khoản 2). CLO chỉ được đánh giá ở một chặng (CLO7) được chuẩn hóa
          trọng số chặng khi tính điểm (CBR-23).
        </p>
      </div>

      <CloConfigSection clos={clos} chiXem={daKetThuc} onCapNhat={(ds, message) => { setClos(ds); bao(message); }} />

      <QuestionSection chang={chang} clos={clos} />

      <ConfirmDialog mo={!!xacNhan} tieuDe={xacNhan?.tieuDe ?? ''} nhanXacNhan={xacNhan?.nhan} dangXuLy={dangXuLy}
                     onHuy={() => setXacNhan(null)} onXacNhan={() => xacNhan && void chay(xacNhan.lam)}>
        <p>{xacNhan?.noiDung}</p>
      </ConfirmDialog>
    </div>
  );
}
