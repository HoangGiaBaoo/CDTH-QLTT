package org.example.cdthqltt.dto.record;

import org.example.cdthqltt.entity.*;

/** Gọi trong giao dịch (quan hệ LAZY). */
public final class HoSoMapper {

    private HoSoMapper() {
    }

    public static HoSoResponse toResponse(HoSoThucTap h, GiangVien gvhd) {
        SinhVien sv = h.getSinhVien();
        DotThucTap dot = h.getDot();
        DonViHuongDan dv = h.getDonVi();
        CanBoDvhd cb = h.getCanBoDvhd();
        return new HoSoResponse(h.getId(),
                new HoSoResponse.SinhVienTomTat(sv.getId(), sv.getMaSv(), sv.getNguoiDung().getHoTen(), sv.getLop(),
                        sv.getChuongTrinhDaoTao()),
                new HoSoResponse.DotTomTat(dot.getId(), dot.getMaDot(), dot.getTen()),
                h.getHinhThucThucTap(),
                dv == null ? null : new HoSoResponse.DonViTomTat(dv.getId(), dv.getMaDvhd(), dv.getTen()),
                cb == null ? null : new HoSoResponse.NguoiTomTat(cb.getId(), cb.getNguoiDung().getId(),
                        cb.getNguoiDung().getHoTen(), cb.getNguoiDung().getEmail()),
                gvhd == null ? null : new HoSoResponse.NguoiTomTat(gvhd.getId(), gvhd.getNguoiDung().getId(),
                        gvhd.getNguoiDung().getHoTen(), gvhd.getNguoiDung().getEmail()),
                h.getBoPhan(), h.getDeTai(), h.getHinhThucLamViec(), h.getSoTuanThamGia(), h.getMucTieu(),
                h.getSanPhamDuKien(), h.getTrangThai(), h.getLyDoTuChoi(), h.getNgayGui());
    }
}
