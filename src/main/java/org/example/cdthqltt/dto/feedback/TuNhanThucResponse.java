package org.example.cdthqltt.dto.feedback;

import java.math.BigDecimal;
import java.util.List;

/**
 * #97 — so sánh tự đánh giá với kết quả chính thức.
 *
 * @param chiSo   chỉ số tự nhận thức = TB |mức tự đánh giá − mức chính thức| trên các CLO, làm tròn 0,01; ≥ 0,
 *                càng gần 0 càng tự nhận thức đúng
 * @param xuHuong TB (mức tự đánh giá − mức chính thức): dương = tự đánh giá cao hơn, âm = thấp hơn
 */
public record TuNhanThucResponse(Long phanHoiId, Long hoSoId, List<SoSanhClo> cacClo, BigDecimal chiSo,
                                 BigDecimal xuHuong, BigDecimal hpSelf, BigDecimal diemHpChinhThuc, String nhanDinh) {

    public record SoSanhClo(String maClo, String ten, int mucTuDanhGia, int mucChinhThuc, int doLech) {
    }
}
