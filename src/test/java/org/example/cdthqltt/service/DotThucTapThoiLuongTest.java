package org.example.cdthqltt.service;

import org.example.cdthqltt.common.BusinessException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Thời lượng đợt (Đ5 k1: 8 tuần; Đ15 k4: gia hạn). Số tuần làm tròn lên theo ngày tính cả hai đầu, nên đợt bắt đầu
 * thứ Hai 04/01/2027 đủ 8 tuần khi kết thúc từ 22/02 (50 ngày) đến 28/02/2027 (56 ngày). Không Spring context.
 */
class DotThucTapThoiLuongTest {

    private static final LocalDate BAT_DAU = LocalDate.of(2027, 1, 4);

    @Test
    void taoDotDungTamTuanTaiHaiBien() {
        // 22/02 = 50 ngày ⇒ 8 tuần · 28/02 = 56 ngày ⇒ 8 tuần
        assertThatCode(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 2, 22), false)).doesNotThrowAnyException();
        assertThatCode(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 2, 28), false)).doesNotThrowAnyException();
    }

    @Test
    void taoDotNganHonHoacDaiHonTamTuanBiChan() {
        // 21/02 = 49 ngày ⇒ 7 tuần · 01/03 = 57 ngày ⇒ 9 tuần · 24/01 = 21 ngày ⇒ 3 tuần (ca người dùng gặp)
        assertThatThrownBy(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 2, 21), false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("7 tuần").hasMessageContaining("từ 22/02/2027 đến 28/02/2027");
        assertThatThrownBy(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 3, 1), false))
                .isInstanceOf(BusinessException.class).hasMessageContaining("9 tuần");
        assertThatThrownBy(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 1, 24), false))
                .isInstanceOf(BusinessException.class).hasMessageContaining("3 tuần");
    }

    @Test
    void suaDotChoGiaHanNhungKhongChoRutNgan() {
        // Sửa đợt: 9 tuần là gia hạn (Đ15 k4) ⇒ hợp lệ; 7 tuần vẫn bị chặn.
        assertThatCode(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 3, 1), true)).doesNotThrowAnyException();
        assertThatThrownBy(() -> DotThucTapService.kiemThoiLuong(BAT_DAU, LocalDate.of(2027, 2, 21), true))
                .isInstanceOf(BusinessException.class).hasMessageContaining("từ 22/02/2027 trở đi");
    }
}
