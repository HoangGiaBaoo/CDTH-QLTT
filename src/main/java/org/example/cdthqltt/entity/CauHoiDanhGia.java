package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Câu hỏi của phiếu TTTN-04 (chặng 1) / TTTN-05 (chặng 2); mỗi câu gắn đúng một CLO (CBR-10). */
@Entity
@Table(name = "cau_hoi_danh_gia")
@Getter
@Setter
@NoArgsConstructor
public class CauHoiDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chang_id", nullable = false)
    private ChangDanhGia chang;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chuan_dau_ra_id", nullable = false)
    private ChuanDauRa chuanDauRa;

    @Column(name = "thu_tu", nullable = false)
    private Integer thuTu;

    @Column(name = "noi_dung", nullable = false, length = 500)
    private String noiDung;
}
