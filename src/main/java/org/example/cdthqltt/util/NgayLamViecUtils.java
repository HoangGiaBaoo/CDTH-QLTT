package org.example.cdthqltt.util;

import java.time.DayOfWeek;
import java.time.LocalDate;

/** Đếm ngày làm việc — chỉ trừ thứ 7, chủ nhật (docs/01 mục 10.8: chưa trừ ngày lễ). */
public final class NgayLamViecUtils {

    private NgayLamViecUtils() {
    }

    public static boolean laNgayLamViec(LocalDate ngay) {
        DayOfWeek d = ngay.getDayOfWeek();
        return d != DayOfWeek.SATURDAY && d != DayOfWeek.SUNDAY;
    }

    /**
     * Ngày làm việc thứ {@code soNgay} tính từ {@code batDau} (ngày bắt đầu là ngày thứ 1 nếu là ngày làm việc).
     * Ví dụ bắt đầu thứ 5, 5 ngày làm việc: T5, T6, T2, T3, T4 ⇒ hạn là thứ 4 tuần sau.
     */
    public static LocalDate ngayLamViecThu(LocalDate batDau, int soNgay) {
        if (soNgay < 1) {
            throw new IllegalArgumentException("soNgay phải ≥ 1");
        }
        LocalDate ngay = batDau;
        int dem = laNgayLamViec(ngay) ? 1 : 0;
        while (dem < soNgay) {
            ngay = ngay.plusDays(1);
            if (laNgayLamViec(ngay)) {
                dem++;
            }
        }
        return ngay;
    }
}
