package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.feedback.*;
import org.example.cdthqltt.entity.ChuanDauRa;
import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.PhanHoi;
import org.example.cdthqltt.entity.enums.LoaiPhanHoi;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.repository.ChuanDauRaRepository;
import org.example.cdthqltt.repository.NguoiDungRepository;
import org.example.cdthqltt.repository.PhanCongGvhdRepository;
import org.example.cdthqltt.repository.PhanHoiRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.service.scoring.CauHinhClo;
import org.example.cdthqltt.service.scoring.KhoangMuc;
import org.example.cdthqltt.service.scoring.RubricUtils;
import org.example.cdthqltt.service.scoring.ScoringService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * UC12 — phản hồi hai chiều (#94 … #97): TTTN-08a của cán bộ ĐVHD, TTTN-08b của sinh viên kèm tự đánh giá 7 CLO,
 * HPself và chỉ số tự nhận thức năng lực.
 */
@Service
@RequiredArgsConstructor
public class PhanHoiService {

    /**
     * UC12 tiền điều kiện: hồ sơ Chờ đánh giá cuối kỳ. Sau công bố vẫn cho gửi để SV chưa gửi 08b còn xem được kết
     * quả (UC12 8a, BR-12.5) — kết luận đã chốt không đổi.
     */
    private static final Set<TrangThaiHoSo> DUOC_GUI = EnumSet.of(TrangThaiHoSo.CHO_DANH_GIA,
            TrangThaiHoSo.HOAN_THANH, TrangThaiHoSo.KHONG_HOAN_THANH);
    private static final BigDecimal TRAM = new BigDecimal("100");
    private static final DateTimeFormatter NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PhanHoiRepository phanHoiRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final ChuanDauRaRepository cloRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final HoSoThucTapService hoSoService;
    private final CauHinhTinhDiemService cauHinhService;
    private final ScoringService scoringService;
    private final KetQuaService ketQuaService;
    private final NhatKyHeThongService nhatKyService;
    private final JsonMapper jsonMapper;

    /**
     * #94 — SV: 08b của mình (đầy đủ), 08a khi kết quả đã công bố · cán bộ ĐVHD: chỉ 08a · GV, giáo vụ: 08a và
     * 08b không kèm phần A đánh giá chất lượng (phần này chỉ thống kê ẩn danh — RP-06).
     */
    @Transactional(readOnly = true)
    public List<PhanHoiResponse> danhSach(Long hoSoId) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        List<PhanHoiResponse> ds = new ArrayList<>();
        boolean xem08a = !u.laSinhVien() || ketQuaService.ketQuaDaCongBo(h.getId()).isPresent();
        if (xem08a) {
            phanHoiRepo.findByHoSoIdAndLoai(h.getId(), LoaiPhanHoi.TTTN_08A).ifPresent(p -> ds.add(sangResponse(p, true)));
        }
        if (!u.laCanBoDvhd()) {
            phanHoiRepo.findByHoSoIdAndLoai(h.getId(), LoaiPhanHoi.TTTN_08B)
                    .ifPresent(p -> ds.add(sangResponse(p, u.laSinhVien())));
        }
        return ds;
    }

    /** #95 — BR-12.3: SV xem lại HPself trước khi gửi; chưa chọn đủ 7 CLO thì HPself rỗng kèm danh sách còn thiếu. */
    @Transactional(readOnly = true)
    public HpSelfResponse xemTruocHpSelf(XemTruocHpSelfRequest req) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(req.hoSoId(), SecurityUtils.currentUser());
        return tinhHpSelf(h, req.tuDanhGia());
    }

    /** #96 — mỗi hồ sơ một phiếu mỗi loại; 08b phải đủ 7 CLO (UC12 7a) và có cam kết trung thực. */
    @Transactional
    public PhanHoiResponse gui(GuiPhanHoiRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(req.hoSoId(), u);
        LoaiPhanHoi loai = u.laSinhVien() ? LoaiPhanHoi.TTTN_08B : LoaiPhanHoi.TTTN_08A;
        if (req.loai() != loai) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, u.laSinhVien()
                    ? "Sinh viên chỉ gửi phiếu phản hồi TTTN-08b" : "Cán bộ ĐVHD chỉ gửi phiếu phản hồi TTTN-08a");
        }
        if (u.laCanBoDvhd() && (h.getCanBoDvhd() == null || !h.getCanBoDvhd().getId().equals(u.canBoDvhdId()))) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "Chỉ cán bộ hướng dẫn của sinh viên mới gửi phiếu TTTN-08a");
        }
        if (!DUOC_GUI.contains(h.getTrangThai())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Phiếu phản hồi chỉ gửi được khi hồ sơ đã sang "
                    + "giai đoạn đánh giá cuối kỳ — báo cáo TTTN-06 đủ xác nhận của ĐVHD và GVHD (Điều 10 khoản 2)");
        }
        phanHoiRepo.findByHoSoIdAndLoai(h.getId(), loai).ifPresent(cu -> {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Phiếu " + tenPhieu(loai) + " của hồ sơ này đã được gửi ngày "
                    + cu.getNgayGui().format(NGAY) + "; mỗi hồ sơ chỉ gửi một lần");
        });

        PhanHoi p = new PhanHoi();
        p.setHoSo(h);
        p.setLoai(loai);
        p.setNguoiGuiId(u.nguoiDungId());
        p.setYKienMo(rong(req.yKienMo()));
        if (loai == LoaiPhanHoi.TTTN_08A) {
            p.setDuLieuTieuChi(jsonMapper.writeValueAsString(chuanHoa08a(req.phieu08a())));
        } else {
            Phieu08b b = chuanHoa08b(h, req.phieu08b());
            p.setHpSelf(tinhHpSelf(h, b.tuDanhGia()).hpSelf());
            p.setDuLieuTieuChi(jsonMapper.writeValueAsString(b));
            // Gửi sau khi đã công bố (UC12 8a) thì có ngay kết quả chính thức để so sánh.
            ketQuaService.ketQuaDaCongBo(h.getId())
                    .ifPresent(kq -> p.setChiSoTuNhanThuc(chiSoTuNhanThuc(b.tuDanhGia(), kq.mucClo())));
        }
        phanHoiRepo.save(p);
        // Đ15 k3d: 08a, 08b là minh chứng bắt buộc — ảnh hưởng điều kiện công nhận nên ghi nhật ký.
        nhatKyService.ghiVet("GUI_PHAN_HOI", "ho_so_thuc_tap", h.getId(), null,
                Map.of("loai", loai, "phanHoiId", p.getId()));
        return sangResponse(p, true);
    }

    /**
     * #97 — BR-12.4: chỉ có sau khi kết quả chính thức được công bố; chỉ chính SV và GVHD của SV xem
     * (UC12 bước 8).
     */
    @Transactional(readOnly = true)
    public TuNhanThucResponse tuNhanThuc(Long phanHoiId) {
        CurrentUser u = SecurityUtils.currentUser();
        PhanHoi p = phanHoiRepo.findById(phanHoiId)
                .filter(x -> x.getLoai() == LoaiPhanHoi.TTTN_08B)
                .orElseThrow(BusinessException::khongCoQuyen);
        HoSoThucTap h = hoSoService.layVaKiemQuyen(p.getHoSo().getId(), u);
        if (u.laGiangVien() && !phanCongRepo.existsByHoSoIdAndGiangVienId(h.getId(), u.giangVienId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "Chỉ GVHD của sinh viên mới xem chỉ số tự nhận thức");
        }
        KetQuaService.KetQuaChinhThuc kq = ketQuaService.ketQuaDaCongBo(h.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Chỉ số tự nhận thức chỉ có sau khi kết quả chính thức được công bố (BR-12.4)"));

        Phieu08b b = doc(p, Phieu08b.class);
        Map<String, String> tenClo = tenClo(h);
        Map<String, Integer> tuDanhGia = b.tuDanhGia().stream()
                .collect(Collectors.toMap(TuDanhGiaClo::maClo, TuDanhGiaClo::muc, (a, c) -> a));
        List<TuNhanThucResponse.SoSanhClo> ds = new ArrayList<>();
        int tongLech = 0;
        kq.mucClo().forEach((ma, chinhThuc) -> {
            Integer tu = tuDanhGia.get(ma);
            if (tu != null && chinhThuc != null) {
                ds.add(new TuNhanThucResponse.SoSanhClo(ma, tenClo.get(ma), tu, chinhThuc, tu - chinhThuc));
            }
        });
        for (TuNhanThucResponse.SoSanhClo s : ds) {
            tongLech += s.doLech();
        }
        BigDecimal chiSo = p.getChiSoTuNhanThuc() != null ? p.getChiSoTuNhanThuc()
                : chiSoTuNhanThuc(b.tuDanhGia(), kq.mucClo());
        BigDecimal xuHuong = ds.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(tongLech).divide(BigDecimal.valueOf(ds.size()), MathContext.DECIMAL64)
                .setScale(2, RoundingMode.HALF_UP);
        return new TuNhanThucResponse(p.getId(), h.getId(), ds, chiSo, xuHuong, p.getHpSelf(), kq.diemHp(),
                nhanDinh(chiSo, xuHuong));
    }

    /** Kết quả vừa công bố: tính và lưu chỉ số tự nhận thức cho SV đã gửi 08b (BR-12.4, RP-05). */
    @EventListener
    public void khiKetQuaCongBo(KetQuaDaCongBoEvent e) {
        phanHoiRepo.findByHoSoIdAndLoai(e.hoSoId(), LoaiPhanHoi.TTTN_08B).ifPresent(p ->
                ketQuaService.ketQuaDaCongBo(e.hoSoId()).ifPresent(kq ->
                        p.setChiSoTuNhanThuc(chiSoTuNhanThuc(doc(p, Phieu08b.class).tuDanhGia(), kq.mucClo()))));
    }

    // ------------------------------------------------------------------

    /**
     * HPself (UC12 bước 5): mức tự đánh giá → điểm giữa khoảng của mức đó trong rubric đợt → cùng công thức
     * Σα·CLO/100 của UC10 (dùng chung ScoringService) → làm tròn 0,1 ở bước cuối.
     */
    private HpSelfResponse tinhHpSelf(HoSoThucTap h, List<TuDanhGiaClo> tuDanhGia) {
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(h.getDot().getId());
        Map<String, String> ten = tenClo(h);
        Map<String, Integer> muc = gomMucTuDanhGia(cauHinh, tuDanhGia);
        List<HpSelfResponse.DongHpSelf> dong = new ArrayList<>();
        Map<String, BigDecimal> diem = new LinkedHashMap<>();
        List<String> thieu = new ArrayList<>();
        for (CauHinhClo clo : cauHinh.clo()) {
            Integer m = muc.get(clo.maClo());
            if (m == null) {
                thieu.add(clo.maClo());
                dong.add(new HpSelfResponse.DongHpSelf(clo.maClo(), ten.get(clo.maClo()), null, null, clo.alpha(), null));
                continue;
            }
            BigDecimal d = RubricUtils.diemGiuaKhoang(khoangCuaMuc(clo, m));
            diem.put(clo.maClo(), d);
            dong.add(new HpSelfResponse.DongHpSelf(clo.maClo(), ten.get(clo.maClo()), m, d, clo.alpha(),
                    d.multiply(clo.alpha(), MathContext.DECIMAL64).divide(TRAM, MathContext.DECIMAL64)
                            .setScale(2, RoundingMode.HALF_UP)));
        }
        BigDecimal hpSelf = thieu.isEmpty() ? RubricUtils.lamTron(scoringService.tinhHpTuDiemClo(diem, cauHinh.clo())) : null;
        return new HpSelfResponse(dong, hpSelf, thieu);
    }

    /** Mã CLO chuẩn hóa chữ hoa; mã lạ hoặc lặp ⇒ VALIDATION_ERROR. Dòng chưa chọn mức không có trong kết quả. */
    private static Map<String, Integer> gomMucTuDanhGia(CauHinhTinhDiemService.CauHinhDot cauHinh, List<TuDanhGiaClo> ds) {
        Set<String> hopLe = cauHinh.clo().stream().map(CauHinhClo::maClo).collect(Collectors.toSet());
        Map<String, Integer> muc = new LinkedHashMap<>();
        Set<String> daGap = new HashSet<>();
        for (TuDanhGiaClo t : ds == null ? List.<TuDanhGiaClo>of() : ds) {
            String ma = t.maClo().trim().toUpperCase(Locale.ROOT);
            if (!hopLe.contains(ma)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, ma + " không thuộc chuẩn đầu ra của đợt thực tập");
            }
            if (!daGap.add(ma)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mỗi CLO chỉ tự đánh giá một lần (" + ma + " bị lặp)");
            }
            if (t.muc() != null) {
                muc.put(ma, t.muc());
            }
        }
        return muc;
    }

    private static KhoangMuc khoangCuaMuc(CauHinhClo clo, int muc) {
        return clo.bangMuc().stream().filter(k -> k.muc() == muc).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Mức " + muc + " không có trong rubric của " + clo.maClo()));
    }

    private Phieu08a chuanHoa08a(Phieu08a a) {
        List<DanhGiaTieuChi> ds = a == null || a.tieuChi() == null ? List.of() : a.tieuChi();
        Map<Integer, DanhGiaTieuChi> theoStt = new TreeMap<>();
        int soTieuChi = BieuMauPhanHoi.TIEU_CHI_08A.size();
        for (DanhGiaTieuChi d : ds) {
            if (d.stt() > soTieuChi) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Phiếu TTTN-08a chỉ có " + soTieuChi + " tiêu chí");
            }
            if (theoStt.put(d.stt(), d) != null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tiêu chí " + d.stt() + " bị lặp");
            }
        }
        List<String> thieu = conThieu(soTieuChi, theoStt.keySet());
        if (!thieu.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Phiếu TTTN-08a còn tiêu chí chưa chấm mức: " + String.join(", ", thieu));
        }
        return new Phieu08a(theoStt.values().stream()
                .map(d -> new DanhGiaTieuChi(d.stt(), BieuMauPhanHoi.TIEU_CHI_08A.get(d.stt() - 1), d.muc(), rong(d.nhanXet())))
                .toList());
    }

    /** Kiểm đủ ba phần và cam kết, gom mọi lỗi vào một thông điệp để SV sửa một lần (UC12 7a). */
    private Phieu08b chuanHoa08b(HoSoThucTap h, Phieu08b b) {
        if (b == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Chưa điền phiếu TTTN-08b");
        }
        List<String> loi = new ArrayList<>();

        int soNoiDung = BieuMauPhanHoi.CHAT_LUONG_08B.size();
        Map<Integer, DanhGiaHaiLong> haiLong = new TreeMap<>();
        for (DanhGiaHaiLong d : b.chatLuong() == null ? List.<DanhGiaHaiLong>of() : b.chatLuong()) {
            if (d.stt() > soNoiDung) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Phần A chỉ có " + soNoiDung + " nội dung đánh giá");
            }
            if (haiLong.put(d.stt(), d) != null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Nội dung " + d.stt() + " phần A bị lặp");
            }
        }
        List<String> thieuA = conThieu(soNoiDung, haiLong.keySet());
        if (!thieuA.isEmpty()) {
            loi.add("Phần A còn nội dung chưa chọn mức hài lòng: " + String.join(", ", thieuA));
        }

        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(h.getDot().getId());
        Map<String, Integer> muc = gomMucTuDanhGia(cauHinh, b.tuDanhGia());
        List<String> thieuClo = cauHinh.clo().stream().map(CauHinhClo::maClo).filter(ma -> !muc.containsKey(ma)).toList();
        if (!thieuClo.isEmpty()) {
            loi.add("Còn CLO chưa tự đánh giá: " + String.join(", ", thieuClo));
        }

        TuLuan t = b.tuLuan() == null ? new TuLuan(null, null, null, null) : b.tuLuan();
        List<String> cauTraLoi = Arrays.asList(t.kyNangHocDuoc(), t.khoKhan(), t.keHoachCaiThien(), t.deXuat());
        List<String> thieuC = IntStream.range(0, cauTraLoi.size())
                .filter(i -> rong(cauTraLoi.get(i)) == null).mapToObj(i -> String.valueOf(i + 1)).toList();
        if (!thieuC.isEmpty()) {
            loi.add("Phần C còn câu chưa trả lời: " + String.join(", ", thieuC));
        }
        if (!Boolean.TRUE.equals(b.camKet())) {
            loi.add("Chưa tích cam kết trung thực (mục II)");
        }
        if (!loi.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, String.join("; ", loi));
        }

        Map<String, String> minhChung = new HashMap<>();
        b.tuDanhGia().forEach(x -> minhChung.put(x.maClo().trim().toUpperCase(Locale.ROOT), rong(x.minhChung())));
        List<TuDanhGiaClo> tuDanhGia = cauHinh.clo().stream()
                .map(clo -> {
                    int m = muc.get(clo.maClo());
                    return new TuDanhGiaClo(clo.maClo(), m, RubricUtils.diemGiuaKhoang(khoangCuaMuc(clo, m)),
                            minhChung.get(clo.maClo()));
                })
                .toList();
        List<DanhGiaHaiLong> chatLuong = haiLong.values().stream()
                .map(d -> new DanhGiaHaiLong(d.stt(), BieuMauPhanHoi.CHAT_LUONG_08B.get(d.stt() - 1), d.mucHaiLong(), rong(d.ghiChu())))
                .toList();
        return new Phieu08b(chatLuong, rong(b.yKienKhac()), tuDanhGia,
                new TuLuan(t.kyNangHocDuoc().trim(), t.khoKhan().trim(), t.keHoachCaiThien().trim(), t.deXuat().trim()), true);
    }

    /** TB |mức tự đánh giá − mức chính thức| trên các CLO, làm tròn 0,01 — luôn ≥ 0 (UC12 quy tắc). */
    private static BigDecimal chiSoTuNhanThuc(List<TuDanhGiaClo> tuDanhGia, Map<String, Integer> mucChinhThuc) {
        int tong = 0;
        int soClo = 0;
        for (TuDanhGiaClo t : tuDanhGia) {
            Integer chinhThuc = mucChinhThuc.get(t.maClo());
            if (chinhThuc != null && t.muc() != null) {
                tong += Math.abs(t.muc() - chinhThuc);
                soClo++;
            }
        }
        if (soClo == 0) {
            return null;
        }
        return BigDecimal.valueOf(tong).divide(BigDecimal.valueOf(soClo), MathContext.DECIMAL64).setScale(2, RoundingMode.HALF_UP);
    }

    private static String nhanDinh(BigDecimal chiSo, BigDecimal xuHuong) {
        if (chiSo == null) {
            return null;
        }
        if (chiSo.signum() == 0) {
            return "Tự đánh giá trùng khớp với kết quả chính thức ở mọi CLO";
        }
        if (xuHuong.signum() > 0) {
            return "Có xu hướng tự đánh giá cao hơn kết quả chính thức";
        }
        if (xuHuong.signum() < 0) {
            return "Có xu hướng tự đánh giá thấp hơn kết quả chính thức";
        }
        return "Lệch ở một số CLO nhưng cân bằng về tổng thể";
    }

    private PhanHoiResponse sangResponse(PhanHoi p, boolean dayDu) {
        String nguoiGui = nguoiDungRepo.findById(p.getNguoiGuiId()).map(NguoiDung::getHoTen).orElse(null);
        if (p.getLoai() == LoaiPhanHoi.TTTN_08A) {
            return new PhanHoiResponse(p.getId(), p.getHoSo().getId(), p.getLoai(), nguoiGui, p.getNgayGui(),
                    doc(p, Phieu08a.class), null, p.getYKienMo(), null, null);
        }
        Phieu08b b = doc(p, Phieu08b.class);
        if (!dayDu) {
            b = new Phieu08b(null, null, b.tuDanhGia(), b.tuLuan(), b.camKet());
        }
        return new PhanHoiResponse(p.getId(), p.getHoSo().getId(), p.getLoai(), nguoiGui, p.getNgayGui(),
                null, b, dayDu ? p.getYKienMo() : null, p.getHpSelf(), p.getChiSoTuNhanThuc());
    }

    private <T> T doc(PhanHoi p, Class<T> kieu) {
        return jsonMapper.readValue(p.getDuLieuTieuChi(), kieu);
    }

    private Map<String, String> tenClo(HoSoThucTap h) {
        return cloRepo.findByDotIdOrderByMaClo(h.getDot().getId()).stream()
                .collect(Collectors.toMap(ChuanDauRa::getMaClo, ChuanDauRa::getTen, (a, b) -> a));
    }

    private static List<String> conThieu(int soMuc, Set<Integer> daCo) {
        return IntStream.rangeClosed(1, soMuc).filter(i -> !daCo.contains(i)).mapToObj(String::valueOf).toList();
    }

    private static String tenPhieu(LoaiPhanHoi loai) {
        return loai == LoaiPhanHoi.TTTN_08A ? "TTTN-08a" : "TTTN-08b";
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
