package org.example.cdthqltt.dto.hostorg;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;

/** #21 — DA_DUYET, TU_CHOI hoặc DA_LOAI; từ chối / loại bắt buộc có lý do (UC02 5a, 5b). */
public record PheDuyetDonViRequest(
        @NotNull(message = "Vui lòng chọn quyết định") TrangThaiPheDuyet quyetDinh,
        @Size(max = 500) String lyDo) {
}
