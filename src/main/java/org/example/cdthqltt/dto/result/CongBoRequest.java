package org.example.cdthqltt.dto.result;

import java.util.List;

/**
 * #87 — công bố theo danh sách hồ sơ ({@code hoSoIds}) hoặc cả đợt ({@code termId}, bỏ trống = đợt đang mở).
 * Theo danh sách: mọi hồ sơ phải đã xác nhận, không thì không công bố hồ sơ nào.
 */
public record CongBoRequest(Long termId, List<Long> hoSoIds) {
}
