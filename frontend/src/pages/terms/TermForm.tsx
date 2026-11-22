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
/** Điều 5 khoản 1 — backend kiểm lại (DotThucTapService.kiemThoiLuong); ở đây chỉ để điền sẵn và báo sớm. */
const SO_TUAN = 8;

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

/** Ngày kết thúc để đợt dài đúng 8 tuần: bắt đầu thứ Hai ⇒ kết thúc Chủ nhật tuần thứ 8. */
function ketThucDuTuan(batDau: string): string {
  return congNgay(batDau, SO_TUAN * 7 - 1);
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
  // Form tạo: chọn ngày bắt đầu thì tự điền ngày kết thúc đủ 8 tuần, cho tới khi giáo vụ tự sửa ngày kết thúc.
  // Form sửa không tự đổi, vì đổi ngày kết thúc ở đó là gia hạn (Điều 15 khoản 4).
  const [tuDienKetThuc, setTuDienKetThuc] = useState(!dot);

  const dat = <K extends keyof TaoDotRequest>(k: K, v: TaoDotRequest[K]) => setF((x) => ({ ...x, [k]: v }));
  const doiBatDau = (v: string) =>
    setF((x) => ({ ...x, ngayBatDau: v, ngayKetThuc: tuDienKetThuc && v ? ketThucDuTuan(v) : x.ngayKetThuc }));
  const doiKetThuc = (v: string) => {
    setTuDienKetThuc(false);
    dat('ngayKetThuc', v);
  };
  const datDuTuan = () => {
    setTuDienKetThuc(!dot);
    dat('ngayKetThuc', ketThucDuTuan(f.ngayBatDau));
  };
  const loiTruong = (t: string) => (loi instanceof ApiError ? loi.loiTruong(t) : undefined);
  const moc = xemTruocMoc(f.ngayBatDau, f.ngayKetThuc);
  const doiMoc = dot && (dot.ngayBatDau !== f.ngayBatDau || dot.ngayKetThuc !== f.ngayKetThuc);
  // Tạo đợt: đúng 8 tuần. Sửa đợt: dài hơn là gia hạn, chỉ chặn ngắn hơn.
  const saiThoiLuong = moc && (dot ? moc.soTuan < SO_TUAN : moc.soTuan !== SO_TUAN);
  const giaHan = moc && dot && moc.soTuan > SO_TUAN;

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

  const o = (k: keyof TaoDotRequest, nhan: string, props: Record<string, unknown> = {},
             doi: (v: string) => void = (v) => dat(k, v)) => (
    <label className="field">
      <span>{nhan}</span>
      <input value={f[k] ?? ''} onChange={(e) => doi(e.target.value)} {...props} />
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
        {o('ngayBatDau', 'Ngày bắt đầu *', { type: 'date' }, doiBatDau)}
        {o('ngayKetThuc', 'Ngày kết thúc *', { type: 'date', min: f.ngayBatDau ? congNgay(f.ngayBatDau, 1) : undefined },
          doiKetThuc)}
        {o('hanNopBaoCao', 'Hạn nộp báo cáo', { type: 'date', min: f.ngayBatDau || undefined })}
      </div>

      {saiThoiLuong && moc ? (
        <div className="hint hint-loi">
          Đợt thực tập {dot ? 'không được ngắn hơn' : 'kéo dài đúng'} {SO_TUAN} tuần (Điều 5 khoản 1); khoảng đang chọn
          là <b>{moc.soTuan} tuần</b>.{' '}
          <button type="button" className="btn btn-phu btn-nho" onClick={datDuTuan}>
            Đặt ngày kết thúc {ngay(ketThucDuTuan(f.ngayBatDau))} ({SO_TUAN} tuần)
          </button>
        </div>
      ) : moc ? (
        <div className="hint">
          Thời lượng <b>{moc.soTuan} tuần</b>{giaHan && ' (gia hạn — Điều 15 khoản 4)'} · Chặng 1 mở{' '}
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
