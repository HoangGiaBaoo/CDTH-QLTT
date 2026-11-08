package org.example.cdthqltt.dto.progress;

import java.time.LocalDate;

/** Một SV đã được nhắc ghi nhật ký; {@code ngayGhiCuoi} null nghĩa là chưa ghi lần nào. */
public record NhacNhoResponse(Long hoSoId, String maSv, String hoTen, LocalDate ngayGhiCuoi) {
}
