package org.example.cdthqltt.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Một tiêu chí phiếu TTTN-08a (mục 1, mức 0–4). {@code noiDung} do hệ thống điền theo biểu mẫu khi lưu — giá trị
 * client gửi lên bị bỏ qua.
 */
public record DanhGiaTieuChi(
        @NotNull(message = "Thiếu số thứ tự tiêu chí") @Min(value = 1, message = "Số thứ tự tiêu chí từ 1") Integer stt,
        String noiDung,
        @NotNull(message = "Vui lòng chọn mức độ đạt") @Min(value = 0, message = "Mức độ đạt từ 0 đến 4")
        @Max(value = 4, message = "Mức độ đạt từ 0 đến 4") Integer muc,
        @Size(max = 1000, message = "Nhận xét tối đa 1000 ký tự") String nhanXet) {
}
