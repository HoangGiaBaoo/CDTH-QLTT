import { useState } from 'react';
import { assignmentApi } from '../../api/assignments';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import type { GiangVienHanMuc, PhanCong } from '../../types/assignment';
import LecturerPicker from './LecturerPicker';

/**
 * Luồng thay thế UC05 — đổi GVHD kèm lý do (#51). Backend chặn khi GV cũ đã nộp phiếu đánh giá (phải mở lại phiếu
 * trước) và kiểm hạn mức GV mới; lỗi hiện ngay trong hộp thoại để giáo vụ chọn lại mà không mất lý do đã nhập.
 */
export default function ChangeLecturerDialog({ pc, dsGv, onXong, onHuy }: {
  pc: PhanCong | null;
  dsGv: GiangVienHanMuc[];
  onXong: (message?: string) => void;
  onHuy: () => void;
}) {
  const [gvMoi, setGvMoi] = useState<number>();
  const [lyDo, setLyDo] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<unknown>(null);

  const dong = () => { setGvMoi(undefined); setLyDo(''); setLoi(null); onHuy(); };

  const luu = async () => {
    if (!pc || !gvMoi) return;
    setDangGui(true);
    setLoi(null);
    try {
      const { message } = await assignmentApi.doiGvhd(pc.id, { giangVienId: gvMoi, lyDo: lyDo.trim() });
      setGvMoi(undefined);
      setLyDo('');
      onXong(message);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <ConfirmDialog
      mo={!!pc}
      tieuDe={pc ? `Đổi GVHD của ${pc.hoTenSinhVien}?` : ''}
      nhanXacNhan="Đổi giảng viên"
      rong
      tuFocusNut={false}
      dangXuLy={dangGui}
      khoaXacNhan={!gvMoi || !lyDo.trim()}
      onXacNhan={() => void luu()}
      onHuy={dong}
    >
      {pc && (
        <>
          <p className="mt0">
            Giảng viên hiện tại: <b>{pc.hoTenGiangVien}</b> ({pc.maGv}). Không đổi được nếu giảng viên này đã nộp phiếu
            đánh giá cho sinh viên — giáo vụ cần mở lại phiếu trước. Việc đổi được ghi nhật ký; hai giảng viên và sinh viên
            nhận thông báo.
          </p>
          <ErrorAlert error={loi} />
          <div className="tieu-de-nho mt">Giảng viên mới *</div>
          <div className="gv-ds-cuon">
            <LecturerPicker ds={dsGv} chon={gvMoi} onChon={setGvMoi} soCan={1} ten="gv-moi" boQua={pc.giangVienId} />
          </div>
          <label className="field mt">
            <span>Lý do đổi giảng viên *</span>
            <textarea className="textarea" rows={2} maxLength={500} value={lyDo} onChange={(e) => setLyDo(e.target.value)} />
          </label>
        </>
      )}
    </ConfirmDialog>
  );
}
