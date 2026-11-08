package org.example.cdthqltt.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** #8 — chỉ thông tin cơ bản; vai trò không đổi sau khi tạo (mỗi tài khoản đúng một vai trò). */
public record CapNhatNguoiDungRequest(
        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100) String hoTen,
        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không đúng định dạng") @Size(max = 100) String email,
        @Pattern(regexp = "^$|^[0-9+ .-]{8,20}$", message = "Số điện thoại không hợp lệ") String dienThoai) {
}
