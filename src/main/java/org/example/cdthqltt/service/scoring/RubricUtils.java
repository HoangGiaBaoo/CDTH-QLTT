package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

/**
 * Một chỗ duy nhất cho làm tròn và quy đổi mức — dùng chung khi nộp phiếu (CBR-10), khi tính kết quả và khi
 * tính HPself, để không có chỗ quy đổi trên điểm đã làm tròn, chỗ khác trên điểm chưa làm tròn.
 */
public final class RubricUtils {

    private static final BigDecimal HAI = BigDecimal.valueOf(2);

    private RubricUtils() {
    }

    /** Làm tròn 0,1 theo HALF_UP — chỉ gọi ở bước cuối (CBR-18, Đ14 k4a). */
    public static BigDecimal lamTron(BigDecimal x) {
        return x.setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Đ13 k2: điểm thuộc khoảng [diemMin; diemMax) của mức nào; riêng mức cao nhất lấy cả diemMax (10 ⇒ Mức 4).
     * Khoảng đọc từ muc_rubric của đợt, không viết cứng.
     */
    public static int xacDinhMuc(BigDecimal diem, List<KhoangMuc> bangMuc) {
        if (bangMuc == null || bangMuc.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Chưa cấu hình rubric cho đợt thực tập");
        }
        KhoangMuc cao = bangMuc.stream().max(Comparator.comparingInt(KhoangMuc::muc)).orElseThrow();
        for (KhoangMuc k : bangMuc) {
            boolean trenMin = diem.compareTo(k.diemMin()) >= 0;
            boolean duoiMax = k == cao ? diem.compareTo(k.diemMax()) <= 0 : diem.compareTo(k.diemMax()) < 0;
            if (trenMin && duoiMax) {
                return k.muc();
            }
        }
        throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                "Điểm " + hienThi(diem) + " nằm ngoài thang điểm của rubric");
    }

    /** Điểm giữa khoảng của một mức — quy đổi mức tự đánh giá sang điểm để tính HPself (UC12). */
    public static BigDecimal diemGiuaKhoang(KhoangMuc k) {
        return k.diemMin().add(k.diemMax()).divide(HAI, MathContext.DECIMAL64);
    }

    /** Hiển thị kiểu Việt Nam trong thông điệp: 7,5. */
    public static String hienThi(BigDecimal x) {
        return x.stripTrailingZeros().toPlainString().replace('.', ',');
    }
}
