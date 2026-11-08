package org.example.cdthqltt.dto.assessment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** #75 — CBR-12: lý do bắt buộc. */
public record MoLaiPhieuRequest(@NotBlank(message = "Vui lòng nhập lý do mở lại phiếu") @Size(max = 500) String lyDo) {
}
