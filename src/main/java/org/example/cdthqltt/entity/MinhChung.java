package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Minh chứng thực tập (CBR-23, CBR-24). Tệp lưu bằng tên ngẫu nhiên; tên gốc chỉ ở {@code tenFile}. */
@Entity
@Table(name = "minh_chung")
@Getter
@Setter
@NoArgsConstructor
public class MinhChung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSoThucTap hoSo;

    @Column(name = "loai_minh_chung", nullable = false, length = 100)
    private String loaiMinhChung;

    @Column(name = "tuan")
    private Integer tuan;

    @Column(name = "ten_file", nullable = false, length = 255)
    private String tenFile;

    @Column(name = "duong_dan", nullable = false, length = 500)
    private String duongDan;

    @Column(name = "kich_thuoc")
    private Long kichThuoc;

    @Column(name = "nguoi_tai_len_id")
    private Long nguoiTaiLenId;

    @Column(name = "ngay_tai_len", nullable = false)
    private LocalDateTime ngayTaiLen;

    // Khóa khi kết quả công bố (Đ16 k1) — không sửa, không xóa.
    @Column(name = "da_khoa", nullable = false)
    private Boolean daKhoa = Boolean.FALSE;

    @PrePersist
    void truocKhiLuu() {
        if (ngayTaiLen == null) {
            ngayTaiLen = LocalDateTime.now();
        }
    }
}
