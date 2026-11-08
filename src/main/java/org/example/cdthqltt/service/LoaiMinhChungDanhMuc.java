package org.example.cdthqltt.service;

import java.util.Map;
import java.util.Set;

/**
 * Mã loại minh chứng dùng trong {@code loai_minh_chung_bat_buoc} và {@code minh_chung.loai_minh_chung}
 * (seed V2). Mã thuộc {@link #HE_THONG} được đối chiếu từ dữ liệu hệ thống, không bắt sinh viên tải lại.
 */
public final class LoaiMinhChungDanhMuc {

    public static final String PHIEU_DANG_KY = "PHIEU_DANG_KY";
    public static final String NHAT_KY = "NHAT_KY";
    public static final String KE_HOACH_HOC_TAP = "KE_HOACH_HOC_TAP";
    public static final String BAO_CAO_THUC_TAP = "BAO_CAO_THUC_TAP";
    public static final String PHAN_HOI_08A = "PHAN_HOI_08A";
    public static final String PHAN_HOI_08B = "PHAN_HOI_08B";
    public static final String NHAN_XET_GVHD = "NHAN_XET_GVHD";

    public static final Set<String> HE_THONG = Set.of(PHIEU_DANG_KY, NHAT_KY, KE_HOACH_HOC_TAP, BAO_CAO_THUC_TAP,
            PHAN_HOI_08A, PHAN_HOI_08B, NHAN_XET_GVHD);

    private static final Map<String, String> TEN = Map.ofEntries(
            Map.entry(PHIEU_DANG_KY, "Phiếu đăng ký TTTN-01 có xác nhận ĐVHD"),
            Map.entry(NHAT_KY, "Nhật ký thực tập"),
            Map.entry(KE_HOACH_HOC_TAP, "Kế hoạch học tập TTTN-02"),
            Map.entry(BAO_CAO_THUC_TAP, "Báo cáo thực tập TTTN-06"),
            Map.entry(PHAN_HOI_08A, "Phiếu phản hồi của ĐVHD (TTTN-08a)"),
            Map.entry(PHAN_HOI_08B, "Phiếu phản hồi của sinh viên (TTTN-08b)"),
            Map.entry(NHAN_XET_GVHD, "Nhận xét, đánh giá của GVHD"),
            Map.entry("DE_CUONG_NGHIEN_CUU", "Đề cương nghiên cứu"),
            Map.entry("SAN_PHAM_NGHIEN_CUU", "Sản phẩm nghiên cứu"),
            Map.entry("KE_HOACH_KINH_DOANH", "Kế hoạch kinh doanh"),
            Map.entry("BAO_CAO_KET_QUA", "Báo cáo kết quả"),
            Map.entry("XAC_NHAN_CO_VAN", "Xác nhận của cố vấn"),
            Map.entry("KE_HOACH_HOAT_DONG", "Kế hoạch hoạt động"),
            Map.entry("ANH_VIDEO_HOAT_DONG", "Ảnh/video minh chứng hoạt động"),
            Map.entry("THU_CAM_ON", "Thư cảm ơn từ ĐVHD"),
            Map.entry("QUYET_DINH_TIEP_NHAN", "Quyết định tiếp nhận"),
            Map.entry("BAO_CAO_CONG_VIEC", "Báo cáo công việc"),
            Map.entry("XAC_NHAN_DVHD", "Xác nhận của ĐVHD"),
            Map.entry("HOP_DONG_TRAO_DOI", "Hợp đồng trao đổi / Biên bản thỏa thuận"),
            Map.entry("GIAY_CHUNG_NHAN_HOAN_THANH", "Giấy chứng nhận hoàn thành"),
            Map.entry("BAO_CAO_SONG_NGU", "Báo cáo kết quả song ngữ"),
            Map.entry("KHAC", "Minh chứng khác"));

    private LoaiMinhChungDanhMuc() {
    }

    public static String tenHienThi(String ma) {
        return TEN.getOrDefault(ma, ma);
    }

    public static String nguon(String ma) {
        return HE_THONG.contains(ma) ? "HE_THONG" : "TAI_LEN";
    }

    public static boolean hopLe(String ma) {
        return TEN.containsKey(ma);
    }
}
