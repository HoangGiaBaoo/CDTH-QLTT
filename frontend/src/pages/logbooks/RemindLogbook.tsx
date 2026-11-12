import { useState } from 'react';
import { progressApi } from '../../api/progress';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import type { NhacNho } from '../../types/progress';
import { ngay } from '../../utils/format';

export interface KetQuaNhac {
  message?: string;
  ds: NhacNho[];
}

/**
 * Luồng thay thế UC07 — GVHD nhắc SV chưa ghi nhật ký (#60, NT-09). Không truyền `hoSo` ⇒ mọi SV đang thực tập của GV.
 * Ai "quá 5 ngày" do backend lọc; trang cha hiện kết quả bằng `KetQuaNhacNho` (rỗng ⇒ lời backend, không phải lỗi).
 */
export default function RemindLogbook({ hoSo, onXong }: {
  hoSo?: { id: number; hoTen: string };
  onXong: (kq: KetQuaNhac) => void;
}) {
  const [mo, setMo] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<unknown>(null);

  const gui = async () => {
    setDangGui(true);
    setLoi(null);
    try {
      const { data, message } = await progressApi.nhacNho(hoSo ? [hoSo.id] : undefined);
      setMo(false);
      onXong({ message, ds: data });
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-phu" onClick={() => { setLoi(null); setMo(true); }}>Nhắc ghi nhật ký</button>
      <ConfirmDialog
        mo={mo}
        tieuDe={hoSo ? `Nhắc ${hoSo.hoTen} ghi nhật ký?` : 'Nhắc sinh viên ghi nhật ký?'}
        nhanXacNhan="Gửi nhắc nhở"
        dangXuLy={dangGui}
        onXacNhan={() => void gui()}
        onHuy={() => setMo(false)}
      >
        <p className="mt0">
          {hoSo ? 'Nếu sinh viên' : 'Các sinh viên Đang thực tập bạn hướng dẫn'} đã quá 5 ngày chưa cập nhật nhật ký
          {hoSo ? ' thì sẽ' : ' sẽ'} nhận thông báo nhắc ghi nhật ký hằng ngày (Điều 19 khoản 1 điểm c). Hệ thống tự xác
          định ai cần nhắc.
        </p>
        <ErrorAlert error={loi} />
      </ConfirmDialog>
    </>
  );
}

/** Kết quả #60: lời backend + (khi nhắc cả danh sách) những SV đã được nhắc. */
export function KetQuaNhacNho({ kq, lietKe }: { kq: KetQuaNhac | null; lietKe?: boolean }) {
  if (!kq) return null;
  return (
    <div className={`alert ${kq.ds.length ? 'alert-xanh' : 'alert-xanh-duong'} mb`} role="status">
      {kq.message}
      {lietKe && kq.ds.length > 0 && (
        <ul className="nhac-ds">
          {kq.ds.map((n) => (
            <li key={n.hoSoId}>
              {n.hoTen} ({n.maSv}) — {n.ngayGhiCuoi ? `ghi lần cuối ${ngay(n.ngayGhiCuoi)}` : 'chưa ghi lần nào'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
