package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Nhật ký hệ thống — Đ14 k4c: mọi thay đổi ảnh hưởng điểm phải lưu vết; chỉ ghi thêm, không sửa/xóa. */
@Entity
@Table(name = "nhat_ky_he_thong")
@Getter
@Setter
@NoArgsConstructor
public class NhatKyHeThong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thoi_diem", nullable = false, updatable = false)
    private LocalDateTime thoiDiem;

    @Column(name = "nguoi_thuc_hien", updatable = false)
    private Long nguoiThucHien;

    @Column(name = "vai_tro", length = 30, updatable = false)
    private String vaiTro;

    @Column(name = "hanh_vi", nullable = false, length = 100, updatable = false)
    private String hanhVi;

    @Column(name = "doi_tuong", length = 100, updatable = false)
    private String doiTuong;

    @Column(name = "doi_tuong_id", updatable = false)
    private Long doiTuongId;

    @Column(name = "gia_tri_truoc", columnDefinition = "TEXT", updatable = false)
    private String giaTriTruoc;

    @Column(name = "gia_tri_sau", columnDefinition = "TEXT", updatable = false)
    private String giaTriSau;

    @PrePersist
    void truocKhiLuu() {
        if (thoiDiem == null) {
            thoiDiem = LocalDateTime.now();
        }
    }
}
