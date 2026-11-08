package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.evidence.KetQuaDoiChieu;
import org.example.cdthqltt.dto.result.*;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.*;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.example.cdthqltt.service.export.XuatBangTongHopWord;
import org.example.cdthqltt.service.scoring.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * UC10 — tính điểm CLO, điểm học phần và xét công nhận hoàn thành (#82 … #88).
 * Thuật toán nằm ở {@link ScoringService} (Java thuần); lớp này nạp dữ liệu, kiểm đủ phiếu, lưu kết quả,
 * ghi nhật ký và điều khiển vòng đời Chưa tính → Đã tính → Đã xác nhận → Đã công bố.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KetQuaService {

    /** Đ18 k4: điểm thưởng tối đa 0,5 — ngưỡng của Quy định; CSDL chặn thêm bằng ck_ket_qua_thuong. */
    private static final BigDecimal DIEM_THUONG_TOI_DA = new BigDecimal("0.5");
    private static final BigDecimal TRAM = new BigDecimal("100");
    /** Độ dài cột ly_do_khong_dat. */
    private static final int DO_DAI_LY_DO = 500;
    /** Độ dài cột phien_ban_trong_so. */
    private static final int DO_DAI_PHIEN_BAN = 50;
    private static final DateTimeFormatter DINH_DANG_PHIEN_BAN = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
    /** Hồ sơ đã được GVHD duyệt trở đi — có mặt trong bảng kết quả toàn đợt (RP-01). */
    private static final Set<TrangThaiHoSo> HO_SO_TRONG_BANG = EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP,
            TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.HOAN_THANH, TrangThaiHoSo.KHONG_HOAN_THANH, TrangThaiHoSo.GIAN_DOAN);

    private final HoSoThucTapRepository hoSoRepo;
    private final KetQuaHocPhanRepository ketQuaRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final ThanhVienToDanhGiaRepository thanhVienRepo;
    private final ToDanhGiaRepository toRepo;
    private final ChuanDauRaRepository cloRepo;
    private final MinhChungRepository minhChungRepo;
    private final PhanHoiRepository phanHoiRepo;
    private final NhatKyHeThongRepository nhatKyRepo;
    private final HoSoThucTapService hoSoService;
    private final DotThucTapService dotService;
    private final CauHinhTinhDiemService cauHinhService;
    private final MinhChungService minhChungService;
    private final ScoringService scoringService;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;
    private final XuatBangTongHopWord xuatWord;
    private final ApplicationEventPublisher publisher;

    /** Kết quả chính thức đã công bố — hợp đồng cho UC12 (chỉ số tự nhận thức) và UC13 (thống kê CLO). */
    public record KetQuaChinhThuc(BigDecimal diemHp, Map<String, BigDecimal> diemClo, Map<String, Integer> mucClo) {
    }

    /**
     * Hợp đồng cho người B (UC12) và UC13: điểm và mức từng CLO của kết quả <b>đã công bố</b>; chưa công bố thì rỗng.
     * Mức quy đổi trên điểm đã làm tròn bằng cùng hàm lúc tính (docs/01 mục 10.1).
     */
    @Transactional(readOnly = true)
    public Optional<KetQuaChinhThuc> ketQuaDaCongBo(Long hoSoId) {
        return ketQuaRepo.findByHoSoId(hoSoId)
                .filter(kq -> kq.getTrangThai() == TrangThaiKetQua.DA_CONG_BO)
                .map(kq -> {
                    CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(kq.getHoSo().getDot().getId());
                    Map<String, BigDecimal> diem = new LinkedHashMap<>();
                    Map<String, Integer> muc = new LinkedHashMap<>();
                    for (CauHinhClo clo : cauHinh.clo()) {
                        BigDecimal d = layDiemClo(kq, clo.maClo());
                        diem.put(clo.maClo(), d);
                        muc.put(clo.maClo(), mucCua(d, clo.bangMuc()));
                    }
                    return new KetQuaChinhThuc(kq.getDiemHp(), diem, muc);
                });
    }

    // ------------------------------------------------------------------
    // Tự động tính khi đủ phiếu (UC10 bước 1, luồng thay thế sau khi mở lại phiếu)
    // ------------------------------------------------------------------

    /**
     * Chạy đồng bộ trong giao dịch nộp phiếu. Chưa đủ phiếu thì chỉ bỏ qua — việc nộp phiếu vẫn thành công.
     * Mọi nhánh ném {@link BusinessException} ở đây đều là method private (không qua proxy giao dịch) nên bắt
     * lỗi không làm giao dịch nộp phiếu bị đánh dấu rollback.
     */
    @EventListener
    public void khiPhieuDaNop(PhieuDaNopEvent e) {
        HoSoThucTap h = hoSoRepo.findById(e.hoSoId()).orElse(null);
        if (h == null || h.getTrangThai() != TrangThaiHoSo.CHO_DANH_GIA) {
            return;
        }
        TrangThaiKetQua hienTai = ketQuaRepo.findByHoSoId(h.getId())
                .map(KetQuaHocPhan::getTrangThai).orElse(TrangThaiKetQua.CHUA_TINH);
        if (hienTai == TrangThaiKetQua.DA_XAC_NHAN || hienTai == TrangThaiKetQua.DA_CONG_BO) {
            return;
        }
        try {
            tinhVaLuu(h, "TU_DONG_KHI_DU_PHIEU");
        } catch (BusinessException ex) {
            log.info("Chưa tự tính điểm hồ sơ {}: {}", h.getId(), ex.getMessage());
        }
    }

    // ------------------------------------------------------------------
    // #82 – #88
    // ------------------------------------------------------------------

    /** #82 — giáo vụ cả đợt; GV và cán bộ: SV mình hướng dẫn + SV trong Tổ mình tham gia. */
    @Transactional(readOnly = true)
    public List<KetQuaTomTatResponse> danhSach(Long dotId) {
        CurrentUser u = SecurityUtils.currentUser();
        DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
        List<HoSoThucTap> hoSos = switch (u.vaiTro()) {
            case ADMIN -> hoSoRepo.findByDotIdOrderById(dot.getId());
            case GIANG_VIEN -> gop(hoSoRepo.theoGiangVien(u.giangVienId(), dot.getId(), null), hoSoTrongToCua(u, dot));
            case CAN_BO_DVHD -> gop(hoSoRepo.theoCanBo(u.canBoDvhdId(), dot.getId(), null), hoSoTrongToCua(u, dot));
            case SINH_VIEN -> throw BusinessException.khongCoQuyen();
        };
        Map<Long, KetQuaHocPhan> ketQua = ketQuaRepo.theoDot(dot.getId()).stream()
                .collect(Collectors.toMap(k -> k.getHoSo().getId(), Function.identity()));
        Map<Long, String> gvhd = phanCongRepo.theoDot(dot.getId()).stream()
                .collect(Collectors.toMap(p -> p.getHoSo().getId(), p -> p.getGiangVien().getNguoiDung().getHoTen(), (a, b) -> a));
        List<String> maClo = cloRepo.findByDotIdOrderByMaClo(dot.getId()).stream().map(ChuanDauRa::getMaClo).toList();
        return hoSos.stream()
                .filter(h -> HO_SO_TRONG_BANG.contains(h.getTrangThai()) || ketQua.containsKey(h.getId()))
                .sorted(Comparator.comparing(h -> h.getSinhVien().getMaSv()))
                .map(h -> tomTat(h, ketQua.get(h.getId()), gvhd.get(h.getId()), maClo))
                .toList();
    }

    /**
     * #83 — cán bộ xem bảng TTTN-07 đầy đủ; sinh viên chỉ xem khi kết quả đã công bố và đã gửi phiếu 08b
     * (BR-12.5), và không thấy điểm theo nhóm người chấm.
     */
    @Transactional(readOnly = true)
    public KetQuaChiTietResponse chiTiet(Long hoSoId) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        KetQuaHocPhan kq = ketQuaRepo.findByHoSoId(h.getId()).orElse(null);
        return u.laSinhVien() ? choSinhVien(h, kq) : lapBangTongHop(h, kq);
    }

    /** #84 — giáo vụ chạy lại thuật toán: kiểm đủ phiếu hai bên (CBR-17), ghi nhật ký HP trước và sau. */
    @Transactional
    public BangTongHopResponse chayTinhDiem(Long hoSoId) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        ketQuaRepo.findByHoSoId(h.getId()).ifPresent(KetQuaService::kiemChuaChot);
        kiemChoDanhGia(h);
        return lapBangTongHop(h, tinhVaLuu(h, "GIAO_VU_TINH_LAI"));
    }

    /** #85 — chỉ GVHD của SV: nhận xét mục V và đề xuất điểm thưởng (CBR-21); đổi thưởng thì tính lại HP. */
    @Transactional
    public BangTongHopResponse nhanXet(Long hoSoId, NhanXetKetQuaRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        if (!phanCongRepo.existsByHoSoIdAndGiangVienId(h.getId(), u.giangVienId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Chỉ GVHD của sinh viên mới nhập nhận xét và đề xuất điểm thưởng");
        }
        KetQuaHocPhan kq = layKetQuaDaTinh(h);
        BigDecimal thuong = req.diemThuong() == null ? BigDecimal.ZERO : req.diemThuong();
        kiemDiemThuong(thuong);
        kq.setNhanXetGvhd(req.nhanXet().trim());
        BigDecimal thuongCu = khongNull(kq.getDiemThuong());
        if (thuong.compareTo(thuongCu) != 0) {
            kq.setDiemThuong(thuong);
            // Đ14 k4c: điểm thưởng làm đổi điểm học phần ⇒ ghi vết rồi tính lại toàn bộ.
            nhatKyService.ghiVet("DE_XUAT_DIEM_THUONG", "ho_so_thuc_tap", h.getId(),
                    Map.of("diemThuong", thuongCu), Map.of("diemThuong", thuong));
            kq = tinhVaLuu(h, "GVHD_DE_XUAT_DIEM_THUONG");
        }
        return lapBangTongHop(h, kq);
    }

    /**
     * #86 — giáo vụ xác nhận và duyệt điểm thưởng. Sau xác nhận, minh chứng của hồ sơ bị khóa vì đã là căn cứ
     * của điểm (CBR-22); muốn sửa điểm phải mở lại phiếu (CBR-12).
     */
    @Transactional
    public BangTongHopResponse xacNhan(Long hoSoId, XacNhanKetQuaRequest req) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        KetQuaHocPhan kq = layKetQuaDaTinh(h);
        kiemChoDanhGia(h);
        if (kq.getNhanXetGvhd() == null || kq.getNhanXetGvhd().isBlank()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "GVHD chưa rà soát và nhập nhận xét cho bảng tổng hợp (mẫu TTTN-07 mục V, UC10 bước 8)");
        }
        BigDecimal duyet = req == null ? null : req.diemThuongDuyet();
        if (duyet != null) {
            kiemDiemThuong(duyet);
            BigDecimal deXuat = khongNull(kq.getDiemThuong());
            if (duyet.compareTo(deXuat) != 0) {
                kq.setDiemThuong(duyet);
                nhatKyService.ghiVet("DUYET_DIEM_THUONG", "ho_so_thuc_tap", h.getId(),
                        Map.of("diemThuong", deXuat), Map.of("diemThuong", duyet));
                kq = tinhVaLuu(h, "GIAO_VU_DUYET_DIEM_THUONG");
            }
        }
        kiemConHieuLuc(h, kq);
        kq.setTrangThai(TrangThaiKetQua.DA_XAC_NHAN);
        minhChungRepo.khoaTheoHoSo(h.getId());
        nhatKyService.ghiVet("XAC_NHAN_KET_QUA", "ho_so_thuc_tap", h.getId(),
                Map.of("trangThai", TrangThaiKetQua.DA_TINH), anhChup(kq));
        return lapBangTongHop(h, kq);
    }

    /**
     * #87 — công bố theo danh sách (mọi hồ sơ phải đã xác nhận, sai một thì không công bố hồ sơ nào) hoặc cả đợt
     * (công bố các kết quả đã xác nhận). Hồ sơ chuyển Hoàn thành / Không hoàn thành theo kết luận Đ15 k3.
     */
    @Transactional
    public CongBoResponse congBo(CongBoRequest req) {
        Long dotId = req == null ? null : req.termId();
        List<Long> ids = req == null || req.hoSoIds() == null ? List.of()
                : req.hoSoIds().stream().filter(Objects::nonNull).distinct().toList();
        List<KetQuaHocPhan> ds;
        Long soChuaXacNhan = null;
        if (!ids.isEmpty()) {
            ds = chonTheoDanhSach(ids, dotId);
        } else {
            DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
            ds = ketQuaRepo.theoDotVaTrangThai(dot.getId(), TrangThaiKetQua.DA_XAC_NHAN).stream()
                    .filter(k -> k.getHoSo().getTrangThai() == TrangThaiHoSo.CHO_DANH_GIA)
                    .toList();
            if (ds.isEmpty()) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Đợt " + dot.getMaDot() + " chưa có kết quả nào đã được giáo vụ xác nhận để công bố (UC10 bước 10)");
            }
            long dangThucHien = hoSoRepo.findByDotIdOrderById(dot.getId()).stream()
                    .filter(h -> NhomTrangThaiHoSo.DANG_THUC_HIEN.contains(h.getTrangThai())).count();
            soChuaXacNhan = dangThucHien - ds.size();
        }

        int soDat = 0;
        for (KetQuaHocPhan kq : ds) {
            HoSoThucTap h = kq.getHoSo();
            boolean dat = kq.getKetLuan() == KetLuan.DAT;
            kq.setTrangThai(TrangThaiKetQua.DA_CONG_BO);
            hoSoService.chuyenTrangThai(h, dat ? TrangThaiHoSo.HOAN_THANH : TrangThaiHoSo.KHONG_HOAN_THANH,
                    "Công bố kết quả học phần");
            Map<String, Object> sau = new LinkedHashMap<>();
            sau.put("trangThai", TrangThaiKetQua.DA_CONG_BO);
            sau.put("diemHp", kq.getDiemHp());
            sau.put("ketLuan", kq.getKetLuan());
            nhatKyService.ghiVet("CONG_BO_KET_QUA", "ho_so_thuc_tap", h.getId(),
                    Map.of("trangThai", TrangThaiKetQua.DA_XAC_NHAN), sau);
            thongBaoService.gui("NT-14", List.of(h.getSinhVien().getNguoiDung().getId()),
                    "Kết quả học phần đợt " + h.getDot().getTen() + " đã được công bố. "
                            + "Gửi phiếu phản hồi TTTN-08b để xem kết quả.", "/results/" + h.getId());
            publisher.publishEvent(new KetQuaDaCongBoEvent(h.getId()));
            if (dat) {
                soDat++;
            }
        }
        return new CongBoResponse(ds.size(), soDat, ds.size() - soDat,
                ds.stream().map(k -> k.getHoSo().getId()).toList(), soChuaXacNhan);
    }

    /** #88 — tệp Word theo bố cục mẫu TTTN-07; chỉ xuất khi kết quả đã được tính. */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> xuatTTTN07(Long hoSoId) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        KetQuaHocPhan kq = ketQuaRepo.findByHoSoId(h.getId())
                .filter(k -> k.getTrangThai() != TrangThaiKetQua.CHUA_TINH)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Hồ sơ chưa có kết quả học phần đã tính nên chưa xuất được mẫu TTTN-07 (Điều 14)"));
        byte[] tep = xuatWord.xuat(lapBangTongHop(h, kq));
        String tenFile = "TTTN-07_" + h.getSinhVien().getMaSv() + ".docx";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(tenFile, StandardCharsets.UTF_8).build().toString())
                .body(new ByteArrayResource(tep));
    }

    // ------------------------------------------------------------------
    // Tính và lưu
    // ------------------------------------------------------------------

    /** Kiểm đủ phiếu → tính → ghi ket_qua_hoc_phan (trạng thái Đã tính) → nhật ký điểm trước/sau (Đ14 k4c). */
    private KetQuaHocPhan tinhVaLuu(HoSoThucTap h, String nguon) {
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(h.getDot().getId());
        List<PhieuDanhGia> tatCa = phieuRepo.findByHoSoIdOrderById(h.getId());
        kiemDuPhieu(h, cauHinh, tatCa);

        KetQuaHocPhan kq = ketQuaRepo.findByHoSoId(h.getId()).orElseGet(() -> {
            KetQuaHocPhan moi = new KetQuaHocPhan();
            moi.setHoSo(h);
            return moi;
        });
        KetQuaTinhDiem r = tinh(h, cauHinh, tatCa, kq.getDiemThuong());
        Map<String, Object> truoc = kq.getId() == null ? null : anhChup(kq);

        for (CauHinhClo clo : cauHinh.clo()) {
            ganDiemClo(kq, clo.maClo(), r.diemClo().get(clo.maClo()));
        }
        kq.setDiemHp(r.diemHp());
        kq.setMucDat(r.mucHp());
        kq.setNhomKienThuc(r.nhomKienThuc());
        kq.setNhomKyNang(r.nhomKyNang());
        kq.setNhomThaiDo(r.nhomThaiDo());
        kq.setKetLuan(r.ketLuan());
        kq.setLyDoKhongDat(noiLyDo(r));
        // CBR-22: lưu phiên bản bộ trọng số đã dùng để bảng điểm cũ truy vết được khi Khoa chỉnh cấu hình.
        kq.setPhienBanTrongSo(phienBanTrongSo(h.getDot()));
        kq.setTrangThai(TrangThaiKetQua.DA_TINH);
        kq.setNgayTinh(LocalDateTime.now());
        ketQuaRepo.save(kq);

        Map<String, Object> sau = anhChup(kq);
        sau.put("nguon", nguon);
        nhatKyService.ghiVet("TINH_DIEM", "ho_so_thuc_tap", h.getId(), truoc, sau);
        return kq;
    }

    /**
     * Dựng đầu vào cho bộ máy tính điểm. Chặng cuối chỉ lấy phiếu của thành viên hiện còn trong Tổ và không
     * vắng mặt (Đ10 k3) — phiếu của người đã bị thay ra coi như vắng.
     */
    private KetQuaTinhDiem tinh(HoSoThucTap h, CauHinhTinhDiemService.CauHinhDot cauHinh,
                                List<PhieuDanhGia> tatCa, BigDecimal diemThuong) {
        int changTo = thuTuChangTo(cauHinh);
        List<PhieuDanhGia> daNop = tatCa.stream().filter(PhieuDanhGia::daNop).toList();
        Set<Long> nguoiChamTo = thanhVienKhongVang(h).stream().map(tv -> tv.getNguoiDung().getId()).collect(Collectors.toSet());
        Set<Long> loaiTru = daNop.stream()
                .filter(p -> p.getChang().getThuTu() == changTo)
                .map(p -> p.getNguoiCham().getId())
                .filter(id -> !nguoiChamTo.contains(id))
                .collect(Collectors.toSet());
        List<PhieuDiem> phieu = cauHinhService.doiPhieu(daNop, loaiTru, changTo);
        KetQuaDoiChieu minhChung = minhChungService.doiChieu(h);
        return scoringService.tinhDiem(new DauVaoTinhDiem(cauHinh.chang(), cauHinh.clo(), cauHinh.bangMucHp(), phieu,
                h.getSinhVien().getChuongTrinhDaoTao(), diemThuong, minhChung.du(), minhChung.loaiConThieu()));
    }

    /**
     * UC10 bước 2 (CBR-17, Đ13 k3): chặng giữa kỳ cần phiếu đã nộp của cả GVHD và cán bộ hướng dẫn; chặng cuối
     * cần phiếu đã nộp của mọi thành viên Tổ không vắng mặt. Phiếu đang mở lại chưa được tính.
     */
    private void kiemDuPhieu(HoSoThucTap h, CauHinhTinhDiemService.CauHinhDot cauHinh, List<PhieuDanhGia> tatCa) {
        List<String> moLai = tatCa.stream().filter(p -> p.getTrangThai() == TrangThaiPhieu.MO_LAI)
                .map(p -> p.getNguoiCham().getHoTen() + " (" + p.getChang().getTen() + ")").toList();
        if (!moLai.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Phiếu đang được mở lại, chờ người chấm nộp lại: "
                    + String.join(", ", moLai) + " (Điều 14 khoản 4 điểm c)");
        }
        int changTo = thuTuChangTo(cauHinh);
        for (CauHinhChang c : cauHinh.chang()) {
            List<PhieuDanhGia> daNop = tatCa.stream()
                    .filter(p -> p.daNop() && p.getChang().getThuTu() == c.thuTu()).toList();
            if (c.thuTu() == changTo) {
                kiemPhieuTo(h, c, daNop);
            } else {
                kiemPhieuHuongDan(h, c, daNop, cauHinh);
            }
        }
    }

    private void kiemPhieuHuongDan(HoSoThucTap h, CauHinhChang c, List<PhieuDanhGia> daNop,
                                   CauHinhTinhDiemService.CauHinhDot cauHinh) {
        if (nhomPhaiCham(cauHinh, c, NhomNguoiCham.DVHD)
                && daNop.stream().noneMatch(p -> p.getNhomNguoiCham() == NhomNguoiCham.DVHD)) {
            String ten = h.getCanBoDvhd() == null ? "" : " " + h.getCanBoDvhd().getNguoiDung().getHoTen();
            throw new BusinessException(ErrorCode.THIEU_PHIEU_DVHD,
                    c.ten() + " chưa có phiếu đã nộp của cán bộ hướng dẫn" + ten + " (Điều 13 khoản 3)");
        }
        if (nhomPhaiCham(cauHinh, c, NhomNguoiCham.GVHD)
                && daNop.stream().noneMatch(p -> p.getNhomNguoiCham() == NhomNguoiCham.GVHD)) {
            String ten = phanCongRepo.findByHoSoId(h.getId())
                    .map(p -> " " + p.getGiangVien().getNguoiDung().getHoTen()).orElse("");
            throw new BusinessException(ErrorCode.THIEU_PHIEU_GVHD,
                    c.ten() + " chưa có phiếu đã nộp của GVHD" + ten + " (Điều 13 khoản 3)");
        }
    }

    private void kiemPhieuTo(HoSoThucTap h, CauHinhChang c, List<PhieuDanhGia> daNop) {
        List<ThanhVienToDanhGia> thanhVien = thanhVienRepo.theoHoSo(h.getId());
        if (thanhVien.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Sinh viên chưa được xếp vào Tổ đánh giá nên chưa có phiếu " + c.ten() + " (Điều 10 khoản 3)");
        }
        Set<Long> daNopIds = daNop.stream().map(p -> p.getNguoiCham().getId()).collect(Collectors.toSet());
        List<ThanhVienToDanhGia> thieu = thanhVien.stream()
                .filter(tv -> !Boolean.TRUE.equals(tv.getVangMat()) && !daNopIds.contains(tv.getNguoiDung().getId()))
                .toList();
        if (!thieu.isEmpty()) {
            boolean thieuDvhd = thieu.stream().anyMatch(tv -> tv.getNhomNguoiCham() == NhomNguoiCham.DVHD);
            String ds = thieu.stream()
                    .map(tv -> tv.getNguoiDung().getHoTen() + " (nhóm " + (tv.getNhomNguoiCham() == NhomNguoiCham.DVHD ? "ĐVHD" : "GVHD") + ")")
                    .collect(Collectors.joining(", "));
            throw new BusinessException(thieuDvhd ? ErrorCode.THIEU_PHIEU_DVHD : ErrorCode.THIEU_PHIEU_GVHD,
                    c.ten() + " còn thiếu phiếu đã nộp của: " + ds + " (Điều 13 khoản 3)");
        }
    }

    /** Nhóm người chấm có tỷ lệ > 0 ở ít nhất một CLO của chặng — đọc từ cấu hình, không viết cứng. */
    private static boolean nhomPhaiCham(CauHinhTinhDiemService.CauHinhDot cauHinh, CauHinhChang c, NhomNguoiCham nhom) {
        return cauHinh.clo().stream().anyMatch(clo -> clo.changCoDanhGia().contains(c.thuTu())
                && (nhom == NhomNguoiCham.DVHD ? clo.tyLeDvhd() : clo.tyLeGvhd()).signum() > 0);
    }

    /**
     * Minh chứng, phiếu 08a/08b có thể được bổ sung sau lần tính (điều kiện d Đ15 k3) — không xác nhận một kết luận
     * đã cũ; giáo vụ phải tính lại để thấy kết luận mới trước khi chốt.
     */
    private void kiemConHieuLuc(HoSoThucTap h, KetQuaHocPhan kq) {
        KetQuaTinhDiem r = tinh(h, cauHinhService.napChoDot(h.getDot().getId()), phieuRepo.findByHoSoIdOrderById(h.getId()),
                kq.getDiemThuong());
        if (!conKhop(kq, r)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Minh chứng hoặc phiếu phản hồi đã thay đổi sau lần tính điểm gần nhất; cần chạy Tính lại để cập nhật "
                            + "kết luận trước khi xác nhận (Điều 15 khoản 3)");
        }
    }

    private static boolean conKhop(KetQuaHocPhan kq, KetQuaTinhDiem r) {
        return r.ketLuan() == kq.getKetLuan()
                && kq.getDiemHp() != null && r.diemHp().compareTo(kq.getDiemHp()) == 0
                && Objects.equals(noiLyDo(r), kq.getLyDoKhongDat());
    }

    private static String noiLyDo(KetQuaTinhDiem r) {
        return r.lyDoKhongDat().isEmpty() ? null : catNgan(String.join("\n", r.lyDoKhongDat()), DO_DAI_LY_DO);
    }

    private static int thuTuChangTo(CauHinhTinhDiemService.CauHinhDot cauHinh) {
        return cauHinh.chang().stream().mapToInt(CauHinhChang::thuTu).max()
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Đợt thực tập chưa cấu hình chặng đánh giá (Điều 11 khoản 4)"));
    }

    private List<ThanhVienToDanhGia> thanhVienKhongVang(HoSoThucTap h) {
        return thanhVienRepo.theoHoSo(h.getId()).stream().filter(tv -> !Boolean.TRUE.equals(tv.getVangMat())).toList();
    }

    /** docs/01 mục 10.9: "{maDot}@{yyyyMMddHHmm}" của lần sửa trọng số cuối; chưa sửa lần nào thì "@goc". */
    private String phienBanTrongSo(DotThucTap dot) {
        String phienBan = nhatKyRepo.findTopByHanhViAndDoiTuongAndDoiTuongIdOrderByIdDesc("SUA_TRONG_SO", "dot_thuc_tap", dot.getId())
                .map(n -> dot.getMaDot() + "@" + n.getThoiDiem().format(DINH_DANG_PHIEN_BAN))
                .orElse(dot.getMaDot() + "@goc");
        return catNgan(phienBan, DO_DAI_PHIEN_BAN);
    }

    // ------------------------------------------------------------------
    // Kiểm trạng thái
    // ------------------------------------------------------------------

    private KetQuaHocPhan layKetQuaDaTinh(HoSoThucTap h) {
        KetQuaHocPhan kq = ketQuaRepo.findByHoSoId(h.getId()).orElse(null);
        if (kq == null || kq.getTrangThai() == TrangThaiKetQua.CHUA_TINH) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Kết quả học phần chưa được tính — cần đủ phiếu đã nộp của cả hai chặng (Điều 13 khoản 3)");
        }
        kiemChuaChot(kq);
        return kq;
    }

    private static void kiemChuaChot(KetQuaHocPhan kq) {
        if (kq.getTrangThai() == TrangThaiKetQua.DA_CONG_BO) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Kết quả học phần đã công bố, không thay đổi được nữa");
        }
        if (kq.getTrangThai() == TrangThaiKetQua.DA_XAC_NHAN) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Kết quả học phần đã được giáo vụ xác nhận; muốn thay đổi điểm cần mở lại phiếu liên quan (CBR-12)");
        }
    }

    /** Đ10 k2: điểm học phần chỉ tính khi báo cáo TTTN-06 đã đủ hai xác nhận — hồ sơ Chờ đánh giá. */
    private static void kiemChoDanhGia(HoSoThucTap h) {
        if (h.getTrangThai() != TrangThaiHoSo.CHO_DANH_GIA) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, moTaChuaDenLucTinh(h) + " (Điều 10 khoản 2)");
        }
    }

    private static String moTaChuaDenLucTinh(HoSoThucTap h) {
        return switch (h.getTrangThai()) {
            case DANG_THUC_TAP -> "Sinh viên đang thực tập, báo cáo TTTN-06 chưa đủ xác nhận của ĐVHD và GVHD nên chưa tính được điểm học phần";
            case GIAN_DOAN -> "Hồ sơ đang gián đoạn thực tập nên chưa tính được điểm học phần";
            default -> "Hồ sơ chưa ở giai đoạn đánh giá cuối kỳ nên chưa tính được điểm học phần";
        };
    }

    private static void kiemDiemThuong(BigDecimal thuong) {
        if (thuong.signum() < 0 || thuong.compareTo(DIEM_THUONG_TOI_DA) > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Điểm thưởng từ 0 đến " + RubricUtils.hienThi(DIEM_THUONG_TOI_DA) + " điểm (Điều 18 khoản 4)");
        }
    }

    private List<KetQuaHocPhan> chonTheoDanhSach(List<Long> ids, Long dotId) {
        List<KetQuaHocPhan> ds = new ArrayList<>();
        List<String> loi = new ArrayList<>();
        for (Long id : ids) {
            HoSoThucTap h = hoSoRepo.findById(id).orElseThrow(() -> BusinessException.khongTimThay("hồ sơ thực tập mã " + id));
            String ten = h.getSinhVien().getMaSv() + " " + h.getSinhVien().getNguoiDung().getHoTen();
            if (dotId != null && !h.getDot().getId().equals(dotId)) {
                loi.add(ten + ": không thuộc đợt đã chọn");
                continue;
            }
            Optional<KetQuaHocPhan> kq = ketQuaRepo.findByHoSoId(id);
            TrangThaiKetQua tt = kq.map(KetQuaHocPhan::getTrangThai).orElse(TrangThaiKetQua.CHUA_TINH);
            if (tt != TrangThaiKetQua.DA_XAC_NHAN) {
                String lyDo = switch (tt) {
                    case CHUA_TINH -> "chưa tính điểm";
                    case DA_TINH -> "chưa được xác nhận";
                    case DA_CONG_BO -> "đã công bố";
                    case DA_XAC_NHAN -> "đã xác nhận";
                };
                loi.add(ten + ": " + lyDo);
            } else if (h.getTrangThai() != TrangThaiHoSo.CHO_DANH_GIA) {
                loi.add(ten + ": hồ sơ không ở trạng thái Chờ đánh giá");
            } else {
                ds.add(kq.get());
            }
        }
        if (!loi.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Chỉ công bố được kết quả đã xác nhận; không công bố hồ sơ nào vì: " + String.join("; ", loi)
                            + " (UC10 bước 10)");
        }
        return ds;
    }

    // ------------------------------------------------------------------
    // Dựng DTO
    // ------------------------------------------------------------------

    private KetQuaSinhVienResponse choSinhVien(HoSoThucTap h, KetQuaHocPhan kq) {
        if (kq == null || kq.getTrangThai() != TrangThaiKetQua.DA_CONG_BO) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Kết quả học phần chưa được công bố (BR-12.5)");
        }
        if (!phanHoiRepo.existsByHoSoIdAndLoai(h.getId(), LoaiPhanHoi.TTTN_08B)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Bạn cần gửi phiếu phản hồi TTTN-08b trước khi xem kết quả học phần (BR-12.5)");
        }
        BangTongHopResponse bang = lapBangTongHop(h, kq);
        return new KetQuaSinhVienResponse(bang.thongTin(),
                bang.cacClo().stream().map(d -> new KetQuaSinhVienResponse.DongCloSinhVien(d.maClo(), d.ten(), d.alpha(),
                        d.diemClo(), d.muc())).toList(),
                bang.diemThuong(), bang.diemHp(), bang.mucHp(), bang.nhomNangLuc(), bang.ketLuan(),
                bang.lyDoKhongDat(), bang.nhanXetGvhd());
    }

    /**
     * Bảng TTTN-07. Điểm CLO/HP/nhóm lấy từ giá trị đã lưu; cột điểm từng chặng và cột quy đổi tính lại từ phiếu
     * đã nộp bằng chính ScoringService (docs/01 mục 10.11). Kết quả chưa tính thì trả lý do thay cho điểm.
     */
    private BangTongHopResponse lapBangTongHop(HoSoThucTap h, KetQuaHocPhan kq) {
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(h.getDot().getId());
        Map<String, String> tenClo = cloRepo.findByDotIdOrderByMaClo(h.getDot().getId()).stream()
                .collect(Collectors.toMap(ChuanDauRa::getMaClo, ChuanDauRa::getTen, (a, b) -> a));
        List<PhieuDanhGia> tatCa = phieuRepo.findByHoSoIdOrderById(h.getId());
        boolean daTinh = kq != null && kq.getTrangThai() != TrangThaiKetQua.CHUA_TINH;

        KetQuaTinhDiem r = null;
        String chuaTinhDuoc = null;
        if (daTinh) {
            try {
                r = tinh(h, cauHinh, tatCa, kq.getDiemThuong());
            } catch (BusinessException ex) {
                chuaTinhDuoc = ex.getMessage();
            }
        } else {
            chuaTinhDuoc = lyDoChuaTinh(h, cauHinh, tatCa);
        }

        List<BangTongHopResponse.DongClo> dong = new ArrayList<>();
        for (CauHinhClo clo : cauHinh.clo()) {
            Map<Integer, BangTongHopResponse.DiemChangHienThi> theoChang = new TreeMap<>();
            BigDecimal quyDoi = null;
            if (r != null) {
                r.diemChang().getOrDefault(clo.maClo(), Map.of()).forEach((thuTu, d) -> theoChang.put(thuTu,
                        new BangTongHopResponse.DiemChangHienThi(hienThi(d.tbDvhd()), hienThi(d.tbGvhd()), hienThi(d.diemChang()))));
                quyDoi = hienThi(r.diemCloDayDu().get(clo.maClo()).multiply(clo.alpha(), MathContext.DECIMAL64)
                        .divide(TRAM, MathContext.DECIMAL64));
            }
            BigDecimal diem = daTinh ? layDiemClo(kq, clo.maClo()) : null;
            dong.add(new BangTongHopResponse.DongClo(clo.maClo(), tenClo.get(clo.maClo()), clo.alpha(), theoChang,
                    diem, mucCua(diem, clo.bangMuc()), quyDoi));
        }

        List<MucXepLoai> thangMuc = cauHinh.bangMucHp().stream()
                .sorted(Comparator.comparingInt(KhoangMuc::muc))
                .map(k -> new MucXepLoai(k.muc(), k.diemMin(), k.diemMax())).toList();
        List<BangTongHopResponse.NhomNangLuc> nhom = List.of(
                nhomNangLuc("Kiến thức chuyên môn", ScoringService.NHOM_KIEN_THUC, daTinh ? kq.getNhomKienThuc() : null, cauHinh),
                nhomNangLuc("Kỹ năng nghề nghiệp", ScoringService.NHOM_KY_NANG, daTinh ? kq.getNhomKyNang() : null, cauHinh),
                nhomNangLuc("Thái độ, đạo đức, phát triển", ScoringService.NHOM_THAI_DO, daTinh ? kq.getNhomThaiDo() : null, cauHinh));

        return new BangTongHopResponse(thongTin(h),
                kq == null ? TrangThaiKetQua.CHUA_TINH : kq.getTrangThai(),
                dong,
                kq == null ? BigDecimal.ZERO : khongNull(kq.getDiemThuong()),
                daTinh ? kq.getDiemHp() : null,
                daTinh ? kq.getMucDat() : null,
                thangMuc,
                nhom,
                daTinh ? kq.getKetLuan() : null,
                daTinh ? tachLyDo(kq.getLyDoKhongDat()) : List.of(),
                kq == null ? null : kq.getNhanXetGvhd(),
                daTinh ? kq.getPhienBanTrongSo() : null,
                daTinh ? kq.getNgayTinh() : null,
                canhBao(kq, r),
                chuaTinhDuoc);
    }

    private static List<String> canhBao(KetQuaHocPhan kq, KetQuaTinhDiem r) {
        if (r == null) {
            return List.of();
        }
        List<String> ds = new ArrayList<>(r.canhBao());
        if (kq != null && kq.getTrangThai() == TrangThaiKetQua.DA_TINH && !conKhop(kq, r)) {
            ds.add("Dữ liệu đã thay đổi sau lần tính gần nhất: tính lại sẽ cho điểm học phần "
                    + RubricUtils.hienThi(r.diemHp()) + ", kết luận " + (r.ketLuan() == KetLuan.DAT ? "Đạt" : "Không đạt")
                    + " — giáo vụ cần bấm Tính lại trước khi xác nhận");
        }
        return ds;
    }

    private String lyDoChuaTinh(HoSoThucTap h, CauHinhTinhDiemService.CauHinhDot cauHinh, List<PhieuDanhGia> tatCa) {
        if (h.getTrangThai() != TrangThaiHoSo.CHO_DANH_GIA) {
            return moTaChuaDenLucTinh(h);
        }
        try {
            kiemDuPhieu(h, cauHinh, tatCa);
            return "Đã đủ phiếu hai chặng, chờ giáo vụ chạy tính điểm";
        } catch (BusinessException ex) {
            return ex.getMessage();
        }
    }

    private BangTongHopResponse.NhomNangLuc nhomNangLuc(String ten, List<String> cacClo, BigDecimal diem,
                                                        CauHinhTinhDiemService.CauHinhDot cauHinh) {
        return new BangTongHopResponse.NhomNangLuc(ten, cacClo, diem, mucCua(diem, cauHinh.bangMucHp()));
    }

    private ThongTinChungResponse thongTin(HoSoThucTap h) {
        SinhVien sv = h.getSinhVien();
        String gvhd = phanCongRepo.findByHoSoId(h.getId()).map(p -> p.getGiangVien().getNguoiDung().getHoTen()).orElse(null);
        return new ThongTinChungResponse(h.getId(), sv.getNguoiDung().getHoTen(), sv.getMaSv(), sv.getLop(), sv.getNganh(),
                sv.getKhoaVien(), sv.getChuongTrinhDaoTao(), gvhd,
                h.getDonVi() == null ? null : h.getDonVi().getTen(),
                h.getCanBoDvhd() == null ? null : h.getCanBoDvhd().getNguoiDung().getHoTen(),
                h.getDot().getNgayBatDau(), h.getDot().getNgayKetThuc(), h.getTrangThai());
    }

    private KetQuaTomTatResponse tomTat(HoSoThucTap h, KetQuaHocPhan kq, String gvhd, List<String> maClo) {
        boolean daTinh = kq != null && kq.getTrangThai() != TrangThaiKetQua.CHUA_TINH;
        Map<String, BigDecimal> diemClo = new LinkedHashMap<>();
        if (daTinh) {
            maClo.forEach(ma -> diemClo.put(ma, layDiemClo(kq, ma)));
        }
        SinhVien sv = h.getSinhVien();
        return new KetQuaTomTatResponse(h.getId(), sv.getMaSv(), sv.getNguoiDung().getHoTen(), sv.getLop(),
                sv.getChuongTrinhDaoTao(), h.getTrangThai(), gvhd, diemClo,
                kq == null ? null : khongNull(kq.getDiemThuong()),
                daTinh ? kq.getDiemHp() : null, daTinh ? kq.getMucDat() : null, daTinh ? kq.getKetLuan() : null,
                kq == null ? TrangThaiKetQua.CHUA_TINH : kq.getTrangThai(), daTinh ? kq.getNgayTinh() : null);
    }

    private List<HoSoThucTap> hoSoTrongToCua(CurrentUser u, DotThucTap dot) {
        return toRepo.theoThanhVien(u.nguoiDungId(), dot.getId()).stream()
                .flatMap(t -> t.getHoSos().stream())
                .map(ToDanhGiaHoSo::getHoSo)
                .toList();
    }

    private static List<HoSoThucTap> gop(List<HoSoThucTap> a, List<HoSoThucTap> b) {
        Map<Long, HoSoThucTap> m = new LinkedHashMap<>();
        a.forEach(h -> m.put(h.getId(), h));
        b.forEach(h -> m.putIfAbsent(h.getId(), h));
        return new ArrayList<>(m.values());
    }

    private static Map<String, Object> anhChup(KetQuaHocPhan kq) {
        Map<String, Object> m = new LinkedHashMap<>();
        Map<String, BigDecimal> clo = new LinkedHashMap<>();
        for (int i = 1; i <= 7; i++) {
            clo.put("CLO" + i, layDiemClo(kq, "CLO" + i));
        }
        m.put("diemClo", clo);
        m.put("diemThuong", kq.getDiemThuong());
        m.put("diemHp", kq.getDiemHp());
        m.put("mucDat", kq.getMucDat());
        m.put("ketLuan", kq.getKetLuan());
        m.put("trangThai", kq.getTrangThai());
        return m;
    }

    /** Ánh xạ mã CLO sang cột diem_clo1..7 của bảng ket_qua_hoc_phan (đúng 7 CLO — CBR-07). */
    private static void ganDiemClo(KetQuaHocPhan kq, String maClo, BigDecimal diem) {
        switch (maClo) {
            case "CLO1" -> kq.setDiemClo1(diem);
            case "CLO2" -> kq.setDiemClo2(diem);
            case "CLO3" -> kq.setDiemClo3(diem);
            case "CLO4" -> kq.setDiemClo4(diem);
            case "CLO5" -> kq.setDiemClo5(diem);
            case "CLO6" -> kq.setDiemClo6(diem);
            case "CLO7" -> kq.setDiemClo7(diem);
            default -> throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Mã " + maClo + " không thuộc 7 chuẩn đầu ra của học phần (Điều 9 khoản 2)");
        }
    }

    private static BigDecimal layDiemClo(KetQuaHocPhan kq, String maClo) {
        return switch (maClo) {
            case "CLO1" -> kq.getDiemClo1();
            case "CLO2" -> kq.getDiemClo2();
            case "CLO3" -> kq.getDiemClo3();
            case "CLO4" -> kq.getDiemClo4();
            case "CLO5" -> kq.getDiemClo5();
            case "CLO6" -> kq.getDiemClo6();
            case "CLO7" -> kq.getDiemClo7();
            default -> null;
        };
    }

    /** Mức của điểm đã làm tròn — cùng hàm với lúc tính (docs/01 mục 10.1). */
    private static Integer mucCua(BigDecimal diem, List<KhoangMuc> bangMuc) {
        return diem == null ? null : RubricUtils.xacDinhMuc(diem, bangMuc);
    }

    /** Làm tròn 2 chữ số chỉ để hiển thị cột trung gian; giá trị này không được dùng để tính tiếp. */
    private static BigDecimal hienThi(BigDecimal x) {
        return x == null ? null : x.setScale(2, RoundingMode.HALF_UP);
    }

    private static List<String> tachLyDo(String lyDo) {
        return lyDo == null || lyDo.isBlank() ? List.of() : List.of(lyDo.split("\n"));
    }

    private static BigDecimal khongNull(BigDecimal x) {
        return x == null ? BigDecimal.ZERO : x;
    }

    private static String catNgan(String s, int toiDa) {
        return s.length() <= toiDa ? s : s.substring(0, toiDa - 1) + "…";
    }
}
