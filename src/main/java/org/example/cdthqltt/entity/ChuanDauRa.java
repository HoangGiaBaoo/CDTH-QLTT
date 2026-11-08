package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "chuan_dau_ra", uniqueConstraints = @UniqueConstraint(columnNames = {"dot_id", "ma_clo"}))
@Getter
@Setter
@NoArgsConstructor
public class ChuanDauRa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dot_id", nullable = false)
    private DotThucTap dot;

    @Column(name = "ma_clo", nullable = false, length = 10)
    private String maClo;

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    // CBR-07: Σα của 7 CLO = 100.
    @Column(name = "trong_so_alpha", nullable = false, precision = 5, scale = 2)
    private BigDecimal trongSoAlpha;

    // CBR-08: tỷ lệ đồng chấm ĐVHD + GVHD = 100.
    @Column(name = "ty_le_dvhd", nullable = false, precision = 5, scale = 2)
    private BigDecimal tyLeDvhd;

    @Column(name = "ty_le_gvhd", nullable = false, precision = 5, scale = 2)
    private BigDecimal tyLeGvhd;
}
