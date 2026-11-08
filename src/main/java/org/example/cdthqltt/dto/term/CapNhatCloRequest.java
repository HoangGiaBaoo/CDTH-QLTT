package org.example.cdthqltt.dto.term;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * #34 — sửa α và tỷ lệ đồng chấm của một CLO. Vì Σα phải luôn bằng 100 (CBR-07), đổi α của một CLO bắt buộc
 * đổi α của CLO khác trong cùng lần lưu: gửi kèm {@code dieuChinhAlphaKhac}; hệ thống kiểm tổng sau khi áp tất cả.
 */
public record CapNhatCloRequest(
        @NotNull(message = "Vui lòng nhập trọng số α")
        @DecimalMin(value = "0", message = "Trọng số α không âm") @DecimalMax(value = "100", message = "Trọng số α tối đa 100")
        @Digits(integer = 3, fraction = 2) BigDecimal trongSoAlpha,
        @NotNull(message = "Vui lòng nhập tỷ lệ ĐVHD")
        @DecimalMin(value = "0") @DecimalMax(value = "100") @Digits(integer = 3, fraction = 2) BigDecimal tyLeDvhd,
        @NotNull(message = "Vui lòng nhập tỷ lệ GVHD")
        @DecimalMin(value = "0") @DecimalMax(value = "100") @Digits(integer = 3, fraction = 2) BigDecimal tyLeGvhd,
        @Valid List<DieuChinhAlpha> dieuChinhAlphaKhac) {

    public record DieuChinhAlpha(
            @NotNull Long cloId,
            @NotNull @DecimalMin(value = "0") @DecimalMax(value = "100") @Digits(integer = 3, fraction = 2) BigDecimal trongSoAlpha) {
    }
}
