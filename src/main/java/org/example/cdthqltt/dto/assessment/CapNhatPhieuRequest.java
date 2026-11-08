package org.example.cdthqltt.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

/** #73 — ghi đè nhận xét và toàn bộ điểm của phiếu. */
public record CapNhatPhieuRequest(
        @Size(max = 5000) String nhanXetChung,
        List<@Valid DiemCloRequest> diemClos) {
}
