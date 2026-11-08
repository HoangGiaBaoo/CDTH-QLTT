package org.example.cdthqltt.dto.term;

import jakarta.validation.constraints.NotNull;
import org.example.cdthqltt.entity.enums.TrangThaiChang;

/** #32 — chỉ DANG_MO (mở) hoặc DA_DONG (đóng); DA_TONG_HOP do bước tổng hợp kết quả đặt. */
public record DoiTrangThaiChangRequest(@NotNull(message = "Vui lòng chọn trạng thái") TrangThaiChang trangThai) {
}
