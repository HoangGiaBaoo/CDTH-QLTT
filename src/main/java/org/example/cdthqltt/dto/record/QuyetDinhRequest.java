package org.example.cdthqltt.dto.record;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Xác nhận / từ chối kèm lý do — dùng cho #45 (cán bộ ĐVHD) và #46 (GVHD). Từ chối thì lý do bắt buộc. */
public record QuyetDinhRequest(
        @NotNull(message = "Vui lòng chọn đồng ý hoặc từ chối") Boolean dongY,
        @Size(max = 500) String lyDo) {
}
