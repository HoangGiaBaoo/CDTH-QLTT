package org.example.cdthqltt.dto.stats;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * #98 — một báo cáo RP-01 … RP-06 dạng bảng: cùng cấu trúc cho mọi loại để giao diện hiển thị và #99 xuất Excel
 * dùng chung. Giá trị ô là số (BigDecimal/Integer/Long) hoặc chuỗi.
 *
 * @param tongHop chỉ số tổng hợp theo thứ tự hiển thị (nhãn tiếng Việt → giá trị)
 * @param ghiChu  căn cứ tính và phạm vi dữ liệu, in dưới bảng
 */
public record BaoCaoThongKeResponse(String maBaoCao, String tenBaoCao, Long dotId, String maDot, String tenDot,
                                    LocalDateTime thoiDiemLap, List<String> cot, List<List<Object>> dong,
                                    Map<String, Object> tongHop, List<String> ghiChu) {
}
