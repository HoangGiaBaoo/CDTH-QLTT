import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { reportApi } from '../../api/reports';
import ErrorAlert from '../../components/ErrorAlert';
import { dungLuong, ngay } from '../../utils/format';
import { soNgayTruoc } from '../../utils/lich';
import { kiemTep, LOI_TEP } from '../../utils/tepTaiLen';
import type { BaoCao } from '../../types/report';

/** Giống `FileStorageService.DUOI_BAO_CAO` — báo cáo chỉ nhận pdf, docx (UC11 3a). */
const DUOI_BAO_CAO = ['pdf', 'docx'];

/** Mục II mẫu TTTN-06 — sáu phần nội dung sinh viên tự kiểm trước khi nộp (UC11 bước 1–2). */
const SAU_PHAN = [
  { ten: 'Phần 1. Giới thiệu chung về đơn vị thực tập', goi: 'Lịch sử, cơ cấu tổ chức, lĩnh vực hoạt động, dự án hoặc công trình tham gia.' },
  { ten: 'Phần 2. Mục tiêu và kế hoạch thực tập', goi: 'Mục tiêu học tập cá nhân theo từng CLO; kế hoạch công việc chi tiết theo tuần.' },
  {
    ten: 'Phần 3. Nội dung và kết quả thực tập',
    goi: 'Nhiệm vụ được giao, công việc thực tế; sản phẩm kỹ thuật, bản vẽ, mô hình, báo cáo kỹ thuật, dữ liệu thu thập; kỹ năng và công cụ đã dùng.',
  },
  {
    ten: 'Phần 4. Phân tích, đánh giá và đề xuất',
    goi: 'Nhận xét quy trình, khó khăn, giải pháp; liên hệ lý thuyết với thực tế; kiến nghị cải tiến (nếu có).',
  },
  { ten: 'Phần 5. Tự nhận xét và định hướng nghề nghiệp cá nhân', goi: 'Năng lực bản thân, điểm mạnh / yếu; kế hoạch học tập, nghiên cứu hoặc làm việc.' },
  { ten: 'Phần 6. Kết luận và kiến nghị', goi: 'Tổng kết nội dung, bài học kinh nghiệm; kiến nghị với Nhà trường hoặc ĐVHD (nếu có).' },
];

/** Mục III mẫu TTTN-06 + phần mở đầu của mục II — hiển thị ngay trên màn (quy tắc UC11). */
const YEU_CAU_TRINH_BAY = [
  'Trang bìa (tên Trường, Khoa/Viện, học phần “Thực tập tốt nghiệp”, cơ sở thực tập, thời gian, họ tên), lời cảm ơn, mục lục và danh mục hình / bảng biểu',
  'Tối thiểu 20 trang A4, không kể phụ lục',
  'Times New Roman cỡ 13, giãn dòng 1,5; căn lề 3–2–2–2 cm',
  'Đánh số bảng, hình, tài liệu tham khảo',
  'Trang cuối có phần ký xác nhận của GVHD và cán bộ ĐVHD',
];

interface Props {
  hoSoId: number;
  /** Số của phiên bản sắp tạo — bản cũ vẫn giữ nguyên. */
  phienBanMoi: number;
  /** Hạn nộp báo cáo của đợt (đợt chưa đặt hạn ⇒ ngày kết thúc), cùng mốc backend dùng để gắn Nộp muộn. */
  han: string;
  onDaNop: (b: BaoCao, message?: string) => void;
}

/** UC11 bước 1–5 — tích đủ sáu phần, chọn tệp pdf / docx ≤ 20 MB rồi nộp (#90); backend kiểm lại mọi quy tắc. */
export default function ReportSubmitForm({ hoSoId, phienBanMoi, han, onDaNop }: Props) {
  const [daTich, setDaTich] = useState<boolean[]>(() => SAU_PHAN.map(() => false));
  const [loiTich, setLoiTich] = useState<string>();
  const [tep, setTep] = useState<File | null>(null);
  const [loiTep, setLoiTep] = useState<string>();
  const [loi, setLoi] = useState<unknown>(null);
  const [dangNop, setDangNop] = useState(false);
  const [tienDo, setTienDo] = useState(0);
  // Đổi key để xóa tệp đã chọn trên <input type="file"> sau khi nộp xong.
  const [khoaO, setKhoaO] = useState(0);

  const soDaTich = daTich.filter(Boolean).length;
  const duSauPhan = soDaTich === SAU_PHAN.length;
  const soNgayTre = soNgayTruoc(han);

  const tich = (i: number, v: boolean) => {
    setDaTich((cu) => cu.map((x, j) => (j === i ? v : x)));
    setLoiTich(undefined);
  };

  const chonTep = (f: File | null) => {
    setLoi(null);
    setTep(f);
    setLoiTep(f ? kiemTep(f, DUOI_BAO_CAO) : undefined);
  };

  const gui = async (e: FormEvent) => {
    e.preventDefault();
    setLoi(null);
    const thieuTich = !duSauPhan;
    if (thieuTich) setLoiTich(`Còn ${SAU_PHAN.length - soDaTich} phần chưa tích — hãy kiểm tra báo cáo đủ sáu phần theo mục II mẫu TTTN-06.`);
    if (!tep) setLoiTep('Chưa chọn tệp báo cáo.');
    if (thieuTich || !tep || loiTep) return;
    setDangNop(true);
    setTienDo(0);
    try {
      const { data, message } = await reportApi.nop({ recordId: hoSoId, checklistConfirmed: true, file: tep }, setTienDo);
      setTep(null);
      setKhoaO((k) => k + 1);
      setDaTich(SAU_PHAN.map(() => false));
      onDaNop(data, message);
    } catch (err) {
      if (err instanceof ApiError && LOI_TEP.has(err.code)) setLoiTep(err.message);
      else setLoi(err);
    } finally {
      setDangNop(false);
    }
  };

  return (
    <form id="bc-nop" className="card mb" onSubmit={(e) => void gui(e)} noValidate>
      <div className="card-head">
        <h2 className="section-title mt0">Nộp báo cáo{phienBanMoi > 1 ? ` — phiên bản ${phienBanMoi}` : ''}</h2>
        {phienBanMoi > 1 && <span className="muted small">Các phiên bản trước vẫn được lưu</span>}
      </div>
      {soNgayTre > 0 && (
        <div className="alert alert-vang mb" role="status">
          Đã quá hạn nộp {ngay(han)} {soNgayTre} ngày — vẫn nộp được, nhưng báo cáo bị gắn nhãn Nộp muộn kèm số ngày trễ
          và hiển thị cho GVHD, giáo vụ (UC11 5a).
        </div>
      )}
      <ErrorAlert error={loi} />

      <div className="bc-khung">
        <fieldset className={`bc-sau-phan${loiTich ? ' bc-sau-phan-loi' : ''}`} disabled={dangNop}>
          <legend>
            Kiểm tra sáu phần nội dung (mục II mẫu TTTN-06) *
            <span className={`small ${duSauPhan ? 'ck-dat' : 'muted'}`}> · {soDaTich}/{SAU_PHAN.length}</span>
          </legend>
          {SAU_PHAN.map((p, i) => (
            <label key={p.ten} className="cam-ket">
              <input type="checkbox" checked={daTich[i]} onChange={(e) => tich(i, e.target.checked)} />
              <span><b>{p.ten}</b><span className="muted small bc-goi">{p.goi}</span></span>
            </label>
          ))}
          {loiTich && <small className="field-error" role="alert">{loiTich}</small>}
        </fieldset>

        <div className="bc-yeu-cau">
          <h3>Yêu cầu trình bày (mục III)</h3>
          <ul>
            {YEU_CAU_TRINH_BAY.map((y) => <li key={y}>{y}</li>)}
          </ul>
        </div>
      </div>

      <label className="field mt">
        <span>Tệp báo cáo *</span>
        <input key={khoaO} id="bc-tep" type="file" disabled={dangNop} className={loiTep ? 'input-loi' : undefined}
               accept=".pdf,.docx" onChange={(e) => chonTep(e.target.files?.[0] ?? null)} />
        {tep && !loiTep && <small className="muted">{tep.name} · {dungLuong(tep.size)}</small>}
        {loiTep && <small className="field-error" role="alert">{loiTep}</small>}
        <small className="muted">Chỉ pdf hoặc docx, tối đa 20 MB (CBR-24).</small>
      </label>
      {dangNop && (
        <div className="tai-len-tien-do mt" role="status">
          <div className="meter-ray"><div className="meter-dat" style={{ width: `${tienDo}%` }} /></div>
          <span className="small muted">Đang tải lên {tienDo}%</span>
        </div>
      )}
      <div className="form-actions mt">
        <button type="submit" className="btn btn-chinh" disabled={dangNop || !!loiTep}>
          {dangNop ? 'Đang nộp…' : 'Nộp báo cáo'}
        </button>
      </div>
    </form>
  );
}
