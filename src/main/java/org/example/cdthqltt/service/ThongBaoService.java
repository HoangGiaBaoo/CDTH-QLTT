package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.notification.ThongBaoResponse;
import org.example.cdthqltt.entity.ThongBao;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.example.cdthqltt.repository.NguoiDungRepository;
import org.example.cdthqltt.repository.ThongBaoRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Objects;

/** Thông báo trong hệ thống theo mã sự kiện NT-xx (docs/01-nghiep-vu.md mục 8). */
@Service
@RequiredArgsConstructor
public class ThongBaoService {

    private static final int DO_DAI_TOI_DA = 500;

    private final ThongBaoRepository repo;
    private final NguoiDungRepository nguoiDungRepo;

    @Transactional
    public void gui(String maSuKien, Collection<Long> nguoiNhanIds, String noiDung, String duongDan) {
        if (nguoiNhanIds == null) {
            return;
        }
        String nd = noiDung.length() > DO_DAI_TOI_DA ? noiDung.substring(0, DO_DAI_TOI_DA) : noiDung;
        nguoiNhanIds.stream().filter(Objects::nonNull).distinct().forEach(id -> {
            ThongBao tb = new ThongBao();
            tb.setNguoiNhanId(id);
            tb.setMaSuKien(maSuKien);
            tb.setNoiDung(nd);
            tb.setDuongDan(duongDan);
            repo.save(tb);
        });
    }

    /** Gửi cho mọi tài khoản ADMIN đang hoạt động (giáo vụ Khoa). */
    @Transactional
    public void guiGiaoVu(String maSuKien, String noiDung, String duongDan) {
        gui(maSuKien, nguoiDungRepo.findByVaiTroAndTrangThai(VaiTro.ADMIN, TrangThaiTaiKhoan.HOAT_DONG)
                .stream().map(n -> n.getId()).toList(), noiDung, duongDan);
    }

    @Transactional(readOnly = true)
    public PageResponse<ThongBaoResponse> cuaToi(boolean chiChuaDoc, int page, int size) {
        CurrentUser u = SecurityUtils.currentUser();
        var pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? PageResponse.KICH_THUOC_MAC_DINH : size);
        var kq = chiChuaDoc
                ? repo.findByNguoiNhanIdAndDaDocFalseOrderByNgayTaoDescIdDesc(u.nguoiDungId(), pageable)
                : repo.findByNguoiNhanIdOrderByNgayTaoDescIdDesc(u.nguoiDungId(), pageable);
        return PageResponse.of(kq, ThongBaoResponse::from);
    }

    @Transactional
    public ThongBaoResponse danhDauDaDoc(Long id) {
        CurrentUser u = SecurityUtils.currentUser();
        ThongBao tb = repo.findById(id).orElseThrow(() -> BusinessException.khongTimThay("thông báo"));
        if (!tb.getNguoiNhanId().equals(u.nguoiDungId())) {
            throw BusinessException.khongCoQuyen();
        }
        tb.setDaDoc(true);
        return ThongBaoResponse.from(tb);
    }
}
