package org.example.cdthqltt.dto.hostorg;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.example.cdthqltt.entity.CanBoDvhd;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CanBoResponse(Long id, Long nguoiDungId, String tenDangNhap, String hoTen, String email, String dienThoai,
                            TrangThaiTaiKhoan trangThaiTaiKhoan, Long donViId, String tenDonVi, String chucVu,
                            Integer soNamKinhNghiem, Integer soSvToiDa, Long soDangHuongDan, String matKhauBanDau) {

    public static CanBoResponse from(CanBoDvhd c, Long soDangHuongDan, String matKhauBanDau) {
        NguoiDung n = c.getNguoiDung();
        return new CanBoResponse(c.getId(), n.getId(), n.getTenDangNhap(), n.getHoTen(), n.getEmail(), n.getDienThoai(),
                n.getTrangThai(), c.getDonVi().getId(), c.getDonVi().getTen(), c.getChucVu(), c.getSoNamKinhNghiem(),
                c.getSoSvToiDa(), soDangHuongDan, matKhauBanDau);
    }

    /** Bản cho sinh viên chọn cán bộ: không có tên đăng nhập, trạng thái tài khoản. */
    public static CanBoResponse choSinhVien(CanBoDvhd c, Long soDangHuongDan) {
        NguoiDung n = c.getNguoiDung();
        return new CanBoResponse(c.getId(), null, null, n.getHoTen(), n.getEmail(), n.getDienThoai(), null,
                c.getDonVi().getId(), c.getDonVi().getTen(), c.getChucVu(), c.getSoNamKinhNghiem(), c.getSoSvToiDa(),
                soDangHuongDan, null);
    }
}
