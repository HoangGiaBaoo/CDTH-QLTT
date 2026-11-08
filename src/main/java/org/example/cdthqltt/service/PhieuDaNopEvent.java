package org.example.cdthqltt.service;

/**
 * Phát ra khi một phiếu đánh giá được nộp (kể cả nộp lại sau khi mở lại). KetQuaService lắng nghe để tự tính
 * điểm khi chặng cuối đã đủ phiếu — tách sự kiện để UC08 không phụ thuộc vòng vào UC10.
 */
public record PhieuDaNopEvent(Long hoSoId, int thuTuChang) {
}
