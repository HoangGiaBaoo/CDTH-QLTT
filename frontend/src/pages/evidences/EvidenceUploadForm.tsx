import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { evidenceApi } from '../../api/evidences';
import ErrorAlert from '../../components/ErrorAlert';
import { dungLuong } from '../../utils/format';
import { homNayIso, khoangTuan, tuanCua } from '../../utils/lich';
import { kiemTep, LOI_TEP } from '../../utils/tepTaiLen';
import type { MinhChung } from '../../types/evidence';
import type { Dot } from '../../types/term';

/** Giống `FileStorageService.DUOI_MINH_CHUNG` (CBR-24). */
const DUOI_CHO_PHEP = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4'];
const MO_TA_DUOI = 'pdf, doc, docx, xls, xlsx, jpg, png, mp4';

export interface LoaiTaiLen {
  ma: string;
  ten: string;
  /** Loại bắt buộc của hình thức thực tập mà hồ sơ chưa có tệp nào. */
  thieu?: boolean;
}

interface Props {
  hoSoId: number;
  dot: Dot;
  loai: LoaiTaiLen[];
  loaiChon: string;
  onDoiLoai: (ma: string) => void;
  onDaTai: (m: MinhChung, message?: string) => void;
  /** Lời nhắc dưới tiêu đề (ví dụ hình thức chỉ có minh chứng do hệ thống ghi nhận). */
  ghiChu?: string;
}

/** UC07 bước 4–5 — sinh viên chọn loại minh chứng, tuần liên quan và tệp; #66 lưu tệp kèm người tải và thời điểm. */
export default function EvidenceUploadForm({ hoSoId, dot, loai, loaiChon, onDoiLoai, onDaTai, ghiChu }: Props) {
  const tuanNay = tuanCua(dot, homNayIso());
  const [tuan, setTuan] = useState(tuanNay >= 1 && tuanNay <= dot.soTuan ? String(tuanNay) : '');
  const [tep, setTep] = useState<File | null>(null);
  const [loiTep, setLoiTep] = useState<string>();
  const [loi, setLoi] = useState<unknown>(null);
  const [dangTai, setDangTai] = useState(false);
  const [tienDo, setTienDo] = useState(0);
  // Đổi key để xóa tệp đã chọn trên <input type="file"> sau khi tải xong.
  const [khoaO, setKhoaO] = useState(0);

  const chonTep = (f: File | null) => {
    setLoi(null);
    setTep(f);
    setLoiTep(f ? kiemTep(f, DUOI_CHO_PHEP, MO_TA_DUOI) : undefined);
  };

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    if (!tep) {
      setLoiTep('Chưa chọn tệp minh chứng.');
      return;
    }
    if (loiTep) return;
    setDangTai(true);
    setTienDo(0);
    try {
      const { data, message } = await evidenceApi.taiLen(
        { recordId: hoSoId, type: loaiChon, week: tuan ? Number(tuan) : undefined, file: tep }, setTienDo);
      setTep(null);
      setKhoaO((k) => k + 1);
      onDaTai(data, message);
    } catch (err) {
      if (err instanceof ApiError && LOI_TEP.has(err.code)) setLoiTep(err.message);
      else setLoi(err);
    } finally {
      setDangTai(false);
    }
  };

  const loaiDangChon = loai.find((l) => l.ma === loaiChon);

  return (
    <form id="mc-tai-len" className="card mb" onSubmit={(e) => void gui(e)} noValidate>
      <h2 className="section-title mt0">Tải lên minh chứng</h2>
      {ghiChu && <p className="muted small mc-ghi-chu">{ghiChu}</p>}
      <ErrorAlert error={loi} />
      <div className="mc-form">
        <label className="field">
          <span>Loại minh chứng *</span>
          <select value={loaiChon} disabled={dangTai} onChange={(e) => onDoiLoai(e.target.value)}>
            {loai.map((l) => (
              <option key={l.ma} value={l.ma}>{l.ten}{l.thieu ? ' (bắt buộc, chưa có)' : ''}</option>
            ))}
          </select>
          {loaiDangChon?.ma === 'KHAC' && (
            <small className="muted">Không thuộc danh mục bắt buộc — không làm thay đổi bảng đối chiếu.</small>
          )}
        </label>
        <label className="field">
          <span>Tuần liên quan</span>
          <select value={tuan} disabled={dangTai} onChange={(e) => setTuan(e.target.value)}>
            <option value="">Không gắn tuần</option>
            {Array.from({ length: dot.soTuan }, (_, i) => i + 1).map((t) => (
              <option key={t} value={t}>Tuần {t} ({khoangTuan(dot, t)}){t === tuanNay ? ' — tuần này' : ''}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field mt">
        <span>Tệp *</span>
        <input key={khoaO} id="mc-tep" type="file" disabled={dangTai} className={loiTep ? 'input-loi' : undefined}
               accept={DUOI_CHO_PHEP.map((d) => `.${d}`).join(',')}
               onChange={(e) => chonTep(e.target.files?.[0] ?? null)} />
        {tep && !loiTep && <small className="muted">{tep.name} · {dungLuong(tep.size)}</small>}
        {loiTep && <small className="field-error" role="alert">{loiTep}</small>}
        <small className="muted">Tối đa 20 MB; pdf, doc, docx, xls, xlsx, jpg, png, mp4.</small>
      </label>
      {dangTai && (
        <div className="tai-len-tien-do mt" role="status">
          <div className="meter-ray"><div className="meter-dat" style={{ width: `${tienDo}%` }} /></div>
          <span className="small muted">Đang tải lên {tienDo}%</span>
        </div>
      )}
      <div className="form-actions mt">
        <button type="submit" className="btn btn-chinh" disabled={dangTai || !!loiTep}>
          {dangTai ? 'Đang tải lên…' : 'Tải lên'}
        </button>
      </div>
    </form>
  );
}
