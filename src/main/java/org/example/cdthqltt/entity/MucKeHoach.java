package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "muc_ke_hoach", uniqueConstraints = @UniqueConstraint(columnNames = {"ke_hoach_id", "tuan"}))
@Getter
@Setter
@NoArgsConstructor
public class MucKeHoach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ke_hoach_id", nullable = false)
    private KeHoachHocTap keHoach;

    // Tuần 1..N = từng tuần thực tập; tuần N+1 = dòng Tổng kết (TTTN-03, N+1 dòng).
    @Column(name = "tuan", nullable = false)
    private Integer tuan;

    @Column(name = "muc_tieu", columnDefinition = "TEXT")
    private String mucTieu;

    @Column(name = "ket_qua_mong_doi", columnDefinition = "TEXT")
    private String ketQuaMongDoi;

    @Column(name = "hinh_thuc_minh_chung", length = 200)
    private String hinhThucMinhChung;
}
