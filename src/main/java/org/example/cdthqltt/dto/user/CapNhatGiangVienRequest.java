package org.example.cdthqltt.dto.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** #16 */
public record CapNhatGiangVienRequest(
        @Size(max = 100) String boMon,
        @Size(max = 100) String khoaVien,
        @Size(max = 50) String hocHamHocVi,
        @NotNull(message = "Vui lòng nhập hạn mức sinh viên")
        @Min(value = 5, message = "Hạn mức sinh viên từ 5 đến 10 (CBR-04)")
        @Max(value = 10, message = "Hạn mức sinh viên từ 5 đến 10 (CBR-04)") Integer soSvToiDa) {
}
