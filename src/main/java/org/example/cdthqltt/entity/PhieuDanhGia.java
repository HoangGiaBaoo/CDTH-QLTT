package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Phiếu đánh giá TTTN-04 (chặng 1) / TTTN-05 (chặng 2); CBR-11: mỗi người chấm một phiếu/SV/chặng. */
@Entity
@Table(name = "phieu_danh_gia", uniqueConstraints = @UniqueConstraint(columnNames = {"ho_so_id", "chang_id", "nguoi_cham_id"}))
@Getter
@Setter
@NoArgsConstructor
public class PhieuDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chang_id", nullable = false)
    private ChangDanhGia chang;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_cham_id", nullable = false)
    private NguoiDung nguoiCham;

    @Enumerated(EnumType.STRING)
    @Column(name = "nhom_nguoi_cham", nullable = false)
    private NhomNguoiCham nhomNguoiCham;

    @Column(name = "nhan_xet_chung", columnDefinition = "TEXT")
    private String nhanXetChung;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiPhieu trangThai = TrangThaiPhieu.NHAP;

    @Column(name = "ngay_nop")
    private LocalDateTime ngayNop;

    @Column(name = "ly_do_mo_lai", length = 500)
    private String lyDoMoLai;

    @OneToMany(mappedBy = "phieu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiemCloChiTiet> diemClos = new ArrayList<>();

    public boolean daNop() {
        return trangThai == TrangThaiPhieu.DA_NOP;
    }
}
