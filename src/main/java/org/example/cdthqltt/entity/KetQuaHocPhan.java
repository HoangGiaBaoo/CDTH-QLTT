package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.KetLuan;
import org.example.cdthqltt.entity.enums.TrangThaiKetQua;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Kết quả học phần — bảng tổng hợp TTTN-07 (Đ13–Đ15). */
@Entity
@Table(name = "ket_qua_hoc_phan")
@Getter
@Setter
@NoArgsConstructor
public class KetQuaHocPhan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false, unique = true)
    private HoSoThucTap hoSo;

    @Column(name = "diem_clo1", precision = 4, scale = 2)
    private BigDecimal diemClo1;

    @Column(name = "diem_clo2", precision = 4, scale = 2)
    private BigDecimal diemClo2;

    @Column(name = "diem_clo3", precision = 4, scale = 2)
    private BigDecimal diemClo3;

    @Column(name = "diem_clo4", precision = 4, scale = 2)
    private BigDecimal diemClo4;

    @Column(name = "diem_clo5", precision = 4, scale = 2)
    private BigDecimal diemClo5;

    @Column(name = "diem_clo6", precision = 4, scale = 2)
    private BigDecimal diemClo6;

    @Column(name = "diem_clo7", precision = 4, scale = 2)
    private BigDecimal diemClo7;

    @Column(name = "diem_hp", precision = 4, scale = 2)
    private BigDecimal diemHp;

    @Column(name = "muc_dat", columnDefinition = "TINYINT")
    private Integer mucDat;

    // CBR-21: điểm thưởng tối đa 0,5 do GVHD đề xuất, ADMIN duyệt.
    @Column(name = "diem_thuong", precision = 3, scale = 2)
    private BigDecimal diemThuong = BigDecimal.ZERO;

    @Column(name = "nhom_kien_thuc", precision = 4, scale = 2)
    private BigDecimal nhomKienThuc;

    @Column(name = "nhom_ky_nang", precision = 4, scale = 2)
    private BigDecimal nhomKyNang;

    @Column(name = "nhom_thai_do", precision = 4, scale = 2)
    private BigDecimal nhomThaiDo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ket_luan")
    private KetLuan ketLuan;

    @Column(name = "ly_do_khong_dat", length = 500)
    private String lyDoKhongDat;

    // CBR-22: lưu phiên bản cấu hình trọng số đã dùng để tính.
    @Column(name = "phien_ban_trong_so", length = 50)
    private String phienBanTrongSo;

    @Column(name = "nhan_xet_gvhd", columnDefinition = "TEXT")
    private String nhanXetGvhd;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiKetQua trangThai = TrangThaiKetQua.CHUA_TINH;

    @Column(name = "ngay_tinh")
    private LocalDateTime ngayTinh;

    /** Điểm CLO theo mã — ánh xạ mã CLO1…CLO7 sang cột diem_clo1…7 (đúng 7 CLO, CBR-07); mã khác trả null. */
    public BigDecimal diemCloTheoMa(String maClo) {
        return switch (maClo) {
            case "CLO1" -> diemClo1;
            case "CLO2" -> diemClo2;
            case "CLO3" -> diemClo3;
            case "CLO4" -> diemClo4;
            case "CLO5" -> diemClo5;
            case "CLO6" -> diemClo6;
            case "CLO7" -> diemClo7;
            default -> null;
        };
    }

    /** Ghi điểm CLO theo mã; trả false khi mã không thuộc 7 cột của bảng. */
    public boolean ganDiemClo(String maClo, BigDecimal diem) {
        switch (maClo) {
            case "CLO1" -> diemClo1 = diem;
            case "CLO2" -> diemClo2 = diem;
            case "CLO3" -> diemClo3 = diem;
            case "CLO4" -> diemClo4 = diem;
            case "CLO5" -> diemClo5 = diem;
            case "CLO6" -> diemClo6 = diem;
            case "CLO7" -> diemClo7 = diem;
            default -> {
                return false;
            }
        }
        return true;
    }
}
