package org.example.cdthqltt.dto.term;

import org.example.cdthqltt.entity.MucRubric;

import java.math.BigDecimal;

public record MucRubricResponse(Long id, Long chuanDauRaId, Integer muc, BigDecimal diemMin, BigDecimal diemMax,
                                String moTaHanhVi) {

    public static MucRubricResponse from(MucRubric m) {
        return new MucRubricResponse(m.getId(), m.getChuanDauRa().getId(), m.getMuc(), m.getDiemMin(), m.getDiemMax(),
                m.getMoTaHanhVi());
    }
}
