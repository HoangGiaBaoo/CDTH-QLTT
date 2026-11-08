package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.LoaiPhanHoi;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Phiếu phản hồi TTTN-08a (ĐVHD) / TTTN-08b (sinh viên tự đánh giá). */
@Entity
@Table(name = "phan_hoi", uniqueConstraints = @UniqueConstraint(columnNames = {"ho_so_id", "loai"}))
@Getter
@Setter
@NoArgsConstructor
public class PhanHoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false)
    private LoaiPhanHoi loai;

    @Column(name = "nguoi_gui_id", nullable = false)
    private Long nguoiGuiId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "du_lieu_tieu_chi")
    private String duLieuTieuChi;

    @Column(name = "hp_self", precision = 4, scale = 2)
    private BigDecimal hpSelf;

    @Column(name = "chi_so_tu_nhan_thuc", precision = 4, scale = 2)
    private BigDecimal chiSoTuNhanThuc;

    @Column(name = "y_kien_mo", columnDefinition = "TEXT")
    private String yKienMo;

    @Column(name = "ngay_gui", nullable = false)
    private LocalDateTime ngayGui;

    @PrePersist
    void truocKhiLuu() {
        if (ngayGui == null) {
            ngayGui = LocalDateTime.now();
        }
    }
}
