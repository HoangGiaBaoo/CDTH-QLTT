package org.example.cdthqltt.dto.term;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** #29 — sửa ngày kết thúc (gia hạn, Đ15 k4) thì tính lại mốc chặng 2 và gửi NT-15. */
public record CapNhatDotRequest(
        @NotBlank(message = "Vui lòng nhập tên đợt") @Size(max = 200) String ten,
        @NotBlank(message = "Vui lòng nhập học kỳ") @Size(max = 10) String hocKy,
        @NotBlank(message = "Vui lòng nhập năm học") @Size(max = 20) String namHoc,
        @Size(max = 100) String khoaVien,
        @NotNull(message = "Vui lòng chọn ngày bắt đầu") LocalDate ngayBatDau,
        @NotNull(message = "Vui lòng chọn ngày kết thúc") LocalDate ngayKetThuc,
        LocalDate hanNopBaoCao) {
}
