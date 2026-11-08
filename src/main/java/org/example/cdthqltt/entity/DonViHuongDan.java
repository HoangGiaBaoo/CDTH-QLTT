package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;

import java.time.LocalDate;

@Entity
@Table(name = "don_vi_huong_dan")
@Getter
@Setter
@NoArgsConstructor
public class DonViHuongDan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_dvhd", nullable = false, unique = true, length = 30)
    private String maDvhd;

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "dia_chi", nullable = false, length = 300)
    private String diaChi;

    @Column(name = "linh_vuc", nullable = false, length = 200)
    private String linhVuc;

    @Column(name = "nguoi_dai_dien", nullable = false, length = 100)
    private String nguoiDaiDien;

    @Column(name = "dien_thoai", length = 20)
    private String dienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai_phe_duyet", nullable = false)
    private TrangThaiPheDuyet trangThaiPheDuyet = TrangThaiPheDuyet.CHO_DUYET;

    @Column(name = "ly_do", length = 500)
    private String lyDo;

    @Column(name = "ngay_phe_duyet")
    private LocalDate ngayPheDuyet;

    @Column(name = "nguoi_phe_duyet_id")
    private Long nguoiPheDuyetId;

    // Đ16 k1: không xóa vật lý đơn vị đã có hồ sơ; xóa mềm khi chưa phát sinh.
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = Boolean.FALSE;
}
