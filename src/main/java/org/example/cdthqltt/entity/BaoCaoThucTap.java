package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Báo cáo thực tập — biểu mẫu TTTN-06; BR-11.5: nộp lại tạo phiên bản mới, giữ bản cũ. */
@Entity
@Table(name = "bao_cao_thuc_tap", uniqueConstraints = @UniqueConstraint(columnNames = {"ho_so_id", "phien_ban"}))
@Getter
@Setter
@NoArgsConstructor
public class BaoCaoThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @Column(name = "phien_ban", nullable = false)
    private Integer phienBan = 1;

    @Column(name = "ten_file", nullable = false, length = 255)
    private String tenFile;

    @Column(name = "duong_dan", nullable = false, length = 500)
    private String duongDan;

    @Column(name = "ngay_nop", nullable = false)
    private LocalDateTime ngayNop;

    @Column(name = "nop_muon", nullable = false)
    private Boolean nopMuon = Boolean.FALSE;

    @Column(name = "xac_nhan_dvhd")
    private LocalDateTime xacNhanDvhd;

    @Column(name = "xac_nhan_gvhd")
    private LocalDateTime xacNhanGvhd;

    @PrePersist
    void truocKhiLuu() {
        if (ngayNop == null) {
            ngayNop = LocalDateTime.now();
        }
    }

    public boolean daDuXacNhan() {
        return xacNhanDvhd != null && xacNhanGvhd != null;
    }
}
