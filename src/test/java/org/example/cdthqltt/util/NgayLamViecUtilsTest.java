package org.example.cdthqltt.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/** Hạn nộp kế hoạch 5 ngày làm việc (Đ6 k3a) — các ngày bắt đầu dễ sai. 2026-11-09 là thứ 2. */
class NgayLamViecUtilsTest {

    @Test
    void batDauThuHaiHetHanThuSauCungTuan() {
        assertThat(NgayLamViecUtils.ngayLamViecThu(LocalDate.of(2026, 11, 9), 5)).isEqualTo(LocalDate.of(2026, 11, 13));
    }

    @Test
    void batDauThuNamHetHanThuTuTuanSau() {
        // T5 12/11, T6 13/11, T2 16/11, T3 17/11, T4 18/11
        assertThat(NgayLamViecUtils.ngayLamViecThu(LocalDate.of(2026, 11, 12), 5)).isEqualTo(LocalDate.of(2026, 11, 18));
    }

    @Test
    void batDauThuSauHetHanThuNamTuanSau() {
        assertThat(NgayLamViecUtils.ngayLamViecThu(LocalDate.of(2026, 11, 13), 5)).isEqualTo(LocalDate.of(2026, 11, 19));
    }

    @Test
    void batDauThuBayBoQuaCuoiTuan() {
        // Thứ 7 14/11 không tính ⇒ T2 16/11 … T6 20/11
        assertThat(NgayLamViecUtils.ngayLamViecThu(LocalDate.of(2026, 11, 14), 5)).isEqualTo(LocalDate.of(2026, 11, 20));
    }
}
