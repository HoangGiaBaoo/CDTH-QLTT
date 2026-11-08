package org.example.cdthqltt.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record DangNhapRequest(
        @NotBlank(message = "Vui lòng nhập tên đăng nhập") String tenDangNhap,
        @NotBlank(message = "Vui lòng nhập mật khẩu") String matKhau) {
}
