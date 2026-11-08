package org.example.cdthqltt.dto.hostorg;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** #19, #20 — sinh viên đề xuất đơn vị mới có thể bỏ trống mã, hệ thống tự sinh. */
public record DonViRequest(
        @Pattern(regexp = "^$|^[A-Za-z0-9._-]{2,30}$", message = "Mã ĐVHD 2–30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch")
        String maDvhd,
        @NotBlank(message = "Vui lòng nhập tên đơn vị") @Size(max = 200) String ten,
        @NotBlank(message = "Vui lòng nhập địa chỉ") @Size(max = 300) String diaChi,
        @NotBlank(message = "Vui lòng nhập lĩnh vực") @Size(max = 200) String linhVuc,
        @NotBlank(message = "Vui lòng nhập người đại diện") @Size(max = 100) String nguoiDaiDien,
        @Pattern(regexp = "^$|^[0-9+ .-]{8,20}$", message = "Số điện thoại không hợp lệ") String dienThoai,
        @Email(message = "Email không đúng định dạng") @Size(max = 100) String email) {
}
