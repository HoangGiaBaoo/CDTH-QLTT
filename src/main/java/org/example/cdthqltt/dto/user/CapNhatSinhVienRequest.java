package org.example.cdthqltt.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;

/** #13 — chương trình đào tạo quyết định ngưỡng đạt CLO1, CLO2 (CBR-19). */
public record CapNhatSinhVienRequest(
        @NotBlank(message = "Vui lòng nhập mã sinh viên") @Size(max = 20) String maSv,
        @Size(max = 30) String lop,
        @Size(max = 20) String khoaHoc,
        @Size(max = 100) String nganh,
        @Size(max = 100) String khoaVien,
        @NotNull(message = "Vui lòng chọn chương trình đào tạo") ChuongTrinhDaoTao chuongTrinhDaoTao) {
}
