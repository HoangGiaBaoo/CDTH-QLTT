/**
 * Chữ cố định của biểu mẫu TTTN-08a / TTTN-08b (kèm Quy định QĐ 207) — cùng nội dung với BieuMauPhanHoi.java.
 * Backend tự điền `noiDung` khi lưu; giao diện dùng để dựng form trước khi có dữ liệu.
 */
import type { TuLuan } from '../../types/feedback';

/** TTTN-08a mục 1 — sáu tiêu chí, mức độ đạt 0–4. */
export const TIEU_CHI_08A = [
  'Kiến thức chuyên môn và khả năng vận dụng thực tế',
  'Kỹ năng phân tích và giải quyết vấn đề kỹ thuật',
  'Kỹ năng giao tiếp và làm việc nhóm',
  'Tinh thần trách nhiệm, tác phong và ý thức kỷ luật',
  'Tuân thủ quy định an toàn lao động',
  'Sáng tạo, chủ động, đề xuất cải tiến',
];

/** TTTN-08b phần A.1 — sáu nội dung, mức độ hài lòng 1–5. */
export const CHAT_LUONG_08B = [
  'Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo',
  'Mức độ hỗ trợ từ giảng viên hướng dẫn',
  'Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD',
  'Điều kiện làm việc và an toàn tại nơi thực tập',
  'Cơ hội học hỏi và phát triển nghề nghiệp',
  'Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)',
];

/** TTTN-08b phần C — bốn câu trao đổi tự thân, đúng thứ tự trên biểu mẫu. */
export const CAU_TU_LUAN_08B: { khoa: keyof TuLuan; cau: string }[] = [
  { khoa: 'kyNangHocDuoc', cau: 'Những kỹ năng hoặc kiến thức tôi đã học được nhiều nhất trong kỳ thực tập' },
  { khoa: 'khoKhan', cau: 'Những khó khăn hoặc hạn chế tôi gặp phải' },
  { khoa: 'keHoachCaiThien', cau: 'Kế hoạch cá nhân để cải thiện năng lực chuyên môn hoặc kỹ năng mềm' },
  { khoa: 'deXuat', cau: 'Đề xuất của tôi cho việc cải thiện học phần Thực tập tốt nghiệp' },
];

/** Mức độ 0–4 — chú giải dưới bảng tự đánh giá CLO của TTTN-08b, dùng chung cho mức độ đạt của TTTN-08a. */
export const MUC_DAT = [
  { muc: 0, nhan: 'Chưa đạt yêu cầu' },
  { muc: 1, nhan: 'Đạt một phần' },
  { muc: 2, nhan: 'Đạt yêu cầu' },
  { muc: 3, nhan: 'Đạt tốt' },
  { muc: 4, nhan: 'Xuất sắc' },
];

/** Mức độ hài lòng 1–5 — chú giải phần A.1 TTTN-08b. */
export const MUC_HAI_LONG = [
  { muc: 1, nhan: 'Rất không hài lòng' },
  { muc: 2, nhan: 'Không hài lòng' },
  { muc: 3, nhan: 'Chấp nhận được' },
  { muc: 4, nhan: 'Hài lòng' },
  { muc: 5, nhan: 'Rất hài lòng' },
];

/** TTTN-08b mục II. */
export const CAM_KET_08B = 'Tôi xin cam kết rằng các thông tin, số liệu và minh chứng trong phiếu này là trung thực, phản ánh '
  + 'đúng năng lực và kết quả thực tế trong quá trình thực tập tốt nghiệp. Tôi đồng ý cho phép Nhà trường sử dụng dữ '
  + 'liệu này phục vụ mục đích đánh giá, kiểm định và cải tiến chất lượng đào tạo.';

export const nhanMuc = (ds: { muc: number; nhan: string }[], muc?: number | null) =>
  ds.find((m) => m.muc === muc)?.nhan ?? '';
