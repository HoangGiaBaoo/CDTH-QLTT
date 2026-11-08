package org.example.cdthqltt.dto.hostorg;

import jakarta.validation.constraints.*;

/** #24 — kiểm kinh nghiệm ≥ 3 năm ở service để trả đúng BUSINESS_RULE_VIOLATION kèm điều khoản (UC02 4a). */
public record ThemCanBoRequest(
        @NotBlank(message = "Vui lòng nhập tên đăng nhập")
        @Pattern(regexp = "^[A-Za-z0-9._-]{3,50}$", message = "Tên đăng nhập 3–50 ký tự, chỉ gồm chữ, số, dấu chấm, gạch")
        String tenDangNhap,
        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100) String hoTen,
        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không đúng định dạng") @Size(max = 100) String email,
        @Pattern(regexp = "^$|^[0-9+ .-]{8,20}$", message = "Số điện thoại không hợp lệ") String dienThoai,
        @Size(max = 100) String chucVu,
        @NotNull(message = "Vui lòng nhập số năm kinh nghiệm") @Min(value = 0, message = "Số năm kinh nghiệm không âm") Integer soNamKinhNghiem,
        @Min(value = 1, message = "Hạn mức tối thiểu 1 sinh viên") Integer soSvToiDa) {
}
