package org.example.cdthqltt.dto.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** #51 — đổi GVHD kèm lý do. */
public record DoiGvhdRequest(
        @NotNull(message = "Vui lòng chọn giảng viên mới") Long giangVienId,
        @NotBlank(message = "Vui lòng nhập lý do đổi giảng viên") @Size(max = 500) String lyDo) {
}
