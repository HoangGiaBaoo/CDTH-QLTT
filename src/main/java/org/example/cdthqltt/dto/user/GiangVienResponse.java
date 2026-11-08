package org.example.cdthqltt.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GiangVienResponse(
        Long id,
        Long nguoiDungId,
        String hoTen,
        String email,
        String dienThoai,
        String maGv,
        String boMon,
        String khoaVien,
        String hocHamHocVi,
        Integer soSvToiDa,
        /** Số SV đang hướng dẫn trong đợt đang chạy — chỉ điền ở danh sách GV (#14). */
        Long soSvDangHuongDan) {
}
