package org.example.cdthqltt.dto.record;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.cdthqltt.entity.enums.HinhThucLamViec;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;

/**
 * #42, #43 — phiếu đăng ký TTTN-01. Bản nháp được phép thiếu đơn vị / cán bộ / đề tài;
 * đủ thông tin chỉ bắt buộc khi gửi (#44). {@code dotId} bỏ trống ⇒ đợt đang mở đăng ký.
 */
public record HoSoRequest(
        Long dotId,
        @NotNull(message = "Vui lòng chọn hình thức thực tập") HinhThucThucTap hinhThucThucTap,
        Long donViId,
        Long canBoDvhdId,
        @Size(max = 200) String boPhan,
        @Size(max = 300) String deTai,
        HinhThucLamViec hinhThucLamViec,
        @Min(value = 1, message = "Số tuần tham gia tối thiểu 1") @Max(value = 52, message = "Số tuần tham gia tối đa 52") Integer soTuanThamGia,
        @Size(max = 4000) String mucTieu,
        @Size(max = 4000) String sanPhamDuKien) {
}
