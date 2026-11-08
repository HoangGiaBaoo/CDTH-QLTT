package org.example.cdthqltt.dto.feedback;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Nội dung phiếu TTTN-08b lưu trong cột JSON du_lieu_tieu_chi: A đánh giá chất lượng (6 nội dung 1–5 + ý kiến
 * khác), B tự đánh giá 7 CLO, C bốn câu tự luận, II cam kết trung thực. Phản hồi mở (A.2) lưu ở y_kien_mo.
 * Phần A chỉ hiện cho chính sinh viên; người khác xem qua thống kê ẩn danh (RP-06).
 */
public record Phieu08b(List<@Valid DanhGiaHaiLong> chatLuong,
                       @Size(max = 2000, message = "Ý kiến khác tối đa 2000 ký tự") String yKienKhac,
                       List<@Valid TuDanhGiaClo> tuDanhGia,
                       @Valid TuLuan tuLuan,
                       Boolean camKet) {
}
