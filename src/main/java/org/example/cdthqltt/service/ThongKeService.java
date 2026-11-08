package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.evidence.KetQuaDoiChieu;
import org.example.cdthqltt.dto.feedback.DanhGiaHaiLong;
import org.example.cdthqltt.dto.feedback.DanhGiaTieuChi;
import org.example.cdthqltt.dto.feedback.Phieu08a;
import org.example.cdthqltt.dto.feedback.Phieu08b;
import org.example.cdthqltt.dto.feedback.TuDanhGiaClo;
import org.example.cdthqltt.dto.result.KetQuaTomTatResponse;
import org.example.cdthqltt.dto.stats.BaoCaoThongKeResponse;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.*;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.service.export.XuatBaoCaoExcel;
import org.example.cdthqltt.service.scoring.CauHinhChang;
import org.example.cdthqltt.service.scoring.CauHinhClo;
import org.example.cdthqltt.service.scoring.KhoangMuc;
import org.example.cdthqltt.service.scoring.RubricUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * UC13 — thống kê toàn đợt cho giáo vụ (#98, #99): RP-01 bảng kết quả · RP-02 tỷ lệ đạt theo CLO · RP-03 tiến độ
 * chấm · RP-04 tình trạng minh chứng · RP-05 chỉ số tự nhận thức · RP-06 thống kê phản hồi 08b (ẩn danh).
 */
@Service
@RequiredArgsConstructor
public class ThongKeService {

    /** Đ24 k2 — KPI mục tiêu: ≥ 90% CLO đạt ngưỡng · ≥ 95% hồ sơ đầy đủ · ≥ 80% phản hồi tích cực từ ĐVHD. */
    private static final BigDecimal MUC_TIEU_CLO_DAT = new BigDecimal("90");
    private static final BigDecimal MUC_TIEU_HO_SO_DAY_DU = new BigDecimal("95");
    private static final BigDecimal MUC_TIEU_PHAN_HOI_TICH_CUC = new BigDecimal("80");
    /** TTTN-08b: mức 4 "Hài lòng" và 5 "Rất hài lòng" là đánh giá tích cực. */
    private static final int MUC_HAI_LONG_TICH_CUC = 4;
    private static final int MUC_HAI_LONG_TOI_DA = 5;
    /** TTTN-08a: trung bình sáu tiêu chí từ mức 3 "Đạt tốt" trở lên là phản hồi tích cực (cách hiểu Đ24 k2 của nhóm). */
    private static final BigDecimal MUC_08A_TICH_CUC = new BigDecimal("3");
    private static final BigDecimal TRAM = new BigDecimal("100");

    /** Hồ sơ đã được GVHD duyệt — có nghĩa vụ chấm điểm và minh chứng. */
    private static final Set<TrangThaiHoSo> HO_SO_DA_DUYET = EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP,
            TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.HOAN_THANH, TrangThaiHoSo.KHONG_HOAN_THANH, TrangThaiHoSo.GIAN_DOAN);
    /** Hồ sơ đã sang giai đoạn chấm cuối kỳ (báo cáo đủ hai xác nhận). */
    private static final Set<TrangThaiHoSo> HO_SO_CHAM_CUOI_KY = EnumSet.of(TrangThaiHoSo.CHO_DANH_GIA,
            TrangThaiHoSo.HOAN_THANH, TrangThaiHoSo.KHONG_HOAN_THANH);
    /** Thống kê CLO chỉ dùng kết quả đã được giáo vụ chốt. */
    private static final Set<TrangThaiKetQua> KET_QUA_DA_CHOT = EnumSet.of(TrangThaiKetQua.DA_XAC_NHAN, TrangThaiKetQua.DA_CONG_BO);

    private final HoSoThucTapRepository hoSoRepo;
    private final KetQuaHocPhanRepository ketQuaRepo;
    private final PhieuDanhGiaRepository phieuRepo;
    private final ThanhVienToDanhGiaRepository thanhVienRepo;
    private final PhanHoiRepository phanHoiRepo;
    private final ChuanDauRaRepository cloRepo;
    private final DotThucTapService dotService;
    private final CauHinhTinhDiemService cauHinhService;
    private final MinhChungService minhChungService;
    private final KetQuaService ketQuaService;
    private final XuatBaoCaoExcel xuatExcel;
    private final JsonMapper jsonMapper;

    /** #98 */
    @Transactional(readOnly = true)
    public BaoCaoThongKeResponse lapBaoCao(String loai, Long dotId) {
        DotThucTap dot = dotId == null ? dotService.layDotDangMo() : dotService.layDot(dotId);
        return switch (chuanHoaMa(loai)) {
            case "RP-01" -> bangKetQua(dot);
            case "RP-02" -> thongKeCloToanDot(dot);
            case "RP-03" -> tienDoCham(dot);
            case "RP-04" -> tinhTrangMinhChung(dot);
            case "RP-05" -> tuNhanThuc(dot);
            case "RP-06" -> phanHoi(dot);
            default -> throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Loại báo cáo không hợp lệ: " + loai + " (chọn RP-01 … RP-06)");
        };
    }

    /** #99 */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> xuatExcel(String loai, Long dotId) {
        BaoCaoThongKeResponse b = lapBaoCao(loai, dotId);
        String tenFile = b.maBaoCao() + "_" + b.maDot() + ".xlsx";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(tenFile, StandardCharsets.UTF_8).build().toString())
                .body(new ByteArrayResource(xuatExcel.xuat(b)));
    }

    // ------------------------------------------------------------------
    // RP-01 … RP-06
    // ------------------------------------------------------------------

    /** RP-01 — cùng dữ liệu với #82 (phạm vi giáo vụ: cả đợt). */
    private BaoCaoThongKeResponse bangKetQua(DotThucTap dot) {
        List<String> maClo = cloRepo.findByDotIdOrderByMaClo(dot.getId()).stream().map(ChuanDauRa::getMaClo).toList();
        List<String> cot = new ArrayList<>(List.of("MSSV", "Họ và tên", "Lớp", "Chương trình", "GVHD"));
        cot.addAll(maClo);
        cot.addAll(List.of("Điểm thưởng", "Điểm HP", "Mức", "Kết luận", "Trạng thái hồ sơ", "Trạng thái kết quả"));
        List<List<Object>> dong = new ArrayList<>();
        int soDat = 0;
        int soDaTinh = 0;
        for (KetQuaTomTatResponse k : ketQuaService.danhSach(dot.getId())) {
            List<Object> d = new ArrayList<>(List.of(k.maSv(), k.hoTen(), giaTri(k.lop()), k.chuongTrinh().getTenHienThi(),
                    giaTri(k.giangVienHuongDan())));
            maClo.forEach(ma -> d.add(k.diemClo().get(ma)));
            d.add(k.diemThuong());
            d.add(k.diemHp());
            d.add(k.mucDat());
            d.add(k.ketLuan() == null ? "" : tenKetLuan(k.ketLuan()));
            d.add(k.trangThaiHoSo().name());
            d.add(k.trangThai().name());
            dong.add(d);
            if (k.diemHp() != null) {
                soDaTinh++;
                if (k.ketLuan() == KetLuan.DAT) {
                    soDat++;
                }
            }
        }
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Số hồ sơ", dong.size());
        tongHop.put("Số hồ sơ đã có kết quả", soDaTinh);
        tongHop.put("Số hồ sơ Đạt", soDat);
        tongHop.put("Tỷ lệ Đạt trên số đã có kết quả (%)", phanTram(soDat, soDaTinh));
        return baoCao("RP-01", "Bảng kết quả toàn đợt", dot, cot, dong, tongHop, List.of(
                "Điểm CLO và điểm học phần làm tròn 0,1 (Điều 14 khoản 4); kết luận theo Điều 15 khoản 3."));
    }

    /**
     * RP-02 — mỗi CLO: điểm trung bình, phân bố năm mức, tỷ lệ đạt ngưỡng (Mức 1 chương trình Chuẩn, Mức 2
     * CLC/STEM — Đ15 k1, k2) so với mục tiêu 90% (Đ24 k2). Chỉ tính kết quả đã xác nhận / đã công bố.
     */
    private BaoCaoThongKeResponse thongKeCloToanDot(DotThucTap dot) {
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(dot.getId());
        Map<String, String> ten = tenClo(dot);
        List<KetQuaHocPhan> ds = ketQuaChot(dot);
        List<Integer> cacMuc = cauHinh.bangMucHp().stream().map(KhoangMuc::muc).sorted().toList();

        List<String> cot = new ArrayList<>(List.of("CLO", "Tên chuẩn đầu ra", "Số SV", "Điểm TB"));
        cacMuc.forEach(m -> cot.add("Mức " + m));
        cot.addAll(List.of("Số SV đạt ngưỡng", "Tỷ lệ đạt (%)", "Mục tiêu (%)", "Đánh giá"));
        List<List<Object>> dong = new ArrayList<>();
        int soCloDatMucTieu = 0;
        for (CauHinhClo clo : cauHinh.clo()) {
            Map<Integer, Integer> phanBo = new TreeMap<>();
            cacMuc.forEach(m -> phanBo.put(m, 0));
            BigDecimal tong = BigDecimal.ZERO;
            int soSv = 0;
            int soDat = 0;
            for (KetQuaHocPhan kq : ds) {
                BigDecimal diem = kq.diemCloTheoMa(clo.maClo());
                if (diem == null) {
                    continue;
                }
                // Mức quy đổi trên điểm đã làm tròn, cùng hàm lúc tính điểm (docs/01 mục 10.1).
                int muc = RubricUtils.xacDinhMuc(diem, clo.bangMuc());
                phanBo.merge(muc, 1, Integer::sum);
                tong = tong.add(diem);
                soSv++;
                if (muc >= kq.getHoSo().getSinhVien().getChuongTrinhDaoTao().getMucToiThieuCloDieuKien()) {
                    soDat++;
                }
            }
            BigDecimal tyLe = phanTram(soDat, soSv);
            boolean datMucTieu = tyLe != null && tyLe.compareTo(MUC_TIEU_CLO_DAT) >= 0;
            if (datMucTieu) {
                soCloDatMucTieu++;
            }
            List<Object> d = new ArrayList<>(List.of(clo.maClo(), giaTri(ten.get(clo.maClo())), soSv));
            d.add(trungBinh(tong, soSv));
            d.addAll(phanBo.values());
            d.add(soDat);
            d.add(tyLe);
            d.add(MUC_TIEU_CLO_DAT);
            d.add(tyLe == null ? "Chưa có dữ liệu" : datMucTieu ? "Đạt mục tiêu" : "Chưa đạt mục tiêu");
            dong.add(d);
        }

        Map<Integer, Integer> phanBoHp = new TreeMap<>();
        cacMuc.forEach(m -> phanBoHp.put(m, 0));
        BigDecimal tongHp = BigDecimal.ZERO;
        int soHoanThanh = 0;
        for (KetQuaHocPhan kq : ds) {
            phanBoHp.merge(kq.getMucDat(), 1, Integer::sum);
            tongHp = tongHp.add(kq.getDiemHp());
            if (kq.getKetLuan() == KetLuan.DAT) {
                soHoanThanh++;
            }
        }
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Số kết quả đã chốt", ds.size());
        tongHop.put("Điểm học phần trung bình", trungBinh(tongHp, ds.size()));
        tongHop.put("Phân bố mức điểm học phần", phanBoHp.entrySet().stream()
                .map(e -> "Mức " + e.getKey() + ": " + e.getValue()).collect(Collectors.joining("; ")));
        tongHop.put("Số SV hoàn thành học phần", soHoanThanh);
        tongHop.put("Tỷ lệ hoàn thành (%)", phanTram(soHoanThanh, ds.size()));
        tongHop.put("Số CLO đạt mục tiêu ≥ 90%", soCloDatMucTieu + "/" + cauHinh.clo().size());
        return baoCao("RP-02", "Thống kê tỷ lệ đạt theo CLO", dot, cot, dong, tongHop, List.of(
                "Tính trên " + ds.size() + " kết quả đã được giáo vụ xác nhận hoặc đã công bố.",
                "Ngưỡng đạt CLO: Mức 1 với chương trình Chuẩn, Mức 2 với chương trình CLC/STEM (Điều 15 khoản 1, 2).",
                "Mục tiêu ≥ 90% sinh viên đạt ngưỡng ở mỗi CLO (Điều 24 khoản 2).",
                "Mức quy đổi trên điểm CLO đã làm tròn 0,1, cùng hàm với lúc tính điểm."));
    }

    /**
     * RP-03 — phiếu đã nộp trên số phiếu cần có, theo chặng và nhóm người chấm. Chặng giữa kỳ: mỗi hồ sơ đã duyệt
     * cần một phiếu mỗi nhóm; chặng cuối: mỗi thành viên Tổ không vắng mặt một phiếu (Đ10 k3, Đ13 k3).
     */
    private BaoCaoThongKeResponse tienDoCham(DotThucTap dot) {
        CauHinhTinhDiemService.CauHinhDot cauHinh = cauHinhService.napChoDot(dot.getId());
        int changTo = cauHinh.chang().stream().mapToInt(CauHinhChang::thuTu).max().orElse(0);
        List<HoSoThucTap> hoSos = hoSoRepo.findByDotIdOrderById(dot.getId());
        Map<Long, List<PhieuDanhGia>> phieuTheoHoSo = phieuRepo.timKiem(null, dot.getId(), null, null).stream()
                .collect(Collectors.groupingBy(p -> p.getHoSo().getId()));
        Map<Long, List<ThanhVienToDanhGia>> toTheoHoSo = new HashMap<>();
        Set<Long> chuaXepTo = new TreeSet<>();

        List<String> cot = List.of("Chặng", "Nhóm người chấm", "Số hồ sơ", "Phiếu cần có", "Đã nộp", "Đang nháp",
                "Đang mở lại", "Còn thiếu", "Tỷ lệ đã nộp (%)");
        List<List<Object>> dong = new ArrayList<>();
        int tongCanCo = 0;
        int tongDaNop = 0;
        for (CauHinhChang c : cauHinh.chang()) {
            boolean laChangTo = c.thuTu() == changTo;
            List<HoSoThucTap> canCham = hoSos.stream()
                    .filter(h -> (laChangTo ? HO_SO_CHAM_CUOI_KY : HO_SO_DA_DUYET).contains(h.getTrangThai())
                            && h.getTrangThai() != TrangThaiHoSo.GIAN_DOAN)
                    .toList();
            for (NhomNguoiCham nhom : List.of(NhomNguoiCham.GVHD, NhomNguoiCham.DVHD)) {
                if (!nhomPhaiCham(cauHinh, c, nhom)) {
                    continue;
                }
                int canCo = 0;
                int daNop = 0;
                int nhap = 0;
                int moLai = 0;
                for (HoSoThucTap h : canCham) {
                    List<PhieuDanhGia> phieu = phieuTheoHoSo.getOrDefault(h.getId(), List.of()).stream()
                            .filter(p -> p.getChang().getThuTu() == c.thuTu() && p.getNhomNguoiCham() == nhom).toList();
                    if (laChangTo) {
                        List<ThanhVienToDanhGia> thanhVien = toTheoHoSo.computeIfAbsent(h.getId(), thanhVienRepo::theoHoSo);
                        if (thanhVien.isEmpty()) {
                            chuaXepTo.add(h.getId());
                            continue;
                        }
                        for (ThanhVienToDanhGia tv : thanhVien) {
                            if (Boolean.TRUE.equals(tv.getVangMat()) || tv.getNhomNguoiCham() != nhom) {
                                continue;
                            }
                            canCo++;
                            Optional<PhieuDanhGia> cua = phieu.stream()
                                    .filter(p -> p.getNguoiCham().getId().equals(tv.getNguoiDung().getId())).findFirst();
                            if (cua.isPresent()) {
                                switch (cua.get().getTrangThai()) {
                                    case DA_NOP -> daNop++;
                                    case NHAP -> nhap++;
                                    case MO_LAI -> moLai++;
                                }
                            }
                        }
                    } else {
                        canCo++;
                        if (phieu.stream().anyMatch(PhieuDanhGia::daNop)) {
                            daNop++;
                        } else if (phieu.stream().anyMatch(p -> p.getTrangThai() == TrangThaiPhieu.MO_LAI)) {
                            moLai++;
                        } else if (phieu.stream().anyMatch(p -> p.getTrangThai() == TrangThaiPhieu.NHAP)) {
                            nhap++;
                        }
                    }
                }
                tongCanCo += canCo;
                tongDaNop += daNop;
                dong.add(new ArrayList<>(List.of(c.ten(), nhom == NhomNguoiCham.GVHD ? "GVHD" : "ĐVHD", canCham.size(),
                        canCo, daNop, nhap, moLai, canCo - daNop)));
                dong.get(dong.size() - 1).add(phanTram(daNop, canCo));
            }
        }
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Tổng phiếu cần có", tongCanCo);
        tongHop.put("Tổng phiếu đã nộp", tongDaNop);
        tongHop.put("Tỷ lệ đã nộp (%)", phanTram(tongDaNop, tongCanCo));
        tongHop.put("Số hồ sơ chờ chấm cuối kỳ chưa được xếp Tổ đánh giá", chuaXepTo.size());
        return baoCao("RP-03", "Tiến độ chấm điểm", dot, cot, dong, tongHop, List.of(
                "Chặng giữa kỳ: mỗi hồ sơ đã được GVHD duyệt cần một phiếu của GVHD và một phiếu của cán bộ hướng dẫn.",
                "Chặng cuối kỳ: chỉ tính hồ sơ có báo cáo đủ hai xác nhận; mỗi thành viên Tổ không vắng mặt một phiếu (Điều 10 khoản 3).",
                "Hồ sơ đang gián đoạn không tính vào số phiếu cần có."));
    }

    /** RP-04 — hồ sơ còn thiếu minh chứng bắt buộc theo hình thức thực tập (Đ4, Đ15 k3d); mục tiêu ≥ 95% đầy đủ. */
    private BaoCaoThongKeResponse tinhTrangMinhChung(DotThucTap dot) {
        List<HoSoThucTap> hoSos = hoSoRepo.findByDotIdOrderById(dot.getId()).stream()
                .filter(h -> HO_SO_DA_DUYET.contains(h.getTrangThai())).toList();
        List<String> cot = List.of("MSSV", "Họ và tên", "Hình thức thực tập", "Trạng thái hồ sơ", "Số loại còn thiếu",
                "Minh chứng còn thiếu");
        List<List<Object>> dong = new ArrayList<>();
        Map<String, Integer> thieuTheoLoai = new TreeMap<>();
        int soDayDu = 0;
        for (HoSoThucTap h : hoSos) {
            KetQuaDoiChieu dc = minhChungService.doiChieu(h);
            if (dc.du()) {
                soDayDu++;
                continue;
            }
            dc.loaiConThieu().forEach(loai -> thieuTheoLoai.merge(loai, 1, Integer::sum));
            dong.add(List.of(h.getSinhVien().getMaSv(), h.getSinhVien().getNguoiDung().getHoTen(),
                    h.getHinhThucThucTap().name(), h.getTrangThai().name(), dc.loaiConThieu().size(),
                    String.join(", ", dc.loaiConThieu())));
        }
        BigDecimal tyLe = phanTram(soDayDu, hoSos.size());
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Số hồ sơ đã duyệt", hoSos.size());
        tongHop.put("Số hồ sơ đầy đủ minh chứng", soDayDu);
        tongHop.put("Tỷ lệ đầy đủ (%)", tyLe);
        tongHop.put("Mục tiêu (%)", MUC_TIEU_HO_SO_DAY_DU);
        tongHop.put("Đánh giá", tyLe == null ? "Chưa có dữ liệu"
                : tyLe.compareTo(MUC_TIEU_HO_SO_DAY_DU) >= 0 ? "Đạt mục tiêu" : "Chưa đạt mục tiêu");
        thieuTheoLoai.forEach((loai, so) -> tongHop.put("Thiếu: " + loai, so));
        return baoCao("RP-04", "Tình trạng hồ sơ minh chứng", dot, cot, dong, tongHop, List.of(
                "Danh sách chỉ gồm hồ sơ còn thiếu; minh chứng do hệ thống sinh (kế hoạch, nhật ký, báo cáo, phiếu 08a/08b) "
                        + "được đối chiếu trực tiếp từ dữ liệu.",
                "Mục tiêu ≥ 95% hồ sơ đầy đủ (Điều 24 khoản 2)."));
    }

    /** RP-05 — mức tự đánh giá (08b) so với mức chính thức trên từng CLO; chỉ hồ sơ đã công bố (BR-12.4). */
    private BaoCaoThongKeResponse tuNhanThuc(DotThucTap dot) {
        Map<String, String> ten = tenClo(dot);
        List<String> maClo = new ArrayList<>(ten.keySet());
        Map<String, int[]> dem = new LinkedHashMap<>();
        maClo.forEach(ma -> dem.put(ma, new int[7]));
        BigDecimal tongChiSo = BigDecimal.ZERO;
        int soChiSo = 0;
        int soPhieu = 0;
        for (PhanHoi p : phanHoiRepo.theoLoaiVaDot(LoaiPhanHoi.TTTN_08B, dot.getId())) {
            Optional<KetQuaService.KetQuaChinhThuc> kq = ketQuaService.ketQuaDaCongBo(p.getHoSo().getId());
            if (kq.isEmpty()) {
                continue;
            }
            soPhieu++;
            if (p.getChiSoTuNhanThuc() != null) {
                tongChiSo = tongChiSo.add(p.getChiSoTuNhanThuc());
                soChiSo++;
            }
            for (TuDanhGiaClo t : Optional.ofNullable(doc(p.getDuLieuTieuChi(), Phieu08b.class).tuDanhGia()).orElse(List.of())) {
                Integer chinhThuc = kq.get().mucClo().get(t.maClo());
                int[] c = dem.get(t.maClo());
                if (c == null || chinhThuc == null || t.muc() == null) {
                    continue;
                }
                int lech = t.muc() - chinhThuc;
                // c: [số SV, Σ tự đánh giá, Σ chính thức, Σ lệch, Σ |lệch|, số cao hơn, số thấp hơn]
                c[0]++;
                c[1] += t.muc();
                c[2] += chinhThuc;
                c[3] += lech;
                c[4] += Math.abs(lech);
                if (lech > 0) {
                    c[5]++;
                } else if (lech < 0) {
                    c[6]++;
                }
            }
        }
        List<String> cot = List.of("CLO", "Tên chuẩn đầu ra", "Số SV", "Mức tự đánh giá TB", "Mức chính thức TB",
                "Độ lệch TB", "Độ lệch tuyệt đối TB", "Số SV tự đánh giá cao hơn", "Số SV trùng khớp", "Số SV tự đánh giá thấp hơn");
        List<List<Object>> dong = new ArrayList<>();
        dem.forEach((ma, c) -> dong.add(List.of(ma, giaTri(ten.get(ma)), c[0], trungBinh(c[1], c[0]), trungBinh(c[2], c[0]),
                trungBinh(c[3], c[0]), trungBinh(c[4], c[0]), c[5], c[0] - c[5] - c[6], c[6])));
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Số phiếu 08b có kết quả đã công bố", soPhieu);
        tongHop.put("Chỉ số tự nhận thức trung bình", soChiSo == 0 ? null
                : tongChiSo.divide(BigDecimal.valueOf(soChiSo), MathContext.DECIMAL64).setScale(2, RoundingMode.HALF_UP));
        return baoCao("RP-05", "Chỉ số tự nhận thức năng lực", dot, cot, dong, tongHop, List.of(
                "Chỉ số tự nhận thức = trung bình |mức tự đánh giá − mức chính thức| trên 7 CLO; càng gần 0 càng tự nhận thức đúng.",
                "Độ lệch dương: sinh viên tự đánh giá cao hơn kết quả chính thức.",
                "Chỉ tính hồ sơ đã công bố kết quả (BR-12.4)."));
    }

    /**
     * RP-06 — điểm hài lòng trung bình theo sáu nội dung phiếu 08b; không có cột nào định danh sinh viên
     * (UC12 quy tắc, bảo mật RP-06). Kèm tỷ lệ phản hồi tích cực từ ĐVHD (08a) so với mục tiêu 80% (Đ24 k2).
     */
    private BaoCaoThongKeResponse phanHoi(DotThucTap dot) {
        List<PhanHoi> ds08b = phanHoiRepo.theoLoaiVaDot(LoaiPhanHoi.TTTN_08B, dot.getId());
        int soNoiDung = BieuMauPhanHoi.CHAT_LUONG_08B.size();
        int[][] phanBo = new int[soNoiDung][MUC_HAI_LONG_TOI_DA + 1];
        List<String> yKien = new ArrayList<>();
        for (PhanHoi p : ds08b) {
            Phieu08b b = doc(p.getDuLieuTieuChi(), Phieu08b.class);
            if (b.chatLuong() != null) {
                for (DanhGiaHaiLong d : b.chatLuong()) {
                    if (d.stt() != null && d.stt() >= 1 && d.stt() <= soNoiDung && d.mucHaiLong() != null) {
                        phanBo[d.stt() - 1][d.mucHaiLong()]++;
                    }
                }
            }
            themYKien(yKien, b.yKienKhac());
            themYKien(yKien, p.getYKienMo());
        }
        List<String> cot = new ArrayList<>(List.of("STT", "Nội dung đánh giá", "Số phiếu", "Điểm hài lòng TB"));
        for (int m = 1; m <= MUC_HAI_LONG_TOI_DA; m++) {
            cot.add("Mức " + m);
        }
        cot.add("Tỷ lệ hài lòng (%)");
        List<List<Object>> dong = new ArrayList<>();
        for (int i = 0; i < soNoiDung; i++) {
            int so = 0;
            int tong = 0;
            int tichCuc = 0;
            for (int m = 1; m <= MUC_HAI_LONG_TOI_DA; m++) {
                so += phanBo[i][m];
                tong += m * phanBo[i][m];
                if (m >= MUC_HAI_LONG_TICH_CUC) {
                    tichCuc += phanBo[i][m];
                }
            }
            List<Object> d = new ArrayList<>(List.of(i + 1, BieuMauPhanHoi.CHAT_LUONG_08B.get(i), so, trungBinh(tong, so)));
            for (int m = 1; m <= MUC_HAI_LONG_TOI_DA; m++) {
                d.add(phanBo[i][m]);
            }
            d.add(phanTram(tichCuc, so));
            dong.add(d);
        }

        List<PhanHoi> ds08a = phanHoiRepo.theoLoaiVaDot(LoaiPhanHoi.TTTN_08A, dot.getId());
        int tichCuc08a = 0;
        for (PhanHoi p : ds08a) {
            List<DanhGiaTieuChi> tieuChi = Optional.ofNullable(doc(p.getDuLieuTieuChi(), Phieu08a.class).tieuChi()).orElse(List.of());
            int tong = tieuChi.stream().mapToInt(DanhGiaTieuChi::muc).sum();
            if (!tieuChi.isEmpty() && trungBinh(tong, tieuChi.size()).compareTo(MUC_08A_TICH_CUC) >= 0) {
                tichCuc08a++;
            }
        }
        BigDecimal tyLe08a = phanTram(tichCuc08a, ds08a.size());
        Collections.sort(yKien);
        Map<String, Object> tongHop = new LinkedHashMap<>();
        tongHop.put("Số phiếu 08b", ds08b.size());
        tongHop.put("Số phiếu 08a", ds08a.size());
        tongHop.put("Tỷ lệ phản hồi tích cực từ ĐVHD (%)", tyLe08a);
        tongHop.put("Mục tiêu phản hồi tích cực (%)", MUC_TIEU_PHAN_HOI_TICH_CUC);
        tongHop.put("Đánh giá", tyLe08a == null ? "Chưa có dữ liệu"
                : tyLe08a.compareTo(MUC_TIEU_PHAN_HOI_TICH_CUC) >= 0 ? "Đạt mục tiêu" : "Chưa đạt mục tiêu");
        tongHop.put("Ý kiến của sinh viên (ẩn danh)", yKien);
        return baoCao("RP-06", "Thống kê phản hồi", dot, cot, dong, tongHop, List.of(
                "Thang hài lòng TTTN-08b: 1 Rất không hài lòng … 5 Rất hài lòng; tỷ lệ hài lòng tính mức 4 và 5.",
                "Phản hồi tích cực từ ĐVHD: phiếu 08a có trung bình sáu tiêu chí từ mức 3 (Đạt tốt) trở lên; mục tiêu ≥ 80% (Điều 24 khoản 2).",
                "Báo cáo không hiển thị danh tính sinh viên; ý kiến được sắp theo thứ tự chữ cái."));
    }

    // ------------------------------------------------------------------

    private List<KetQuaHocPhan> ketQuaChot(DotThucTap dot) {
        return ketQuaRepo.theoDot(dot.getId()).stream().filter(k -> KET_QUA_DA_CHOT.contains(k.getTrangThai())).toList();
    }

    private Map<String, String> tenClo(DotThucTap dot) {
        Map<String, String> m = new LinkedHashMap<>();
        cloRepo.findByDotIdOrderByMaClo(dot.getId()).forEach(c -> m.put(c.getMaClo(), c.getTen()));
        return m;
    }

    private static boolean nhomPhaiCham(CauHinhTinhDiemService.CauHinhDot cauHinh, CauHinhChang c, NhomNguoiCham nhom) {
        Predicate<CauHinhClo> coTyLe = clo -> (nhom == NhomNguoiCham.DVHD ? clo.tyLeDvhd() : clo.tyLeGvhd()).signum() > 0;
        return cauHinh.clo().stream().anyMatch(clo -> clo.changCoDanhGia().contains(c.thuTu()) && coTyLe.test(clo));
    }

    private BaoCaoThongKeResponse baoCao(String ma, String ten, DotThucTap dot, List<String> cot, List<List<Object>> dong,
                                         Map<String, Object> tongHop, List<String> ghiChu) {
        return new BaoCaoThongKeResponse(ma, ten, dot.getId(), dot.getMaDot(), dot.getTen(), LocalDateTime.now(),
                cot, dong, tongHop, ghiChu);
    }

    private <T> T doc(String json, Class<T> kieu) {
        return jsonMapper.readValue(json == null ? "{}" : json, kieu);
    }

    private static void themYKien(List<String> ds, String s) {
        if (s != null && !s.isBlank()) {
            ds.add(s.trim());
        }
    }

    private static String chuanHoaMa(String loai) {
        String m = loai == null ? "" : loai.trim().toUpperCase(Locale.ROOT).replace('_', '-');
        return m.matches("RP\\d{2}") ? "RP-" + m.substring(2) : m;
    }

    /** Tỷ lệ phần trăm làm tròn 0,1; mẫu số 0 ⇒ null (chưa có dữ liệu). */
    private static BigDecimal phanTram(int tuSo, int mauSo) {
        if (mauSo == 0) {
            return null;
        }
        return BigDecimal.valueOf(tuSo).multiply(TRAM)
                .divide(BigDecimal.valueOf(mauSo), MathContext.DECIMAL64).setScale(1, RoundingMode.HALF_UP);
    }

    private static BigDecimal trungBinh(BigDecimal tong, int so) {
        return so == 0 ? null : tong.divide(BigDecimal.valueOf(so), MathContext.DECIMAL64).setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal trungBinh(int tong, int so) {
        return trungBinh(BigDecimal.valueOf(tong), so);
    }

    private static String tenKetLuan(KetLuan k) {
        return k == KetLuan.DAT ? "Đạt" : "Không đạt";
    }

    private static Object giaTri(String s) {
        return s == null ? "" : s;
    }
}
