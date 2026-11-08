package org.example.cdthqltt.dto.report;

import java.time.LocalDateTime;

/** #89, #90, #92, #93 — không trả đường dẫn lưu trữ; tải tệp qua #91. */
public record BaoCaoResponse(Long id, Long hoSoId, Integer phienBan, String tenFile, LocalDateTime ngayNop,
                             boolean nopMuon, long soNgayTre, LocalDateTime xacNhanDvhd, LocalDateTime xacNhanGvhd,
                             boolean laMoiNhat, boolean daDuXacNhan) {
}
