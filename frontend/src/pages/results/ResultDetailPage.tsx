import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { resultApi } from '../../api/results';
import { useAuth } from '../../auth/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_CHUONG_TRINH, NHAN_TRANG_THAI_HO_SO, NHAN_TRANG_THAI_KET_QUA } from '../../utils/constants';
import { diem, ngay, ngayGio } from '../../utils/format';
import { luuTep } from '../../utils/taiTep';
import type { HoSo } from '../../types/record';
import type { BangTongHop, MucXepLoai, TrangThaiKetQua } from '../../types/result';
import CloScoreTable from './CloScoreTable';
import RecognitionConditions from './RecognitionConditions';
import ReviewForm from './ReviewForm';

const VONG_DOI: TrangThaiKetQua[] = ['CHUA_TINH', 'DA_TINH', 'DA_XAC_NHAN', 'DA_CONG_BO'];

/** Khoảng của mức trên mục III, như bản Word: mức thấp nhất "< 4,0", cao nhất "từ 8,5", còn lại "a – dưới b". */
function khoang(m: MucXepLoai, i: number, n: number): string {
  if (i === 0) return `< ${diem(m.den)}`;
  if (i === n - 1) return `từ ${diem(m.tu)}`;
  return `${diem(m.tu)} – dưới ${diem(m.den)}`;
}

/** So hai mức điểm thưởng theo đơn vị 0,01 — tránh sai số dấu phẩy động khi so trên giao diện. */
const khacNhau = (a: number, b: number) => Math.round(a * 100) !== Math.round(b * 100);

/**
 * SCR-21 — bảng tổng hợp TTTN-07 của một hồ sơ (#83), đúng sáu mục của biểu mẫu. Giáo vụ: tính lại (#84),
 * xác nhận + duyệt điểm thưởng (#86), công bố (#87); GVHD của SV: nhận xét + đề xuất thưởng (#85);
 * giáo vụ và giảng viên xuất Word (#88). Cán bộ ĐVHD chỉ xem.
 */
export default function ResultDetailPage() {
  const id = Number(useParams().recordId);
  const { nguoiDung } = useAuth();
  const laAdmin = nguoiDung?.vaiTro === 'ADMIN';
  const [bang, setBang] = useState<BangTongHop | null>(null);
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [thongBao, setThongBao] = useState<string>();
  const [hoi, setHoi] = useState<null | 'xacNhan' | 'congBo'>(null);
  const [thuongDuyet, setThuongDuyet] = useState('');
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    setLoiTai(null);
    // #41 cho biết người đang xem có phải GVHD của SV không, và đợt của hồ sơ (để dẫn sang SCR-10).
    Promise.all([resultApi.chiTiet(id), recordApi.chiTiet(id)])
      .then(([b, h]) => { if (conHieuLuc) { setBang(b); setHoSo(h); } })
      .catch((e) => { if (conHieuLuc) setLoiTai(e); });
    return () => { conHieuLuc = false; };
  }, [id]);

  if (loiTai) return <div><Link to="/results" className="back-link">← Kết quả học phần</Link><ErrorAlert error={loiTai} /></div>;
  if (!bang || !hoSo) return <Loading />;

  const tt = bang.thongTin;
  const trangThai = bang.trangThai;
  const daTinh = trangThai !== 'CHUA_TINH';
  const laGvhd = nguoiDung?.vaiTro === 'GIANG_VIEN' && hoSo.gvhd?.nguoiDungId === nguoiDung.id;
  const xuatDuoc = daTinh && (laAdmin || nguoiDung?.vaiTro === 'GIANG_VIEN');
  const viTri = VONG_DOI.indexOf(trangThai);

  const chay = async (lam: () => Promise<void>) => {
    setLoi(null);
    setThongBao(undefined);
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

  const tinhLai = () => chay(async () => {
    const { data, message } = await resultApi.tinhLai(id);
    setBang(data);
    setThongBao(message);
  });

  const moXacNhan = () => {
    setThuongDuyet(String(bang.diemThuong));
    setHoi('xacNhan');
  };

  const xacNhan = () => {
    setHoi(null);
    return chay(async () => {
      const v = thuongDuyet.trim() === '' ? 0 : Number(thuongDuyet.replace(',', '.'));
      // null = giữ mức GVHD đề xuất (#86); chỉ gửi khi giáo vụ đổi mức.
      const { data, message } = await resultApi.xacNhan(id, {
        diemThuongDuyet: Number.isFinite(v) && khacNhau(v, bang.diemThuong) ? v : null,
      });
      setBang(data);
      setThongBao(message);
    });
  };

  const congBo = () => {
    setHoi(null);
    return chay(async () => {
      const { message } = await resultApi.congBo({ hoSoIds: [id] });
      const [b, h] = await Promise.all([resultApi.chiTiet(id), recordApi.chiTiet(id)]);
      setBang(b);
      setHoSo(h);
      setThongBao(message);
    });
  };

  const xuat = () => chay(async () => {
    const { blob, tenTep } = await resultApi.xuatTTTN07(id, `TTTN-07_${tt.maSv}.docx`);
    luuTep(blob, tenTep);
  });

  const loiCauHinh = laAdmin && loi instanceof ApiError && loi.code === 'CLO_CHUA_DUOC_DANH_GIA';

  return (
    <div>
      <Link to="/results" className="back-link">← Kết quả học phần</Link>
      <div className="page-head">
        <h1 className="page-title">
          Bảng tổng hợp TTTN-07 · {tt.hoTen}
          <StatusBadge value={trangThai} labels={NHAN_TRANG_THAI_KET_QUA} />
        </h1>
        <div className="action-bar-buttons">
          {xuatDuoc && <button className="btn btn-phu" onClick={() => void xuat()} disabled={dangGui}>Xuất TTTN-07 (.docx)</button>}
          {laAdmin && (trangThai === 'CHUA_TINH' || trangThai === 'DA_TINH') && (
            <button className="btn btn-phu" onClick={() => void tinhLai()} disabled={dangGui}>
              {trangThai === 'CHUA_TINH' ? 'Tính điểm' : 'Tính lại'}
            </button>
          )}
          {laAdmin && trangThai === 'DA_TINH' && (
            <button className="btn btn-chinh" onClick={moXacNhan} disabled={dangGui}>Xác nhận</button>
          )}
          {laAdmin && trangThai === 'DA_XAC_NHAN' && (
            <button className="btn btn-chinh" onClick={() => setHoi('congBo')} disabled={dangGui}>Công bố</button>
          )}
        </div>
      </div>

      <div className="card mb">
        <ol className="stepper">
          {VONG_DOI.map((t, i) => (
            <li key={t} className={i < viTri ? 'step-xong' : i === viTri ? 'step-hien-tai' : ''}>
              <span className="step-so">{i + 1}</span>{NHAN_TRANG_THAI_KET_QUA[t]}
            </li>
          ))}
        </ol>
      </div>

      {thongBao && <div className="alert alert-xanh mb">{thongBao}</div>}
      <ErrorAlert error={loi} />
      {loiCauHinh && (
        <p className="hint">
          Sửa bộ câu hỏi để mọi CLO được đánh giá ở ít nhất một chặng: <Link to={`/terms/${hoSo.dot.id}`}>cấu hình đợt {hoSo.dot.maDot} (SCR-10)</Link>.
        </p>
      )}
      {bang.chuaTinhDuoc && (
        <div className="alert alert-vang mb">
          <b>{daTinh ? 'Không dựng lại được cột điểm từng chặng:' : 'Chưa có kết quả:'}</b> {bang.chuaTinhDuoc}
        </div>
      )}
      {bang.canhBao.length > 0 && (
        <div className="alert alert-vang mb">
          <b>Cảnh báo</b>
          <ul className="alert-list">{bang.canhBao.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {laAdmin && trangThai === 'DA_XAC_NHAN' && (
        <p className="hint">
          Kết quả đã xác nhận, minh chứng của hồ sơ đã khóa (CBR-22). Muốn thay đổi điểm cần mở lại phiếu liên quan ở{' '}
          <Link to="/assessments">Giám sát phiếu chấm</Link> (CBR-12) — kết quả sẽ được tính lại.
        </p>
      )}

      {/* I */}
      <div className="card mb">
        <h2 className="section-title mt0">I. Thông tin chung</h2>
        <div className="info-grid">
          <div><span className="muted">Họ và tên sinh viên</span><b>{tt.hoTen}</b></div>
          <div><span className="muted">Mã sinh viên</span>{tt.maSv}</div>
          <div><span className="muted">Lớp</span>{tt.lop ?? '—'}</div>
          <div><span className="muted">Ngành</span>{tt.nganh ?? '—'}</div>
          <div><span className="muted">Khoa/Viện</span>{tt.khoaVien ?? '—'}</div>
          <div><span className="muted">Chương trình</span>{NHAN_CHUONG_TRINH[tt.chuongTrinh] ?? tt.chuongTrinh}</div>
          <div><span className="muted">Giảng viên hướng dẫn</span>{tt.giangVienHuongDan ?? '—'}</div>
          <div><span className="muted">Đơn vị hướng dẫn</span>{tt.donViHuongDan ?? '—'}</div>
          <div><span className="muted">Cán bộ hướng dẫn</span>{tt.canBoHuongDan ?? '—'}</div>
          <div><span className="muted">Thời gian thực tập</span>{ngay(tt.tuNgay)} – {ngay(tt.denNgay)}</div>
          <div><span className="muted">Trạng thái hồ sơ</span><span><StatusBadge value={tt.trangThaiHoSo} labels={NHAN_TRANG_THAI_HO_SO} /></span></div>
        </div>
      </div>

      {/* II */}
      <div className="card mb">
        <h2 className="section-title mt0">II. Bảng điểm chi tiết theo từng CLO</h2>
        <CloScoreTable bang={bang} />
      </div>

      {/* III */}
      <div className="card mb">
        <h2 className="section-title mt0">III. Tổng hợp điểm học phần</h2>
        <div className="hp-tong">
          <div className="hp-khoi">
            <span className="muted small">Điểm học phần (HP)</span>
            <span className="hp-so">{diem(bang.diemHp)}</span>
            {bang.diemThuong > 0 && <span className="muted small">đã cộng điểm thưởng {diem(bang.diemThuong)}</span>}
          </div>
          <div className="hp-khoi">
            <span className="muted small">Xếp loại (Điều 13 khoản 2)</span>
            <ul className="xep-loai">
              {bang.thangMuc.map((m, i) => (
                <li key={m.muc} className={bang.mucHp === m.muc ? 'xl-chon' : undefined}>
                  <span aria-hidden>{bang.mucHp === m.muc ? '☒' : '☐'}</span> Mức {m.muc} ({khoang(m, i, bang.thangMuc.length)})
                </li>
              ))}
            </ul>
          </div>
          <div className="hp-khoi">
            <span className="muted small">Kết luận công nhận hoàn thành</span>
            {bang.ketLuan === 'DAT' ? <span className="ket-luan kl-dat">ĐẠT</span>
              : bang.ketLuan === 'KHONG_DAT' ? <span className="ket-luan kl-khong-dat">KHÔNG ĐẠT</span>
                : <span className="muted">Chưa xét</span>}
          </div>
        </div>
        <h3 className="tieu-de-nho">Bốn điều kiện công nhận (Điều 15 khoản 3)</h3>
        <RecognitionConditions bang={bang} />
      </div>

      {/* IV */}
      <div className="card mb">
        <h2 className="section-title mt0">IV. Đánh giá tổng hợp theo nhóm năng lực</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead><tr><th>Nhóm năng lực</th><th>Các CLO liên quan</th><th className="num">Điểm trung bình nhóm</th><th>Mức đạt (0–4)</th></tr></thead>
            <tbody>
              {bang.nhomNangLuc.map((n) => (
                <tr key={n.ten}>
                  <td>{n.ten}</td>
                  <td>{n.cacClo.join(', ')}</td>
                  <td className="num"><b>{diem(n.diem)}</b></td>
                  <td>{n.muc != null ? `Mức ${n.muc}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* V */}
      <div className="card mb">
        <h2 className="section-title mt0">V. Nhận xét của giảng viên hướng dẫn</h2>
        {laGvhd && trangThai === 'DA_TINH' ? (
          <ReviewForm key={bang.ngayTinh ?? ''} recordId={id} bang={bang}
                      onDaLuu={(b, m) => { setBang(b); setThongBao(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        ) : bang.nhanXetGvhd ? (
          <p className="pre-line mt0">{bang.nhanXetGvhd}</p>
        ) : (
          <p className="muted mt0">
            {laGvhd && trangThai === 'CHUA_TINH' ? 'Bạn nhập nhận xét sau khi kết quả được tính.' : 'GVHD chưa nhập nhận xét.'}
          </p>
        )}
        {bang.nhanXetGvhd && bang.diemThuong > 0 && !(laGvhd && trangThai === 'DA_TINH') && (
          <p className="small mt0">Điểm thưởng: <b>{diem(bang.diemThuong)}</b>{trangThai === 'DA_TINH' ? ' (đề xuất, chờ giáo vụ duyệt)' : ''}</p>
        )}
      </div>

      {/* VI */}
      <div className="card mb">
        <h2 className="section-title mt0">VI. Xác nhận và lưu trữ</h2>
        <div className="info-grid">
          <div><span className="muted">Ngày tính điểm</span>{ngayGio(bang.ngayTinh)}</div>
          <div><span className="muted">Bộ trọng số đã dùng (CBR-22)</span>{bang.phienBanTrongSo ?? '—'}</div>
          <div><span className="muted">Mã hồ sơ</span>{tt.hoSoId}</div>
        </div>
      </div>

      <ConfirmDialog
        mo={hoi === 'xacNhan'}
        tieuDe="Xác nhận kết quả học phần?"
        nhanXacNhan="Xác nhận"
        dangXuLy={dangGui}
        onXacNhan={() => void xacNhan()}
        onHuy={() => setHoi(null)}
      >
        <p>Điểm học phần <b>{diem(bang.diemHp)}</b>, kết luận <b>{bang.ketLuan === 'DAT' ? 'Đạt' : 'Không đạt'}</b>.</p>
        <label className="field field-diem">
          <span>Điểm thưởng được duyệt</span>
          <input type="number" className="input-so" min={0} step={0.1} value={thuongDuyet} onChange={(e) => setThuongDuyet(e.target.value)} />
        </label>
        <p className="hint">
          GVHD đề xuất {diem(bang.diemThuong)}. Đổi mức thì hệ thống tính lại điểm học phần trước khi xác nhận.
          Sau khi xác nhận, minh chứng của hồ sơ bị khóa (CBR-22); muốn sửa điểm phải mở lại phiếu (CBR-12).
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        mo={hoi === 'congBo'}
        tieuDe="Công bố kết quả học phần?"
        nhanXacNhan="Công bố"
        nguyHiem
        dangXuLy={dangGui}
        onXacNhan={() => void congBo()}
        onHuy={() => setHoi(null)}
      >
        <p>
          Hồ sơ của <b>{tt.hoTen}</b> chuyển <b>{bang.ketLuan === 'DAT' ? 'Hoàn thành' : 'Không hoàn thành'}</b>. Sinh viên nhận
          thông báo NT-14 và xem được kết quả sau khi gửi phiếu TTTN-08b (BR-12.5). Không hoàn tác được.
        </p>
      </ConfirmDialog>
    </div>
  );
}
