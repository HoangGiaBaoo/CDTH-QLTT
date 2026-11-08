package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.assignment.*;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;
import org.example.cdthqltt.repository.GiangVienRepository;
import org.example.cdthqltt.repository.HoSoThucTapRepository;
import org.example.cdthqltt.repository.PhanCongGvhdRepository;
import org.example.cdthqltt.repository.PhieuDanhGiaRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/** UC05 — phân công GVHD; hạn mức riêng từng giảng viên (CBR-04, Đ6 k2b). */
@Service
@RequiredArgsConstructor
public class PhanCongService {

    private final PhanCongGvhdRepository phanCongRepo;
    private final HoSoThucTapRepository hoSoRepo;
    private final GiangVienRepository giangVienRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final DotThucTapService dotService;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    /** Hợp đồng cho người A (UC08 xác định người chấm chặng 1, UC09 kiểm thành phần Tổ). */
    @Transactional(readOnly = true)
    public GiangVien layGvhd(Long hoSoId) {
        return phanCongRepo.findByHoSoId(hoSoId).map(PhanCongGvhd::getGiangVien)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Hồ sơ chưa được phân công GVHD"));
    }

    /** #48 — BR-05.4: GV chỉ thấy SV của mình, SV chỉ thấy GVHD của mình. */
    @Transactional(readOnly = true)
    public List<PhanCongResponse> danhSach(Long dotId) {
        CurrentUser u = SecurityUtils.currentUser();
        if (u.laSinhVien()) {
            return hoSoRepo.findBySinhVienIdOrderByIdDesc(u.sinhVienId()).stream()
                    .filter(h -> dotId == null || h.getDot().getId().equals(dotId))
                    .map(h -> phanCongRepo.findByHoSoId(h.getId()))
                    .flatMap(Optional::stream)
                    .map(PhanCongResponse::tu)
                    .toList();
        }
        DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
        return phanCongRepo.theoDot(dot.getId()).stream()
                .filter(p -> u.laAdmin() || p.getGiangVien().getId().equals(u.giangVienId()))
                .map(PhanCongResponse::tu)
                .toList();
    }

    /** #49 */
    @Transactional(readOnly = true)
    public UngVienPhanCongResponse ungVien(Long dotId) {
        DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
        var sinhViens = hoSoRepo.choPhanCong(dot.getId()).stream()
                .map(h -> new UngVienPhanCongResponse.HoSoChoPhanCong(h.getId(), h.getSinhVien().getId(),
                        h.getSinhVien().getMaSv(), h.getSinhVien().getNguoiDung().getHoTen(), h.getSinhVien().getLop(),
                        h.getDonVi() == null ? null : h.getDonVi().getTen(), h.getHinhThucThucTap()))
                .toList();
        var giangViens = giangVienRepo.findAllByOrderByMaGv().stream()
                .filter(gv -> gv.getNguoiDung().dangHoatDong())
                .map(gv -> {
                    long daNhan = phanCongRepo.demTheoGiangVien(gv.getId(), dot.getId());
                    return new UngVienPhanCongResponse.GiangVienHanMuc(gv.getId(), gv.getMaGv(), gv.getNguoiDung().getHoTen(),
                            gv.getBoMon(), daNhan, gv.getSoSvToiDa(), Math.max(0, gv.getSoSvToiDa() - daNhan));
                })
                .toList();
        return new UngVienPhanCongResponse(sinhViens, giangViens);
    }

    /**
     * #50 — UC05 4a: kiểm toàn bộ lựa chọn trước khi ghi; một hồ sơ sai hoặc vượt hạn mức thì không phân công hồ sơ
     * nào (cả lô trong một giao dịch, lỗi ném ra ⇒ rollback).
     */
    @Transactional
    public List<PhanCongResponse> phanCongHangLoat(PhanCongRequest req) {
        GiangVien gv = layGiangVienHoatDong(req.giangVienId());
        List<Long> ids = req.hoSoIds().stream().distinct().toList();
        List<HoSoThucTap> hoSos = hoSoRepo.findAllById(ids);
        if (hoSos.size() != ids.size()) {
            throw BusinessException.khongTimThay("hồ sơ thực tập");
        }
        Set<Long> cacDot = new HashSet<>();
        for (HoSoThucTap h : hoSos) {
            cacDot.add(h.getDot().getId());
            if (h.getTrangThai() != TrangThaiHoSo.CHO_GVHD) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Hồ sơ của " + h.getSinhVien().getNguoiDung().getHoTen() + " chưa được ĐVHD xác nhận tiếp nhận");
            }
            // BR-05.1: mỗi hồ sơ đúng một GVHD.
            if (phanCongRepo.existsByHoSoId(h.getId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                        "Sinh viên " + h.getSinhVien().getNguoiDung().getHoTen() + " đã có GVHD; dùng chức năng Đổi giảng viên");
            }
        }
        if (cacDot.size() > 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Các hồ sơ được chọn phải cùng một đợt thực tập");
        }
        Long dotId = cacDot.iterator().next();
        kiemHanMuc(gv, dotId, hoSos.size());

        Long nguoiPhanCong = SecurityUtils.currentUser().nguoiDungId();
        List<PhanCongGvhd> moi = hoSos.stream().map(h -> {
            PhanCongGvhd p = new PhanCongGvhd();
            p.setHoSo(h);
            p.setGiangVien(gv);
            p.setNguoiPhanCong(nguoiPhanCong);
            return p;
        }).toList();
        phanCongRepo.saveAll(moi);
        nhatKyService.ghiVet("PHAN_CONG_GVHD", "giang_vien", gv.getId(), null,
                Map.of("dotId", dotId, "hoSoIds", ids));

        // Đ6 k2c: kết quả phân công công khai ngay — báo GV và từng SV (NT-04).
        List<Long> nguoiNhan = new ArrayList<>();
        nguoiNhan.add(gv.getNguoiDung().getId());
        hoSos.forEach(h -> nguoiNhan.add(h.getSinhVien().getNguoiDung().getId()));
        thongBaoService.gui("NT-04", nguoiNhan,
                "Kết quả phân công: giảng viên " + gv.getNguoiDung().getHoTen() + " hướng dẫn " + hoSos.size()
                        + " sinh viên; GVHD vui lòng duyệt hồ sơ", "/assignments");
        return moi.stream().map(PhanCongResponse::tu).toList();
    }

    /** #51 — luồng thay thế UC05: chặn khi GV cũ đã nộp phiếu (phải mở lại phiếu trước). */
    @Transactional
    public PhanCongResponse doiGvhd(Long phanCongId, DoiGvhdRequest req) {
        PhanCongGvhd p = phanCongRepo.findById(phanCongId)
                .orElseThrow(() -> BusinessException.khongTimThay("phân công"));
        GiangVien cu = p.getGiangVien();
        GiangVien moi = layGiangVienHoatDong(req.giangVienId());
        if (cu.getId().equals(moi.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Giảng viên mới trùng giảng viên hiện tại");
        }
        HoSoThucTap h = p.getHoSo();
        if (phieuRepo.coPhieuCuaNguoiCham(h.getId(), cu.getNguoiDung().getId(), TrangThaiPhieu.DA_NOP)) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Giảng viên " + cu.getNguoiDung().getHoTen() + " đã nộp phiếu đánh giá cho sinh viên này; cần mở lại phiếu trước khi đổi GVHD");
        }
        kiemHanMuc(moi, h.getDot().getId(), 1);

        String lyDo = req.lyDo().trim();
        p.setGiangVien(moi);
        p.setLyDoThayDoi(lyDo);
        p.setNguoiPhanCong(SecurityUtils.currentUser().nguoiDungId());
        // Đ14 k4c: đổi GVHD ảnh hưởng người chấm ⇒ ghi nhật ký.
        nhatKyService.ghiVet("DOI_GVHD", "ho_so_thuc_tap", h.getId(),
                Map.of("giangVienId", cu.getId()), Map.of("giangVienId", moi.getId(), "lyDo", lyDo));
        thongBaoService.gui("NT-04",
                List.of(cu.getNguoiDung().getId(), moi.getNguoiDung().getId(), h.getSinhVien().getNguoiDung().getId()),
                "Sinh viên " + h.getSinhVien().getNguoiDung().getHoTen() + " đổi GVHD từ " + cu.getNguoiDung().getHoTen()
                        + " sang " + moi.getNguoiDung().getHoTen() + ". Lý do: " + lyDo, "/assignments");
        return PhanCongResponse.tu(p);
    }

    // ------------------------------------------------------------------

    private GiangVien layGiangVienHoatDong(Long giangVienId) {
        GiangVien gv = giangVienRepo.findById(giangVienId).orElseThrow(() -> BusinessException.khongTimThay("giảng viên"));
        if (!gv.getNguoiDung().dangHoatDong()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Tài khoản giảng viên đang bị vô hiệu hóa");
        }
        return gv;
    }

    /** UC05 4a: báo luôn số SV còn nhận được để giáo vụ chọn lại. */
    private void kiemHanMuc(GiangVien gv, Long dotId, int soThem) {
        long daNhan = phanCongRepo.demTheoGiangVien(gv.getId(), dotId);
        long conNhan = Math.max(0, gv.getSoSvToiDa() - daNhan);
        if (soThem > conNhan) {
            throw new BusinessException(ErrorCode.QUOTA_EXCEEDED,
                    "Giảng viên " + gv.getNguoiDung().getHoTen() + " đã nhận " + daNhan + "/" + gv.getSoSvToiDa()
                            + " sinh viên, chỉ còn nhận được " + conNhan + "; không phân công sinh viên nào (Điều 6 khoản 2 điểm b)");
        }
    }
}
