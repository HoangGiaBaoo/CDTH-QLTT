package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.studyplan.CapNhatKeHoachRequest;
import org.example.cdthqltt.dto.studyplan.KeHoachResponse;
import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.KeHoachHocTap;
import org.example.cdthqltt.entity.MucKeHoach;
import org.example.cdthqltt.entity.PhanCongGvhd;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.TrangThaiKeHoach;
import org.example.cdthqltt.repository.KeHoachHocTapRepository;
import org.example.cdthqltt.repository.PhanCongGvhdRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.util.NgayLamViecUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** UC06 — kế hoạch học tập TTTN-02. */
@Service
@RequiredArgsConstructor
public class KeHoachService {

    /** Đ6 k3a: nộp kế hoạch trong 05 ngày làm việc kể từ ngày bắt đầu thực tập. */
    private static final int SO_NGAY_LAM_VIEC_HAN_NOP = 5;

    private final KeHoachHocTapRepository keHoachRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final HoSoThucTapService hoSoService;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    /** Hợp đồng cho đối chiếu minh chứng: kế hoạch đã đủ hai xác nhận. */
    @Transactional(readOnly = true)
    public boolean daKhoa(Long hoSoId) {
        return keHoachRepo.findByHoSoId(hoSoId).map(kh -> kh.getTrangThai() == TrangThaiKeHoach.DA_KHOA).orElse(false);
    }

    /** #52 */
    @Transactional(readOnly = true)
    public KeHoachResponse theoHoSo(Long hoSoId) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        KeHoachHocTap kh = keHoachRepo.findByHoSoId(h.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Hồ sơ chưa có kế hoạch học tập (kế hoạch được tạo khi GVHD phê duyệt hồ sơ)"));
        return sangResponse(kh);
    }

    /** #53 — chỉ sửa khi Bản nháp. */
    @Transactional
    public KeHoachResponse capNhat(Long keHoachId, CapNhatKeHoachRequest req) {
        KeHoachHocTap kh = layVaKiemQuyen(keHoachId);
        kiemCuaSinhVienDangThucTap(kh);
        if (kh.getTrangThai() != TrangThaiKeHoach.NHAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Kế hoạch đã gửi xác nhận; cần GVHD mở lại mới sửa được (BR-06.4)");
        }
        for (CapNhatKeHoachRequest.Muc m : req.cacMuc()) {
            MucKeHoach muc = kh.getCacMuc().stream().filter(x -> x.getTuan().equals(m.tuan())).findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                            "Kế hoạch không có dòng tuần " + m.tuan()));
            muc.setMucTieu(rong(m.mucTieu()));
            muc.setKetQuaMongDoi(rong(m.ketQuaMongDoi()));
            muc.setHinhThucMinhChung(rong(m.hinhThucMinhChung()));
        }
        return sangResponse(kh);
    }

    /** #54 — UC06 3a: thiếu dòng ⇒ báo số tuần; 4a: quá hạn vẫn nhận nhưng gắn Nộp muộn (BR-06.3). */
    @Transactional
    public KeHoachResponse guiXacNhan(Long keHoachId) {
        KeHoachHocTap kh = layVaKiemQuyen(keHoachId);
        kiemCuaSinhVienDangThucTap(kh);
        if (kh.getTrangThai() != TrangThaiKeHoach.NHAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Kế hoạch đã được gửi xác nhận");
        }
        int soTuan = kh.getHoSo().getDot().getSoTuan();
        List<String> thieu = new ArrayList<>();
        for (MucKeHoach m : kh.getCacMuc()) {
            if (m.getMucTieu() == null || m.getKetQuaMongDoi() == null || m.getHinhThucMinhChung() == null) {
                thieu.add(m.getTuan() > soTuan ? "Tổng kết" : "tuần " + m.getTuan());
            }
        }
        if (!thieu.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Mỗi dòng cần đủ mục tiêu, kết quả mong đợi và hình thức minh chứng; còn thiếu: " + String.join(", ", thieu));
        }
        LocalDateTime bayGio = LocalDateTime.now();
        kh.setNgayNop(bayGio);
        kh.setNopMuon(bayGio.toLocalDate().isAfter(hanNop(kh.getHoSo())));
        kh.setTrangThai(TrangThaiKeHoach.CHO_XAC_NHAN);

        HoSoThucTap h = kh.getHoSo();
        List<Long> nguoiNhan = new ArrayList<>();
        nguoiNhan.add(h.getCanBoDvhd().getNguoiDung().getId());
        phanCongRepo.findByHoSoId(h.getId()).ifPresent(p -> nguoiNhan.add(p.getGiangVien().getNguoiDung().getId()));
        thongBaoService.gui("NT-07", nguoiNhan, "Sinh viên " + h.getSinhVien().getNguoiDung().getHoTen()
                + " đã gửi kế hoạch học tập" + (kh.getNopMuon() ? " (nộp muộn)" : "") + ", chờ bạn xác nhận",
                "/records/" + h.getId() + "/study_plan");
        return sangResponse(kh);
    }

    /** #55 — cán bộ ĐVHD và GVHD của chính hồ sơ lần lượt xác nhận; đủ hai xác nhận ⇒ khóa. */
    @Transactional
    public KeHoachResponse xacNhan(Long keHoachId) {
        CurrentUser u = SecurityUtils.currentUser();
        KeHoachHocTap kh = layVaKiemQuyen(keHoachId);
        HoSoThucTap h = kh.getHoSo();
        if (kh.getTrangThai() != TrangThaiKeHoach.CHO_XAC_NHAN) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Kế hoạch không ở trạng thái chờ xác nhận");
        }
        LocalDateTime bayGio = LocalDateTime.now();
        if (u.laCanBoDvhd()) {
            if (!h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) {
                throw BusinessException.khongCoQuyen();
            }
            if (kh.getXacNhanDvhd() != null) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Bạn đã xác nhận kế hoạch này");
            }
            kh.setXacNhanDvhd(bayGio);
        } else {
            if (!laGvhd(h.getId(), u)) {
                throw BusinessException.khongCoQuyen();
            }
            if (kh.getXacNhanGvhd() != null) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Bạn đã xác nhận kế hoạch này");
            }
            kh.setXacNhanGvhd(bayGio);
        }
        if (kh.getXacNhanDvhd() != null && kh.getXacNhanGvhd() != null) {
            // Khóa kế hoạch; minh chứng "Kế hoạch học tập" được đối chiếu tự động từ trạng thái này.
            kh.setTrangThai(TrangThaiKeHoach.DA_KHOA);
            thongBaoService.gui("NT-07", List.of(h.getSinhVien().getNguoiDung().getId()),
                    "Kế hoạch học tập đã được ĐVHD và GVHD xác nhận", "/records/" + h.getId() + "/study_plan");
        }
        return sangResponse(kh);
    }

    /** #56 — BR-06.4: GVHD mở lại để SV sửa; xóa cả hai xác nhận, ghi nhật ký. */
    @Transactional
    public KeHoachResponse moLai(Long keHoachId) {
        CurrentUser u = SecurityUtils.currentUser();
        KeHoachHocTap kh = layVaKiemQuyen(keHoachId);
        if (!laGvhd(kh.getHoSo().getId(), u)) {
            throw BusinessException.khongCoQuyen();
        }
        if (kh.getTrangThai() == TrangThaiKeHoach.NHAP) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Kế hoạch đang ở trạng thái Bản nháp");
        }
        TrangThaiKeHoach cu = kh.getTrangThai();
        kh.setTrangThai(TrangThaiKeHoach.NHAP);
        kh.setXacNhanDvhd(null);
        kh.setXacNhanGvhd(null);
        nhatKyService.ghiVet("MO_LAI_KE_HOACH", "ke_hoach_hoc_tap", kh.getId(), Map.of("trangThai", cu),
                Map.of("trangThai", TrangThaiKeHoach.NHAP));
        thongBaoService.gui("NT-07", List.of(kh.getHoSo().getSinhVien().getNguoiDung().getId()),
                "GVHD đã mở lại kế hoạch học tập để bạn chỉnh sửa", "/records/" + kh.getHoSo().getId() + "/study_plan");
        return sangResponse(kh);
    }

    // ------------------------------------------------------------------

    private KeHoachHocTap layVaKiemQuyen(Long keHoachId) {
        CurrentUser u = SecurityUtils.currentUser();
        KeHoachHocTap kh = keHoachRepo.findById(keHoachId).orElse(null);
        if (kh == null) {
            throw u.laAdmin() ? BusinessException.khongTimThay("kế hoạch học tập") : BusinessException.khongCoQuyen();
        }
        hoSoService.layVaKiemQuyen(kh.getHoSo().getId(), u);
        return kh;
    }

    private static void kiemCuaSinhVienDangThucTap(KeHoachHocTap kh) {
        if (kh.getHoSo().getTrangThai() != TrangThaiHoSo.DANG_THUC_TAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ không ở trạng thái Đang thực tập");
        }
    }

    private boolean laGvhd(Long hoSoId, CurrentUser u) {
        return u.laGiangVien() && phanCongRepo.findByHoSoId(hoSoId).map(PhanCongGvhd::getGiangVien)
                .map(gv -> gv.getId().equals(u.giangVienId())).orElse(false);
    }

    private static LocalDate hanNop(HoSoThucTap h) {
        return NgayLamViecUtils.ngayLamViecThu(h.getDot().getNgayBatDau(), SO_NGAY_LAM_VIEC_HAN_NOP);
    }

    private KeHoachResponse sangResponse(KeHoachHocTap kh) {
        return KeHoachResponse.tu(kh, hanNop(kh.getHoSo()), kh.getHoSo().getDot().getSoTuan());
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
