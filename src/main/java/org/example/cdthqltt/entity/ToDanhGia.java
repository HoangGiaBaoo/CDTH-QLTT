package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Tổ đánh giá cuối kỳ (Đ10, CBR-14). */
@Entity
@Table(name = "to_danh_gia")
@Getter
@Setter
@NoArgsConstructor
public class ToDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dot_id", nullable = false)
    private DotThucTap dot;

    @Column(name = "ngay_thanh_lap", nullable = false)
    private LocalDate ngayThanhLap;

    @Column(name = "thoi_gian_bao_cao")
    private LocalDateTime thoiGianBaoCao;

    @Column(name = "dia_diem", length = 200)
    private String diaDiem;

    @Enumerated(EnumType.STRING)
    @Column(name = "hinh_thuc")
    private HinhThucLamViec hinhThuc = HinhThucLamViec.TRUC_TIEP;

    // Đ10 k4: báo cáo trực tuyến phải được Trưởng Khoa đồng ý.
    @Column(name = "ghi_chu_phe_duyet", length = 500)
    private String ghiChuPheDuyet;

    @Column(name = "duong_dan_ghi_hinh", length = 500)
    private String duongDanGhiHinh;

    @OneToMany(mappedBy = "toDanhGia", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ThanhVienToDanhGia> thanhViens = new ArrayList<>();

    @OneToMany(mappedBy = "toDanhGia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ToDanhGiaHoSo> hoSos = new ArrayList<>();
}
