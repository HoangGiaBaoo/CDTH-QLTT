package org.example.cdthqltt.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Một nội dung phần A phiếu TTTN-08b — mức hài lòng 1–5. {@code noiDung} do hệ thống điền khi lưu. */
public record DanhGiaHaiLong(
        @NotNull(message = "Thiếu số thứ tự nội dung") @Min(value = 1, message = "Số thứ tự nội dung từ 1") Integer stt,
        String noiDung,
        @NotNull(message = "Vui lòng chọn mức độ hài lòng") @Min(value = 1, message = "Mức độ hài lòng từ 1 đến 5")
        @Max(value = 5, message = "Mức độ hài lòng từ 1 đến 5") Integer mucHaiLong,
        @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự") String ghiChu) {
}
