package org.example.cdthqltt.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** Vòng đời đợt thực tập (UC03). {@code tenHienThi} dùng trong thông báo lỗi, khớp nhãn ở frontend. */
@Getter
@RequiredArgsConstructor
public enum TrangThaiDot {
    KHOI_TAO("Khởi tạo"),
    DANG_NHAN_DANG_KY("Đang nhận đăng ký"),
    DANG_THUC_HIEN("Đang thực hiện"),
    DA_KET_THUC("Đã kết thúc");

    private final String tenHienThi;
}
