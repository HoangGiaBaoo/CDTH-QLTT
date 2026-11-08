package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Nhật ký thực tập hằng ngày (Đ9 k1a); BR-07.1: mỗi ngày một bản ghi. */
@Entity
@Table(name = "nhat_ky_thuc_tap", uniqueConstraints = @UniqueConstraint(columnNames = {"ho_so_id", "ngay"}))
@Getter
@Setter
@NoArgsConstructor
public class NhatKyThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @Column(name = "ngay", nullable = false)
    private LocalDate ngay;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "so_gio", precision = 4, scale = 1)
    private BigDecimal soGio;

    @Column(name = "ket_qua", columnDefinition = "TEXT")
    private String ketQua;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @PrePersist
    void truocKhiLuu() {
        if (ngayTao == null) {
            ngayTao = LocalDateTime.now();
        }
    }
}
