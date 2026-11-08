package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "can_bo_dvhd")
@Getter
@Setter
@NoArgsConstructor
public class CanBoDvhd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false, unique = true)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "don_vi_id", nullable = false)
    private DonViHuongDan donVi;

    @Column(name = "chuc_vu", length = 100)
    private String chucVu;

    // CBR-05 (Đ7 k1c): cán bộ hướng dẫn phải có từ 3 năm kinh nghiệm.
    @Column(name = "so_nam_kinh_nghiem", nullable = false)
    private Integer soNamKinhNghiem;

    // CBR-03 (Đ7 k2c): tối đa 5 SV/đợt — giá trị lưu ở cột, không viết cứng trong service.
    @Column(name = "so_sv_toi_da", nullable = false)
    private Integer soSvToiDa = 5;
}
