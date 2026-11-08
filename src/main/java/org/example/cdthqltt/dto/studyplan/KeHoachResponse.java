package org.example.cdthqltt.dto.studyplan;

import org.example.cdthqltt.entity.KeHoachHocTap;
import org.example.cdthqltt.entity.MucKeHoach;
import org.example.cdthqltt.entity.enums.TrangThaiKeHoach;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** #52 — kế hoạch TTTN-02 kèm N dòng tuần + 1 dòng Tổng kết và hạn nộp. */
public record KeHoachResponse(Long id,
                              Long hoSoId,
                              TrangThaiKeHoach trangThai,
                              LocalDate hanNop,
                              LocalDateTime ngayNop,
                              Boolean nopMuon,
                              LocalDateTime xacNhanDvhd,
                              LocalDateTime xacNhanGvhd,
                              List<Muc> cacMuc) {

    public record Muc(Long id, Integer tuan, boolean laTongKet, String mucTieu, String ketQuaMongDoi,
                      String hinhThucMinhChung) {
    }

    public static KeHoachResponse tu(KeHoachHocTap kh, LocalDate hanNop, int soTuan) {
        List<Muc> muc = kh.getCacMuc().stream()
                .map((MucKeHoach m) -> new Muc(m.getId(), m.getTuan(), m.getTuan() > soTuan, m.getMucTieu(),
                        m.getKetQuaMongDoi(), m.getHinhThucMinhChung()))
                .toList();
        return new KeHoachResponse(kh.getId(), kh.getHoSo().getId(), kh.getTrangThai(), hanNop, kh.getNgayNop(),
                kh.getNopMuon(), kh.getXacNhanDvhd(), kh.getXacNhanGvhd(), muc);
    }
}
