package org.example.cdthqltt.dto.assignment;

import org.example.cdthqltt.entity.enums.HinhThucThucTap;

import java.util.List;

/** #49 — hai cột của SCR-13: SV chờ phân công và giảng viên kèm số đã nhận / hạn mức. */
public record UngVienPhanCongResponse(List<HoSoChoPhanCong> sinhViens, List<GiangVienHanMuc> giangViens) {

    public record HoSoChoPhanCong(Long hoSoId, Long sinhVienId, String maSv, String hoTen, String lop,
                                  String donVi, HinhThucThucTap hinhThucThucTap) {
    }

    public record GiangVienHanMuc(Long id, String maGv, String hoTen, String boMon,
                                  long daNhan, int soSvToiDa, long conNhan) {
    }
}
