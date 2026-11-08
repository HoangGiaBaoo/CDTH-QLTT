package org.example.cdthqltt.dto.progress;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** #63 — {@code dongY = false} là yêu cầu bổ sung, bắt buộc nội dung (UC07 6a). */
public record XacNhanTienDoRequest(
        @NotNull(message = "Vui lòng chọn xác nhận hoặc yêu cầu bổ sung") Boolean dongY,
        @Size(max = 500) String yeuCauBoSung) {
}
