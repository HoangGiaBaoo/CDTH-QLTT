package org.example.cdthqltt.dto.progress;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** #59 — ngày của nhật ký không đổi được (mỗi ngày đúng một bản ghi). */
public record CapNhatNhatKyRequest(
        @NotBlank(message = "Vui lòng nhập nội dung công việc") @Size(max = 5000) String noiDung,
        @DecimalMin(value = "0.0", message = "Số giờ không âm") @DecimalMax(value = "24.0", message = "Số giờ tối đa 24")
        @Digits(integer = 2, fraction = 1, message = "Số giờ tối đa một chữ số thập phân") BigDecimal soGio,
        @Size(max = 5000) String ketQua) {
}
