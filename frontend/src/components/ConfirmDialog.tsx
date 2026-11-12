import { useEffect, type ReactNode } from 'react';

interface Props {
  mo: boolean;
  tieuDe: string;
  children?: ReactNode;
  nhanXacNhan?: string;
  /** Thao tác không đảo ngược được (nộp phiếu, chuyển trạng thái đợt…) — nút xác nhận màu đỏ. */
  nguyHiem?: boolean;
  dangXuLy?: boolean;
  /** Chưa đủ dữ liệu để xác nhận (ví dụ chưa nhập lý do bắt buộc). */
  khoaXacNhan?: boolean;
  /** false khi nội dung hộp thoại có ô nhập cần được focus trước. */
  tuFocusNut?: boolean;
  /** Hộp thoại chứa form nhiều ô (đề xuất ĐVHD…) — rộng hơn hộp hỏi lại thường. */
  rong?: boolean;
  onXacNhan: () => void;
  onHuy: () => void;
}

/** Hộp thoại hỏi lại trước thao tác khó hoàn tác. Esc hoặc bấm nền để hủy. */
export default function ConfirmDialog({
  mo, tieuDe, children, nhanXacNhan = 'Xác nhận', nguyHiem, dangXuLy, khoaXacNhan, tuFocusNut = true, rong, onXacNhan, onHuy,
}: Props) {
  useEffect(() => {
    if (!mo) return;
    const phim = (e: KeyboardEvent) => { if (e.key === 'Escape' && !dangXuLy) onHuy(); };
    window.addEventListener('keydown', phim);
    return () => window.removeEventListener('keydown', phim);
  }, [mo, dangXuLy, onHuy]);

  if (!mo) return null;
  return (
    <div className="modal-backdrop" onClick={() => !dangXuLy && onHuy()}>
      <div className={`modal${rong ? ' modal-rong' : ''}`} role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-title" className="modal-title">{tieuDe}</h2>
        {children && <div className="modal-body">{children}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-phu" onClick={onHuy} disabled={dangXuLy}>Hủy</button>
          <button type="button" className={`btn ${nguyHiem ? 'btn-do' : 'btn-chinh'}`} onClick={onXacNhan}
                  disabled={dangXuLy || khoaXacNhan} autoFocus={tuFocusNut}>
            {dangXuLy ? 'Đang xử lý…' : nhanXacNhan}
          </button>
        </div>
      </div>
    </div>
  );
}
