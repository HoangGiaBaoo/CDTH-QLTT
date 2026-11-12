import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { recordApi } from '../../api/records';
import { resultApi } from '../../api/results';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { NHAN_CHUONG_TRINH, NHAN_TRANG_THAI_HO_SO } from '../../utils/constants';
import { diem, ngay, phanTram } from '../../utils/format';
import type { HoSo } from '../../types/record';
import type { KetQuaSinhVien } from '../../types/result';
import CloRadar from './CloRadar';
import RecognitionConditions from './RecognitionConditions';

/** Đường dẫn SCR-23 (phản hồi 08b, màn của người B). */
const SCR_23 = '/my-record/feedback';

/**
 * SCR-24 — kết quả học phần của sinh viên (#83 dạng rút gọn, UC13). Không có điểm từng người chấm hay điểm từng
 * chặng: backend không trả các trường đó cho sinh viên. Chưa công bố hoặc chưa gửi 08b (BR-12.5) ⇒ giải thích và dẫn
 * sang SCR-23 (nhánh 3a).
 *
 * @param recordId có khi mở từ thông báo NT-14 (`/results/{id}`); không có thì lấy hồ sơ hiện tại (#40).
 */
export default function MyResultPage({ recordId }: { recordId?: number }) {
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [kq, setKq] = useState<KetQuaSinhVien | null>(null);
  const [chuaXem, setChuaXem] = useState<ApiError | null>(null);
  const [loi, setLoi] = useState<unknown>(null);
  const [khongCoHoSo, setKhongCoHoSo] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    setHoSo(null);
    setKq(null);
    setChuaXem(null);
    setLoi(null);
    setKhongCoHoSo(false);
    (async () => {
      let h: HoSo;
      try {
        h = recordId ? await recordApi.chiTiet(recordId) : await recordApi.cuaToi();
      } catch (e) {
        if (!conHieuLuc) return;
        if (e instanceof ApiError && e.code === 'RESOURCE_NOT_FOUND' && !recordId) setKhongCoHoSo(true);
        else setLoi(e);
        return;
      }
      if (!conHieuLuc) return;
      setHoSo(h);
      try {
        const x = await resultApi.cuaSinhVien(h.id);
        if (conHieuLuc) setKq(x);
      } catch (e) {
        if (!conHieuLuc) return;
        // BR-12.5: chưa công bố / chưa gửi 08b là trạng thái chờ, không phải lỗi hệ thống.
        if (e instanceof ApiError && e.code === 'BUSINESS_RULE_VIOLATION') setChuaXem(e);
        else setLoi(e);
      }
    })();
    return () => { conHieuLuc = false; };
  }, [recordId]);

  const tieuDe = <h1 className="page-title">Kết quả của tôi</h1>;

  if (khongCoHoSo) {
    return (
      <div>
        <div className="page-head">{tieuDe}</div>
        <div className="card empty">
          <div className="empty-title">Bạn chưa có hồ sơ thực tập nào</div>
          <div className="muted">Kết quả học phần hiện ở đây sau khi đợt thực tập kết thúc và được công bố.</div>
          <Link className="btn btn-chinh" to="/my-record">Đăng ký thực tập</Link>
        </div>
      </div>
    );
  }
  if (loi) return <div><div className="page-head">{tieuDe}</div><ErrorAlert error={loi} /></div>;
  if (!hoSo || (!kq && !chuaXem)) return <Loading />;

  const dauTrang = (
    <div className="page-head">
      <h1 className="page-title">
        Kết quả của tôi · {hoSo.dot.ten}
        <StatusBadge value={hoSo.trangThai} labels={NHAN_TRANG_THAI_HO_SO} />
      </h1>
    </div>
  );

  if (chuaXem) {
    return (
      <div>
        {dauTrang}
        <div className="alert alert-vang mb">{chuaXem.message}</div>
        <div className="card">
          <h2 className="section-title mt0">Khi nào xem được kết quả?</h2>
          <p className="mt0">Theo BR-12.5, bạn xem được điểm học phần khi có đủ hai điều kiện:</p>
          <ol className="buoc">
            <li>Giáo vụ Khoa đã <b>công bố</b> kết quả — hệ thống gửi thông báo NT-14 khi công bố.</li>
            <li>Bạn đã <b>gửi phiếu phản hồi TTTN-08b</b> (đánh giá chất lượng đợt thực tập và tự đánh giá 7 CLO).</li>
          </ol>
          <p className="muted">
            Phiếu 08b gửi được ngay cả khi kết quả chưa công bố. Phần tự đánh giá giúp so sánh nhận thức của bạn với kết quả
            chính thức (chỉ số tự nhận thức, BR-12.4).
          </p>
          <div className="form-actions">
            <Link className="btn btn-chinh" to={SCR_23} state={{ tuKetQua: chuaXem.message }}>Đến phiếu phản hồi TTTN-08b</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!kq) return <Loading />;

  const tt = kq.thongTin;
  return (
    <div>
      {dauTrang}

      <div className="kq-tren mb">
        <div className="card hp-the">
          <span className="muted small">Điểm học phần</span>
          <span className="hp-so">{diem(kq.diemHp)}</span>
          <span>{kq.mucHp != null ? `Mức ${kq.mucHp}` : '—'}</span>
          {kq.diemThuong > 0 && <span className="muted small">Đã cộng điểm thưởng {diem(kq.diemThuong)}</span>}
          <span className="muted small mt">Kết luận công nhận hoàn thành</span>
          {kq.ketLuan === 'DAT' ? <span className="ket-luan kl-dat">ĐẠT</span>
            : kq.ketLuan === 'KHONG_DAT' ? <span className="ket-luan kl-khong-dat">KHÔNG ĐẠT</span>
              : <span className="muted">—</span>}
          <div className="info-gon">
            <div><span className="muted">GVHD</span>{tt.giangVienHuongDan ?? '—'}</div>
            <div><span className="muted">Đơn vị</span>{tt.donViHuongDan ?? '—'}</div>
            <div><span className="muted">Chương trình</span>{NHAN_CHUONG_TRINH[tt.chuongTrinh] ?? tt.chuongTrinh}</div>
            <div><span className="muted">Thời gian</span>{ngay(tt.tuNgay)} – {ngay(tt.denNgay)}</div>
          </div>
        </div>
        <div className="card">
          <h2 className="section-title mt0">Điểm 7 chuẩn đầu ra (thang 10)</h2>
          <CloRadar truc={kq.cacClo} />
        </div>
      </div>

      <div className="card mb">
        <h2 className="section-title mt0">Điểm từng chuẩn đầu ra</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead><tr><th>CLO</th><th>Mô tả năng lực đầu ra</th><th className="num">Trọng số</th><th className="num">Điểm</th><th>Mức đạt</th></tr></thead>
            <tbody>
              {kq.cacClo.map((d) => (
                <tr key={d.maClo}>
                  <td className="nowrap"><b>{d.maClo}</b></td>
                  <td>{d.ten}</td>
                  <td className="num">{phanTram(d.alpha)}</td>
                  <td className="num"><b>{diem(d.diemClo)}</b></td>
                  <td>{d.muc != null ? `Mức ${d.muc}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">
          Điểm từng CLO tổng hợp từ phiếu của người hướng dẫn (chặng 1) và Tổ đánh giá (chặng 2) theo Điều 13–14, làm tròn
          0,1 ở bước cuối. Điểm của từng người chấm không hiển thị cho sinh viên.
        </p>
      </div>

      <div className="card mb">
        <h2 className="section-title mt0">Bốn điều kiện công nhận hoàn thành (Điều 15 khoản 3)</h2>
        <RecognitionConditions bang={kq} />
      </div>

      <div className="card mb">
        <h2 className="section-title mt0">Đánh giá theo nhóm năng lực</h2>
        <div className="table-wrap">
          <table className="table table-giua">
            <thead><tr><th>Nhóm năng lực</th><th>Các CLO liên quan</th><th className="num">Điểm trung bình</th><th>Mức đạt</th></tr></thead>
            <tbody>
              {kq.nhomNangLuc.map((n) => (
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

      <div className="card mb">
        <h2 className="section-title mt0">Nhận xét của giảng viên hướng dẫn</h2>
        {kq.nhanXetGvhd ? <p className="pre-line mt0">{kq.nhanXetGvhd}</p> : <p className="muted mt0">Không có nhận xét.</p>}
      </div>

      <p className="hint">
        Chỉ số tự nhận thức năng lực (so sánh phần tự đánh giá trong phiếu 08b với kết quả chính thức) xem ở{' '}
        <Link to={SCR_23}>Phản hồi 08b</Link>.
      </p>
    </div>
  );
}
