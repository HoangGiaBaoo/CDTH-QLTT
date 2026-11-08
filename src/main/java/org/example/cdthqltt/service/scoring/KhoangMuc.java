package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.entity.MucRubric;

import java.math.BigDecimal;

/** Một khoảng điểm của rubric: [diemMin; diemMax), mức cao nhất đóng ở diemMax (Đ13 k2). */
public record KhoangMuc(int muc, BigDecimal diemMin, BigDecimal diemMax) {

    public static KhoangMuc tu(MucRubric m) {
        return new KhoangMuc(m.getMuc(), m.getDiemMin(), m.getDiemMax());
    }
}
