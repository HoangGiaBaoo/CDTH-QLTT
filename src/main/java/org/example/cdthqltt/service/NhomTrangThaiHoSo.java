package org.example.cdthqltt.service;

import org.example.cdthqltt.entity.enums.TrangThaiHoSo;

import java.util.EnumSet;
import java.util.Set;

/** Các nhóm trạng thái hồ sơ dùng chung khi đếm hạn mức và lọc danh sách. */
public final class NhomTrangThaiHoSo {

    /**
     * CBR-03: hồ sơ "chiếm chỗ" của cán bộ ĐVHD = đã được cán bộ xác nhận trở đi. Đếm động bằng truy vấn nên
     * khi GVHD từ chối (hồ sơ về NHAP) bộ đếm tự giảm — không cần cột đếm.
     */
    public static final Set<TrangThaiHoSo> TINH_HAN_MUC_CAN_BO = EnumSet.of(TrangThaiHoSo.CHO_GVHD,
            TrangThaiHoSo.DANG_THUC_TAP, TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.HOAN_THANH,
            TrangThaiHoSo.KHONG_HOAN_THANH, TrangThaiHoSo.GIAN_DOAN);

    /** Hồ sơ đang trong quá trình thực tập (sau khi GVHD duyệt, trước khi công bố kết quả). */
    public static final Set<TrangThaiHoSo> DANG_THUC_HIEN = EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP,
            TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.GIAN_DOAN);

    private NhomTrangThaiHoSo() {
    }
}
