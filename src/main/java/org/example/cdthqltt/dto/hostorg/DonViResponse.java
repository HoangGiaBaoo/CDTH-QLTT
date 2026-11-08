package org.example.cdthqltt.dto.hostorg;

import org.example.cdthqltt.entity.DonViHuongDan;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;

import java.time.LocalDate;

public record DonViResponse(Long id, String maDvhd, String ten, String diaChi, String linhVuc, String nguoiDaiDien,
                            String dienThoai, String email, TrangThaiPheDuyet trangThaiPheDuyet, String lyDo,
                            LocalDate ngayPheDuyet, Integer soCanBo) {

    public static DonViResponse from(DonViHuongDan d, Integer soCanBo) {
        return new DonViResponse(d.getId(), d.getMaDvhd(), d.getTen(), d.getDiaChi(), d.getLinhVuc(), d.getNguoiDaiDien(),
                d.getDienThoai(), d.getEmail(), d.getTrangThaiPheDuyet(), d.getLyDo(), d.getNgayPheDuyet(), soCanBo);
    }
}
