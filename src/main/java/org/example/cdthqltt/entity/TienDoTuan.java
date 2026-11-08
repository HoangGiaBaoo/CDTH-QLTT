package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Tiến độ tuần — biểu mẫu TTTN-03. */
@Entity
@Table(name = "tien_do_tuan", uniqueConstraints = @UniqueConstraint(columnNames = {"ho_so_id", "tuan"}))
@Getter
@Setter
@NoArgsConstructor
public class TienDoTuan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @Column(name = "tuan", nullable = false)
    private Integer tuan;

    @Column(name = "cong_viec_duoc_giao", columnDefinition = "TEXT")
    private String congViecDuocGiao;

    @Column(name = "ket_qua_thuc_hien", columnDefinition = "TEXT")
    private String ketQuaThucHien;

    @Column(name = "phan_tram_hoan_thanh")
    private Integer phanTramHoanThanh;

    @Column(name = "xac_nhan_dvhd_id")
    private Long xacNhanDvhdId;

    @Column(name = "ngay_xac_nhan")
    private LocalDateTime ngayXacNhan;

    @Column(name = "yeu_cau_bo_sung", length = 500)
    private String yeuCauBoSung;

    public boolean daXacNhan() {
        return ngayXacNhan != null;
    }
}
