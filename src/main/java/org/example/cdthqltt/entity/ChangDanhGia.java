package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.TrangThaiChang;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "chang_danh_gia", uniqueConstraints = @UniqueConstraint(columnNames = {"dot_id", "thu_tu"}))
@Getter
@Setter
@NoArgsConstructor
public class ChangDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dot_id", nullable = false)
    private DotThucTap dot;

    // CBR-06: chỉ có chặng 1 (giữa kỳ) và chặng 2 (cuối kỳ).
    @Column(name = "thu_tu", nullable = false, columnDefinition = "TINYINT")
    private Integer thuTu;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "tuan_thuc_hien", nullable = false)
    private Integer tuanThucHien;

    // Đ13 k3: w1 = 0,3; w2 = 0,7 — giá trị nằm trong seed, không trong code.
    @Column(name = "trong_so_w", nullable = false, precision = 4, scale = 3)
    private BigDecimal trongSoW;

    @Column(name = "ngay_mo")
    private LocalDate ngayMo;

    @Column(name = "ngay_dong")
    private LocalDate ngayDong;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiChang trangThai = TrangThaiChang.CHUA_MO;
}
