package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.TrangThaiKeHoach;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Kế hoạch học tập — biểu mẫu TTTN-02. */
@Entity
@Table(name = "ke_hoach_hoc_tap")
@Getter
@Setter
@NoArgsConstructor
public class KeHoachHocTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id", nullable = false, unique = true)
    private HoSoThucTap hoSo;

    @Column(name = "ngay_nop")
    private LocalDateTime ngayNop;

    // BR-06.2: nộp sau hạn 5 ngày làm việc vẫn nhận, chỉ gắn cờ.
    @Column(name = "nop_muon", nullable = false)
    private Boolean nopMuon = Boolean.FALSE;

    @Column(name = "xac_nhan_dvhd")
    private LocalDateTime xacNhanDvhd;

    @Column(name = "xac_nhan_gvhd")
    private LocalDateTime xacNhanGvhd;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiKeHoach trangThai = TrangThaiKeHoach.NHAP;

    @OneToMany(mappedBy = "keHoach", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("tuan ASC")
    private List<MucKeHoach> cacMuc = new ArrayList<>();
}
