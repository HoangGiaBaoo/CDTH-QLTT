package org.example.cdthqltt.dto.audit;

import org.example.cdthqltt.entity.NhatKyHeThong;

import java.time.LocalDateTime;

public record NhatKyResponse(Long id, LocalDateTime thoiDiem, Long nguoiThucHien, String vaiTro, String hanhVi,
                             String doiTuong, Long doiTuongId, String giaTriTruoc, String giaTriSau) {

    public static NhatKyResponse from(NhatKyHeThong n) {
        return new NhatKyResponse(n.getId(), n.getThoiDiem(), n.getNguoiThucHien(), n.getVaiTro(), n.getHanhVi(),
                n.getDoiTuong(), n.getDoiTuongId(), n.getGiaTriTruoc(), n.getGiaTriSau());
    }
}
