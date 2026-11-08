package org.example.cdthqltt.dto.result;

import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.entity.enums.KetLuan;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.TrangThaiKetQua;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/** #82 — một dòng bảng kết quả toàn đợt (RP-01). Hồ sơ chưa có kết quả thì các trường điểm là null. */
public record KetQuaTomTatResponse(Long hoSoId, String maSv, String hoTen, String lop, ChuongTrinhDaoTao chuongTrinh,
                                   TrangThaiHoSo trangThaiHoSo, String giangVienHuongDan,
                                   Map<String, BigDecimal> diemClo, BigDecimal diemThuong, BigDecimal diemHp,
                                   Integer mucDat, KetLuan ketLuan, TrangThaiKetQua trangThai, LocalDateTime ngayTinh) {
}
