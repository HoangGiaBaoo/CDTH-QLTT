package org.example.cdthqltt.dto.user;

import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;

public record SinhVienResponse(
        Long id,
        Long nguoiDungId,
        String hoTen,
        String email,
        String dienThoai,
        String maSv,
        String lop,
        String khoaHoc,
        String nganh,
        String khoaVien,
        ChuongTrinhDaoTao chuongTrinhDaoTao) {
}
