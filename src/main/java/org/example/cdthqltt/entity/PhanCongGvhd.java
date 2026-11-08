package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** BR-05.1: mỗi hồ sơ có đúng một GVHD tại một thời điểm. */
@Entity
@Table(name = "phan_cong_gvhd")
@Getter
@Setter
@NoArgsConstructor
public class PhanCongGvhd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false, unique = true)
    private HoSoThucTap hoSo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "giang_vien_id", nullable = false)
    private GiangVien giangVien;

    @Column(name = "ngay_phan_cong", nullable = false)
    private LocalDateTime ngayPhanCong;

    @Column(name = "nguoi_phan_cong")
    private Long nguoiPhanCong;

    @Column(name = "ly_do_thay_doi", length = 500)
    private String lyDoThayDoi;

    @PrePersist
    void truocKhiLuu() {
        if (ngayPhanCong == null) {
            ngayPhanCong = LocalDateTime.now();
        }
    }
}
