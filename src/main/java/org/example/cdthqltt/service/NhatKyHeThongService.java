package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.audit.NhatKyResponse;
import org.example.cdthqltt.entity.NhatKyHeThong;
import org.example.cdthqltt.repository.NhatKyHeThongRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;

/**
 * Lưu vết thay đổi (Đ14 k4c): nộp/mở lại phiếu, tính lại điểm, đổi GVHD, sửa trọng số, điểm thưởng, công bố…
 * Ghi trong cùng giao dịch với thao tác nghiệp vụ: thao tác hỏng thì vết cũng không còn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NhatKyHeThongService {

    private final NhatKyHeThongRepository repo;
    private final JsonMapper jsonMapper;

    @Transactional
    public void ghiVet(String hanhVi, String doiTuong, Long doiTuongId, Object truoc, Object sau) {
        CurrentUser u = SecurityUtils.currentUserOrNull();
        NhatKyHeThong nk = new NhatKyHeThong();
        nk.setNguoiThucHien(u != null ? u.nguoiDungId() : null);
        nk.setVaiTro(u != null ? u.vaiTro().name() : "HE_THONG");
        nk.setHanhVi(hanhVi);
        nk.setDoiTuong(doiTuong);
        nk.setDoiTuongId(doiTuongId);
        nk.setGiaTriTruoc(sangChuoi(truoc));
        nk.setGiaTriSau(sangChuoi(sau));
        repo.save(nk);
    }

    @Transactional(readOnly = true)
    public PageResponse<NhatKyResponse> traCuu(String doiTuong, Long doiTuongId, Long nguoiThucHien,
                                               LocalDateTime tu, LocalDateTime den, int page, int size) {
        var kq = repo.timKiem(rong(doiTuong), doiTuongId, nguoiThucHien, tu, den,
                PageRequest.of(Math.max(page, 0), size <= 0 ? PageResponse.KICH_THUOC_MAC_DINH : size));
        return PageResponse.of(kq, NhatKyResponse::from);
    }

    private String sangChuoi(Object giaTri) {
        if (giaTri == null) {
            return null;
        }
        if (giaTri instanceof CharSequence s) {
            return s.toString();
        }
        try {
            return jsonMapper.writeValueAsString(giaTri);
        } catch (RuntimeException e) {
            log.warn("Không chuyển được giá trị nhật ký sang JSON", e);
            return String.valueOf(giaTri);
        }
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
