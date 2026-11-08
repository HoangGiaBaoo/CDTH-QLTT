package org.example.cdthqltt.dto.term;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.example.cdthqltt.entity.DotThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiDot;

import java.time.LocalDate;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record DotResponse(Long id, String maDot, String ten, String hocKy, String namHoc, String khoaVien,
                          LocalDate ngayBatDau, LocalDate ngayKetThuc, Integer soTuan, LocalDate hanNopBaoCao,
                          TrangThaiDot trangThai, List<String> canhBao) {

    public static DotResponse from(DotThucTap d) {
        return from(d, List.of());
    }

    public static DotResponse from(DotThucTap d, List<String> canhBao) {
        return new DotResponse(d.getId(), d.getMaDot(), d.getTen(), d.getHocKy(), d.getNamHoc(), d.getKhoaVien(),
                d.getNgayBatDau(), d.getNgayKetThuc(), d.getSoTuan(), d.getHanNopBaoCao(), d.getTrangThai(), canhBao);
    }
}
