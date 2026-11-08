package org.example.cdthqltt.dto.term;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** #28 */
public record TaoDotRequest(
        @NotBlank(message = "Vui lòng nhập mã đợt")
        @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$", message = "Mã đợt 3–30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch")
        String maDot,
        @NotBlank(message = "Vui lòng nhập tên đợt") @Size(max = 200) String ten,
        @NotBlank(message = "Vui lòng nhập học kỳ") @Size(max = 10) String hocKy,
        @NotBlank(message = "Vui lòng nhập năm học") @Size(max = 20) String namHoc,
        @Size(max = 100) String khoaVien,
        @NotNull(message = "Vui lòng chọn ngày bắt đầu") LocalDate ngayBatDau,
        @NotNull(message = "Vui lòng chọn ngày kết thúc") LocalDate ngayKetThuc,
        LocalDate hanNopBaoCao) {
}
