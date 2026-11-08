package org.example.cdthqltt.dto.feedback;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** #95 — mức tự đánh giá đang chọn; được phép chưa đủ 7 CLO (HPself trả null kèm danh sách còn thiếu). */
public record XemTruocHpSelfRequest(
        @NotNull(message = "Thiếu hồ sơ thực tập") Long hoSoId,
        List<@Valid TuDanhGiaClo> tuDanhGia) {
}
