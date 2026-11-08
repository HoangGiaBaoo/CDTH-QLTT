package org.example.cdthqltt.dto.feedback;

import jakarta.validation.Valid;

import java.util.List;

/** Nội dung phiếu TTTN-08a lưu trong cột JSON du_lieu_tieu_chi; ý kiến bổ sung (mục 2) lưu ở y_kien_mo. */
public record Phieu08a(List<@Valid DanhGiaTieuChi> tieuChi) {
}
