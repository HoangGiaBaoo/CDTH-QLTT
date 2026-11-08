package org.example.cdthqltt.security;

import org.example.cdthqltt.entity.enums.VaiTro;

/**
 * Người dùng đang đăng nhập, dựng một lần trong {@link JwtAuthFilter} cho mỗi request.
 * Kèm id hồ sơ mở rộng theo vai trò để service kiểm quyền sở hữu mà không cần truy vấn lại.
 */
public record CurrentUser(Long nguoiDungId, VaiTro vaiTro, Long sinhVienId, Long giangVienId, Long canBoDvhdId) {

    public boolean laAdmin() {
        return vaiTro == VaiTro.ADMIN;
    }

    public boolean laSinhVien() {
        return vaiTro == VaiTro.SINH_VIEN;
    }

    public boolean laGiangVien() {
        return vaiTro == VaiTro.GIANG_VIEN;
    }

    public boolean laCanBoDvhd() {
        return vaiTro == VaiTro.CAN_BO_DVHD;
    }
}
