package org.example.cdthqltt.dto.assessment;

import org.example.cdthqltt.dto.record.HoSoResponse;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.example.cdthqltt.entity.enums.TrangThaiChang;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** #70 — biểu mẫu chấm TTTN-04 / TTTN-05 cho đúng người chấm; nhóm ĐVHD không có CLO7 (CBR-09). */
public record BieuMauResponse(HoSoResponse hoSo, Integer chang, String tenChang, TrangThaiChang trangThaiChang,
                              LocalDate ngayMo, LocalDate ngayDong, NhomNguoiCham nhom, Long phieuId,
                              List<CauHoi> cauHois) {

    public record CauHoi(Integer thuTu, String noiDung, String maClo, String tenClo, List<Muc> cacMuc) {
    }

    /** {@code diemGoiY}: điểm giữa khoảng (UC08 bước 5). */
    public record Muc(Integer muc, BigDecimal diemMin, BigDecimal diemMax, String moTaHanhVi, BigDecimal diemGoiY) {
    }
}
