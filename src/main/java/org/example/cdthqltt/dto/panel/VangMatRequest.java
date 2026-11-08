package org.example.cdthqltt.dto.panel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;

/**
 * #81 — đánh dấu vắng mặt (hoặc bỏ đánh dấu) kèm lý do; có thể bổ sung người thay thế.
 * Có người thay thế thì thành phần Tổ sau thay đổi phải đạt CBR-14.
 */
public record VangMatRequest(
        @NotNull(message = "Vui lòng chọn vắng mặt hay có mặt") Boolean vangMat,
        @NotBlank(message = "Vui lòng nhập lý do") @Size(max = 500) String lyDo,
        Long thayTheNguoiDungId,
        NhomNguoiCham thayTheNhom) {
}
