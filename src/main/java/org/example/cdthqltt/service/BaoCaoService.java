package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.report.BaoCaoResponse;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.service.storage.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/** UC11 — báo cáo thực tập TTTN-06: mỗi lần nộp là một phiên bản mới, ĐVHD rồi GVHD xác nhận. */
@Service
@RequiredArgsConstructor
public class BaoCaoService {

    private final BaoCaoThucTapRepository baoCaoRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final ChangDanhGiaRepository changRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final ThanhVienToDanhGiaRepository thanhVienRepo;
    private final HoSoThucTapService hoSoService;
    private final FileStorageService storage;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    /** Hợp đồng cho người A: phiên bản mới nhất đã đủ hai xác nhận. */
    @Transactional(readOnly = true)
    public boolean daDuXacNhan(Long hoSoId) {
        return baoCaoRepo.findTopByHoSoIdOrderByPhienBanDesc(hoSoId).map(BaoCaoThucTap::daDuXacNhan).orElse(false);
    }

    /** #89 — mọi phiên bản, mới nhất trước. */
    @Transactional(readOnly = true)
    public List<BaoCaoResponse> danhSach(Long hoSoId) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        List<BaoCaoThucTap> ds = baoCaoRepo.findByHoSoIdOrderByPhienBanDesc(h.getId());
        Integer moiNhat = ds.isEmpty() ? null : ds.get(0).getPhienBan();
        return ds.stream().map(b -> sangResponse(b, b.getPhienBan().equals(moiNhat))).toList();
    }

    /**
     * #90 — UC11: chỉ pdf/docx ≤ 20 MB (3a), phải xác nhận đã đủ sáu phần TTTN-06, nộp muộn vẫn nhận kèm số ngày
     * trễ (5a), phiên bản mới nhất đã có xác nhận thì phải nhờ GVHD mở lại (6a, BR-11.4).
     */
    @Transactional
    public BaoCaoResponse nop(Long hoSoId, boolean daDuSauPhan, MultipartFile tep) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        if (h.getTrangThai() != TrangThaiHoSo.DANG_THUC_TAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Chỉ nộp báo cáo khi hồ sơ đang thực tập");
        }
        if (!daDuSauPhan) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Vui lòng kiểm tra và xác nhận báo cáo đã đủ sáu phần theo mục II mẫu TTTN-06");
        }
        Optional<BaoCaoThucTap> cu = baoCaoRepo.findTopByHoSoIdOrderByPhienBanDesc(h.getId());
        if (cu.isPresent() && (cu.get().getXacNhanDvhd() != null || cu.get().getXacNhanGvhd() != null)) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Báo cáo đã được xác nhận; liên hệ GVHD để mở lại trước khi thay tệp (BR-11.4)");
        }
        FileStorageService.TepDaLuu luu = storage.luu(tep, h.getId(), FileStorageService.DUOI_BAO_CAO);
        BaoCaoThucTap b = new BaoCaoThucTap();
        b.setHoSo(h);
        b.setPhienBan(cu.map(x -> x.getPhienBan() + 1).orElse(1));
        b.setTenFile(luu.tenFile());
        b.setDuongDan(luu.duongDan());
        b.setNgayNop(LocalDateTime.now());
        b.setNopMuon(soNgayTre(b) > 0);
        baoCaoRepo.save(b);

        thongBaoService.gui("NT-07", nguoiXacNhan(h), "Sinh viên " + h.getSinhVien().getNguoiDung().getHoTen()
                        + " đã nộp báo cáo thực tập (phiên bản " + b.getPhienBan() + ")"
                        + (b.getNopMuon() ? ", nộp muộn " + soNgayTre(b) + " ngày" : "") + ", chờ bạn xác nhận",
                "/records/" + h.getId() + "/reports");
        return sangResponse(b, true);
    }

    /** #91 — tải qua endpoint có kiểm quyền. */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> taiVe(Long baoCaoId) {
        BaoCaoThucTap b = layVaKiemQuyen(baoCaoId);
        return storage.taiVe(b.getDuongDan(), b.getTenFile());
    }

    /**
     * #92 — cán bộ ĐVHD xác nhận hoàn thành kế hoạch, sau đó GVHD xác nhận đủ điều kiện chấm; đủ hai xác nhận
     * thì hồ sơ chuyển Chờ đánh giá cuối kỳ, mở điều kiện chấm chặng 2 (Đ10 k2).
     */
    @Transactional
    public BaoCaoResponse xacNhan(Long baoCaoId) {
        CurrentUser u = SecurityUtils.currentUser();
        BaoCaoThucTap b = layVaKiemQuyen(baoCaoId);
        HoSoThucTap h = b.getHoSo();
        kiemLaMoiNhat(b);
        if (h.getTrangThai() != TrangThaiHoSo.DANG_THUC_TAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ không ở trạng thái Đang thực tập");
        }
        LocalDateTime bayGio = LocalDateTime.now();
        if (u.laCanBoDvhd()) {
            if (h.getCanBoDvhd() == null || !h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) {
                throw BusinessException.khongCoQuyen();
            }
            if (b.getXacNhanDvhd() != null) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Bạn đã xác nhận báo cáo này");
            }
            b.setXacNhanDvhd(bayGio);
        } else {
            if (!laGvhd(h, u)) {
                throw BusinessException.khongCoQuyen();
            }
            if (b.getXacNhanGvhd() != null) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Bạn đã xác nhận báo cáo này");
            }
            if (b.getXacNhanDvhd() == null) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Cán bộ ĐVHD cần xác nhận hoàn thành kế hoạch thực tập trước khi GVHD xác nhận đủ điều kiện chấm");
            }
            b.setXacNhanGvhd(bayGio);
        }
        if (b.daDuXacNhan()) {
            hoSoService.chuyenTrangThai(h, TrangThaiHoSo.CHO_DANH_GIA, "Báo cáo TTTN-06 đủ hai xác nhận");
            List<Long> nguoiNhan = new ArrayList<>();
            nguoiNhan.add(h.getSinhVien().getNguoiDung().getId());
            thanhVienRepo.theoHoSo(h.getId()).forEach(tv -> nguoiNhan.add(tv.getNguoiDung().getId()));
            thongBaoService.gui("NT-12", nguoiNhan, "Báo cáo của sinh viên " + h.getSinhVien().getNguoiDung().getHoTen()
                    + " đã đủ xác nhận; hồ sơ chờ đánh giá cuối kỳ", "/records/" + h.getId());
        }
        return sangResponse(b, true);
    }

    /**
     * #93 — BR-11.4: GVHD mở lại để SV thay tệp; xóa hai xác nhận của phiên bản mới nhất (giá trị cũ ghi nhật ký).
     * Hồ sơ đã sang Chờ đánh giá thì quay về Đang thực tập, trừ khi Tổ đã có phiếu chặng cuối được nộp.
     */
    @Transactional
    public BaoCaoResponse moLai(Long baoCaoId) {
        CurrentUser u = SecurityUtils.currentUser();
        BaoCaoThucTap b = layVaKiemQuyen(baoCaoId);
        HoSoThucTap h = b.getHoSo();
        if (!laGvhd(h, u)) {
            throw BusinessException.khongCoQuyen();
        }
        kiemLaMoiNhat(b);
        if (b.getXacNhanDvhd() == null && b.getXacNhanGvhd() == null) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Báo cáo chưa có xác nhận nào, sinh viên vẫn nộp lại được");
        }
        if (h.getTrangThai() == TrangThaiHoSo.CHO_DANH_GIA) {
            List<ChangDanhGia> cacChang = changRepo.findByDotIdOrderByThuTu(h.getDot().getId());
            ChangDanhGia changCuoi = cacChang.get(cacChang.size() - 1);
            boolean daCoPhieu = phieuRepo.findByHoSoIdAndChangIdOrderById(h.getId(), changCuoi.getId()).stream()
                    .anyMatch(PhieuDanhGia::daNop);
            if (daCoPhieu) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                        "Tổ đánh giá đã nộp phiếu cuối kỳ cho sinh viên này, không mở lại báo cáo được");
            }
            hoSoService.chuyenTrangThai(h, TrangThaiHoSo.DANG_THUC_TAP, "GVHD mở lại báo cáo");
        } else if (h.getTrangThai() != TrangThaiHoSo.DANG_THUC_TAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ đã kết thúc, không mở lại báo cáo được");
        }
        Map<String, Object> truoc = new LinkedHashMap<>();
        truoc.put("phienBan", b.getPhienBan());
        truoc.put("xacNhanDvhd", b.getXacNhanDvhd());
        truoc.put("xacNhanGvhd", b.getXacNhanGvhd());
        b.setXacNhanDvhd(null);
        b.setXacNhanGvhd(null);
        nhatKyService.ghiVet("MO_LAI_BAO_CAO", "bao_cao_thuc_tap", b.getId(), truoc, Map.of("phienBan", b.getPhienBan()));
        thongBaoService.gui("NT-13", List.of(h.getSinhVien().getNguoiDung().getId()),
                "GVHD đã mở lại báo cáo thực tập, bạn có thể nộp phiên bản mới", "/records/" + h.getId() + "/reports");
        return sangResponse(b, true);
    }

    // ------------------------------------------------------------------

    private BaoCaoThucTap layVaKiemQuyen(Long baoCaoId) {
        CurrentUser u = SecurityUtils.currentUser();
        BaoCaoThucTap b = baoCaoRepo.findById(baoCaoId).orElse(null);
        if (b == null) {
            throw u.laAdmin() ? BusinessException.khongTimThay("báo cáo") : BusinessException.khongCoQuyen();
        }
        hoSoService.layVaKiemQuyen(b.getHoSo().getId(), u);
        return b;
    }

    private void kiemLaMoiNhat(BaoCaoThucTap b) {
        boolean moiNhat = baoCaoRepo.findTopByHoSoIdOrderByPhienBanDesc(b.getHoSo().getId())
                .map(x -> x.getId().equals(b.getId())).orElse(false);
        if (!moiNhat) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Chỉ thao tác trên phiên bản báo cáo mới nhất");
        }
    }

    private boolean laGvhd(HoSoThucTap h, CurrentUser u) {
        return u.laGiangVien() && phanCongRepo.existsByHoSoIdAndGiangVienId(h.getId(), u.giangVienId());
    }

    private List<Long> nguoiXacNhan(HoSoThucTap h) {
        List<Long> ds = new ArrayList<>();
        if (h.getCanBoDvhd() != null) {
            ds.add(h.getCanBoDvhd().getNguoiDung().getId());
        }
        phanCongRepo.findByHoSoId(h.getId()).ifPresent(p -> ds.add(p.getGiangVien().getNguoiDung().getId()));
        return ds;
    }

    /** UC11 5a: so ngày nộp với hạn nộp báo cáo của đợt; đợt chưa đặt hạn thì lấy ngày kết thúc thực tập. */
    private static long soNgayTre(BaoCaoThucTap b) {
        DotThucTap dot = b.getHoSo().getDot();
        LocalDate han = dot.getHanNopBaoCao() != null ? dot.getHanNopBaoCao() : dot.getNgayKetThuc();
        return Math.max(0, ChronoUnit.DAYS.between(han, b.getNgayNop().toLocalDate()));
    }

    private static BaoCaoResponse sangResponse(BaoCaoThucTap b, boolean laMoiNhat) {
        return new BaoCaoResponse(b.getId(), b.getHoSo().getId(), b.getPhienBan(), b.getTenFile(), b.getNgayNop(),
                Boolean.TRUE.equals(b.getNopMuon()), soNgayTre(b), b.getXacNhanDvhd(), b.getXacNhanGvhd(), laMoiNhat,
                b.daDuXacNhan());
    }
}
