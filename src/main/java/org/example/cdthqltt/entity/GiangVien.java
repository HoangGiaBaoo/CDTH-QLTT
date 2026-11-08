package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "giang_vien")
@Getter
@Setter
@NoArgsConstructor
public class GiangVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false, unique = true)
    private NguoiDung nguoiDung;

    @Column(name = "ma_gv", nullable = false, unique = true, length = 20)
    private String maGv;

    @Column(name = "bo_mon", length = 100)
    private String boMon;

    @Column(name = "khoa_vien", length = 100)
    private String khoaVien;

    @Column(name = "hoc_ham_hoc_vi", length = 50)
    private String hocHamHocVi;

    // CBR-04 (Đ6 k2b): hạn mức 5–10 SV/đợt do Khoa đặt cho từng GV; giá trị luôn đọc từ cột này.
    @Column(name = "so_sv_toi_da", nullable = false)
    private Integer soSvToiDa = 8;
}
