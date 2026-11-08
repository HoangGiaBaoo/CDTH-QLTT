package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;

import java.time.LocalDateTime;

/** Hồ sơ đăng ký thực tập — biểu mẫu TTTN-01. */
@Entity
@Table(name = "ho_so_thuc_tap", uniqueConstraints = @UniqueConstraint(columnNames = {"sinh_vien_id", "dot_id"}))
@Getter
@Setter
@NoArgsConstructor
public class HoSoThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sinh_vien_id", nullable = false)
    private SinhVien sinhVien;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dot_id", nullable = false)
    private DotThucTap dot;

    @Enumerated(EnumType.STRING)
    @Column(name = "hinh_thuc_thuc_tap", nullable = false)
    private HinhThucThucTap hinhThucThucTap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_vi_id")
    private DonViHuongDan donVi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "can_bo_dvhd_id")
    private CanBoDvhd canBoDvhd;

    @Column(name = "bo_phan", length = 200)
    private String boPhan;

    @Column(name = "de_tai", length = 300)
    private String deTai;

    @Enumerated(EnumType.STRING)
    @Column(name = "hinh_thuc_lam_viec")
    private HinhThucLamViec hinhThucLamViec = HinhThucLamViec.TRUC_TIEP;

    @Column(name = "so_tuan_tham_gia")
    private Integer soTuanThamGia;

    @Column(name = "muc_tieu", columnDefinition = "TEXT")
    private String mucTieu;

    @Column(name = "san_pham_du_kien", columnDefinition = "TEXT")
    private String sanPhamDuKien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiHoSo trangThai = TrangThaiHoSo.NHAP;

    @Column(name = "ly_do_tu_choi", length = 500)
    private String lyDoTuChoi;

    @Column(name = "ngay_gui")
    private LocalDateTime ngayGui;
}
