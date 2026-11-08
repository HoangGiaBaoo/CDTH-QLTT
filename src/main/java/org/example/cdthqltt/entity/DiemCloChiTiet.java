package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "diem_clo_chi_tiet", uniqueConstraints = @UniqueConstraint(columnNames = {"phieu_id", "chuan_dau_ra_id"}))
@Getter
@Setter
@NoArgsConstructor
public class DiemCloChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "phieu_id", nullable = false)
    private PhieuDanhGia phieu;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chuan_dau_ra_id", nullable = false)
    private ChuanDauRa chuanDauRa;

    @Column(name = "muc_dat", nullable = false, columnDefinition = "TINYINT")
    private Integer mucDat;

    // CBR-10: điểm phải nằm trong khoảng của mức đã chọn.
    @Column(name = "diem", nullable = false, precision = 4, scale = 2)
    private BigDecimal diem;

    @Column(name = "nhan_xet", length = 500)
    private String nhanXet;
}
