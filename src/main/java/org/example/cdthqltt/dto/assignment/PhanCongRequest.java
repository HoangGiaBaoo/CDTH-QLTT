package org.example.cdthqltt.dto.assignment;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** #50 — phân công nhiều hồ sơ cho một giảng viên trong một giao dịch. */
public record PhanCongRequest(
        @NotNull(message = "Vui lòng chọn giảng viên") Long giangVienId,
        @NotEmpty(message = "Vui lòng chọn ít nhất một sinh viên") List<@NotNull Long> hoSoIds) {
}
