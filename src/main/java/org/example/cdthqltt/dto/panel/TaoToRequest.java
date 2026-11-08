package org.example.cdthqltt.dto.panel;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;

import java.time.LocalDateTime;
import java.util.List;

/** #79 — thành lập Tổ đánh giá cho một nhóm SV báo cáo cùng buổi. */
public record TaoToRequest(
        @NotNull(message = "Vui lòng chọn đợt thực tập") Long dotId,
        @NotEmpty(message = "Vui lòng chọn sinh viên báo cáo") List<@NotNull Long> hoSoIds,
        @NotEmpty(message = "Vui lòng thêm thành viên") List<@Valid ThanhVien> thanhViens,
        LocalDateTime thoiGianBaoCao,
        @Size(max = 200) String diaDiem,
        HinhThucLamViec hinhThuc,
        @Size(max = 500) String ghiChuPheDuyet) {

    public record ThanhVien(@NotNull(message = "Thiếu người dùng") Long nguoiDungId,
                            @NotNull(message = "Thiếu nhóm người chấm") NhomNguoiCham nhom,
                            Boolean laChuTich) {
    }
}
