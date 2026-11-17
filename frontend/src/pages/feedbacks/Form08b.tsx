import { useEffect, useMemo, useRef, useState } from 'react';
import { feedbackApi } from '../../api/feedbacks';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { diem } from '../../utils/format';
import { CAM_KET_08B, CAU_TU_LUAN_08B, CHAT_LUONG_08B, MUC_DAT, MUC_HAI_LONG } from './bieuMau';
import BangHpSelf from './BangHpSelf';
import MucDoChon from './MucDoChon';
import type { HpSelf, PhanHoi, TuDanhGiaClo, TuLuan } from '../../types/feedback';

interface Props {
  hoSoId: number;
  onDaGui: (p: PhanHoi, message?: string) => void;
}

/**
 * Phiếu phản hồi TTTN-08b của sinh viên (#96): A đánh giá chất lượng (mức hài lòng 1–5), B tự đánh giá 7 CLO
 * (mức 0–4 + minh chứng bản thân), C bốn câu tự thân, D HPself tính thử bằng #95 mỗi khi đổi mức (BR-12.3),
 * II cam kết. Kiểm đủ ở client để chỉ chỗ thiếu; backend kiểm lại và trả một thông điệp gộp nếu còn thiếu.
 */
export default function Form08b({ hoSoId, onDaGui }: Props) {
  const [hp, setHp] = useState<HpSelf | null>(null);
  const [loiTai, setLoiTai] = useState<unknown>(null);
  const [haiLong, setHaiLong] = useState<Record<number, number>>({});
  const [ghiChu, setGhiChu] = useState<Record<number, string>>({});
  const [yKienKhac, setYKienKhac] = useState('');
  const [yKienMo, setYKienMo] = useState('');
  const [muc, setMuc] = useState<Record<string, number>>({});
  const [minhChung, setMinhChung] = useState<Record<string, string>>({});
  const [tuLuan, setTuLuan] = useState<TuLuan>({});
  const [camKet, setCamKet] = useState(false);
  const [daBam, setDaBam] = useState(false);
  const [hoi, setHoi] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loiGui, setLoiGui] = useState<unknown>(null);
  const [dangTinh, setDangTinh] = useState(false);
  const lanTinh = useRef(0);

  // Danh sách rỗng ⇒ #95 trả đủ CLO của đợt (mã, tên, α) để dựng phần B và D.
  useEffect(() => {
    feedbackApi.xemTruocHpSelf(hoSoId, []).then(setHp).catch(setLoiTai);
  }, [hoSoId]);

  const tuDanhGia = useMemo<TuDanhGiaClo[]>(
    () => (hp?.cacClo ?? []).map((c) => ({ maClo: c.maClo, muc: muc[c.maClo] ?? null, minhChung: minhChung[c.maClo] || undefined })),
    [hp?.cacClo, muc, minhChung],
  );

  // Tính lại HPself khi đổi mức (chờ 250 ms cho lần bấm cuối); chỉ nhận kết quả của lần gọi mới nhất.
  const chuoiMuc = JSON.stringify(muc);
  useEffect(() => {
    if (!hp || Object.keys(muc).length === 0) return;
    const lan = ++lanTinh.current;
    setDangTinh(true);
    const t = setTimeout(() => {
      feedbackApi.xemTruocHpSelf(hoSoId, Object.entries(muc).map(([maClo, m]) => ({ maClo, muc: m })))
        .then((kq) => { if (lan === lanTinh.current) setHp(kq); })
        .catch((e) => { if (lan === lanTinh.current) setLoiGui(e); })
        .finally(() => { if (lan === lanTinh.current) setDangTinh(false); });
    }, 250);
    return () => clearTimeout(t);
  }, [hoSoId, chuoiMuc]); // muc đã gói trong chuoiMuc; không theo dõi hp vì chính hiệu ứng này đặt lại hp

  if (loiTai) return <ErrorAlert error={loiTai} />;
  if (!hp) return <Loading />;

  const thieuA = CHAT_LUONG_08B.map((_, i) => i + 1).filter((stt) => haiLong[stt] == null);
  const thieuClo = hp.cacClo.filter((c) => muc[c.maClo] == null).map((c) => c.maClo);
  const thieuC = CAU_TU_LUAN_08B.map((c, i) => (tuLuan[c.khoa]?.trim() ? 0 : i + 1)).filter(Boolean);
  const conThieu = [
    thieuA.length && `phần A nội dung ${thieuA.join(', ')}`,
    thieuClo.length && `phần B ${thieuClo.join(', ')}`,
    thieuC.length && `phần C câu ${thieuC.join(', ')}`,
    !camKet && 'cam kết ở mục II',
  ].filter(Boolean) as string[];

  const bamGui = () => {
    setDaBam(true);
    setLoiGui(null);
    if (conThieu.length === 0) setHoi(true);
  };

  const gui = async () => {
    setDangGui(true);
    setLoiGui(null);
    try {
      const { data, message } = await feedbackApi.gui({
        hoSoId,
        loai: 'TTTN_08B',
        yKienMo: yKienMo.trim() || undefined,
        phieu08b: {
          chatLuong: CHAT_LUONG_08B.map((_, i) => ({ stt: i + 1, mucHaiLong: haiLong[i + 1], ghiChu: ghiChu[i + 1]?.trim() || undefined })),
          yKienKhac: yKienKhac.trim() || undefined,
          tuDanhGia,
          tuLuan,
          camKet,
        },
      });
      setHoi(false);
      onDaGui(data, message);
    } catch (e) {
      setHoi(false);
      setLoiGui(e);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <form id="ph-08b" onSubmit={(e) => { e.preventDefault(); bamGui(); }} noValidate>
      <section className="card mb" aria-labelledby="ph-a">
        <h2 id="ph-a" className="the-tieu-de">A. Đánh giá chất lượng đợt thực tập</h2>
        <p className="ph-chu-giai mt0">
          Phần A chỉ bạn xem được; Khoa tổng hợp ẩn danh để cải tiến học phần, giảng viên và cán bộ ĐVHD không thấy câu
          trả lời của bạn.
        </p>
        <h3 className="tieu-de-nho">1. Đánh giá về chất lượng hướng dẫn và tổ chức thực tập</h3>
        {CHAT_LUONG_08B.map((nd, i) => {
          const stt = i + 1;
          return (
            <div key={stt} className="ph-dong">
              <div className="ph-noi-dung"><span className="ph-stt">{stt}.</span> {nd}</div>
              <MucDoChon cacMuc={MUC_HAI_LONG} value={haiLong[stt]} nhan={`Mức hài lòng: ${nd}`} loi={daBam && haiLong[stt] == null}
                         onChange={(m) => setHaiLong((x) => ({ ...x, [stt]: m }))} />
              <input className="ph-o" aria-label={`Ghi chú: ${nd}`} placeholder="Ghi chú (không bắt buộc)" maxLength={1000}
                     value={ghiChu[stt] ?? ''} onChange={(e) => setGhiChu((x) => ({ ...x, [stt]: e.target.value }))} />
            </div>
          );
        })}
        <p className="ph-chu-giai">Mức 1: Rất không hài lòng · 2: Không hài lòng · 3: Chấp nhận được · 4: Hài lòng · 5: Rất hài lòng</p>
        <label className="field mt">
          <span>Các ý kiến khác</span>
          <textarea rows={2} maxLength={2000} value={yKienKhac} onChange={(e) => setYKienKhac(e.target.value)} />
        </label>
        <label className="field mt">
          <span>2. Phản hồi mở và đề xuất cải tiến</span>
          <textarea rows={3} maxLength={4000} value={yKienMo} onChange={(e) => setYKienMo(e.target.value)} />
        </label>
      </section>

      <section className="card mb" aria-labelledby="ph-b">
        <h2 id="ph-b" className="the-tieu-de">B. Bảng tự đánh giá CLO</h2>
        <p className="ph-chu-giai mt0">
          Tự đánh giá mức độ đạt chuẩn đầu ra của bản thân; ghi rõ minh chứng (sản phẩm, nhật ký, hoạt động). Mức tự đánh
          giá không ảnh hưởng điểm chính thức.
        </p>
        {hp.cacClo.map((c) => (
          <div key={c.maClo} className="ph-dong">
            <div className="ph-noi-dung"><b className="ph-ma">{c.maClo}</b> {c.ten}</div>
            <MucDoChon cacMuc={MUC_DAT} value={muc[c.maClo]} nhan={`Mức tự đánh giá ${c.maClo}`} loi={daBam && muc[c.maClo] == null}
                       onChange={(m) => setMuc((x) => ({ ...x, [c.maClo]: m }))} />
            <textarea className="ph-o" rows={2} aria-label={`Minh chứng bản thân ${c.maClo}`} maxLength={1000}
                      placeholder="Minh chứng bản thân (không bắt buộc)"
                      value={minhChung[c.maClo] ?? ''} onChange={(e) => setMinhChung((x) => ({ ...x, [c.maClo]: e.target.value }))} />
          </div>
        ))}
        <p className="ph-chu-giai">Mức 0: Chưa đạt yêu cầu · 1: Đạt một phần · 2: Đạt yêu cầu · 3: Đạt tốt · 4: Xuất sắc</p>
      </section>

      <section className="card mb" aria-labelledby="ph-c">
        <h2 id="ph-c" className="the-tieu-de">C. Những trao đổi tự thân</h2>
        <div className="form">
          {CAU_TU_LUAN_08B.map((c, i) => (
            <label key={c.khoa} className="field">
              <span>{i + 1}. {c.cau}</span>
              <textarea rows={3} maxLength={2000} aria-invalid={daBam && !tuLuan[c.khoa]?.trim() || undefined}
                        className={daBam && !tuLuan[c.khoa]?.trim() ? 'input-loi' : undefined}
                        value={tuLuan[c.khoa] ?? ''} onChange={(e) => setTuLuan((x) => ({ ...x, [c.khoa]: e.target.value }))} />
              {daBam && !tuLuan[c.khoa]?.trim() && <small className="field-error">Chưa trả lời câu {i + 1}.</small>}
            </label>
          ))}
        </div>
      </section>

      <section className="card mb" aria-labelledby="ph-d">
        <h2 id="ph-d" className="the-tieu-de">
          D. Tự tính điểm trung bình học phần (tự quy đổi)
          {dangTinh && <span className="muted small ph-dang-tinh">Đang tính…</span>}
        </h2>
        <BangHpSelf hp={hp} />
        {hp.hpSelf == null && (
          <p className="ph-chu-giai">Chọn đủ mức tự đánh giá ở phần B để hệ thống tính HPself — còn {hp.cloConThieu.join(', ')}.</p>
        )}
      </section>

      <section className="card mb" aria-labelledby="ph-ii">
        <h2 id="ph-ii" className="the-tieu-de">II. Cam kết của sinh viên</h2>
        <label className={`ph-cam-ket${daBam && !camKet ? ' ph-cam-ket-loi' : ''}`}>
          <input type="checkbox" checked={camKet} onChange={(e) => setCamKet(e.target.checked)} />
          <span>{CAM_KET_08B}</span>
        </label>
      </section>

      {daBam && conThieu.length > 0 && (
        <div className="alert alert-vang mb" role="alert">Phiếu còn thiếu: {conThieu.join('; ')}.</div>
      )}
      <ErrorAlert error={loiGui} />
      <div className="form-actions">
        <button type="submit" className="btn btn-chinh" disabled={dangGui}>Gửi phiếu TTTN-08b</button>
      </div>

      <ConfirmDialog mo={hoi} tieuDe="Gửi phiếu phản hồi TTTN-08b?" nhanXacNhan="Gửi phiếu" dangXuLy={dangGui || dangTinh}
                     onXacNhan={() => void gui()} onHuy={() => setHoi(false)}>
        <p>Điểm học phần tự đánh giá (HPself): <b>{diem(hp.hpSelf)}</b>.</p>
        <p>Phiếu gửi xong không sửa được. Sau khi kết quả chính thức được công bố, hệ thống so sánh phần tự đánh giá với
          kết quả để tính chỉ số tự nhận thức năng lực.</p>
      </ConfirmDialog>
    </form>
  );
}
