package org.example.cdthqltt.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DoiMatKhauRequest(
        @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại") String matKhauHienTai,
        @NotBlank(message = "Vui lòng nhập mật khẩu mới")
        @Pattern(regexp = MatKhauPolicy.MAU, message = MatKhauPolicy.THONG_DIEP) String matKhauMoi) {
}
