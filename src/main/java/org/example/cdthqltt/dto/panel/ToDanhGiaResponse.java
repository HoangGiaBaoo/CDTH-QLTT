package org.example.cdthqltt.dto.panel;

import org.example.cdthqltt.entity.enums.HinhThucLamViec;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.VaiTro;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** #77, #78 — {@code canhBao}: thành phần chưa đạt CBR-14 (ví dụ sau khi có người vắng mà chưa thay). */
public record ToDanhGiaResponse(Long id, Long dotId, String maDot, LocalDate ngayThanhLap, LocalDateTime thoiGianBaoCao,
                                String diaDiem, HinhThucLamViec hinhThuc, String ghiChuPheDuyet, String duongDanGhiHinh,
                                List<ThanhVien> thanhViens, List<HoSo> hoSos, List<String> canhBao) {

    public record ThanhVien(Long id, Long nguoiDungId, String hoTen, VaiTro vaiTro, NhomNguoiCham nhom,
                            boolean laChuTich, boolean vangMat) {
    }

    public record HoSo(Long hoSoId, String maSv, String hoTen, String lop, TrangThaiHoSo trangThai) {
    }
}
