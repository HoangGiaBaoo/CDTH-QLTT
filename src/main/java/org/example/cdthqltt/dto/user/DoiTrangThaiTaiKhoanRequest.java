package org.example.cdthqltt.dto.user;

import jakarta.validation.constraints.NotNull;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;

public record DoiTrangThaiTaiKhoanRequest(@NotNull(message = "Vui lòng chọn trạng thái") TrangThaiTaiKhoan trangThai) {
}
