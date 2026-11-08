package org.example.cdthqltt.dto.result;

/**
 * #83 — hai dạng trả về theo vai trò: cán bộ (giáo vụ, GV, cán bộ ĐVHD) nhận bảng TTTN-07 đầy đủ; sinh viên
 * chỉ nhận điểm CLO, điểm học phần và kết luận, không có điểm theo nhóm người chấm (UC13, BR-12.5).
 */
public sealed interface KetQuaChiTietResponse permits BangTongHopResponse, KetQuaSinhVienResponse {
}
