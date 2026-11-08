package org.example.cdthqltt.dto.record;

import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;

import java.time.LocalDateTime;

public record HoSoResponse(
        Long id,
        SinhVienTomTat sinhVien,
        DotTomTat dot,
        HinhThucThucTap hinhThucThucTap,
        DonViTomTat donVi,
        NguoiTomTat canBoDvhd,
        NguoiTomTat gvhd,
        String boPhan,
        String deTai,
        HinhThucLamViec hinhThucLamViec,
        Integer soTuanThamGia,
        String mucTieu,
        String sanPhamDuKien,
        TrangThaiHoSo trangThai,
        String lyDoTuChoi,
        LocalDateTime ngayGui) {

    public record SinhVienTomTat(Long id, String maSv, String hoTen, String lop, ChuongTrinhDaoTao chuongTrinhDaoTao) {
    }

    public record DotTomTat(Long id, String maDot, String ten) {
    }

    public record DonViTomTat(Long id, String maDvhd, String ten) {
    }

    /** Cán bộ ĐVHD hoặc GVHD: id hồ sơ mở rộng + id người dùng + họ tên. */
    public record NguoiTomTat(Long id, Long nguoiDungId, String hoTen, String email) {
    }
}
