package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.TrangThaiDot;

import java.time.LocalDate;

@Entity
@Table(name = "dot_thuc_tap")
@Getter
@Setter
@NoArgsConstructor
public class DotThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_dot", nullable = false, unique = true, length = 30)
    private String maDot;

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "hoc_ky", nullable = false, length = 10)
    private String hocKy;

    @Column(name = "nam_hoc", nullable = false, length = 20)
    private String namHoc;

    @Column(name = "khoa_vien", length = 100)
    private String khoaVien;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "so_tuan", nullable = false)
    private Integer soTuan = 8;

    @Column(name = "han_nop_bao_cao")
    private LocalDate hanNopBaoCao;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiDot trangThai = TrangThaiDot.KHOI_TAO;
}
