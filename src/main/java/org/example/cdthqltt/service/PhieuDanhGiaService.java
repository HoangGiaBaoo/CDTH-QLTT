package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.assessment.*;
import org.example.cdthqltt.dto.record.HoSoMapper;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.*;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.service.scoring.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * UC08 (chặng giữa kỳ, GVHD + cán bộ ĐVHD) và phần chấm của UC09 (chặng cuối kỳ, thành viên Tổ đánh giá).
 * Chặng cuối cùng của đợt do Tổ chấm, các chặng trước do người hướng dẫn chấm.
 */
@Service
@RequiredArgsConstructor
public class PhieuDanhGiaService {

    private static final DateTimeFormatter NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PhieuDanhGiaRepository phieuRepo;
    private final ChangDanhGiaRepository changRepo;
    private final CauHoiDanhGiaRepository cauHoiRepo;
    private final MucRubricRepository mucRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final KetQuaHocPhanRepository ketQuaRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final HoSoThucTapService hoSoService;
    private final ToDanhGiaService toService;
    private final DotThucTapService dotService;
    private final CauHinhTinhDiemService cauHinhService;
    private final ScoringService scoringService;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;
    private final ApplicationEventPublisher publisher;

    /** #69 — người chấm chỉ thấy phiếu của mình. */
    @Transactional(readOnly = true)
    public List<PhieuResponse> danhSach(Long dotId, Integer thuTuChang, TrangThaiPhieu trangThai) {
        CurrentUser u = SecurityUtils.currentUser();
        Long nguoiCham = u.laAdmin() ? null : u.nguoiDungId();
        return phieuRepo.timKiem(nguoiCham, dotId, thuTuChang, trangThai).stream()
                .map(p -> PhieuResponse.tu(p, false)).toList();
    }

    /** #70 — câu hỏi + rubric của chặng; nhóm có tỷ lệ = 0 ở CLO nào thì không có câu đó (CBR-09). */
    @Transactional(readOnly = true)
    public BieuMauResponse bieuMau(Long hoSoId, int thuTuChang) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        ChangDanhGia c = dotService.layChang(h.getDot().getId(), thuTuChang);
        NhomNguoiCham nhom = xacDinhNhom(h, c, u);

        Map<Long, List<MucRubric>> mucTheoClo = mucRepo.theoDot(h.getDot().getId()).stream()
                .collect(Collectors.groupingBy(m -> m.getChuanDauRa().getId()));
        List<BieuMauResponse.CauHoi> cauHois = cauHoiRepo.theoChang(c.getId()).stream()
                .filter(q -> nhomDuocCham(q.getChuanDauRa(), nhom))
                .map(q -> new BieuMauResponse.CauHoi(q.getThuTu(), q.getNoiDung(), q.getChuanDauRa().getMaClo(),
                        q.getChuanDauRa().getTen(), mucTheoClo.getOrDefault(q.getChuanDauRa().getId(), List.of()).stream()
                        .map(m -> new BieuMauResponse.Muc(m.getMuc(), m.getDiemMin(), m.getDiemMax(), m.getMoTaHanhVi(),
                                RubricUtils.diemGiuaKhoang(KhoangMuc.tu(m))))
                        .toList()))
                .toList();
        Long phieuId = phieuRepo.findByHoSoIdAndChangIdAndNguoiChamId(h.getId(), c.getId(), u.nguoiDungId())
                .map(PhieuDanhGia::getId).orElse(null);
        GiangVien gvhd = phanCongRepo.findByHoSoId(h.getId()).map(PhanCongGvhd::getGiangVien).orElse(null);
        return new BieuMauResponse(HoSoMapper.toResponse(h, gvhd), c.getThuTu(), c.getTen(), c.getTrangThai(),
                c.getNgayMo(), c.getNgayDong(), nhom, phieuId, cauHois);
    }

    /**
     * #71 — BR-08.7: người chấm cùng chặng chỉ xem phiếu của người khác khi cả hai phiếu đều đã nộp. Thực thi ở
     * service để không thể vượt qua bằng cách gọi thẳng API.
     */
    @Transactional(readOnly = true)
    public PhieuResponse chiTiet(Long phieuId) {
        CurrentUser u = SecurityUtils.currentUser();
        PhieuDanhGia p = phieuRepo.findById(phieuId).orElse(null);
        if (p == null) {
            throw u.laAdmin() ? BusinessException.khongTimThay("phiếu đánh giá") : BusinessException.khongCoQuyen();
        }
        if (u.laAdmin() || p.getNguoiCham().getId().equals(u.nguoiDungId())) {
            return PhieuResponse.tu(p, true);
        }
        HoSoThucTap h = hoSoService.layVaKiemQuyen(p.getHoSo().getId(), u);
        Optional<PhieuDanhGia> cuaToi = phieuRepo.findByHoSoIdAndChangIdAndNguoiChamId(h.getId(), p.getChang().getId(), u.nguoiDungId());
        boolean chamCungChang = cuaToi.isPresent() || timNhom(h, p.getChang(), u).isPresent();
        boolean duocXem = p.daNop() && (!chamCungChang || cuaToi.map(PhieuDanhGia::daNop).orElse(false));
        if (!duocXem) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Chỉ xem được phiếu của người chấm khác khi cả hai đã nộp phiếu (BR-08.7)");
        }
        return PhieuResponse.tu(p, true);
    }

    /** #72 — CBR-11: mỗi người chấm một phiếu cho một SV trong một chặng. */
    @Transactional
    public PhieuResponse tao(TaoPhieuRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(req.hoSoId(), u);
        ChangDanhGia c = dotService.layChang(h.getDot().getId(), req.chang());
        NhomNguoiCham nhom = xacDinhNhom(h, c, u);
        kiemChangMo(c);
        kiemHoSoChoCham(h, c);
        phieuRepo.findByHoSoIdAndChangIdAndNguoiChamId(h.getId(), c.getId(), u.nguoiDungId()).ifPresent(cu -> {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Bạn đã có phiếu (mã " + cu.getId()
                    + ") cho sinh viên này ở " + c.getTen() + "; mỗi người chấm chỉ một phiếu (CBR-11)");
        });
        PhieuDanhGia p = new PhieuDanhGia();
        p.setHoSo(h);
        p.setChang(c);
        p.setNguoiCham(nguoiDungRepo.findById(u.nguoiDungId()).orElseThrow(BusinessException::khongCoQuyen));
        p.setNhomNguoiCham(nhom);
        p.setTrangThai(TrangThaiPhieu.NHAP);
        p.setNhanXetChung(rong(req.nhanXetChung()));
        List<String> boQua = ganDiem(p, req.diemClos());
        phieuRepo.save(p);
        ghiBoQua(p, boQua);
        return PhieuResponse.tu(p, true);
    }

    /** #73 — sửa khi Nháp (chặng còn mở) hoặc Mở lại (giáo vụ đã cho phép, kể cả khi chặng đã đóng). */
    @Transactional
    public PhieuResponse capNhat(Long phieuId, CapNhatPhieuRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        PhieuDanhGia p = layPhieuCuaToi(phieuId, u);
        kiemConSuaDuoc(p, u);
        p.setNhanXetChung(rong(req.nhanXetChung()));
        ghiBoQua(p, ganDiem(p, req.diemClos()));
        return PhieuResponse.tu(p, true);
    }

    /**
     * #74 — UC08 8a / UC09 9a: đủ CLO theo nhóm, có nhận xét chung, điểm nằm trong khoảng của mức đã chọn
     * (CBR-10). Nộp xong phiếu bị khóa; phát sự kiện để UC10 tự tính khi chặng cuối đủ phiếu.
     */
    @Transactional
    public PhieuResponse nop(Long phieuId) {
        CurrentUser u = SecurityUtils.currentUser();
        PhieuDanhGia p = layPhieuCuaToi(phieuId, u);
        kiemConSuaDuoc(p, u);
        HoSoThucTap h = p.getHoSo();
        kiemHoSoChoCham(h, p.getChang());

        List<String> loi = new ArrayList<>();
        if (p.getNhanXetChung() == null) {
            loi.add("Chưa nhập nhận xét chung");
        }
        Map<String, DiemCloChiTiet> daCham = p.getDiemClos().stream()
                .collect(Collectors.toMap(d -> d.getChuanDauRa().getMaClo(), d -> d, (a, b) -> a, TreeMap::new));
        List<String> thieu = cloCanCham(p.getChang(), p.getNhomNguoiCham()).stream()
                .map(ChuanDauRa::getMaClo).filter(ma -> !daCham.containsKey(ma)).sorted().toList();
        if (!thieu.isEmpty()) {
            loi.add("Còn thiếu điểm: " + String.join(", ", thieu));
        }
        Map<Long, List<KhoangMuc>> bangMuc = mucRepo.theoDot(h.getDot().getId()).stream()
                .collect(Collectors.groupingBy(m -> m.getChuanDauRa().getId(),
                        Collectors.mapping(KhoangMuc::tu, Collectors.toList())));
        boolean saiKhoang = false;
        for (DiemCloChiTiet d : daCham.values()) {
            List<KhoangMuc> bang = bangMuc.getOrDefault(d.getChuanDauRa().getId(), List.of());
            if (RubricUtils.xacDinhMuc(d.getDiem(), bang) != d.getMucDat()) {
                saiKhoang = true;
                loi.add(d.getChuanDauRa().getMaClo() + ": điểm " + RubricUtils.hienThi(d.getDiem()) + " không thuộc Mức "
                        + d.getMucDat() + " (" + moTaKhoang(bang, d.getMucDat()) + ")");
            }
        }
        if (!loi.isEmpty()) {
            // CBR-10 (Đ13 k2): điểm thang 10 phải nằm trong khoảng của mức rubric đã chọn.
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    String.join("; ", loi) + (saiKhoang ? " (Điều 13 khoản 2)" : ""));
        }

        p.setTrangThai(TrangThaiPhieu.DA_NOP);
        p.setNgayNop(LocalDateTime.now());
        // Đ14 k4c: nộp phiếu là thay đổi ảnh hưởng điểm ⇒ ghi nhật ký kèm giá trị đã nộp.
        nhatKyService.ghiVet("NOP_PHIEU", "phieu_danh_gia", p.getId(), null, anhChupDiem(p));
        publisher.publishEvent(new PhieuDaNopEvent(h.getId(), p.getChang().getThuTu()));
        return PhieuResponse.tu(p, true);
    }

    /**
     * #75 — CBR-12: chỉ giáo vụ, lý do bắt buộc, ghi nhật ký điểm cũ từng CLO. Kết quả đã công bố thì không mở
     * lại; kết quả đã tính / đã xác nhận quay về Chưa tính và được tính lại khi phiếu được nộp lại (UC10).
     */
    @Transactional
    public PhieuResponse moLai(Long phieuId, MoLaiPhieuRequest req) {
        PhieuDanhGia p = phieuRepo.findById(phieuId).orElseThrow(() -> BusinessException.khongTimThay("phiếu đánh giá"));
        if (p.getTrangThai() != TrangThaiPhieu.DA_NOP) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Chỉ mở lại được phiếu đã nộp");
        }
        ketQuaRepo.findByHoSoId(p.getHoSo().getId()).ifPresent(kq -> {
            if (kq.getTrangThai() == TrangThaiKetQua.DA_CONG_BO) {
                throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Kết quả học phần đã công bố, không mở lại phiếu được");
            }
            kq.setTrangThai(TrangThaiKetQua.CHUA_TINH);
        });
        String lyDo = req.lyDo().trim();
        Map<String, Object> truoc = new LinkedHashMap<>();
        truoc.put("trangThai", p.getTrangThai());
        truoc.put("diem", anhChupDiem(p));
        p.setTrangThai(TrangThaiPhieu.MO_LAI);
        p.setLyDoMoLai(lyDo);
        nhatKyService.ghiVet("MO_LAI_PHIEU", "phieu_danh_gia", p.getId(), truoc,
                Map.of("trangThai", TrangThaiPhieu.MO_LAI, "lyDo", lyDo));
        thongBaoService.gui("NT-13", List.of(p.getNguoiCham().getId()), "Giáo vụ đã mở lại phiếu đánh giá "
                        + p.getChang().getTen() + " của sinh viên " + p.getHoSo().getSinhVien().getNguoiDung().getHoTen() + ". Lý do: " + lyDo,
                "/assessments/" + p.getId());
        return PhieuResponse.tu(p, true);
    }

    /** #76 — BR-08.9 / Đ20 k3: chỉ cảnh báo cho giáo vụ, không chặn. */
    @Transactional(readOnly = true)
    public List<CanhBaoLechResponse> canhBaoLech(Long dotId) {
        DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(dot.getId());
        int changTo = cauHinh.chang().stream().mapToInt(CauHinhChang::thuTu).max().orElse(0);
        Map<HoSoThucTap, List<PhieuDanhGia>> theoHoSo = phieuRepo.theoDotVaTrangThai(dot.getId(), TrangThaiPhieu.DA_NOP).stream()
                .collect(Collectors.groupingBy(PhieuDanhGia::getHoSo, LinkedHashMap::new, Collectors.toList()));

        List<CanhBaoLechResponse> kq = new ArrayList<>();
        theoHoSo.forEach((h, dsPhieu) -> {
            List<PhieuDiem> phieu = cauHinhService.doiPhieu(dsPhieu, toService.nguoiVangMat(h.getId()), changTo).stream()
                    .filter(pd -> !pd.vangMat()).toList();
            for (CauHinhChang chang : cauHinh.chang()) {
                List<PhieuDiem> phieuChang = phieu.stream().filter(pd -> pd.chang() == chang.thuTu()).toList();
                for (CauHinhClo clo : cauHinh.clo()) {
                    if (!clo.changCoDanhGia().contains(chang.thuTu())
                            || !coDiem(phieuChang, NhomNguoiCham.DVHD, clo.maClo())
                            || !coDiem(phieuChang, NhomNguoiCham.GVHD, clo.maClo())) {
                        continue;
                    }
                    DiemChang d = scoringService.hopNhatNhomNguoiCham(clo, chang, phieuChang);
                    if (scoringService.lechVuotNguong(d)) {
                        kq.add(new CanhBaoLechResponse(h.getId(), h.getSinhVien().getMaSv(), h.getSinhVien().getNguoiDung().getHoTen(),
                                chang.thuTu(), clo.maClo(), RubricUtils.lamTron(d.tbDvhd()), RubricUtils.lamTron(d.tbGvhd()),
                                d.tbDvhd().subtract(d.tbGvhd()).abs().setScale(2, RoundingMode.HALF_UP)));
                    }
                }
            }
        });
        return kq;
    }

    // ------------------------------------------------------------------

    /** UC08 3a: chặng giữa kỳ chỉ GVHD được phân công hoặc cán bộ hướng dẫn; chặng cuối chỉ thành viên Tổ không vắng mặt. */
    private NhomNguoiCham xacDinhNhom(HoSoThucTap h, ChangDanhGia c, CurrentUser u) {
        return timNhom(h, c, u).orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED,
                "Bạn không phải người chấm của sinh viên này ở " + c.getTen()));
    }

    private Optional<NhomNguoiCham> timNhom(HoSoThucTap h, ChangDanhGia c, CurrentUser u) {
        if (laChangTo(c)) {
            return toService.thanhVienCham(h.getId(), u.nguoiDungId()).map(ThanhVienToDanhGia::getNhomNguoiCham);
        }
        if (u.laGiangVien() && phanCongRepo.existsByHoSoIdAndGiangVienId(h.getId(), u.giangVienId())) {
            return Optional.of(NhomNguoiCham.GVHD);
        }
        if (u.laCanBoDvhd() && h.getCanBoDvhd() != null && h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) {
            return Optional.of(NhomNguoiCham.DVHD);
        }
        return Optional.empty();
    }

    private boolean laChangTo(ChangDanhGia c) {
        List<ChangDanhGia> cacChang = changRepo.findByDotIdOrderByThuTu(c.getDot().getId());
        return !cacChang.isEmpty() && cacChang.get(cacChang.size() - 1).getId().equals(c.getId());
    }

    private static void kiemChangMo(ChangDanhGia c) {
        if (c.getTrangThai() != TrangThaiChang.DANG_MO) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, c.getTen() + " chưa mở hoặc đã đóng"
                    + (c.getNgayMo() == null ? "" : " (mở từ " + c.getNgayMo().format(NGAY) + ")"));
        }
    }

    /** Chặng cuối kỳ chỉ chấm khi báo cáo TTTN-06 đã đủ hai xác nhận — hồ sơ Chờ đánh giá (Đ10 k2, UC09 6a). */
    private void kiemHoSoChoCham(HoSoThucTap h, ChangDanhGia c) {
        boolean hopLe = laChangTo(c)
                ? h.getTrangThai() == TrangThaiHoSo.CHO_DANH_GIA
                : h.getTrangThai() == TrangThaiHoSo.DANG_THUC_TAP || h.getTrangThai() == TrangThaiHoSo.CHO_DANH_GIA;
        if (!hopLe) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, laChangTo(c)
                    ? "Sinh viên chưa có báo cáo TTTN-06 được ĐVHD và GVHD xác nhận nên chưa chấm được " + c.getTen() + " (Điều 10 khoản 2)"
                    : "Hồ sơ không ở giai đoạn thực tập nên không chấm được " + c.getTen());
        }
    }

    private PhieuDanhGia layPhieuCuaToi(Long phieuId, CurrentUser u) {
        return phieuRepo.findById(phieuId)
                .filter(p -> p.getNguoiCham().getId().equals(u.nguoiDungId()))
                .orElseThrow(BusinessException::khongCoQuyen);
    }

    /** Phiếu đã nộp bị khóa (CBR-12); người chấm vẫn phải còn đúng vai trò (ví dụ chưa bị đổi GVHD, chưa vắng mặt). */
    private void kiemConSuaDuoc(PhieuDanhGia p, CurrentUser u) {
        if (p.getTrangThai() == TrangThaiPhieu.DA_NOP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Phiếu đã nộp và bị khóa; cần giáo vụ mở lại (CBR-12)");
        }
        xacDinhNhom(p.getHoSo(), p.getChang(), u);
        if (p.getTrangThai() == TrangThaiPhieu.NHAP) {
            kiemChangMo(p.getChang());
        }
    }

    /** CLO người chấm phải chấm ở chặng: CLO có câu hỏi trong chặng và nhóm của người chấm có tỷ lệ > 0. */
    private List<ChuanDauRa> cloCanCham(ChangDanhGia c, NhomNguoiCham nhom) {
        return cloCuaChang(c).values().stream().filter(clo -> nhomDuocCham(clo, nhom)).toList();
    }

    private Map<String, ChuanDauRa> cloCuaChang(ChangDanhGia c) {
        Map<String, ChuanDauRa> m = new LinkedHashMap<>();
        cauHoiRepo.theoChang(c.getId()).forEach(q -> m.putIfAbsent(q.getChuanDauRa().getMaClo(), q.getChuanDauRa()));
        return m;
    }

    private static boolean nhomDuocCham(ChuanDauRa clo, NhomNguoiCham nhom) {
        BigDecimal tyLe = nhom == NhomNguoiCham.DVHD ? clo.getTyLeDvhd() : clo.getTyLeGvhd();
        return tyLe != null && tyLe.signum() > 0;
    }

    /**
     * Ghi điểm vào phiếu, cập nhật tại chỗ để không đụng UNIQUE(phieu_id, chuan_dau_ra_id). CLO mà nhóm người chấm
     * có tỷ lệ 0 (ĐVHD ở CLO7) bị bỏ qua và trả về để ghi nhật ký (CBR-09, UC09 8a).
     */
    private List<String> ganDiem(PhieuDanhGia p, List<DiemCloRequest> ds) {
        Map<String, ChuanDauRa> cloHopLe = cloCuaChang(p.getChang());
        Map<String, DiemCloRequest> moi = new LinkedHashMap<>();
        List<String> boQua = new ArrayList<>();
        for (DiemCloRequest d : ds == null ? List.<DiemCloRequest>of() : ds) {
            String ma = d.maClo().trim().toUpperCase(Locale.ROOT);
            ChuanDauRa clo = cloHopLe.get(ma);
            if (clo == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, ma + " không có trong biểu mẫu của " + p.getChang().getTen());
            }
            if (moi.containsKey(ma) || boQua.contains(ma)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mỗi CLO chỉ nhập một điểm (" + ma + " bị lặp)");
            }
            if (!nhomDuocCham(clo, p.getNhomNguoiCham())) {
                boQua.add(ma);
                continue;
            }
            moi.put(ma, d);
        }
        p.getDiemClos().removeIf(ct -> !moi.containsKey(ct.getChuanDauRa().getMaClo()));
        Map<String, DiemCloChiTiet> hienCo = p.getDiemClos().stream()
                .collect(Collectors.toMap(ct -> ct.getChuanDauRa().getMaClo(), ct -> ct));
        moi.forEach((ma, d) -> {
            DiemCloChiTiet ct = hienCo.get(ma);
            if (ct == null) {
                ct = new DiemCloChiTiet();
                ct.setPhieu(p);
                ct.setChuanDauRa(cloHopLe.get(ma));
                p.getDiemClos().add(ct);
            }
            ct.setMucDat(d.mucDat());
            ct.setDiem(d.diem());
            ct.setNhanXet(rong(d.nhanXet()));
        });
        return boQua;
    }

    private void ghiBoQua(PhieuDanhGia p, List<String> boQua) {
        if (!boQua.isEmpty()) {
            nhatKyService.ghiVet("BO_QUA_DIEM_KHONG_DUOC_CHAM", "phieu_danh_gia", p.getId(), null,
                    Map.of("cacClo", boQua, "nhom", p.getNhomNguoiCham(), "canCu", "CBR-09"));
        }
    }

    private static Map<String, Object> anhChupDiem(PhieuDanhGia p) {
        Map<String, Object> m = new TreeMap<>();
        p.getDiemClos().forEach(d -> m.put(d.getChuanDauRa().getMaClo(), Map.of("muc", d.getMucDat(), "diem", d.getDiem())));
        return m;
    }

    private static boolean coDiem(List<PhieuDiem> phieu, NhomNguoiCham nhom, String maClo) {
        return phieu.stream().anyMatch(pd -> pd.nhom() == nhom && pd.diemTheoClo().containsKey(maClo));
    }

    private static String moTaKhoang(List<KhoangMuc> bang, int muc) {
        int cao = bang.stream().mapToInt(KhoangMuc::muc).max().orElse(muc);
        return bang.stream().filter(k -> k.muc() == muc).findFirst()
                .map(k -> "từ " + RubricUtils.hienThi(k.diemMin()) + (k.muc() == cao ? " đến " : " đến dưới ")
                        + RubricUtils.hienThi(k.diemMax()))
                .orElse("mức không tồn tại");
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
