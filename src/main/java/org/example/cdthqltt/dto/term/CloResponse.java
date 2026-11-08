package org.example.cdthqltt.dto.term;

import org.example.cdthqltt.entity.ChuanDauRa;

import java.math.BigDecimal;

public record CloResponse(Long id, Long dotId, String maClo, String ten, String moTa, BigDecimal trongSoAlpha,
                          BigDecimal tyLeDvhd, BigDecimal tyLeGvhd) {

    public static CloResponse from(ChuanDauRa c) {
        return new CloResponse(c.getId(), c.getDot().getId(), c.getMaClo(), c.getTen(), c.getMoTa(),
                c.getTrongSoAlpha(), c.getTyLeDvhd(), c.getTyLeGvhd());
    }
}
