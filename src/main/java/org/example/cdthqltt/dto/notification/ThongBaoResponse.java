package org.example.cdthqltt.dto.notification;

import org.example.cdthqltt.entity.ThongBao;

import java.time.LocalDateTime;

public record ThongBaoResponse(Long id, String maSuKien, String noiDung, String duongDan, boolean daDoc,
                               LocalDateTime ngayTao) {

    public static ThongBaoResponse from(ThongBao t) {
        return new ThongBaoResponse(t.getId(), t.getMaSuKien(), t.getNoiDung(), t.getDuongDan(),
                Boolean.TRUE.equals(t.getDaDoc()), t.getNgayTao());
    }
}
