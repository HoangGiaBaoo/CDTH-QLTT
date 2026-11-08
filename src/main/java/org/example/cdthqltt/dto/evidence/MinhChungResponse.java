package org.example.cdthqltt.dto.evidence;

import org.example.cdthqltt.entity.MinhChung;
import org.example.cdthqltt.service.LoaiMinhChungDanhMuc;

import java.time.LocalDateTime;

/** #64, #66 — không trả đường dẫn lưu trữ; tải tệp qua #67. */
public record MinhChungResponse(Long id, Long hoSoId, String loaiMinhChung, String tenLoai, Integer tuan,
                                String tenFile, Long kichThuoc, Long nguoiTaiLenId, LocalDateTime ngayTaiLen,
                                boolean daKhoa) {

    public static MinhChungResponse tu(MinhChung m) {
        return new MinhChungResponse(m.getId(), m.getHoSo().getId(), m.getLoaiMinhChung(),
                LoaiMinhChungDanhMuc.tenHienThi(m.getLoaiMinhChung()), m.getTuan(), m.getTenFile(), m.getKichThuoc(),
                m.getNguoiTaiLenId(), m.getNgayTaiLen(), Boolean.TRUE.equals(m.getDaKhoa()));
    }
}
