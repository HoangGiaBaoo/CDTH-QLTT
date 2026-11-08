package org.example.cdthqltt.dto.progress;

import org.example.cdthqltt.entity.TienDoTuan;

import java.time.LocalDateTime;

/** #61 — một dòng bảng theo dõi tiến độ TTTN-03. */
public record TienDoResponse(Long id, Long hoSoId, Integer tuan, String congViecDuocGiao, String ketQuaThucHien,
                             Integer phanTramHoanThanh, boolean daXacNhan, LocalDateTime ngayXacNhan,
                             String yeuCauBoSung) {

    public static TienDoResponse tu(TienDoTuan t) {
        return new TienDoResponse(t.getId(), t.getHoSo().getId(), t.getTuan(), t.getCongViecDuocGiao(),
                t.getKetQuaThucHien(), t.getPhanTramHoanThanh(), t.daXacNhan(), t.getNgayXacNhan(), t.getYeuCauBoSung());
    }
}
