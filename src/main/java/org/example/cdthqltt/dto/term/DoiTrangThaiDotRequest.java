package org.example.cdthqltt.dto.term;

import jakarta.validation.constraints.NotNull;
import org.example.cdthqltt.entity.enums.TrangThaiDot;

public record DoiTrangThaiDotRequest(@NotNull(message = "Vui lòng chọn trạng thái") TrangThaiDot trangThai) {
}
