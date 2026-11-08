package org.example.cdthqltt.service;

import java.util.List;

/**
 * Nội dung cố định của biểu mẫu TTTN-08a và TTTN-08b (kèm Quy định QĐ 207) — là chữ trên biểu mẫu, không phải
 * cấu hình chấm điểm. Hệ thống tự điền khi lưu để dữ liệu JSON đọc lại được mà không phụ thuộc giao diện.
 */
public final class BieuMauPhanHoi {

    /** TTTN-08a mục 1 — sáu tiêu chí chấm mức 0–4. */
    public static final List<String> TIEU_CHI_08A = List.of(
            "Kiến thức chuyên môn và khả năng vận dụng thực tế",
            "Kỹ năng phân tích và giải quyết vấn đề kỹ thuật",
            "Kỹ năng giao tiếp và làm việc nhóm",
            "Tinh thần trách nhiệm, tác phong và ý thức kỷ luật",
            "Tuân thủ quy định an toàn lao động",
            "Sáng tạo, chủ động, đề xuất cải tiến");

    /** TTTN-08b phần A.1 — sáu nội dung đánh giá mức hài lòng 1–5. */
    public static final List<String> CHAT_LUONG_08B = List.of(
            "Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo",
            "Mức độ hỗ trợ từ giảng viên hướng dẫn",
            "Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD",
            "Điều kiện làm việc và an toàn tại nơi thực tập",
            "Cơ hội học hỏi và phát triển nghề nghiệp",
            "Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)");

    /** TTTN-08b phần C — bốn câu trao đổi tự thân. */
    public static final List<String> CAU_TU_LUAN_08B = List.of(
            "Những kỹ năng hoặc kiến thức tôi đã học được nhiều nhất trong kỳ thực tập",
            "Những khó khăn hoặc hạn chế tôi gặp phải",
            "Kế hoạch cá nhân để cải thiện năng lực chuyên môn hoặc kỹ năng mềm",
            "Đề xuất của tôi cho việc cải thiện học phần Thực tập tốt nghiệp");

    private BieuMauPhanHoi() {
    }
}
