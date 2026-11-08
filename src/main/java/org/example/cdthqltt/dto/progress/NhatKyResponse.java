package org.example.cdthqltt.dto.progress;

import org.example.cdthqltt.entity.NhatKyThucTap;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NhatKyResponse(Long id, Long hoSoId, LocalDate ngay, String noiDung, BigDecimal soGio, String ketQua,
                             LocalDateTime ngayTao, boolean suaDuoc) {

    public static NhatKyResponse tu(NhatKyThucTap n, boolean suaDuoc) {
        return new NhatKyResponse(n.getId(), n.getHoSo().getId(), n.getNgay(), n.getNoiDung(), n.getSoGio(),
                n.getKetQua(), n.getNgayTao(), suaDuoc);
    }
}
