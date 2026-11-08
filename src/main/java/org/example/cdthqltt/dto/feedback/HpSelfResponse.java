package org.example.cdthqltt.dto.feedback;

import java.math.BigDecimal;
import java.util.List;

/**
 * #95 — phần D phiếu TTTN-08b (tự quy đổi).
 *
 * @param hpSelf HPself làm tròn 0,1; null khi còn CLO chưa chọn mức
 */
public record HpSelfResponse(List<DongHpSelf> cacClo, BigDecimal hpSelf, List<String> cloConThieu) {

    /**
     * Cột (1) mức, (2) điểm quy đổi thang 10 = điểm giữa khoảng, (3) trọng số α, (4) CLO×α — cột (4) làm tròn 2 chữ
     * số chỉ để hiển thị; HPself tính trên giá trị đầy đủ.
     */
    public record DongHpSelf(String maClo, String ten, Integer muc, BigDecimal diemQuyDoi, BigDecimal alpha,
                             BigDecimal diemNhanAlpha) {
    }
}
