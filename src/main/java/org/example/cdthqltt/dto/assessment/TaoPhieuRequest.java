package org.example.cdthqltt.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** #72 — tạo phiếu nháp; {@code chang} là thứ tự chặng (1 hoặc 2). */
public record TaoPhieuRequest(
        @NotNull(message = "Thiếu hồ sơ") Long hoSoId,
        @NotNull(message = "Thiếu chặng") @Min(1) Integer chang,
        @Size(max = 5000) String nhanXetChung,
        List<@Valid DiemCloRequest> diemClos) {
}
