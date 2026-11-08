package org.example.cdthqltt.dto.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.example.cdthqltt.dto.auth.MatKhauPolicy;
import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.entity.enums.VaiTro;

/**
 * #7 — tạo tài khoản kèm hồ sơ theo vai trò trong một giao dịch.
 * Chỉ khối hồ sơ khớp với {@code vaiTro} được dùng; bỏ trống {@code matKhau} thì hệ thống sinh ngẫu nhiên.
 */
public record TaoNguoiDungRequest(
        @NotBlank(message = "Vui lòng nhập tên đăng nhập")
        @Pattern(regexp = "^[A-Za-z0-9._-]{3,50}$", message = "Tên đăng nhập 3–50 ký tự, chỉ gồm chữ, số, dấu chấm, gạch")
        String tenDangNhap,
        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100) String hoTen,
        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không đúng định dạng") @Size(max = 100) String email,
        @Pattern(regexp = "^$|^[0-9+ .-]{8,20}$", message = "Số điện thoại không hợp lệ") String dienThoai,
        @NotNull(message = "Vui lòng chọn vai trò") VaiTro vaiTro,
        @Pattern(regexp = "^$|" + MatKhauPolicy.MAU, message = MatKhauPolicy.THONG_DIEP) String matKhau,
        @Valid HoSoSinhVien sinhVien,
        @Valid HoSoGiangVien giangVien,
        @Valid HoSoCanBo canBoDvhd) {

    public record HoSoSinhVien(
            @NotBlank(message = "Vui lòng nhập mã sinh viên") @Size(max = 20) String maSv,
            @Size(max = 30) String lop,
            @Size(max = 20) String khoaHoc,
            @Size(max = 100) String nganh,
            @Size(max = 100) String khoaVien,
            @NotNull(message = "Vui lòng chọn chương trình đào tạo") ChuongTrinhDaoTao chuongTrinhDaoTao) {
    }

    public record HoSoGiangVien(
            @NotBlank(message = "Vui lòng nhập mã giảng viên") @Size(max = 20) String maGv,
            @Size(max = 100) String boMon,
            @Size(max = 100) String khoaVien,
            @Size(max = 50) String hocHamHocVi,
            // CBR-04: hạn mức 5–10 SV/đợt.
            @Min(value = 5, message = "Hạn mức sinh viên từ 5 đến 10 (CBR-04)")
            @Max(value = 10, message = "Hạn mức sinh viên từ 5 đến 10 (CBR-04)") Integer soSvToiDa) {
    }

    public record HoSoCanBo(
            @NotNull(message = "Vui lòng chọn đơn vị hướng dẫn") Long donViId,
            @Size(max = 100) String chucVu,
            @NotNull(message = "Vui lòng nhập số năm kinh nghiệm") @Min(0) Integer soNamKinhNghiem,
            @Min(1) Integer soSvToiDa) {
    }
}
