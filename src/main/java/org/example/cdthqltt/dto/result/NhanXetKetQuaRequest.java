package org.example.cdthqltt.dto.result;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * #85 — GVHD rà TTTN-07: nhận xét (mục V) và đề xuất điểm thưởng. Trần 0,5 kiểm ở service để thông điệp trích
 * đúng Đ18 k4; null = không đề xuất thưởng.
 */
public record NhanXetKetQuaRequest(
        @NotBlank(message = "Nhận xét của GVHD không được để trống")
        @Size(max = 4000, message = "Nhận xét tối đa 4000 ký tự")
        String nhanXet,
        @DecimalMin(value = "0.0", message = "Điểm thưởng không được âm")
        @Digits(integer = 1, fraction = 2, message = "Điểm thưởng tối đa 2 chữ số thập phân")
        BigDecimal diemThuong) {
}
