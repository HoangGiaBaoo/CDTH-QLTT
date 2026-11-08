package org.example.cdthqltt.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.entity.enums.VaiTro;

import java.time.LocalDateTime;

/** Người dùng kèm hồ sơ mở rộng theo vai trò; không bao giờ chứa mật khẩu băm, số lần sai, thời điểm khóa. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NguoiDungResponse(
        Long id,
        String tenDangNhap,
        String hoTen,
        String email,
        String dienThoai,
        VaiTro vaiTro,
        TrangThaiTaiKhoan trangThai,
        LocalDateTime ngayTao,
        SinhVienResponse sinhVien,
        GiangVienResponse giangVien,
        CanBoTomTat canBoDvhd) {

    /** Hồ sơ cán bộ ĐVHD rút gọn cho màn hình tài khoản; chi tiết đầy đủ ở module host-org. */
    public record CanBoTomTat(Long id, Long donViId, String tenDonVi, String chucVu, Integer soNamKinhNghiem,
                              Integer soSvToiDa) {
    }
}
