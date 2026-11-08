package org.example.cdthqltt.dto.hostorg;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** #25 */
public record CapNhatCanBoRequest(
        @Size(max = 100) String chucVu,
        @NotNull(message = "Vui lòng nhập số năm kinh nghiệm") @Min(value = 0) Integer soNamKinhNghiem,
        @NotNull(message = "Vui lòng nhập hạn mức") @Min(value = 1, message = "Hạn mức tối thiểu 1 sinh viên") Integer soSvToiDa) {
}
