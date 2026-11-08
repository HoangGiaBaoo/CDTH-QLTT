package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.entity.enums.KetLuan;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Kết quả tính điểm một hồ sơ.
 *
 * @param diemChang   maClo → (chặng → điểm chặng), chưa làm tròn
 * @param diemCloDayDu maClo → CLO_i chưa làm tròn (dùng tính HP, Đ14 k2)
 * @param diemClo     maClo → CLO_i đã làm tròn 0,1 (lưu ket_qua_hoc_phan, hiển thị)
 * @param diemHp      đã cộng thưởng, chặn trần 10, làm tròn 0,1
 * @param mucClo      maClo → mức 0–4, quy đổi trên điểm đã làm tròn
 */
public record KetQuaTinhDiem(Map<String, Map<Integer, DiemChang>> diemChang,
                             Map<String, BigDecimal> diemCloDayDu,
                             Map<String, BigDecimal> diemClo,
                             BigDecimal diemHp,
                             int mucHp,
                             Map<String, Integer> mucClo,
                             KetLuan ketLuan,
                             List<String> lyDoKhongDat,
                             BigDecimal nhomKienThuc,
                             BigDecimal nhomKyNang,
                             BigDecimal nhomThaiDo,
                             List<String> canhBao) {
}
