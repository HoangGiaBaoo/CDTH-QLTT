import { useEffect, useState } from 'react';
import { termApi } from '../api/terms';
import { NHAN_TRANG_THAI_DOT } from '../utils/constants';
import type { Dot } from '../types/term';

/**
 * Danh sách đợt + đợt đang chọn cho các màn chấm / kết quả. Mặc định đợt Đang thực hiện, không có thì đợt mới nhất.
 * Đợt Khởi tạo chưa có gì để chấm nên bỏ khỏi danh sách.
 */
export function useTermPicker() {
  const [dsDot, setDsDot] = useState<Dot[]>([]);
  const [termId, setTermId] = useState<number>();
  const [loi, setLoi] = useState<unknown>(null);

  useEffect(() => {
    termApi.danhSach()
      .then((ds) => {
        const coDuLieu = ds.filter((d) => d.trangThai !== 'KHOI_TAO');
        setDsDot(coDuLieu);
        setTermId((coDuLieu.find((d) => d.trangThai === 'DANG_THUC_HIEN') ?? coDuLieu[0])?.id);
      })
      .catch(setLoi);
  }, []);

  return { dsDot, termId, setTermId, loi, dot: dsDot.find((d) => d.id === termId) };
}

/** Ô chọn đợt dùng chung cho các màn chấm / tổ / kết quả / thống kê. */
export default function TermSelect({ dsDot, termId, onChange }: {
  dsDot: Dot[];
  termId?: number;
  onChange: (id: number) => void;
}) {
  return (
    <label className="field field-inline">
      <span>Đợt thực tập</span>
      <select value={termId ?? ''} onChange={(e) => onChange(Number(e.target.value))} disabled={dsDot.length === 0}>
        {dsDot.length === 0 && <option value="">Chưa có đợt</option>}
        {dsDot.map((d) => (
          <option key={d.id} value={d.id}>{d.maDot} — {NHAN_TRANG_THAI_DOT[d.trangThai]}</option>
        ))}
      </select>
    </label>
  );
}
