package org.example.cdthqltt.dto.feedback;

import org.example.cdthqltt.entity.enums.LoaiPhanHoi;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * #94, #96 — đúng một trong {@code phieu08a} / {@code phieu08b} có giá trị theo {@code loai}. Với 08b, người xem
 * không phải chính sinh viên thì phần A và {@code yKienMo} bị bỏ (chỉ thống kê ẩn danh, RP-06).
 */
public record PhanHoiResponse(Long id, Long hoSoId, LoaiPhanHoi loai, String nguoiGui, LocalDateTime ngayGui,
                              Phieu08a phieu08a, Phieu08b phieu08b, String yKienMo, BigDecimal hpSelf,
                              BigDecimal chiSoTuNhanThuc) {
}
