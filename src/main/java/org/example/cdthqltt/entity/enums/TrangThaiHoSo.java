package org.example.cdthqltt.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Máy trạng thái hồ sơ thực tập (docs/01-nghiep-vu.md mục 4).
 * {@code tenHienThi} dùng trong thông báo lỗi, khớp nhãn ở frontend.
 */
@Getter
@RequiredArgsConstructor
public enum TrangThaiHoSo {
    NHAP("Bản nháp"),
    CHO_DVHD("Chờ ĐVHD xác nhận"),
    CHO_GVHD("Chờ GVHD duyệt"),
    DANG_THUC_TAP("Đang thực tập"),
    CHO_DANH_GIA("Chờ đánh giá"),
    HOAN_THANH("Hoàn thành"),
    KHONG_HOAN_THANH("Không hoàn thành"),
    GIAN_DOAN("Gián đoạn"),
    TU_CHOI("Từ chối");

    private final String tenHienThi;
}
