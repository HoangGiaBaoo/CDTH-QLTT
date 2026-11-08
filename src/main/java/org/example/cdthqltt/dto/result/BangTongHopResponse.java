package org.example.cdthqltt.dto.result;

import org.example.cdthqltt.entity.enums.KetLuan;
import org.example.cdthqltt.entity.enums.TrangThaiKetQua;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * #83 (cán bộ), #84–#86 — bảng tổng hợp TTTN-07. Điểm CLO, HP, nhóm năng lực là giá trị đã lưu; cột 1–6 (điểm
 * từng chặng) và cột 9 được tính lại khi đọc (docs/01 mục 10.11), làm tròn 2 chữ số chỉ để hiển thị.
 *
 * @param chuaTinhDuoc lý do chưa có kết quả (thiếu phiếu, hồ sơ chưa đến giai đoạn đánh giá…); null khi đã tính
 */
public record BangTongHopResponse(ThongTinChungResponse thongTin,
                                  TrangThaiKetQua trangThai,
                                  List<DongClo> cacClo,
                                  BigDecimal diemThuong,
                                  BigDecimal diemHp,
                                  Integer mucHp,
                                  List<MucXepLoai> thangMuc,
                                  List<NhomNangLuc> nhomNangLuc,
                                  KetLuan ketLuan,
                                  List<String> lyDoKhongDat,
                                  String nhanXetGvhd,
                                  String phienBanTrongSo,
                                  LocalDateTime ngayTinh,
                                  List<String> canhBao,
                                  String chuaTinhDuoc) implements KetQuaChiTietResponse {

    /**
     * Một dòng mục II.
     *
     * @param theoChang thứ tự chặng → cột (1)(2)(3) hoặc (4)(5)(6); chặng không đánh giá CLO này thì không có khóa
     * @param diemQuyDoi cột (9) = CLO_i × α_i / 100, tính trên CLO chưa làm tròn để tổng cột khớp điểm HP
     */
    public record DongClo(String maClo, String ten, BigDecimal alpha, Map<Integer, DiemChangHienThi> theoChang,
                          BigDecimal diemClo, Integer muc, BigDecimal diemQuyDoi) {
    }

    /** {@code dvhd}/{@code gvhd}: trung bình nhóm người chấm; null khi nhóm có tỷ lệ 0 (ĐVHD ở CLO7). */
    public record DiemChangHienThi(BigDecimal dvhd, BigDecimal gvhd, BigDecimal tb) {
    }

    /** Mục IV. */
    public record NhomNangLuc(String ten, List<String> cacClo, BigDecimal diem, Integer muc) {
    }
}
