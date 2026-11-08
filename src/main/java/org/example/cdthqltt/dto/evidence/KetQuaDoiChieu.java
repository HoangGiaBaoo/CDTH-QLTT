package org.example.cdthqltt.dto.evidence;

import java.util.List;

/** Hợp đồng cho người A — UC10 điều kiện (d) Đ15 k3, RP-04. {@code loaiConThieu} là tên hiển thị. */
public record KetQuaDoiChieu(boolean du, List<String> loaiConThieu) {
}
