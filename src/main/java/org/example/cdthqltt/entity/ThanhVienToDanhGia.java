package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;

@Entity
@Table(name = "thanh_vien_to_danh_gia", uniqueConstraints = @UniqueConstraint(columnNames = {"to_danh_gia_id", "nguoi_dung_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ThanhVienToDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_danh_gia_id", nullable = false)
    private ToDanhGia toDanhGia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Enumerated(EnumType.STRING)
    @Column(name = "nhom_nguoi_cham", nullable = false)
    private NhomNguoiCham nhomNguoiCham;

    @Column(name = "la_chu_tich", nullable = false)
    private Boolean laChuTich = Boolean.FALSE;

    // Phiếu của thành viên vắng mặt không vào phép tính điểm (Đ10 k5).
    @Column(name = "vang_mat", nullable = false)
    private Boolean vangMat = Boolean.FALSE;
}
