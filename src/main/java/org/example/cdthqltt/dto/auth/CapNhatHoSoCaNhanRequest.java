package org.example.cdthqltt.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** BR-01.9: người dùng chỉ tự sửa họ tên, email, điện thoại; không đổi vai trò, trạng thái, mã định danh. */
public record CapNhatHoSoCaNhanRequest(
        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100) String hoTen,
        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không đúng định dạng") @Size(max = 100) String email,
        @Pattern(regexp = "^$|^[0-9+ .-]{8,20}$", message = "Số điện thoại không hợp lệ") String dienThoai) {
}
