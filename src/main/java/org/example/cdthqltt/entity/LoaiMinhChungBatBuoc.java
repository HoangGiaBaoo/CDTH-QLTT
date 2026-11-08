package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;

/** Danh mục minh chứng bắt buộc theo hình thức thực tập (Đ4, CBR-23). */
@Entity
@Table(name = "loai_minh_chung_bat_buoc",
        uniqueConstraints = @UniqueConstraint(columnNames = {"hinh_thuc_thuc_tap", "loai_minh_chung"}))
@Getter
@Setter
@NoArgsConstructor
public class LoaiMinhChungBatBuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "hinh_thuc_thuc_tap", nullable = false)
    private HinhThucThucTap hinhThucThucTap;

    @Column(name = "loai_minh_chung", nullable = false, length = 100)
    private String loaiMinhChung;

    @Column(name = "bat_buoc", nullable = false)
    private Boolean batBuoc = Boolean.TRUE;
}
