package org.example.cdthqltt.dto.result;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

/** #86 — giáo vụ duyệt điểm thưởng: null = giữ mức GVHD đề xuất, giá trị khác = điểm thưởng được duyệt. */
public record XacNhanKetQuaRequest(
        @DecimalMin(value = "0.0", message = "Điểm thưởng không được âm")
        @Digits(integer = 1, fraction = 2, message = "Điểm thưởng tối đa 2 chữ số thập phân")
        BigDecimal diemThuongDuyet) {
}
