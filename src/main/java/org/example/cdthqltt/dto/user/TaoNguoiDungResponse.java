package org.example.cdthqltt.dto.user;

/** Mật khẩu ban đầu chỉ trả về một lần để giáo vụ chuyển cho người dùng; CSDL chỉ lưu bản băm. */
public record TaoNguoiDungResponse(NguoiDungResponse nguoiDung, String matKhauBanDau) {
}
