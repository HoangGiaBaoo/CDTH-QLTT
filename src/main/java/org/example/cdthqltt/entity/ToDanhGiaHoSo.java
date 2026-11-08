package org.example.cdthqltt.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/** Bảng nối Tổ đánh giá — hồ sơ sinh viên báo cáo trước tổ. */
@Entity
@Table(name = "to_danh_gia_ho_so")
@Getter
@Setter
@NoArgsConstructor
public class ToDanhGiaHoSo {

    @EmbeddedId
    private Id id = new Id();

    @MapsId("toDanhGiaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_danh_gia_id")
    private ToDanhGia toDanhGia;

    @MapsId("hoSoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ho_so_id")
    private HoSoThucTap hoSo;

    public ToDanhGiaHoSo(ToDanhGia toDanhGia, HoSoThucTap hoSo) {
        this.toDanhGia = toDanhGia;
        this.hoSo = hoSo;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class Id implements Serializable {

        @Column(name = "to_danh_gia_id")
        private Long toDanhGiaId;

        @Column(name = "ho_so_id")
        private Long hoSoId;
    }
}
