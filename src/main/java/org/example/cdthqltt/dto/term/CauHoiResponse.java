package org.example.cdthqltt.dto.term;

import org.example.cdthqltt.entity.CauHoiDanhGia;

public record CauHoiResponse(Long id, Long changId, Integer thuTu, String noiDung, Long chuanDauRaId, String maClo,
                             String tenClo) {

    public static CauHoiResponse from(CauHoiDanhGia c) {
        return new CauHoiResponse(c.getId(), c.getChang().getId(), c.getThuTu(), c.getNoiDung(),
                c.getChuanDauRa().getId(), c.getChuanDauRa().getMaClo(), c.getChuanDauRa().getTen());
    }
}
