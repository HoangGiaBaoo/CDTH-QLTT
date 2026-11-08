package org.example.cdthqltt.dto.assessment;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** Điểm một CLO trên phiếu: mức 0–4 và điểm thang 10 (CBR-10 kiểm khi nộp). */
public record DiemCloRequest(
        @NotBlank(message = "Thiếu mã CLO") String maClo,
        @NotNull(message = "Vui lòng chọn mức đạt") @Min(value = 0, message = "Mức đạt từ 0 đến 4")
        @Max(value = 4, message = "Mức đạt từ 0 đến 4") Integer mucDat,
        @NotNull(message = "Vui lòng nhập điểm") @DecimalMin(value = "0.00", message = "Điểm từ 0 đến 10")
        @DecimalMax(value = "10.00", message = "Điểm từ 0 đến 10")
        @Digits(integer = 2, fraction = 2, message = "Điểm tối đa hai chữ số thập phân") BigDecimal diem,
        @Size(max = 500) String nhanXet) {
}
