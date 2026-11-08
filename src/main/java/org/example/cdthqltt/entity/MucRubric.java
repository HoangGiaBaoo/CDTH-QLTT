package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "muc_rubric", uniqueConstraints = @UniqueConstraint(columnNames = {"chuan_dau_ra_id", "muc"}))
@Getter
@Setter
@NoArgsConstructor
public class MucRubric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chuan_dau_ra_id", nullable = false)
    private ChuanDauRa chuanDauRa;

    @Column(name = "muc", nullable = false, columnDefinition = "TINYINT")
    private Integer muc;

    // Khoảng [diemMin, diemMax); riêng Mức 4 đóng tại 10 (Đ14 k2).
    @Column(name = "diem_min", nullable = false, precision = 4, scale = 2)
    private BigDecimal diemMin;

    @Column(name = "diem_max", nullable = false, precision = 4, scale = 2)
    private BigDecimal diemMax;

    @Column(name = "mo_ta_hanh_vi", columnDefinition = "TEXT")
    private String moTaHanhVi;
}
