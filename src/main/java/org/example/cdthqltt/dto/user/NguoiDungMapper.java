package org.example.cdthqltt.dto.user;

import org.example.cdthqltt.entity.CanBoDvhd;
import org.example.cdthqltt.entity.GiangVien;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.SinhVien;

/** Ánh xạ entity → DTO; gọi trong giao dịch vì các quan hệ đều LAZY. */
public final class NguoiDungMapper {

    private NguoiDungMapper() {
    }

    public static NguoiDungResponse toResponse(NguoiDung n, SinhVien sv, GiangVien gv, CanBoDvhd cb) {
        return new NguoiDungResponse(n.getId(), n.getTenDangNhap(), n.getHoTen(), n.getEmail(), n.getDienThoai(),
                n.getVaiTro(), n.getTrangThai(), n.getNgayTao(),
                sv == null ? null : toSinhVien(sv),
                gv == null ? null : toGiangVien(gv, null),
                cb == null ? null : new NguoiDungResponse.CanBoTomTat(cb.getId(), cb.getDonVi().getId(),
                        cb.getDonVi().getTen(), cb.getChucVu(), cb.getSoNamKinhNghiem(), cb.getSoSvToiDa()));
    }

    public static SinhVienResponse toSinhVien(SinhVien s) {
        NguoiDung n = s.getNguoiDung();
        return new SinhVienResponse(s.getId(), n.getId(), n.getHoTen(), n.getEmail(), n.getDienThoai(), s.getMaSv(),
                s.getLop(), s.getKhoaHoc(), s.getNganh(), s.getKhoaVien(), s.getChuongTrinhDaoTao());
    }

    public static GiangVienResponse toGiangVien(GiangVien g, Long soSvDangHuongDan) {
        NguoiDung n = g.getNguoiDung();
        return new GiangVienResponse(g.getId(), n.getId(), n.getHoTen(), n.getEmail(), n.getDienThoai(), g.getMaGv(),
                g.getBoMon(), g.getKhoaVien(), g.getHocHamHocVi(), g.getSoSvToiDa(), soSvDangHuongDan);
    }
}
