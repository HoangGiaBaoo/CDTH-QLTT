package org.example.cdthqltt.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** Trạng thái phê duyệt Đơn vị hướng dẫn (UC02). {@code tenHienThi} dùng trong thông báo lỗi, khớp nhãn ở frontend. */
@Getter
@RequiredArgsConstructor
public enum TrangThaiPheDuyet {
    CHO_DUYET("Chờ duyệt"),
    DA_DUYET("Đã duyệt"),
    TU_CHOI("Từ chối"),
    DA_LOAI("Đã loại");

    private final String tenHienThi;
}
