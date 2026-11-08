package org.example.cdthqltt.dto.term;

import org.example.cdthqltt.entity.ChangDanhGia;
import org.example.cdthqltt.entity.enums.TrangThaiChang;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ChangResponse(Long id, Long dotId, Integer thuTu, String ten, Integer tuanThucHien, BigDecimal trongSoW,
                            LocalDate ngayMo, LocalDate ngayDong, TrangThaiChang trangThai) {

    public static ChangResponse from(ChangDanhGia c) {
        return new ChangResponse(c.getId(), c.getDot().getId(), c.getThuTu(), c.getTen(), c.getTuanThucHien(),
                c.getTrongSoW(), c.getNgayMo(), c.getNgayDong(), c.getTrangThai());
    }
}
