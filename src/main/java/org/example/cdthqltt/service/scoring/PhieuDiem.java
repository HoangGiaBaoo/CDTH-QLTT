package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.entity.enums.NhomNguoiCham;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Một phiếu đã nộp (chỉ phiếu DA_NOP được đưa vào). {@code vangMat}: người chấm vắng mặt ở Tổ chặng 2 —
 * phiếu vẫn được truyền vào để bộ máy tự loại, giúp kiểm thử chứng minh được quy tắc.
 */
public record PhieuDiem(int chang,
                        NhomNguoiCham nhom,
                        Long nguoiChamId,
                        boolean vangMat,
                        Map<String, BigDecimal> diemTheoClo) {
}
