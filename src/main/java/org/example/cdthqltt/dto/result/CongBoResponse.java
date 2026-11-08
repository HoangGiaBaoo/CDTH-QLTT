package org.example.cdthqltt.dto.result;

import java.util.List;

/**
 * #87.
 *
 * @param soChuaXacNhan công bố theo đợt: số hồ sơ trong đợt còn chưa có kết quả đã xác nhận (chưa công bố lần này)
 */
public record CongBoResponse(int soDaCongBo, int soHoanThanh, int soKhongHoanThanh, List<Long> hoSoIds,
                             Long soChuaXacNhan) {
}
