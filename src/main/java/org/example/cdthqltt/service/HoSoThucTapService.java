package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.record.*;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.*;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/** UC04 — đăng ký thực tập và phê duyệt hồ sơ; kèm hàm kiểm quyền sở hữu dùng chung cho mọi dữ liệu treo dưới hồ sơ. */
@Service
@RequiredArgsConstructor
public class HoSoThucTapService {

    /** Đ4 k6: thực tập quốc tế tối thiểu 6 tuần — ngưỡng của Quy định. */
    private static final int SO_TUAN_QUOC_TE_TOI_THIEU = 6;

    /** Chuyển trạng thái hợp lệ (docs/01-nghiep-vu.md mục 5) — mọi chỗ đổi trạng thái hồ sơ đều đi qua bảng này. */
    private static final Map<TrangThaiHoSo, Set<TrangThaiHoSo>> CHUYEN_HOP_LE = Map.of(
            TrangThaiHoSo.NHAP, EnumSet.of(TrangThaiHoSo.CHO_DVHD),
            TrangThaiHoSo.CHO_DVHD, EnumSet.of(TrangThaiHoSo.CHO_GVHD, TrangThaiHoSo.NHAP),
            TrangThaiHoSo.CHO_GVHD, EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP, TrangThaiHoSo.NHAP, TrangThaiHoSo.GIAN_DOAN),
            TrangThaiHoSo.DANG_THUC_TAP, EnumSet.of(TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.GIAN_DOAN),
            TrangThaiHoSo.CHO_DANH_GIA, EnumSet.of(TrangThaiHoSo.HOAN_THANH, TrangThaiHoSo.KHONG_HOAN_THANH,
                    TrangThaiHoSo.GIAN_DOAN, TrangThaiHoSo.DANG_THUC_TAP),
            TrangThaiHoSo.GIAN_DOAN, EnumSet.of(TrangThaiHoSo.CHO_GVHD, TrangThaiHoSo.DANG_THUC_TAP, TrangThaiHoSo.CHO_DANH_GIA),
            TrangThaiHoSo.HOAN_THANH, EnumSet.noneOf(TrangThaiHoSo.class),
            TrangThaiHoSo.KHONG_HOAN_THANH, EnumSet.noneOf(TrangThaiHoSo.class),
            TrangThaiHoSo.TU_CHOI, EnumSet.noneOf(TrangThaiHoSo.class));

    private final HoSoThucTapRepository hoSoRepo;
    private final SinhVienRepository sinhVienRepo;
    private final DotThucTapRepository dotRepo;
    private final DonViHuongDanRepository donViRepo;
    private final CanBoDvhdRepository canBoRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final ThanhVienToDanhGiaRepository thanhVienRepo;
    private final KeHoachHocTapRepository keHoachRepo;
    private final TienDoTuanRepository tienDoRepo;
    private final BaoCaoThucTapRepository baoCaoRepo;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    // ------------------------------------------------------------------
    // Hợp đồng dùng chung (người A gọi từ phiếu đánh giá, kết quả, Tổ đánh giá)
    // ------------------------------------------------------------------

    /**
     * Nạp hồ sơ và kiểm quyền sở hữu (lớp 2): ADMIN mọi hồ sơ · SV hồ sơ của mình · GV hồ sơ mình là GVHD ·
     * cán bộ hồ sơ mình hướng dẫn · GV/cán bộ là thành viên Tổ đánh giá chứa hồ sơ (chặng 2).
     * Không có quyền ⇒ ACCESS_DENIED và không tiết lộ hồ sơ có tồn tại hay không.
     */
    @Transactional(readOnly = true)
    public HoSoThucTap layVaKiemQuyen(Long hoSoId, CurrentUser u) {
        Optional<HoSoThucTap> opt = hoSoRepo.findById(hoSoId);
        if (u.laAdmin()) {
            return opt.orElseThrow(() -> BusinessException.khongTimThay("hồ sơ thực tập"));
        }
        HoSoThucTap h = opt.orElseThrow(BusinessException::khongCoQuyen);
        if (!coQuyen(h, u)) {
            throw BusinessException.khongCoQuyen();
        }
        return h;
    }

    /** Đổi trạng thái hồ sơ theo bảng chuyển hợp lệ, ghi nhật ký. */
    @Transactional
    public void chuyenTrangThai(HoSoThucTap h, TrangThaiHoSo moi, String lyDo) {
        TrangThaiHoSo cu = h.getTrangThai();
        if (cu == moi) {
            return;
        }
        if (!CHUYEN_HOP_LE.getOrDefault(cu, Set.of()).contains(moi)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Không thể chuyển hồ sơ từ " + cu + " sang " + moi);
        }
        h.setTrangThai(moi);
        Map<String, Object> sau = new LinkedHashMap<>();
        sau.put("trangThai", moi);
        if (lyDo != null) {
            sau.put("lyDo", lyDo);
        }
        nhatKyService.ghiVet("CHUYEN_TRANG_THAI_HO_SO", "ho_so_thuc_tap", h.getId(), cu, sau);
    }

    // ------------------------------------------------------------------
    // #39 – #47
    // ------------------------------------------------------------------

    /** #39 — GV và cán bộ chỉ thấy hồ sơ thuộc phạm vi mình. */
    @Transactional(readOnly = true)
    public List<HoSoResponse> danhSach(Long dotId, TrangThaiHoSo trangThai, HinhThucThucTap hinhThuc) {
        CurrentUser u = SecurityUtils.currentUser();
        List<HoSoThucTap> ds = switch (u.vaiTro()) {
            case ADMIN -> hoSoRepo.timKiem(dotId, trangThai);
            case GIANG_VIEN -> hoSoRepo.theoGiangVien(u.giangVienId(), dotId, trangThai);
            case CAN_BO_DVHD -> hoSoRepo.theoCanBo(u.canBoDvhdId(), dotId, trangThai);
            case SINH_VIEN -> throw BusinessException.khongCoQuyen();
        };
        return ds.stream().filter(h -> hinhThuc == null || h.getHinhThucThucTap() == hinhThuc).map(this::sangResponse).toList();
    }

    /** #40 — hồ sơ trong đợt đang chạy; không có thì hồ sơ gần nhất. */
    @Transactional(readOnly = true)
    public HoSoResponse cuaToi() {
        CurrentUser u = SecurityUtils.currentUser();
        List<HoSoThucTap> ds = hoSoRepo.findBySinhVienIdOrderByIdDesc(u.sinhVienId());
        return ds.stream()
                .filter(h -> NguoiDungService.DOT_DANG_CHAY.contains(h.getDot().getTrangThai()))
                .findFirst()
                .or(() -> ds.stream().findFirst())
                .map(this::sangResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Bạn chưa có hồ sơ thực tập nào"));
    }

    /** #41 */
    @Transactional(readOnly = true)
    public HoSoResponse chiTiet(Long hoSoId) {
        return sangResponse(layVaKiemQuyen(hoSoId, SecurityUtils.currentUser()));
    }

    /** #42 — CBR-01: mỗi SV một hồ sơ hiệu lực trong đợt (UC04 7a). */
    @Transactional
    public HoSoResponse tao(HoSoRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        SinhVien sv = sinhVienRepo.findById(u.sinhVienId()).orElseThrow(BusinessException::khongCoQuyen);
        DotThucTap dot = req.dotId() != null
                ? dotRepo.findById(req.dotId()).orElseThrow(() -> BusinessException.khongTimThay("đợt thực tập"))
                : dotRepo.findByTrangThaiInOrderByNgayBatDauDesc(List.of(TrangThaiDot.DANG_NHAN_DANG_KY)).stream().findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Hiện không có đợt nào đang nhận đăng ký"));
        kiemDotNhanDangKy(dot);
        hoSoRepo.findBySinhVienIdAndDotId(sv.getId(), dot.getId()).ifPresent(cu -> {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                    "Bạn đã có hồ sơ (mã " + cu.getId() + ") trong đợt " + dot.getMaDot() + "; mỗi sinh viên chỉ một hồ sơ (Điều 5)");
        });
        HoSoThucTap h = new HoSoThucTap();
        h.setSinhVien(sv);
        h.setDot(dot);
        ganThongTin(h, req);
        h.setTrangThai(TrangThaiHoSo.NHAP);
        hoSoRepo.save(h);
        return sangResponse(h);
    }

    /** #43 — chỉ sửa khi Bản nháp. */
    @Transactional
    public HoSoResponse capNhat(Long hoSoId, HoSoRequest req) {
        HoSoThucTap h = layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        if (h.getTrangThai() != TrangThaiHoSo.NHAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ đã gửi, chỉ sửa được khi ở trạng thái Bản nháp");
        }
        ganThongTin(h, req);
        return sangResponse(h);
    }

    /** #44 — kiểm CBR-01, CBR-02, CBR-03, quốc tế ≥ 6 tuần; chuyển Chờ ĐVHD và báo cán bộ (NT-01). */
    @Transactional
    public HoSoResponse guiDangKy(Long hoSoId) {
        HoSoThucTap h = layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        if (h.getTrangThai() != TrangThaiHoSo.NHAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ đã được gửi trước đó");
        }
        kiemDotNhanDangKy(h.getDot());

        List<String> thieu = new ArrayList<>();
        if (h.getDonVi() == null) thieu.add("đơn vị hướng dẫn");
        if (h.getCanBoDvhd() == null) thieu.add("cán bộ hướng dẫn");
        if (h.getDeTai() == null) thieu.add("đề tài / nhiệm vụ");
        if (h.getSoTuanThamGia() == null) thieu.add("số tuần tham gia");
        if (!thieu.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Hồ sơ còn thiếu: " + String.join(", ", thieu));
        }
        // CBR-02 (Đ7 k1): đơn vị phải đang Đã duyệt; đơn vị bị loại chỉ chặn đăng ký mới.
        if (h.getDonVi().getTrangThaiPheDuyet() != TrangThaiPheDuyet.DA_DUYET || Boolean.TRUE.equals(h.getDonVi().getDaXoa())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Đơn vị hướng dẫn chưa được phê duyệt hoặc đã bị loại khỏi danh mục (Điều 7 khoản 1)");
        }
        if (!h.getCanBoDvhd().getNguoiDung().dangHoatDong()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Tài khoản cán bộ hướng dẫn đang bị vô hiệu hóa, vui lòng chọn cán bộ khác");
        }
        // UC04 7c (Đ4 k6).
        if (h.getHinhThucThucTap() == HinhThucThucTap.QUOC_TE && h.getSoTuanThamGia() < SO_TUAN_QUOC_TE_TOI_THIEU) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Thực tập quốc tế phải từ 6 tuần trở lên (Điều 4 khoản 6)");
        }
        // UC04 7b (CBR-03).
        kiemHanMucCanBo(h.getCanBoDvhd(), h.getDot().getId());

        chuyenTrangThai(h, TrangThaiHoSo.CHO_DVHD, null);
        h.setNgayGui(LocalDateTime.now());
        h.setLyDoTuChoi(null);
        thongBaoService.gui("NT-01", List.of(h.getCanBoDvhd().getNguoiDung().getId()),
                "Sinh viên " + h.getSinhVien().getNguoiDung().getHoTen() + " gửi đăng ký thực tập, chờ bạn xác nhận tiếp nhận",
                "/records/" + h.getId());
        return sangResponse(h);
    }

    /** #45 — cán bộ xác nhận (chiếm 1 chỗ hạn mức, NT-03 cho giáo vụ) hoặc từ chối (về Bản nháp, NT-02 cho SV). */
    @Transactional
    public HoSoResponse xacNhanTiepNhan(Long hoSoId, QuyetDinhRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = layVaKiemQuyen(hoSoId, u);
        if (h.getCanBoDvhd() == null || !h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) {
            throw BusinessException.khongCoQuyen();
        }
        if (h.getTrangThai() != TrangThaiHoSo.CHO_DVHD) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ không ở trạng thái Chờ ĐVHD xác nhận");
        }
        Long svNguoiDungId = h.getSinhVien().getNguoiDung().getId();
        if (Boolean.TRUE.equals(req.dongY())) {
            kiemHanMucCanBo(h.getCanBoDvhd(), h.getDot().getId());
            chuyenTrangThai(h, TrangThaiHoSo.CHO_GVHD, null);
            thongBaoService.guiGiaoVu("NT-03", "Hồ sơ của " + h.getSinhVien().getNguoiDung().getHoTen()
                    + " đã được ĐVHD xác nhận, cần phân công GVHD", "/assignments");
        } else {
            String lyDo = batBuocLyDo(req.lyDo());
            chuyenTrangThai(h, TrangThaiHoSo.NHAP, lyDo);
            h.setLyDoTuChoi(lyDo);
            thongBaoService.gui("NT-02", List.of(svNguoiDungId),
                    "Cán bộ ĐVHD từ chối tiếp nhận: " + lyDo, "/records/" + h.getId());
        }
        return sangResponse(h);
    }

    /**
     * #46 — chỉ GVHD đã được phân công. Duyệt ⇒ Đang thực tập + khung kế hoạch (N tuần + 1 dòng Tổng kết) +
     * N dòng tiến độ tuần. Từ chối ⇒ về Bản nháp; hồ sơ thôi chiếm chỗ của cán bộ (đếm động) và bỏ phân công
     * để giáo vụ phân công lại (UC04 10a).
     */
    @Transactional
    public HoSoResponse pheDuyet(Long hoSoId, QuyetDinhRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = layVaKiemQuyen(hoSoId, u);
        PhanCongGvhd pc = phanCongRepo.findByHoSoId(hoSoId)
                .filter(p -> p.getGiangVien().getId().equals(u.giangVienId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "Bạn chưa được phân công hướng dẫn hồ sơ này"));
        if (h.getTrangThai() != TrangThaiHoSo.CHO_GVHD) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ không ở trạng thái Chờ GVHD duyệt");
        }
        Long svNguoiDungId = h.getSinhVien().getNguoiDung().getId();
        if (Boolean.TRUE.equals(req.dongY())) {
            chuyenTrangThai(h, TrangThaiHoSo.DANG_THUC_TAP, null);
            khoiTaoKhungTheoDoi(h);
            thongBaoService.gui("NT-06", List.of(svNguoiDungId),
                    "Hồ sơ thực tập đã được GVHD phê duyệt; hãy lập kế hoạch học tập trong 5 ngày làm việc", "/records/" + h.getId());
        } else {
            String lyDo = batBuocLyDo(req.lyDo());
            chuyenTrangThai(h, TrangThaiHoSo.NHAP, lyDo);
            h.setLyDoTuChoi(lyDo);
            phanCongRepo.delete(pc);
            nhatKyService.ghiVet("HUY_PHAN_CONG_DO_GVHD_TU_CHOI", "ho_so_thuc_tap", h.getId(),
                    Map.of("giangVienId", pc.getGiangVien().getId()), null);
            thongBaoService.gui("NT-05", List.of(svNguoiDungId, h.getCanBoDvhd().getNguoiDung().getId()),
                    "GVHD từ chối hồ sơ: " + lyDo, "/records/" + h.getId());
        }
        return sangResponse(h);
    }

    /** #47 — Đ15 k4: gián đoạn do bất khả kháng, khôi phục về đúng giai đoạn đang dở. */
    @Transactional
    public HoSoResponse doiTrangThaiGianDoan(Long hoSoId, DoiTrangThaiHoSoRequest req) {
        HoSoThucTap h = layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        if (Boolean.TRUE.equals(req.gianDoan())) {
            chuyenTrangThai(h, TrangThaiHoSo.GIAN_DOAN, req.lyDo().trim());
        } else {
            if (h.getTrangThai() != TrangThaiHoSo.GIAN_DOAN) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Hồ sơ không ở trạng thái Gián đoạn");
            }
            TrangThaiHoSo dich;
            if (!keHoachRepo.existsByHoSoId(hoSoId)) {
                dich = TrangThaiHoSo.CHO_GVHD;
            } else {
                dich = baoCaoRepo.findTopByHoSoIdOrderByPhienBanDesc(hoSoId)
                        .filter(BaoCaoThucTap::daDuXacNhan).isPresent() ? TrangThaiHoSo.CHO_DANH_GIA : TrangThaiHoSo.DANG_THUC_TAP;
            }
            chuyenTrangThai(h, dich, req.lyDo().trim());
        }
        return sangResponse(h);
    }

    // ------------------------------------------------------------------

    private boolean coQuyen(HoSoThucTap h, CurrentUser u) {
        return switch (u.vaiTro()) {
            case ADMIN -> true;
            case SINH_VIEN -> h.getSinhVien().getId().equals(u.sinhVienId());
            case GIANG_VIEN -> phanCongRepo.existsByHoSoIdAndGiangVienId(h.getId(), u.giangVienId()) || laThanhVienTo(h, u);
            case CAN_BO_DVHD -> (h.getCanBoDvhd() != null && h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) || laThanhVienTo(h, u);
        };
    }

    private boolean laThanhVienTo(HoSoThucTap h, CurrentUser u) {
        return thanhVienRepo.theoHoSo(h.getId()).stream().anyMatch(tv -> tv.getNguoiDung().getId().equals(u.nguoiDungId()));
    }

    private void kiemHanMucCanBo(CanBoDvhd cb, Long dotId) {
        long dangHuongDan = hoSoRepo.demTheoCanBo(cb.getId(), dotId, NhomTrangThaiHoSo.TINH_HAN_MUC_CAN_BO);
        if (dangHuongDan >= cb.getSoSvToiDa()) {
            throw new BusinessException(ErrorCode.QUOTA_EXCEEDED,
                    "Cán bộ " + cb.getNguoiDung().getHoTen() + " đã nhận đủ " + cb.getSoSvToiDa()
                            + " sinh viên, vui lòng chọn cán bộ khác (Điều 7 khoản 2 điểm c)");
        }
    }

    private void kiemDotNhanDangKy(DotThucTap dot) {
        if (dot.getTrangThai() != TrangThaiDot.DANG_NHAN_DANG_KY) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Đợt " + dot.getMaDot() + " không ở giai đoạn nhận đăng ký");
        }
    }

    private void ganThongTin(HoSoThucTap h, HoSoRequest req) {
        h.setHinhThucThucTap(req.hinhThucThucTap());
        DonViHuongDan dv = null;
        if (req.donViId() != null) {
            dv = donViRepo.findById(req.donViId())
                    .filter(d -> !Boolean.TRUE.equals(d.getDaXoa()) && d.getTrangThaiPheDuyet() == TrangThaiPheDuyet.DA_DUYET)
                    .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                            "Chỉ được chọn đơn vị hướng dẫn đã được phê duyệt (Điều 7 khoản 1)"));
        }
        CanBoDvhd cb = null;
        if (req.canBoDvhdId() != null) {
            cb = canBoRepo.findById(req.canBoDvhdId()).orElseThrow(() -> BusinessException.khongTimThay("cán bộ hướng dẫn"));
            if (dv == null || !cb.getDonVi().getId().equals(dv.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Cán bộ hướng dẫn không thuộc đơn vị đã chọn");
            }
        }
        h.setDonVi(dv);
        h.setCanBoDvhd(cb);
        h.setBoPhan(rong(req.boPhan()));
        h.setDeTai(rong(req.deTai()));
        h.setHinhThucLamViec(req.hinhThucLamViec() == null ? HinhThucLamViec.TRUC_TIEP : req.hinhThucLamViec());
        h.setSoTuanThamGia(req.soTuanThamGia());
        h.setMucTieu(rong(req.mucTieu()));
        h.setSanPhamDuKien(rong(req.sanPhamDuKien()));
    }

    private void khoiTaoKhungTheoDoi(HoSoThucTap h) {
        int soTuan = h.getDot().getSoTuan();
        if (!keHoachRepo.existsByHoSoId(h.getId())) {
            KeHoachHocTap kh = new KeHoachHocTap();
            kh.setHoSo(h);
            kh.setTrangThai(TrangThaiKeHoach.NHAP);
            for (int tuan = 1; tuan <= soTuan + 1; tuan++) {
                MucKeHoach m = new MucKeHoach();
                m.setKeHoach(kh);
                m.setTuan(tuan);
                kh.getCacMuc().add(m);
            }
            keHoachRepo.save(kh);
        }
        for (int tuan = 1; tuan <= soTuan; tuan++) {
            if (tienDoRepo.findByHoSoIdAndTuan(h.getId(), tuan).isEmpty()) {
                TienDoTuan t = new TienDoTuan();
                t.setHoSo(h);
                t.setTuan(tuan);
                tienDoRepo.save(t);
            }
        }
    }

    private HoSoResponse sangResponse(HoSoThucTap h) {
        GiangVien gv = phanCongRepo.findByHoSoId(h.getId()).map(PhanCongGvhd::getGiangVien).orElse(null);
        return HoSoMapper.toResponse(h, gv);
    }

    private static String batBuocLyDo(String lyDo) {
        if (lyDo == null || lyDo.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Vui lòng nhập lý do từ chối");
        }
        return lyDo.trim();
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
