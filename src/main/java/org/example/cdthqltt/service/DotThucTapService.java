package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.term.*;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiChang;
import org.example.cdthqltt.entity.enums.TrangThaiDot;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;
import org.example.cdthqltt.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/** UC03 — đợt TTTN, chặng đánh giá, CLO, rubric, câu hỏi. */
@Slf4j
@Service
@RequiredArgsConstructor
public class DotThucTapService {

    private static final BigDecimal TRAM = new BigDecimal("100");
    private static final List<TrangThaiDot> THU_TU_TRANG_THAI = List.of(TrangThaiDot.KHOI_TAO,
            TrangThaiDot.DANG_NHAN_DANG_KY, TrangThaiDot.DANG_THUC_HIEN, TrangThaiDot.DA_KET_THUC);

    private final DotThucTapRepository dotRepo;
    private final ChangDanhGiaRepository changRepo;
    private final ChuanDauRaRepository cloRepo;
    private final MucRubricRepository rubricRepo;
    private final CauHoiDanhGiaRepository cauHoiRepo;
    private final LoaiMinhChungBatBuocRepository loaiMinhChungRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final HoSoThucTapRepository hoSoRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final ToDanhGiaRepository toRepo;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    /** Đợt mẫu chứa cấu hình gốc theo QĐ 207 (seed V2) — ẩn khỏi danh sách, chỉ dùng để nhân bản. */
    @Value("${app.term.template-code:MAU-QD207}")
    private String maDotMau;

    // ------------------------------------------------------------------
    // Hợp đồng dùng chung (người B gọi)
    // ------------------------------------------------------------------

    /** Đợt đang chạy gần nhất (đang nhận đăng ký hoặc đang thực hiện); không có ⇒ RESOURCE_NOT_FOUND. */
    @Transactional(readOnly = true)
    public DotThucTap layDotDangMo() {
        return dotRepo.findByTrangThaiInOrderByNgayBatDauDesc(NguoiDungService.DOT_DANG_CHAY).stream()
                .filter(d -> !laDotMau(d))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Hiện không có đợt thực tập nào đang mở"));
    }

    @Transactional(readOnly = true)
    public DotThucTap layDot(Long dotId) {
        return dotRepo.findById(dotId).filter(d -> !laDotMau(d))
                .orElseThrow(() -> BusinessException.khongTimThay("đợt thực tập"));
    }

    @Transactional(readOnly = true)
    public ChangDanhGia layChang(Long dotId, int thuTu) {
        return changRepo.findByDotIdAndThuTu(dotId, thuTu)
                .orElseThrow(() -> BusinessException.khongTimThay("chặng " + thuTu + " của đợt"));
    }

    public boolean laDotMau(DotThucTap d) {
        return maDotMau.equals(d.getMaDot());
    }

    // ------------------------------------------------------------------
    // #26 – #30 Đợt
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<DotResponse> danhSach(String namHoc, String hocKy, TrangThaiDot trangThai) {
        return dotRepo.findAllByOrderByNgayBatDauDesc().stream()
                .filter(d -> !laDotMau(d))
                .filter(d -> namHoc == null || namHoc.isBlank() || namHoc.equals(d.getNamHoc()))
                .filter(d -> hocKy == null || hocKy.isBlank() || hocKy.equals(d.getHocKy()))
                .filter(d -> trangThai == null || trangThai == d.getTrangThai())
                .map(DotResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DotResponse chiTiet(Long dotId) {
        return DotResponse.from(layDot(dotId));
    }

    /**
     * #28 — tạo đợt, sinh 2 chặng và nhân bản 7 CLO, 35 mức rubric, 13 câu hỏi từ đợt mẫu
     * (cấu hình riêng từng đợt để điểm khóa trước không đổi khi Khoa sửa trọng số khóa sau).
     */
    @Transactional
    public DotResponse taoDot(TaoDotRequest req) {
        kiemNgay(req.ngayBatDau(), req.ngayKetThuc(), req.hanNopBaoCao());
        String maDot = req.maDot().trim();
        if (dotRepo.existsByMaDot(maDot)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã đợt " + maDot + " đã tồn tại");
        }
        DotThucTap mau = dotRepo.findByMaDot(maDotMau)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Chưa có cấu hình mẫu " + maDotMau + " để nhân bản"));

        DotThucTap dot = new DotThucTap();
        dot.setMaDot(maDot);
        dot.setTen(req.ten().trim());
        dot.setHocKy(req.hocKy().trim());
        dot.setNamHoc(req.namHoc().trim());
        dot.setKhoaVien(rong(req.khoaVien()));
        dot.setNgayBatDau(req.ngayBatDau());
        dot.setNgayKetThuc(req.ngayKetThuc());
        dot.setSoTuan(tinhSoTuan(req.ngayBatDau(), req.ngayKetThuc()));
        dot.setHanNopBaoCao(req.hanNopBaoCao());
        dot.setTrangThai(TrangThaiDot.KHOI_TAO);
        dotRepo.save(dot);

        nhanBanCauHinh(mau, dot);
        nhatKyService.ghiVet("TAO_DOT", "dot_thuc_tap", dot.getId(), null, Map.of("maDot", maDot, "nhanBanTu", maDotMau));
        return DotResponse.from(dot, kiemCauHinh(dot.getId(), false));
    }

    /** #29 */
    @Transactional
    public DotResponse capNhat(Long dotId, CapNhatDotRequest req) {
        DotThucTap dot = layDot(dotId);
        if (dot.getTrangThai() == TrangThaiDot.DA_KET_THUC) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Đợt đã kết thúc, không sửa được");
        }
        kiemNgay(req.ngayBatDau(), req.ngayKetThuc(), req.hanNopBaoCao());
        LocalDate ketThucCu = dot.getNgayKetThuc();
        LocalDate batDauCu = dot.getNgayBatDau();

        dot.setTen(req.ten().trim());
        dot.setHocKy(req.hocKy().trim());
        dot.setNamHoc(req.namHoc().trim());
        dot.setKhoaVien(rong(req.khoaVien()));
        dot.setNgayBatDau(req.ngayBatDau());
        dot.setNgayKetThuc(req.ngayKetThuc());
        dot.setSoTuan(tinhSoTuan(req.ngayBatDau(), req.ngayKetThuc()));
        dot.setHanNopBaoCao(req.hanNopBaoCao());

        boolean doiMoc = !batDauCu.equals(req.ngayBatDau()) || !ketThucCu.equals(req.ngayKetThuc());
        if (doiMoc) {
            for (ChangDanhGia c : changRepo.findByDotIdOrderByThuTu(dotId)) {
                // Chặng đã mở thì giữ nguyên mốc đã dùng.
                if (c.getTrangThai() == TrangThaiChang.CHUA_MO) {
                    datMocChang(c, dot);
                }
            }
            nhatKyService.ghiVet("DOI_MOC_DOT", "dot_thuc_tap", dotId,
                    Map.of("ngayBatDau", batDauCu.toString(), "ngayKetThuc", ketThucCu.toString()),
                    Map.of("ngayBatDau", req.ngayBatDau().toString(), "ngayKetThuc", req.ngayKetThuc().toString()));
            // Đ15 k4 / luồng thay thế UC03: gia hạn ⇒ thông báo toàn bộ người liên quan (NT-15).
            thongBaoService.gui("NT-15", nguoiLienQuan(dotId),
                    "Đợt " + dot.getMaDot() + " đổi thời gian: " + req.ngayBatDau() + " → " + req.ngayKetThuc()
                            + "; mốc chặng đánh giá đã được tính lại", "/terms/" + dotId);
        }
        return DotResponse.from(dot);
    }

    /** #30 — chỉ đi tiến từng bước; mở đăng ký thì kiểm cấu hình (CBR-07, CBR-08, CBR-23). */
    @Transactional
    public DotResponse doiTrangThai(Long dotId, TrangThaiDot moi) {
        DotThucTap dot = layDot(dotId);
        int tu = THU_TU_TRANG_THAI.indexOf(dot.getTrangThai());
        int den = THU_TU_TRANG_THAI.indexOf(moi);
        if (den != tu + 1) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Không thể chuyển đợt từ " + dot.getTrangThai() + " sang " + moi + "; trạng thái đợt chỉ đi tiến từng bước");
        }
        List<String> canhBao = List.of();
        if (moi == TrangThaiDot.DANG_NHAN_DANG_KY) {
            canhBao = kiemCauHinh(dotId, true);
        }
        TrangThaiDot cu = dot.getTrangThai();
        dot.setTrangThai(moi);
        nhatKyService.ghiVet("DOI_TRANG_THAI_DOT", "dot_thuc_tap", dotId, cu, moi);
        return DotResponse.from(dot, canhBao);
    }

    // ------------------------------------------------------------------
    // #31 – #32 Chặng
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ChangResponse> danhSachChang(Long dotId) {
        layDot(dotId);
        return changRepo.findByDotIdOrderByThuTu(dotId).stream().map(ChangResponse::from).toList();
    }

    /** #32 — mở/đóng thủ công, bổ sung cho lịch tự động; mở thì kiểm điều kiện CBR-13. */
    @Transactional
    public ChangResponse doiTrangThaiChang(Long changId, TrangThaiChang moi) {
        ChangDanhGia c = changRepo.findById(changId).orElseThrow(() -> BusinessException.khongTimThay("chặng đánh giá"));
        switch (moi) {
            case DANG_MO -> moChang(c, LocalDate.now(), true);
            case DA_DONG -> {
                if (c.getTrangThai() != TrangThaiChang.DANG_MO) {
                    throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Chỉ đóng được chặng đang mở");
                }
                c.setTrangThai(TrangThaiChang.DA_DONG);
                c.setNgayDong(LocalDate.now());
                nhatKyService.ghiVet("DONG_CHANG", "chang_danh_gia", c.getId(), TrangThaiChang.DANG_MO, TrangThaiChang.DA_DONG);
            }
            default -> throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Chỉ được chọn DANG_MO hoặc DA_DONG");
        }
        return ChangResponse.from(c);
    }

    /**
     * Lịch chạy hằng ngày: mở chặng đến hạn. Idempotent — chặng đã mở thì bỏ qua.
     * Trả số chặng vừa mở.
     */
    @Transactional
    public int moChangDenHan(LocalDate homNay) {
        int dem = 0;
        for (ChangDanhGia c : changRepo.findByTrangThaiAndNgayMoLessThanEqual(TrangThaiChang.CHUA_MO, homNay)) {
            if (c.getDot().getTrangThai() != TrangThaiDot.DANG_THUC_HIEN || laDotMau(c.getDot())) {
                continue;
            }
            try {
                moChang(c, homNay, false);
                dem++;
            } catch (BusinessException e) {
                log.info("Chưa mở chặng {} của đợt {}: {}", c.getThuTu(), c.getDot().getMaDot(), e.getMessage());
            }
        }
        return dem;
    }

    private void moChang(ChangDanhGia c, LocalDate homNay, boolean thuCong) {
        DotThucTap dot = c.getDot();
        if (c.getTrangThai() == TrangThaiChang.DANG_MO) {
            return;
        }
        if (c.getTrangThai() == TrangThaiChang.DA_TONG_HOP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Chặng đã tổng hợp kết quả, không mở lại được");
        }
        if (dot.getTrangThai() != TrangThaiDot.DANG_THUC_HIEN && dot.getTrangThai() != TrangThaiDot.DA_KET_THUC) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Đợt chưa ở trạng thái Đang thực hiện");
        }
        // CBR-13 (Đ10 k2): chặng 1 mở từ đầu tuần thứ 4; chặng 2 mở sau ngày kết thúc thực tập.
        // Điều kiện "đã nộp báo cáo" của chặng 2 kiểm theo TỪNG sinh viên khi lấy biểu mẫu chấm.
        if (c.getTrangThai() == TrangThaiChang.CHUA_MO) {
            if (c.getThuTu() == 1 && homNay.isBefore(dot.getNgayBatDau().plusWeeks(3))) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Chặng 1 chỉ mở từ đầu tuần thứ 4 (" + dot.getNgayBatDau().plusWeeks(3) + ") (Điều 10 khoản 2)");
            }
            if (c.getThuTu() == 2 && !homNay.isAfter(dot.getNgayKetThuc())) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Chặng 2 chỉ mở sau ngày kết thúc thực tập (" + dot.getNgayKetThuc() + ") (Điều 10 khoản 2)");
            }
        }
        TrangThaiChang cu = c.getTrangThai();
        c.setTrangThai(TrangThaiChang.DANG_MO);
        if (c.getNgayMo() == null || c.getNgayMo().isAfter(homNay)) {
            c.setNgayMo(homNay);
        }
        c.setNgayDong(null);
        nhatKyService.ghiVet(thuCong ? "MO_CHANG_THU_CONG" : "MO_CHANG_TU_DONG", "chang_danh_gia", c.getId(), cu, TrangThaiChang.DANG_MO);
        if (c.getThuTu() == 1) {
            thongBaoService.gui("NT-10", nguoiChamChang1(dot.getId()),
                    "Chặng 1 (đánh giá giữa kỳ) của đợt " + dot.getMaDot() + " đã mở, vui lòng chấm phiếu TTTN-04",
                    "/assessments");
        } else {
            thongBaoService.gui("NT-12", nguoiLienQuan(dot.getId()),
                    "Chặng 2 (đánh giá cuối kỳ) của đợt " + dot.getMaDot() + " đã mở", "/assessments");
        }
    }

    // ------------------------------------------------------------------
    // #33 – #38 CLO, rubric, câu hỏi, minh chứng
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CloResponse> danhSachClo(Long dotId) {
        layDot(dotId);
        return cloRepo.findByDotIdOrderByMaClo(dotId).stream().map(CloResponse::from).toList();
    }

    /** #34 — khóa khi đợt đã có phiếu nộp (UC03 6a); kiểm Σα = 100 (CBR-07) và ĐVHD + GVHD = 100 (CBR-08). */
    @Transactional
    public List<CloResponse> capNhatClo(Long cloId, CapNhatCloRequest req) {
        ChuanDauRa clo = cloRepo.findById(cloId).orElseThrow(() -> BusinessException.khongTimThay("chuẩn đầu ra"));
        DotThucTap dot = clo.getDot();
        if (laDotMau(dot)) {
            throw BusinessException.khongTimThay("chuẩn đầu ra");
        }
        if (phieuRepo.coPhieuTheoTrangThai(dot.getId(), TrangThaiPhieu.DA_NOP)) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Đợt đã có phiếu đánh giá được nộp, không sửa được trọng số; cần mở lại các phiếu trước (CBR-12)");
        }
        if (req.tyLeDvhd().add(req.tyLeGvhd()).compareTo(TRAM) != 0) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Tỷ lệ đồng chấm ĐVHD + GVHD của " + clo.getMaClo() + " phải bằng 100 (Điều 14 khoản 3)");
        }

        Map<Long, ChuanDauRa> cacClo = cloRepo.findByDotIdOrderByMaClo(dot.getId()).stream()
                .collect(Collectors.toMap(ChuanDauRa::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
        Map<String, Object> truoc = anhChupTrongSo(cacClo.values());

        clo.setTrongSoAlpha(req.trongSoAlpha());
        clo.setTyLeDvhd(req.tyLeDvhd());
        clo.setTyLeGvhd(req.tyLeGvhd());
        if (req.dieuChinhAlphaKhac() != null) {
            for (CapNhatCloRequest.DieuChinhAlpha dc : req.dieuChinhAlphaKhac()) {
                ChuanDauRa khac = cacClo.get(dc.cloId());
                if (khac == null) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "CLO " + dc.cloId() + " không thuộc cùng đợt");
                }
                khac.setTrongSoAlpha(dc.trongSoAlpha());
            }
        }
        BigDecimal tong = cacClo.values().stream().map(ChuanDauRa::getTrongSoAlpha).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (tong.compareTo(TRAM) != 0) {
            // Ném lỗi ⇒ giao dịch rollback, không thay đổi nào được lưu.
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Tổng trọng số α của 7 CLO phải bằng 100, hiện là " + tong.stripTrailingZeros().toPlainString()
                            + " (Điều 9 khoản 2)");
        }
        // CBR-22 / 10.9: vết sửa trọng số là căn cứ cho phien_ban_trong_so khi tính điểm.
        nhatKyService.ghiVet("SUA_TRONG_SO", "dot_thuc_tap", dot.getId(), truoc, anhChupTrongSo(cacClo.values()));
        return cacClo.values().stream().map(CloResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<MucRubricResponse> danhSachMucRubric(Long cloId) {
        ChuanDauRa clo = cloRepo.findById(cloId).filter(c -> !laDotMau(c.getDot()))
                .orElseThrow(() -> BusinessException.khongTimThay("chuẩn đầu ra"));
        return rubricRepo.findByChuanDauRaIdOrderByMuc(clo.getId()).stream().map(MucRubricResponse::from).toList();
    }

    /** #36 — chỉ sửa mô tả hành vi (BR-03.7). */
    @Transactional
    public MucRubricResponse capNhatMucRubric(Long mucId, CapNhatMucRubricRequest req) {
        MucRubric m = rubricRepo.findById(mucId).filter(x -> !laDotMau(x.getChuanDauRa().getDot()))
                .orElseThrow(() -> BusinessException.khongTimThay("mức rubric"));
        String cu = m.getMoTaHanhVi();
        m.setMoTaHanhVi(req.moTaHanhVi().trim());
        nhatKyService.ghiVet("SUA_MO_TA_RUBRIC", "muc_rubric", m.getId(), cu, m.getMoTaHanhVi());
        return MucRubricResponse.from(m);
    }

    @Transactional(readOnly = true)
    public List<CauHoiResponse> danhSachCauHoi(Long changId) {
        ChangDanhGia c = changRepo.findById(changId).filter(x -> !laDotMau(x.getDot()))
                .orElseThrow(() -> BusinessException.khongTimThay("chặng đánh giá"));
        return cauHoiRepo.theoChang(c.getId()).stream().map(CauHoiResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<LoaiMinhChungResponse> danhMucMinhChung(HinhThucThucTap hinhThuc) {
        List<LoaiMinhChungBatBuoc> ds = hinhThuc == null ? loaiMinhChungRepo.findAll()
                : loaiMinhChungRepo.findByHinhThucThucTapOrderById(hinhThuc);
        return ds.stream()
                .map(l -> new LoaiMinhChungResponse(l.getId(), l.getHinhThucThucTap(), l.getLoaiMinhChung(),
                        LoaiMinhChungDanhMuc.tenHienThi(l.getLoaiMinhChung()), LoaiMinhChungDanhMuc.nguon(l.getLoaiMinhChung()),
                        Boolean.TRUE.equals(l.getBatBuoc())))
                .toList();
    }

    // ------------------------------------------------------------------

    /**
     * Kiểm cấu hình chấm của đợt. {@code chan = true}: vi phạm thì ném lỗi; luôn trả danh sách cảnh báo
     * (CBR-23: CLO chỉ được đánh giá 1 lần trên 2 chặng — hợp lệ nhưng cần lưu ý, ví dụ CLO7).
     */
    @Transactional(readOnly = true)
    public List<String> kiemCauHinh(Long dotId, boolean chan) {
        List<String> loi = new ArrayList<>();
        List<String> canhBao = new ArrayList<>();
        List<ChuanDauRa> clos = cloRepo.findByDotIdOrderByMaClo(dotId);
        if (clos.size() != 7) {
            loi.add("Đợt phải có đúng 7 CLO, hiện có " + clos.size() + " (Điều 9 khoản 2)");
        }
        BigDecimal tong = clos.stream().map(ChuanDauRa::getTrongSoAlpha).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (tong.compareTo(TRAM) != 0) {
            loi.add("Tổng trọng số α phải bằng 100, hiện là " + tong.stripTrailingZeros().toPlainString());
        }
        clos.stream().filter(c -> c.getTyLeDvhd().add(c.getTyLeGvhd()).compareTo(TRAM) != 0)
                .forEach(c -> loi.add("Tỷ lệ đồng chấm của " + c.getMaClo() + " không bằng 100"));
        Map<Long, Long> soLanDanhGia = cauHoiRepo.theoDot(dotId).stream()
                .collect(Collectors.groupingBy(q -> q.getChuanDauRa().getId(),
                        Collectors.mapping(q -> q.getChang().getId(), Collectors.collectingAndThen(Collectors.toSet(), s -> (long) s.size()))));
        for (ChuanDauRa c : clos) {
            long n = soLanDanhGia.getOrDefault(c.getId(), 0L);
            if (n == 0) {
                loi.add(c.getMaClo() + " chưa được đánh giá ở chặng nào (CBR-23)");
            } else if (n < 2) {
                canhBao.add(c.getMaClo() + " chỉ được đánh giá ở 1 chặng — trọng số chặng sẽ được chuẩn hóa (CBR-23)");
            }
        }
        if (chan && !loi.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, String.join("; ", loi));
        }
        canhBao.addAll(0, loi);
        return canhBao;
    }

    private void nhanBanCauHinh(DotThucTap mau, DotThucTap dot) {
        Map<Long, ChangDanhGia> changMoi = new HashMap<>();
        for (ChangDanhGia goc : changRepo.findByDotIdOrderByThuTu(mau.getId())) {
            ChangDanhGia c = new ChangDanhGia();
            c.setDot(dot);
            c.setThuTu(goc.getThuTu());
            c.setTen(goc.getTen());
            c.setTrongSoW(goc.getTrongSoW());
            c.setTrangThai(TrangThaiChang.CHUA_MO);
            datMocChang(c, dot);
            changMoi.put(goc.getId(), changRepo.save(c));
        }
        Map<Long, ChuanDauRa> cloMoi = new HashMap<>();
        for (ChuanDauRa goc : cloRepo.findByDotIdOrderByMaClo(mau.getId())) {
            ChuanDauRa c = new ChuanDauRa();
            c.setDot(dot);
            c.setMaClo(goc.getMaClo());
            c.setTen(goc.getTen());
            c.setMoTa(goc.getMoTa());
            c.setTrongSoAlpha(goc.getTrongSoAlpha());
            c.setTyLeDvhd(goc.getTyLeDvhd());
            c.setTyLeGvhd(goc.getTyLeGvhd());
            cloMoi.put(goc.getId(), cloRepo.save(c));
        }
        for (MucRubric goc : rubricRepo.theoDot(mau.getId())) {
            MucRubric m = new MucRubric();
            m.setChuanDauRa(cloMoi.get(goc.getChuanDauRa().getId()));
            m.setMuc(goc.getMuc());
            m.setDiemMin(goc.getDiemMin());
            m.setDiemMax(goc.getDiemMax());
            m.setMoTaHanhVi(goc.getMoTaHanhVi());
            rubricRepo.save(m);
        }
        for (CauHoiDanhGia goc : cauHoiRepo.theoDot(mau.getId())) {
            CauHoiDanhGia q = new CauHoiDanhGia();
            q.setChang(changMoi.get(goc.getChang().getId()));
            q.setChuanDauRa(cloMoi.get(goc.getChuanDauRa().getId()));
            q.setThuTu(goc.getThuTu());
            q.setNoiDung(goc.getNoiDung());
            cauHoiRepo.save(q);
        }
    }

    /** Chặng 1: đầu tuần thứ 4 = ngày bắt đầu + 21 ngày; chặng 2: ngày liền sau ngày kết thúc (UC03 bước 4). */
    private static void datMocChang(ChangDanhGia c, DotThucTap dot) {
        if (c.getThuTu() == 1) {
            c.setTuanThucHien(4);
            c.setNgayMo(dot.getNgayBatDau().plusWeeks(3));
        } else {
            c.setTuanThucHien(dot.getSoTuan());
            c.setNgayMo(dot.getNgayKetThuc().plusDays(1));
        }
    }

    private static int tinhSoTuan(LocalDate batDau, LocalDate ketThuc) {
        long soNgay = ChronoUnit.DAYS.between(batDau, ketThuc) + 1;
        return (int) ((soNgay + 6) / 7);
    }

    private static void kiemNgay(LocalDate batDau, LocalDate ketThuc, LocalDate hanNop) {
        if (!ketThuc.isAfter(batDau)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Ngày kết thúc phải sau ngày bắt đầu");
        }
        if (hanNop != null && hanNop.isBefore(batDau)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Hạn nộp báo cáo không được trước ngày bắt đầu");
        }
    }

    private Map<String, Object> anhChupTrongSo(Collection<ChuanDauRa> clos) {
        Map<String, Object> m = new LinkedHashMap<>();
        clos.forEach(c -> m.put(c.getMaClo(), Map.of("alpha", c.getTrongSoAlpha().toPlainString(),
                "dvhd", c.getTyLeDvhd().toPlainString(), "gvhd", c.getTyLeGvhd().toPlainString())));
        return m;
    }

    private Set<Long> nguoiChamChang1(Long dotId) {
        Set<Long> ids = new LinkedHashSet<>();
        phanCongRepo.theoDot(dotId).forEach(p -> ids.add(p.getGiangVien().getNguoiDung().getId()));
        hoSoRepo.findByDotIdOrderById(dotId).stream()
                .filter(h -> h.getCanBoDvhd() != null)
                .forEach(h -> ids.add(h.getCanBoDvhd().getNguoiDung().getId()));
        return ids;
    }

    private Set<Long> nguoiLienQuan(Long dotId) {
        Set<Long> ids = nguoiChamChang1(dotId);
        hoSoRepo.findByDotIdOrderById(dotId).forEach(h -> ids.add(h.getSinhVien().getNguoiDung().getId()));
        toRepo.theoDot(dotId).forEach(t -> t.getThanhViens().forEach(tv -> ids.add(tv.getNguoiDung().getId())));
        return ids;
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
