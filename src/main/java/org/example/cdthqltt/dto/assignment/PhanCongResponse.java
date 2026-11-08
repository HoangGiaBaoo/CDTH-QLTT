package org.example.cdthqltt.dto.assignment;

import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.PhanCongGvhd;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;

import java.time.LocalDateTime;

/** #48, #50, #51 — một dòng phân công. */
public record PhanCongResponse(
        Long id,
        Long hoSoId,
        TrangThaiHoSo trangThaiHoSo,
        HinhThucThucTap hinhThucThucTap,
        Long sinhVienId,
        String maSv,
        String hoTenSinhVien,
        String lop,
        Long giangVienId,
        String maGv,
        String hoTenGiangVien,
        String emailGiangVien,
        LocalDateTime ngayPhanCong,
        String lyDoThayDoi) {

    /** Gọi trong giao dịch (quan hệ LAZY). */
    public static PhanCongResponse tu(PhanCongGvhd p) {
        HoSoThucTap h = p.getHoSo();
        var sv = h.getSinhVien();
        var gv = p.getGiangVien();
        return new PhanCongResponse(p.getId(), h.getId(), h.getTrangThai(), h.getHinhThucThucTap(),
                sv.getId(), sv.getMaSv(), sv.getNguoiDung().getHoTen(), sv.getLop(),
                gv.getId(), gv.getMaGv(), gv.getNguoiDung().getHoTen(), gv.getNguoiDung().getEmail(),
                p.getNgayPhanCong(), p.getLyDoThayDoi());
    }
}
