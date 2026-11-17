import { useState } from 'react';
import { feedbackApi } from '../../api/feedbacks';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { MUC_DAT, TIEU_CHI_08A } from './bieuMau';
import MucDoChon from './MucDoChon';
import type { PhanHoi } from '../../types/feedback';

interface Props {
  hoSoId: number;
  tenSinhVien: string;
  onDaGui: (p: PhanHoi, message?: string) => void;
}

/**
 * Phiếu phản hồi TTTN-08a của cán bộ hướng dẫn tại ĐVHD (#96): mục 1 sáu tiêu chí mức 0–4 kèm nhận xét, mục 2 ý kiến
 * bổ sung. Mỗi hồ sơ một phiếu, gửi xong không sửa được; backend kiểm đủ sáu tiêu chí và đúng cán bộ của sinh viên.
 */
export default function Form08a({ hoSoId, tenSinhVien, onDaGui }: Props) {
  const [muc, setMuc] = useState<Record<number, number>>({});
  const [nhanXet, setNhanXet] = useState<Record<number, string>>({});
  const [yKien, setYKien] = useState('');
  const [daBam, setDaBam] = useState(false);
  const [hoi, setHoi] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<unknown>(null);

  const thieu = TIEU_CHI_08A.map((_, i) => i + 1).filter((stt) => muc[stt] == null);

  const gui = async () => {
    setDangGui(true);
    setLoi(null);
    try {
      const { data, message } = await feedbackApi.gui({
        hoSoId,
        loai: 'TTTN_08A',
        yKienMo: yKien.trim() || undefined,
        phieu08a: {
          tieuChi: TIEU_CHI_08A.map((_, i) => ({ stt: i + 1, muc: muc[i + 1], nhanXet: nhanXet[i + 1]?.trim() || undefined })),
        },
      });
      setHoi(false);
      onDaGui(data, message);
    } catch (e) {
      setHoi(false);
      setLoi(e);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <form id="ph-08a" onSubmit={(e) => { e.preventDefault(); setDaBam(true); setLoi(null); if (thieu.length === 0) setHoi(true); }} noValidate>
      <section className="card mb" aria-labelledby="ph-08a-1">
        <h2 id="ph-08a-1" className="the-tieu-de">1. Mức độ đáp ứng về năng lực và thái độ làm việc</h2>
        {TIEU_CHI_08A.map((tc, i) => {
          const stt = i + 1;
          return (
            <div key={stt} className="ph-dong">
              <div className="ph-noi-dung"><span className="ph-stt">{stt}.</span> {tc}</div>
              <MucDoChon cacMuc={MUC_DAT} value={muc[stt]} nhan={`Mức độ đạt: ${tc}`} loi={daBam && muc[stt] == null}
                         onChange={(m) => setMuc((x) => ({ ...x, [stt]: m }))} />
              <input className="ph-o" aria-label={`Nhận xét: ${tc}`} placeholder="Nhận xét (không bắt buộc)" maxLength={1000}
                     value={nhanXet[stt] ?? ''} onChange={(e) => setNhanXet((x) => ({ ...x, [stt]: e.target.value }))} />
            </div>
          );
        })}
        <p className="ph-chu-giai">Mức 0: Chưa đạt yêu cầu · 1: Đạt một phần · 2: Đạt yêu cầu · 3: Đạt tốt · 4: Xuất sắc</p>
        <label className="field mt">
          <span>2. Ý kiến bổ sung của Đơn vị hướng dẫn</span>
          <textarea rows={3} maxLength={4000} value={yKien} onChange={(e) => setYKien(e.target.value)} />
        </label>
      </section>

      {daBam && thieu.length > 0 && (
        <div className="alert alert-vang mb" role="alert">Còn tiêu chí chưa chọn mức độ đạt: {thieu.join(', ')}.</div>
      )}
      <ErrorAlert error={loi} />
      <div className="form-actions">
        <button type="submit" className="btn btn-chinh" disabled={dangGui}>Gửi phiếu TTTN-08a</button>
      </div>

      <ConfirmDialog mo={hoi} tieuDe="Gửi phiếu phản hồi TTTN-08a?" nhanXacNhan="Gửi phiếu" dangXuLy={dangGui}
                     onXacNhan={() => void gui()} onHuy={() => setHoi(false)}>
        <p>Phiếu phản hồi của Đơn vị hướng dẫn đối với sinh viên <b>{tenSinhVien}</b>.</p>
        <p>Phiếu gửi xong không sửa được và là minh chứng bắt buộc khi xét công nhận học phần (Điều 15 khoản 3 điểm d).</p>
      </ConfirmDialog>
    </form>
  );
}
