package org.example.cdthqltt.dto.term;

import org.example.cdthqltt.entity.enums.HinhThucThucTap;

/** {@code nguon}: HE_THONG (tự đối chiếu từ dữ liệu sẵn có) hoặc TAI_LEN (sinh viên tải tệp). */
public record LoaiMinhChungResponse(Long id, HinhThucThucTap hinhThucThucTap, String loaiMinhChung, String tenHienThi,
                                    String nguon, boolean batBuoc) {
}
