package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;

import java.math.BigDecimal;
import java.util.List;

/**
 * Toàn bộ dữ liệu cần để tính điểm một hồ sơ — KetQuaService nạp từ DB rồi truyền vào.
 *
 * @param bangMucHp bảng mức dùng quy đổi điểm học phần (Đ13 k2)
 * @param diemThuong điểm thưởng đã được duyệt, có thể null (Đ18 k4)
 */
public record DauVaoTinhDiem(List<CauHinhChang> chang,
                             List<CauHinhClo> clo,
                             List<KhoangMuc> bangMucHp,
                             List<PhieuDiem> phieu,
                             ChuongTrinhDaoTao chuongTrinh,
                             BigDecimal diemThuong,
                             boolean duMinhChung,
                             List<String> loaiMinhChungThieu) {
}
