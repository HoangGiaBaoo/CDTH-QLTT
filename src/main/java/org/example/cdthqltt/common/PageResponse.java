package org.example.cdthqltt.common;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/** Trang dữ liệu; mặc định 15 dòng/trang (yêu cầu giao diện trong BCPT). */
public record PageResponse<T>(List<T> items, int page, int size, long total) {

    public static final int KICH_THUOC_MAC_DINH = 15;

    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(page.getContent().stream().map(mapper).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements());
    }

    /** Phân trang trong bộ nhớ cho danh sách đã lọc theo quyền ở service. */
    public static <T> PageResponse<T> of(List<T> all, int page, int size) {
        int kichThuoc = size <= 0 ? KICH_THUOC_MAC_DINH : size;
        int from = Math.min(Math.max(page, 0) * kichThuoc, all.size());
        int to = Math.min(from + kichThuoc, all.size());
        return new PageResponse<>(all.subList(from, to), Math.max(page, 0), kichThuoc, all.size());
    }
}
