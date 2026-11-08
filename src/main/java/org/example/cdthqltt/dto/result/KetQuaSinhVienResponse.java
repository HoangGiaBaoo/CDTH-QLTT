package org.example.cdthqltt.dto.result;

import org.example.cdthqltt.entity.enums.KetLuan;

import java.math.BigDecimal;
import java.util.List;

/**
 * #83 (sinh viên, SCR-24) — chỉ có điểm tổng hợp; cố ý không có điểm theo nhóm người chấm, điểm từng chặng
 * hay cảnh báo lệch điểm (UC13, .claude/rules/bao-mat.md).
 */
public record KetQuaSinhVienResponse(ThongTinChungResponse thongTin,
                                     List<DongCloSinhVien> cacClo,
                                     BigDecimal diemThuong,
                                     BigDecimal diemHp,
                                     Integer mucHp,
                                     List<BangTongHopResponse.NhomNangLuc> nhomNangLuc,
                                     KetLuan ketLuan,
                                     List<String> lyDoKhongDat,
                                     String nhanXetGvhd) implements KetQuaChiTietResponse {

    public record DongCloSinhVien(String maClo, String ten, BigDecimal alpha, BigDecimal diemClo, Integer muc) {
    }
}
