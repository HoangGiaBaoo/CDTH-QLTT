package org.example.cdthqltt.dto.progress;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** #62 */
public record CapNhatTienDoRequest(
        @Size(max = 5000) String congViecDuocGiao,
        @Size(max = 5000) String ketQuaThucHien,
        @Min(value = 0, message = "Phần trăm hoàn thành từ 0 đến 100")
        @Max(value = 100, message = "Phần trăm hoàn thành từ 0 đến 100") Integer phanTramHoanThanh) {
}
