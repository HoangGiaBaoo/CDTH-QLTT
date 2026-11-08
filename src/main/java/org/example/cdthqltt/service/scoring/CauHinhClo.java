package org.example.cdthqltt.service.scoring;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Cấu hình một CLO của đợt: α (%), tỷ lệ đồng chấm ĐVHD/GVHD (%), các chặng có câu hỏi trỏ tới CLO này
 * và bảng mức rubric riêng của CLO.
 */
public record CauHinhClo(String maClo,
                         BigDecimal alpha,
                         BigDecimal tyLeDvhd,
                         BigDecimal tyLeGvhd,
                         Set<Integer> changCoDanhGia,
                         List<KhoangMuc> bangMuc) {
}
