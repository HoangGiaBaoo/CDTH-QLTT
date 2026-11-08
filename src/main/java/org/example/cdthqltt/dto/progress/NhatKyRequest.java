package org.example.cdthqltt.dto.progress;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** #58 — thêm nhật ký ngày; {@code hoSoId} bỏ trống thì lấy hồ sơ đang thực tập của SV. */
public record NhatKyRequest(
        Long hoSoId,
        @NotNull(message = "Vui lòng chọn ngày") LocalDate ngay,
        @NotBlank(message = "Vui lòng nhập nội dung công việc") @Size(max = 5000) String noiDung,
        @DecimalMin(value = "0.0", message = "Số giờ không âm") @DecimalMax(value = "24.0", message = "Số giờ tối đa 24")
        @Digits(integer = 2, fraction = 1, message = "Số giờ tối đa một chữ số thập phân") BigDecimal soGio,
        @Size(max = 5000) String ketQua) {
}
