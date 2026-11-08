package org.example.cdthqltt.dto.assessment;

import org.example.cdthqltt.entity.DiemCloChiTiet;
import org.example.cdthqltt.entity.PhieuDanhGia;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/** #69, #71 – #75 */
public record PhieuResponse(Long id, Long hoSoId, String maSv, String hoTenSinhVien, Integer chang, String tenChang,
                            Long nguoiChamId, String hoTenNguoiCham, NhomNguoiCham nhom, TrangThaiPhieu trangThai,
                            String nhanXetChung, LocalDateTime ngayNop, String lyDoMoLai, List<DiemClo> diemClos) {

    public record DiemClo(String maClo, String tenClo, Integer mucDat, BigDecimal diem, String nhanXet) {
    }

    /** Gọi trong giao dịch. {@code kemDiem = false}: danh sách không tải điểm từng CLO. */
    public static PhieuResponse tu(PhieuDanhGia p, boolean kemDiem) {
        var sv = p.getHoSo().getSinhVien();
        List<DiemClo> diem = !kemDiem ? null : p.getDiemClos().stream()
                .sorted(Comparator.comparing((DiemCloChiTiet d) -> d.getChuanDauRa().getMaClo()))
                .map(d -> new DiemClo(d.getChuanDauRa().getMaClo(), d.getChuanDauRa().getTen(), d.getMucDat(), d.getDiem(), d.getNhanXet()))
                .toList();
        return new PhieuResponse(p.getId(), p.getHoSo().getId(), sv.getMaSv(), sv.getNguoiDung().getHoTen(),
                p.getChang().getThuTu(), p.getChang().getTen(), p.getNguoiCham().getId(), p.getNguoiCham().getHoTen(),
                p.getNhomNguoiCham(), p.getTrangThai(), p.getNhanXetChung(), p.getNgayNop(), p.getLyDoMoLai(), diem);
    }
}
