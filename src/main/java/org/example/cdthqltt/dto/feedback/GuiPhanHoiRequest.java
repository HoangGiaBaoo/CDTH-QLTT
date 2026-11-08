package org.example.cdthqltt.dto.feedback;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.LoaiPhanHoi;

/**
 * #96 — cán bộ ĐVHD gửi {@code TTTN_08A} kèm {@code phieu08a}; sinh viên gửi {@code TTTN_08B} kèm {@code phieu08b}.
 * {@code yKienMo}: 08a = ý kiến bổ sung của ĐVHD; 08b = phản hồi mở và đề xuất cải tiến.
 */
public record GuiPhanHoiRequest(
        @NotNull(message = "Thiếu hồ sơ thực tập") Long hoSoId,
        @NotNull(message = "Thiếu loại phiếu phản hồi") LoaiPhanHoi loai,
        @Valid Phieu08a phieu08a,
        @Valid Phieu08b phieu08b,
        @Size(max = 4000, message = "Ý kiến tối đa 4000 ký tự") String yKienMo) {
}
