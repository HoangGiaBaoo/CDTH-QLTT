package org.example.cdthqltt.service;

/**
 * Phát khi một kết quả học phần chuyển Đã công bố (#87) — chạy đồng bộ trong giao dịch công bố. UC12 nghe để
 * tính chỉ số tự nhận thức, vốn chỉ được tính sau khi có kết quả chính thức (BR-12.4).
 */
public record KetQuaDaCongBoEvent(Long hoSoId) {
}
