package org.example.cdthqltt.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Một dòng phần B phiếu TTTN-08b. {@code muc} để trống được (xem trước HPself khi chưa chọn đủ); khi gửi phiếu
 * service liệt kê các CLO còn thiếu (UC12 7a). {@code diemQuyDoi} = điểm giữa khoảng của mức, do hệ thống điền.
 */
public record TuDanhGiaClo(
        @NotBlank(message = "Thiếu mã CLO") String maClo,
        @Min(value = 0, message = "Mức tự đánh giá từ 0 đến 4") @Max(value = 4, message = "Mức tự đánh giá từ 0 đến 4") Integer muc,
        BigDecimal diemQuyDoi,
        @Size(max = 1000, message = "Minh chứng bản thân tối đa 1000 ký tự") String minhChung) {
}
