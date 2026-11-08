package org.example.cdthqltt.service.scoring;

import java.math.BigDecimal;

/**
 * Điểm một CLO ở một chặng (cột 1–6 TTTN-07), chưa làm tròn.
 *
 * @param tbDvhd TB nhóm ĐVHD; null khi tỷ lệ ĐVHD = 0 (CLO7)
 * @param tbGvhd TB nhóm GVHD; null khi tỷ lệ GVHD = 0
 * @param diemChang S_ik = (rD·D̄ + rG·Ḡ) / 100
 */
public record DiemChang(BigDecimal tbDvhd, BigDecimal tbGvhd, BigDecimal diemChang) {
}
