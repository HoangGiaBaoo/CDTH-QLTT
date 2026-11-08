package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;

@Entity
@Table(name = "sinh_vien")
@Getter
@Setter
@NoArgsConstructor
public class SinhVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false, unique = true)
    private NguoiDung nguoiDung;

    @Column(name = "ma_sv", nullable = false, unique = true, length = 20)
    private String maSv;

    @Column(name = "lop", length = 30)
    private String lop;

    @Column(name = "khoa_hoc", length = 20)
    private String khoaHoc;

    @Column(name = "nganh", length = 100)
    private String nganh;

    @Column(name = "khoa_vien", length = 100)
    private String khoaVien;

    // Đ15 k3b: quyết định ngưỡng đạt CLO1, CLO2 (CHUAN Mức 1, CLC_STEM Mức 2).
    @Enumerated(EnumType.STRING)
    @Column(name = "chuong_trinh_dao_tao", nullable = false)
    private ChuongTrinhDaoTao chuongTrinhDaoTao = ChuongTrinhDaoTao.CHUAN;
}
