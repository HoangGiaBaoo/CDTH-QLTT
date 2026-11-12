import { useState } from 'react';
import { ApiError } from '../../api/client';
import { resultApi } from '../../api/results';
import ErrorAlert from '../../components/ErrorAlert';
import type { BangTongHop } from '../../types/result';

interface Props {
  recordId: number;
  bang: BangTongHop;
  onDaLuu: (bang: BangTongHop, message?: string) => void;
}

/**
 * Mục V — GVHD rà soát TTTN-07, nhập nhận xét và đề xuất điểm thưởng (#85, UC10 bước 8, CBR-21).
 * Trần điểm thưởng do backend kiểm (Điều 18 khoản 4) — giao diện không chặn trước để thông điệp trích đúng điều khoản.
 */
export default function ReviewForm({ recordId, bang, onDaLuu }: Props) {
  const [nhanXet, setNhanXet] = useState(bang.nhanXetGvhd ?? '');
  const [thuong, setThuong] = useState(bang.diemThuong > 0 ? String(bang.diemThuong) : '');
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const luu = async () => {
    setLoi(null);
    setDangGui(true);
    try {
      const { data, message } = await resultApi.nhanXet(recordId, {
        nhanXet: nhanXet.trim(),
        diemThuong: thuong.trim() === '' ? null : Number(thuong.replace(',', '.')),
      });
      onDaLuu(data, message);
    } catch (e) {
      setLoi(e);
    } finally {
      setDangGui(false);
    }
  };

  const loiNhanXet = loi instanceof ApiError ? loi.loiTruong('nhanXet') : undefined;
  const loiThuong = loi instanceof ApiError ? loi.loiTruong('diemThuong') : undefined;

  return (
    <div className="form">
      <label className="field">
        <span>Nhận xét của GVHD *</span>
        <textarea className={`textarea${loiNhanXet ? ' input-loi' : ''}`} rows={5} maxLength={4000} value={nhanXet}
                  placeholder="Nhận xét về năng lực, thái độ và kết quả thực tập của sinh viên…"
                  onChange={(e) => setNhanXet(e.target.value)} />
        {loiNhanXet && <span className="field-error">{loiNhanXet}</span>}
      </label>
      <label className="field field-diem">
        <span>Đề xuất điểm thưởng</span>
        <input type="number" className={`input-so${loiThuong ? ' input-loi' : ''}`} min={0} step={0.1} value={thuong}
               placeholder="0" onChange={(e) => setThuong(e.target.value)} />
        {loiThuong && <span className="field-error">{loiThuong}</span>}
      </label>
      <p className="hint mt0">
        Điểm thưởng cho thành tích nổi bật, tối đa theo Điều 18 khoản 4; để trống nếu không đề xuất. Đổi điểm thưởng thì
        hệ thống tính lại điểm học phần (chặn trần 10) và ghi nhật ký. Giáo vụ duyệt mức thưởng khi xác nhận.
      </p>
      {loi && !loiNhanXet && !loiThuong ? <ErrorAlert error={loi} /> : null}
      <div className="form-actions mt0">
        <button className="btn btn-chinh" onClick={() => void luu()} disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : 'Lưu nhận xét'}
        </button>
      </div>
    </div>
  );
}
