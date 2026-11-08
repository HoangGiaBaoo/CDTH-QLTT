package org.example.cdthqltt.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** Quyết định ngưỡng đạt CLO1, CLO2: CHUAN cần Mức 1, CLC_STEM cần Mức 2 (Đ15 k3b). */
@Getter
@RequiredArgsConstructor
public enum ChuongTrinhDaoTao {
    CHUAN("chương trình Chuẩn", 1),
    CLC_STEM("chương trình CLC/STEM", 2);

    private final String tenHienThi;
    /** Mức tối thiểu của CLO1 và CLO2 để được công nhận (Đ15 k3b). */
    private final int mucToiThieuCloDieuKien;
}
