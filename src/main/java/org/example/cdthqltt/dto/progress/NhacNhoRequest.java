package org.example.cdthqltt.dto.progress;

import java.util.List;

/** #60 — bỏ trống {@code hoSoIds} thì nhắc mọi SV của GV đang quá hạn ghi nhật ký. */
public record NhacNhoRequest(List<Long> hoSoIds) {
}
