package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Thông báo trong hệ thống (NT-01…NT-15); không gửi email/SMS (ngoài phạm vi). */
@Entity
@Table(name = "thong_bao")
@Getter
@Setter
@NoArgsConstructor
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_nhan_id", nullable = false)
    private Long nguoiNhanId;

    @Column(name = "ma_su_kien", nullable = false, length = 10)
    private String maSuKien;

    @Column(name = "noi_dung", nullable = false, length = 500)
    private String noiDung;

    @Column(name = "duong_dan", length = 300)
    private String duongDan;

    @Column(name = "da_doc", nullable = false)
    private Boolean daDoc = Boolean.FALSE;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @PrePersist
    void truocKhiLuu() {
        if (ngayTao == null) {
            ngayTao = LocalDateTime.now();
        }
    }
}
