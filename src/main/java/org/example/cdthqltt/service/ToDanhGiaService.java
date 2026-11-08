package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.panel.CapNhatToRequest;
import org.example.cdthqltt.dto.panel.TaoToRequest;
import org.example.cdthqltt.dto.panel.ToDanhGiaResponse;
import org.example.cdthqltt.dto.panel.VangMatRequest;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.*;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/** UC09 — Tổ đánh giá cuối kỳ (Đ10 k3). */
@Service
@RequiredArgsConstructor
public class ToDanhGiaService {

    /** Đ10 k3a: tổ tối thiểu 3 thành viên. */
    private static final int SO_THANH_VIEN_TOI_THIEU = 3;
    /** Đ10 k3a: nhóm giảng viên gồm GVHD và ít nhất một giảng viên khác (docs/01 mục 10.5). */
    private static final int SO_GIANG_VIEN_TOI_THIEU = 2;
    /** Hồ sơ được đưa vào Tổ: đang thực tập (lập tổ trước buổi báo cáo), chờ đánh giá, hoặc gián đoạn (đánh giá bù, Đ15 k4). */
    private static final Set<TrangThaiHoSo> HO_SO_DUOC_XEP_TO = EnumSet.of(TrangThaiHoSo.DANG_THUC_TAP,
            TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.GIAN_DOAN);

    private final ToDanhGiaRepository toRepo;
    private final ThanhVienToDanhGiaRepository thanhVienRepo;
    private final ToDanhGiaHoSoRepository toHoSoRepo;
    private final HoSoThucTapRepository hoSoRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final PhanCongGvhdRepository phanCongRepo;
    private final DotThucTapService dotService;
    private final ThongBaoService thongBaoService;
    private final NhatKyHeThongService nhatKyService;

    /** Hợp đồng cho UC08: thành viên không vắng mặt của tổ chứa hồ sơ (người chấm chặng 2). */
    @Transactional(readOnly = true)
    public Optional<ThanhVienToDanhGia> thanhVienCham(Long hoSoId, Long nguoiDungId) {
        return thanhVienRepo.theoHoSo(hoSoId).stream()
                .filter(tv -> tv.getNguoiDung().getId().equals(nguoiDungId) && !Boolean.TRUE.equals(tv.getVangMat()))
                .findFirst();
    }

    /** Hợp đồng cho UC10: id người dùng vắng mặt ở tổ chứa hồ sơ — phiếu của họ bị loại khỏi trung bình. */
    @Transactional(readOnly = true)
    public Set<Long> nguoiVangMat(Long hoSoId) {
        Set<Long> ids = new HashSet<>();
        thanhVienRepo.theoHoSo(hoSoId).stream().filter(tv -> Boolean.TRUE.equals(tv.getVangMat()))
                .forEach(tv -> ids.add(tv.getNguoiDung().getId()));
        return ids;
    }

    /** #77 — thành viên chỉ thấy tổ mình tham gia. */
    @Transactional(readOnly = true)
    public List<ToDanhGiaResponse> danhSach(Long dotId) {
        CurrentUser u = SecurityUtils.currentUser();
        List<ToDanhGia> ds = u.laAdmin() ? toRepo.theoDot(dotId) : toRepo.theoThanhVien(u.nguoiDungId(), dotId);
        return ds.stream().map(this::sangResponse).toList();
    }

    /** #78 — SV chỉ xem tổ có hồ sơ của mình. */
    @Transactional(readOnly = true)
    public ToDanhGiaResponse chiTiet(Long toId) {
        return sangResponse(layVaKiemQuyen(toId));
    }

    /** #79 — kiểm CBR-14 trước khi lưu; thông báo thành viên và SV (NT-11). */
    @Transactional
    public ToDanhGiaResponse thanhLap(TaoToRequest req) {
        DotThucTap dot = dotService.layDot(req.dotId());
        kiemHinhThuc(req.hinhThuc(), req.ghiChuPheDuyet());

        List<Long> idsHoSo = req.hoSoIds().stream().distinct().toList();
        List<HoSoThucTap> hoSos = hoSoRepo.findAllById(idsHoSo);
        if (hoSos.size() != idsHoSo.size()) {
            throw BusinessException.khongTimThay("hồ sơ thực tập");
        }
        for (HoSoThucTap h : hoSos) {
            String ten = h.getSinhVien().getNguoiDung().getHoTen();
            if (!h.getDot().getId().equals(dot.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Hồ sơ của " + ten + " không thuộc đợt " + dot.getMaDot());
            }
            if (!HO_SO_DUOC_XEP_TO.contains(h.getTrangThai())) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Hồ sơ của " + ten + " chưa ở giai đoạn đánh giá cuối kỳ");
            }
            if (toHoSoRepo.findFirstByHoSoId(h.getId()).isPresent()) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Sinh viên " + ten + " đã được xếp vào một Tổ đánh giá khác");
            }
        }

        Set<Long> daCo = new HashSet<>();
        long soChuTich = req.thanhViens().stream().filter(tv -> Boolean.TRUE.equals(tv.laChuTich())).count();
        if (soChuTich != 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tổ đánh giá phải có đúng một chủ tịch");
        }
        ToDanhGia to = new ToDanhGia();
        to.setDot(dot);
        to.setNgayThanhLap(LocalDate.now());
        to.setThoiGianBaoCao(req.thoiGianBaoCao());
        to.setDiaDiem(req.diaDiem());
        to.setHinhThuc(req.hinhThuc() == null ? HinhThucLamViec.TRUC_TIEP : req.hinhThuc());
        to.setGhiChuPheDuyet(req.ghiChuPheDuyet());
        for (TaoToRequest.ThanhVien r : req.thanhViens()) {
            if (!daCo.add(r.nguoiDungId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Một người được thêm vào tổ hai lần");
            }
            to.getThanhViens().add(taoThanhVien(to, r.nguoiDungId(), r.nhom(), Boolean.TRUE.equals(r.laChuTich())));
        }
        hoSos.forEach(h -> to.getHoSos().add(new ToDanhGiaHoSo(to, h)));

        List<String> loi = kiemThanhPhan(to.getThanhViens(), hoSos);
        if (!loi.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, String.join("; ", loi));
        }
        toRepo.save(to);

        List<Long> nguoiNhan = new ArrayList<>();
        to.getThanhViens().forEach(tv -> nguoiNhan.add(tv.getNguoiDung().getId()));
        hoSos.forEach(h -> nguoiNhan.add(h.getSinhVien().getNguoiDung().getId()));
        thongBaoService.gui("NT-11", nguoiNhan, "Đã thành lập Tổ đánh giá cuối kỳ"
                + (to.getThoiGianBaoCao() == null ? "" : ", báo cáo lúc " + to.getThoiGianBaoCao())
                + (to.getDiaDiem() == null ? "" : " tại " + to.getDiaDiem()), "/panels/" + to.getId());
        return sangResponse(to);
    }

    /** #80 */
    @Transactional
    public ToDanhGiaResponse capNhat(Long toId, CapNhatToRequest req) {
        ToDanhGia to = toRepo.findById(toId).orElseThrow(() -> BusinessException.khongTimThay("Tổ đánh giá"));
        HinhThucLamViec hinhThuc = req.hinhThuc() != null ? req.hinhThuc() : to.getHinhThuc();
        String ghiChu = req.ghiChuPheDuyet() != null ? req.ghiChuPheDuyet() : to.getGhiChuPheDuyet();
        kiemHinhThuc(hinhThuc, ghiChu);
        if (req.thoiGianBaoCao() != null) to.setThoiGianBaoCao(req.thoiGianBaoCao());
        if (req.diaDiem() != null) to.setDiaDiem(req.diaDiem());
        if (req.duongDanGhiHinh() != null) to.setDuongDanGhiHinh(req.duongDanGhiHinh());
        to.setHinhThuc(hinhThuc);
        to.setGhiChuPheDuyet(ghiChu);
        return sangResponse(to);
    }

    /**
     * #81 — đánh dấu vắng mặt / có mặt, bổ sung người thay thế. Có người thay thế thì thành phần mới phải đạt
     * CBR-14; vắng mà chưa có người thay vẫn lưu (buổi báo cáo đã diễn ra) nhưng trả cảnh báo — khi đó nếu
     * nhóm ĐVHD trống, tính điểm sẽ dừng với THIEU_PHIEU_DVHD (UC09 luồng thay thế).
     */
    @Transactional
    public ToDanhGiaResponse doiVangMat(Long toId, Long thanhVienId, VangMatRequest req) {
        ToDanhGia to = toRepo.findById(toId).orElseThrow(() -> BusinessException.khongTimThay("Tổ đánh giá"));
        ThanhVienToDanhGia tv = to.getThanhViens().stream().filter(x -> x.getId().equals(thanhVienId)).findFirst()
                .orElseThrow(() -> BusinessException.khongTimThay("thành viên trong tổ"));
        boolean truoc = Boolean.TRUE.equals(tv.getVangMat());
        tv.setVangMat(req.vangMat());
        Map<String, Object> sau = new LinkedHashMap<>();
        sau.put("vangMat", req.vangMat());
        sau.put("lyDo", req.lyDo().trim());

        if (req.thayTheNguoiDungId() != null) {
            if (req.thayTheNhom() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Vui lòng chọn nhóm người chấm của người thay thế");
            }
            boolean trung = to.getThanhViens().stream().anyMatch(x -> x.getNguoiDung().getId().equals(req.thayTheNguoiDungId()));
            if (trung) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Người thay thế đã là thành viên của tổ");
            }
            to.getThanhViens().add(taoThanhVien(to, req.thayTheNguoiDungId(), req.thayTheNhom(), false));
            sau.put("thayThe", req.thayTheNguoiDungId());
            List<String> loi = kiemThanhPhan(to.getThanhViens(), hoSoCuaTo(to));
            if (!loi.isEmpty()) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, String.join("; ", loi));
            }
        }
        toRepo.save(to);
        // Đ14 k4c: vắng mặt làm thay đổi người được tính điểm ⇒ ghi nhật ký.
        nhatKyService.ghiVet("DOI_VANG_MAT_THANH_VIEN", "thanh_vien_to_danh_gia", tv.getId(), Map.of("vangMat", truoc), sau);
        return sangResponse(to);
    }

    // ------------------------------------------------------------------

    /**
     * CBR-14 / Đ10 k3a trên các thành viên không vắng mặt: ≥ 3 người, số lẻ, nhóm GV ≥ 2 người có GVHD của từng SV,
     * nhóm ĐVHD có cán bộ đã hướng dẫn từng SV. Trả mọi lỗi để giáo vụ sửa một lần.
     */
    List<String> kiemThanhPhan(List<ThanhVienToDanhGia> thanhViens, List<HoSoThucTap> hoSos) {
        List<ThanhVienToDanhGia> coMat = thanhViens.stream().filter(tv -> !Boolean.TRUE.equals(tv.getVangMat())).toList();
        List<String> loi = new ArrayList<>();
        if (coMat.size() < SO_THANH_VIEN_TOI_THIEU || coMat.size() % 2 == 0) {
            loi.add("Tổ đánh giá phải có tối thiểu 3 thành viên và tổng số là số lẻ, hiện có " + coMat.size()
                    + " (Điều 10 khoản 3 điểm a)");
        }
        Set<Long> nhomGv = new HashSet<>();
        Set<Long> nhomDvhd = new HashSet<>();
        coMat.forEach(tv -> (tv.getNhomNguoiCham() == NhomNguoiCham.GVHD ? nhomGv : nhomDvhd).add(tv.getNguoiDung().getId()));
        if (nhomGv.size() < SO_GIANG_VIEN_TOI_THIEU) {
            loi.add("Nhóm giảng viên phải gồm GVHD và ít nhất một giảng viên khác (Điều 10 khoản 3 điểm a)");
        }
        if (nhomDvhd.isEmpty()) {
            loi.add("Tổ phải có ít nhất một thành viên thuộc ĐVHD (Điều 10 khoản 3 điểm a)");
        }
        for (HoSoThucTap h : hoSos) {
            String ten = h.getSinhVien().getNguoiDung().getHoTen();
            Long gvhdNguoiDung = phanCongRepo.findByHoSoId(h.getId()).map(p -> p.getGiangVien().getNguoiDung().getId()).orElse(null);
            if (gvhdNguoiDung == null || !nhomGv.contains(gvhdNguoiDung)) {
                loi.add("Tổ chưa có GVHD của sinh viên " + ten + " (Điều 10 khoản 3 điểm a)");
            }
            if (!nhomDvhd.isEmpty() && (h.getCanBoDvhd() == null || !nhomDvhd.contains(h.getCanBoDvhd().getNguoiDung().getId()))) {
                loi.add("Tổ chưa có cán bộ ĐVHD đã hướng dẫn sinh viên " + ten + " (Điều 10 khoản 3 điểm a)");
            }
        }
        return loi;
    }

    private ThanhVienToDanhGia taoThanhVien(ToDanhGia to, Long nguoiDungId, NhomNguoiCham nhom, boolean chuTich) {
        NguoiDung nd = nguoiDungRepo.findById(nguoiDungId).orElseThrow(() -> BusinessException.khongTimThay("người dùng"));
        VaiTro canCo = nhom == NhomNguoiCham.GVHD ? VaiTro.GIANG_VIEN : VaiTro.CAN_BO_DVHD;
        if (nd.getVaiTro() != canCo) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, nd.getHoTen() + " không thể thuộc nhóm "
                    + (nhom == NhomNguoiCham.GVHD ? "giảng viên" : "ĐVHD"));
        }
        if (!nd.dangHoatDong()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Tài khoản của " + nd.getHoTen() + " đang bị vô hiệu hóa");
        }
        ThanhVienToDanhGia tv = new ThanhVienToDanhGia();
        tv.setToDanhGia(to);
        tv.setNguoiDung(nd);
        tv.setNhomNguoiCham(nhom);
        tv.setLaChuTich(chuTich);
        tv.setVangMat(false);
        return tv;
    }

    /** Đ10 k3b: đánh giá trực tuyến phải có ghi chú phê duyệt của Trưởng Khoa. */
    private static void kiemHinhThuc(HinhThucLamViec hinhThuc, String ghiChu) {
        if (hinhThuc == HinhThucLamViec.TRUC_TUYEN && (ghiChu == null || ghiChu.isBlank())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Đánh giá trực tuyến cần ghi chú đã có phê duyệt của Trưởng Khoa (Điều 10 khoản 3 điểm b)");
        }
    }

    private ToDanhGia layVaKiemQuyen(Long toId) {
        CurrentUser u = SecurityUtils.currentUser();
        ToDanhGia to = toRepo.findById(toId).orElse(null);
        if (to == null) {
            throw u.laAdmin() ? BusinessException.khongTimThay("Tổ đánh giá") : BusinessException.khongCoQuyen();
        }
        boolean duocXem = switch (u.vaiTro()) {
            case ADMIN -> true;
            case GIANG_VIEN, CAN_BO_DVHD -> to.getThanhViens().stream().anyMatch(tv -> tv.getNguoiDung().getId().equals(u.nguoiDungId()));
            case SINH_VIEN -> to.getHoSos().stream().anyMatch(x -> x.getHoSo().getSinhVien().getId().equals(u.sinhVienId()));
        };
        if (!duocXem) {
            throw BusinessException.khongCoQuyen();
        }
        return to;
    }

    private static List<HoSoThucTap> hoSoCuaTo(ToDanhGia to) {
        return to.getHoSos().stream().map(ToDanhGiaHoSo::getHoSo).toList();
    }

    private ToDanhGiaResponse sangResponse(ToDanhGia to) {
        List<ToDanhGiaResponse.ThanhVien> tvs = to.getThanhViens().stream()
                .map(tv -> new ToDanhGiaResponse.ThanhVien(tv.getId(), tv.getNguoiDung().getId(), tv.getNguoiDung().getHoTen(),
                        tv.getNguoiDung().getVaiTro(), tv.getNhomNguoiCham(), Boolean.TRUE.equals(tv.getLaChuTich()),
                        Boolean.TRUE.equals(tv.getVangMat())))
                .toList();
        List<ToDanhGiaResponse.HoSo> hs = hoSoCuaTo(to).stream()
                .map(h -> new ToDanhGiaResponse.HoSo(h.getId(), h.getSinhVien().getMaSv(), h.getSinhVien().getNguoiDung().getHoTen(),
                        h.getSinhVien().getLop(), h.getTrangThai()))
                .toList();
        return new ToDanhGiaResponse(to.getId(), to.getDot().getId(), to.getDot().getMaDot(), to.getNgayThanhLap(),
                to.getThoiGianBaoCao(), to.getDiaDiem(), to.getHinhThuc(), to.getGhiChuPheDuyet(), to.getDuongDanGhiHinh(),
                tvs, hs, kiemThanhPhan(to.getThanhViens(), hoSoCuaTo(to)));
    }
}
