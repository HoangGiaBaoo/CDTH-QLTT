package org.example.cdthqltt.dto.assessment;

import java.math.BigDecimal;

/** #76 — một CLO ở một chặng có TB nhóm ĐVHD và TB nhóm GVHD lệch quá 2,0 điểm (BR-08.9, Đ20 k3). */
public record CanhBaoLechResponse(Long hoSoId, String maSv, String hoTen, Integer chang, String maClo,
                                  BigDecimal tbDvhd, BigDecimal tbGvhd, BigDecimal chenhLech) {
}
