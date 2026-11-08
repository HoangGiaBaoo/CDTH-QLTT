package org.example.cdthqltt.dto.hostorg;

import java.util.List;

/** Khi duyệt, tài khoản cán bộ được kích hoạt và mật khẩu ban đầu trả về một lần cho giáo vụ. */
public record PheDuyetDonViResponse(DonViResponse donVi, List<TaiKhoanCanBo> taiKhoanDuocKichHoat) {

    public record TaiKhoanCanBo(Long canBoId, String tenDangNhap, String hoTen, String matKhauBanDau) {
    }
}
