package org.example.cdthqltt.dto.result;

import java.math.BigDecimal;

/** Khoảng điểm của một mức (Đ13 k2) — đọc từ rubric của đợt để in mục III "Xếp loại". */
public record MucXepLoai(int muc, BigDecimal tu, BigDecimal den) {
}
