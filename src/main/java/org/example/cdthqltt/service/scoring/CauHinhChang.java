package org.example.cdthqltt.service.scoring;

import java.math.BigDecimal;

/** Chặng đánh giá và trọng số w_k (đọc từ {@code chang_danh_gia}). */
public record CauHinhChang(int thuTu, String ten, BigDecimal trongSo) {
}
