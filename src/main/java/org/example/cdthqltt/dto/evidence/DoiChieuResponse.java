package org.example.cdthqltt.dto.evidence;

import java.util.List;

/** #65 — bảng đối chiếu minh chứng với danh mục bắt buộc của hình thức thực tập (BR-07.6). */
public record DoiChieuResponse(Long hoSoId, String hinhThucThucTap, boolean du, List<Dong> danhMuc,
                               List<String> loaiConThieu) {

    /** {@code nguon}: HE_THONG (đối chiếu từ dữ liệu hệ thống) hoặc TAI_LEN (SV tải tệp). */
    public record Dong(String loaiMinhChung, String tenHienThi, String nguon, boolean daCo, int soTep) {
    }
}
