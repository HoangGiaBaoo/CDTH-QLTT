import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import ErrorAlert from '../../components/ErrorAlert';
import { ngay } from '../../utils/format';
import type { Dot, TaoDotRequest } from '../../types/term';

interface Props {
  /** Có `dot` ⇒ form sửa (#29, không sửa mã đợt); không có ⇒ form tạo (#28). */
  dot?: Dot;
  onLuu: (req: TaoDotRequest) => Promise<void>;
  onHuy: () => void;
}

const HOC_KY = [['HK1', 'Học kỳ 1'], ['HK2', 'Học kỳ 2'], ['HE', 'Học kỳ hè']];

function namHocMacDinh(): string {
  const d = new Date();
  const nam = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return `${nam}-${nam + 1}`;
}

/** Cộng ngày trên chuỗi yyyy-MM-dd theo UTC để không lệch múi giờ. */
function congNgay(iso: string, soNgay: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + soNgay);
  return d.toISOString().slice(0, 10);
}

/**
 * Xem trước mốc theo đúng cách backend tính (DotThucTapService.datMocChang / tinhSoTuan) — chỉ để giáo vụ
 * kiểm tra trước khi lưu; giá trị chính thức do backend trả về.
 */
function xemTruocMoc(batDau: string, ketThuc: string) {
  if (!batDau || !ketThuc || ketThuc <= batDau) return null;
  const soNgay = (Date.parse(`${ketThuc}T00:00:00Z`) - Date.parse(`${batDau}T00:00:00Z`)) / 86_400_000 + 1;
  return {
    soTuan: Math.floor((soNgay + 6) / 7),
    // Đ10 k2: chặng 1 mở đầu tuần thứ 4; chặng 2 mở ngày liền sau ngày kết thúc thực tập.
    moChang1: congNgay(batDau, 21),
    moChang2: congNgay(ketThuc, 1),
  };
}

export default function TermForm({ dot, onLuu, onHuy }: Props) {
  const [f, setF] = useState<TaoDotRequest>({
    maDot: dot?.maDot ?? '',
    ten: dot?.ten ?? '',
    hocKy: dot?.hocKy ?? 'HK1',
    namHoc: dot?.namHoc ?? namHocMacDinh(),
    khoaVien: dot?.khoaVien ?? 'Khoa Công nghệ thông tin',
    ngayBatDau: dot?.ngayBatDau ?? '',
    ngayKetThuc: dot?.ngayKetThuc ?? '',
    hanNopBaoCao: dot?.hanNopBaoCao ?? '',
  });
  const [loi, setLoi] = useState<unknown>(null);
  const [dangGui, setDangGui] = useState(false);

  const dat = <K extends keyof TaoDotRequest>(k: K, v: TaoDotRequest[K]) => setF((x) => ({ ...x, [k]: v }));
  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);
  const moc = xemTruocMoc(f.ngayBatDau, f.ngayKetThuc);
  const doiMoc = dot && (dot.ngayBatDau !== f.ngayBatDau || dot.ngayKetThuc !== f.ngayKetThuc);

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      // Ô để trống gửi undefined để backend hiểu là "không có", không phải chuỗi rỗng.
      await onLuu({ ...f, khoaVien: f.khoaVien?.trim() || undefined, hanNopBaoCao: f.hanNopBaoCao || undefined });
    } catch (err) {
      setLoi(err);
    } finally {
      setDangGui(false);
    }
  };

  const o = (k: keyof TaoDotRequest, nhan: string, props: Record<string, unknown> = {}) => (
    <label className="field">
      <span>{nhan}</span>
      <input value={f[k] ?? ''} onChange={(e) => dat(k, e.target.value)} {...props} />
      {loiTruong(k) && <small className="field-error">{loiTruong(k)}</small>}
    </label>
  );

  return (
    <form className="form" onSubmit={gui} noValidate>
      <ErrorAlert error={loi} />
      <div className="form-grid">
        {dot ? (
          <label className="field">
            <span>Mã đợt</span>
            <input value={dot.maDot} disabled />
          </label>
        ) : o('maDot', 'Mã đợt *', { placeholder: 'TTTN-2027-HK1', autoFocus: true })}
        {o('ten', 'Tên đợt *', { placeholder: 'Thực tập tốt nghiệp học kỳ 1 năm học 2027–2028' })}
        <label className="field">
          <span>Học kỳ *</span>
          <select value={f.hocKy} onChange={(e) => dat('hocKy', e.target.value)}>
            {HOC_KY.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>
          {loiTruong('hocKy') && <small className="field-error">{loiTruong('hocKy')}</small>}
        </label>
        {o('namHoc', 'Năm học *', { placeholder: '2027-2028' })}
        {o('khoaVien', 'Khoa / Viện')}
        {o('ngayBatDau', 'Ngày bắt đầu *', { type: 'date' })}
        {o('ngayKetThuc', 'Ngày kết thúc *', { type: 'date' })}
        {o('hanNopBaoCao', 'Hạn nộp báo cáo', { type: 'date' })}
      </div>

      {moc ? (
        <div className="hint">
          Thời lượng <b>{moc.soTuan} tuần</b>{moc.soTuan !== 8 && ' (mặc định 8 tuần — Điều 5 khoản 1)'} · Chặng 1 mở{' '}
          <b>{ngay(moc.moChang1)}</b> (đầu tuần 4) · Chặng 2 mở <b>{ngay(moc.moChang2)}</b> (sau ngày kết thúc)
          {doiMoc && <> · Đổi thời gian sẽ tính lại mốc các chặng chưa mở và gửi thông báo tới người liên quan.</>}
        </div>
      ) : f.ngayBatDau && f.ngayKetThuc ? (
        <div className="hint hint-loi">Ngày kết thúc phải sau ngày bắt đầu.</div>
      ) : null}
      {!dot && (
        <div className="hint">
          Hệ thống tự sinh 2 chặng (trọng số 30% / 70%) và sao chép 7 CLO, 35 mức rubric, 13 câu hỏi từ cấu hình mẫu
          QĐ 207 vào đợt mới.
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-phu" onClick={onHuy} disabled={dangGui}>Hủy</button>
        <button className="btn btn-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : dot ? 'Lưu thay đổi' : 'Tạo đợt'}
        </button>
      </div>
    </form>
  );
}
