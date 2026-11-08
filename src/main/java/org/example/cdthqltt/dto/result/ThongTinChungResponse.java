package org.example.cdthqltt.dto.result;

import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;

import java.time.LocalDate;

/** Mục I "Thông tin chung" của TTTN-07. */
public record ThongTinChungResponse(Long hoSoId, String hoTen, String maSv, String lop, String nganh, String khoaVien,
                                    ChuongTrinhDaoTao chuongTrinh, String giangVienHuongDan, String donViHuongDan,
                                    String canBoHuongDan, LocalDate tuNgay, LocalDate denNgay,
                                    TrangThaiHoSo trangThaiHoSo) {
}
