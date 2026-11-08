package org.example.cdthqltt.dto.record;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** #47 — {@code gianDoan = true}: chuyển Gián đoạn (Đ15 k4); false: khôi phục về trạng thái đang chạy. */
public record DoiTrangThaiHoSoRequest(
        @NotNull(message = "Vui lòng chọn gián đoạn hoặc khôi phục") Boolean gianDoan,
        @NotBlank(message = "Vui lòng nhập lý do") @Size(max = 500) String lyDo) {
}
