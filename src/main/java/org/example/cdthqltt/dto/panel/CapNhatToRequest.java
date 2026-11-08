package org.example.cdthqltt.dto.panel;

import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;

import java.time.LocalDateTime;

/** #80 — trường nào null thì giữ nguyên. */
public record CapNhatToRequest(
        LocalDateTime thoiGianBaoCao,
        @Size(max = 200) String diaDiem,
        HinhThucLamViec hinhThuc,
        @Size(max = 500) String ghiChuPheDuyet,
        @Size(max = 500) String duongDanGhiHinh) {
}
