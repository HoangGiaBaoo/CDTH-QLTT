package org.example.cdthqltt.dto.feedback;

import jakarta.validation.constraints.Size;

/** Phần C phiếu TTTN-08b — bốn câu trao đổi tự thân, theo đúng thứ tự trên biểu mẫu. */
public record TuLuan(
        @Size(max = 2000, message = "Mỗi câu trả lời tối đa 2000 ký tự") String kyNangHocDuoc,
        @Size(max = 2000, message = "Mỗi câu trả lời tối đa 2000 ký tự") String khoKhan,
        @Size(max = 2000, message = "Mỗi câu trả lời tối đa 2000 ký tự") String keHoachCaiThien,
        @Size(max = 2000, message = "Mỗi câu trả lời tối đa 2000 ký tự") String deXuat) {
}
