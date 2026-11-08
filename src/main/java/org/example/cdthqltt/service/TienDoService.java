package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.progress.*;
import org.example.cdthqltt.entity.HoSoThucTap;
import org.example.cdthqltt.entity.NhatKyThucTap;
import org.example.cdthqltt.entity.TienDoTuan;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.repository.HoSoThucTapRepository;
import org.example.cdthqltt.repository.NhatKyThucTapRepository;
import org.example.cdthqltt.repository.TienDoTuanRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/** UC07 — nhật ký thực tập hằng ngày và bảng theo dõi tiến độ theo tuần (TTTN-03). */
@Service
@RequiredArgsConstructor
public class TienDoService {

    /** BR-07.2: chỉ ghi / sửa nhật ký trong 7 ngày gần nhất (tính cả hôm nay). */
    private static final int SO_NGAY_DUOC_SUA = 7;
    /** UC07 luồng thay thế: nhắc SV quá 5 ngày chưa cập nhật nhật ký. */
    private static final int SO_NGAY_QUA_HAN_NHAT_KY = 5;

    private final NhatKyThucTapRepository nhatKyRepo;
    private final TienDoTuanRepository tienDoRepo;
    private final HoSoThucTapRepository hoSoRepo;
    private final HoSoThucTapService hoSoService;
    private final ThongBaoService thongBaoService;

    /** Hợp đồng cho đối chiếu minh chứng NHAT_KY. */
    @Transactional(readOnly = true)
    public boolean coNhatKy(Long hoSoId) {
        return nhatKyRepo.findTopByHoSoIdOrderByNgayDesc(hoSoId).isPresent();
    }

    // ------------------------------------------------------------------ nhật ký

    /** #57 */
    @Transactional(readOnly = true)
    public List<NhatKyResponse> danhSachNhatKy(Long hoSoId, LocalDate tu, LocalDate den) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, u);
        boolean laChu = u.laSinhVien();
        return nhatKyRepo.findByHoSoIdOrderByNgayDesc(h.getId()).stream()
                .filter(n -> tu == null || !n.getNgay().isBefore(tu))
                .filter(n -> den == null || !n.getNgay().isAfter(den))
                .map(n -> NhatKyResponse.tu(n, laChu && trongHanSua(n.getNgay())))
                .toList();
    }

    /** #58 — BR-07.1 một bản ghi mỗi ngày (UC07 2a). */
    @Transactional
    public NhatKyResponse ghiNhatKy(NhatKyRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap h = req.hoSoId() != null ? hoSoService.layVaKiemQuyen(req.hoSoId(), u) : hoSoDangThucTap(u);
        kiemDangThucTap(h);
        LocalDate ngay = req.ngay();
        if (ngay.isAfter(LocalDate.now())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Không ghi nhật ký cho ngày trong tương lai");
        }
        if (ngay.isBefore(h.getDot().getNgayBatDau())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Ngày ghi trước ngày bắt đầu đợt thực tập");
        }
        if (!trongHanSua(ngay)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Chỉ ghi nhật ký trong 7 ngày gần nhất; hãy ghi nhật ký hằng ngày (Điều 19 khoản 1 điểm c)");
        }
        if (nhatKyRepo.existsByHoSoIdAndNgay(h.getId(), ngay)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                    "Ngày " + ngay + " đã có nhật ký; mỗi ngày chỉ một bản ghi, hãy sửa bản ghi đó (Điều 19 khoản 1 điểm c)");
        }
        NhatKyThucTap n = new NhatKyThucTap();
        n.setHoSo(h);
        n.setNgay(ngay);
        n.setNoiDung(req.noiDung().trim());
        n.setSoGio(req.soGio());
        n.setKetQua(rong(req.ketQua()));
        nhatKyRepo.save(n);
        return NhatKyResponse.tu(n, true);
    }

    /** #59 — BR-07.2. */
    @Transactional
    public NhatKyResponse suaNhatKy(Long nhatKyId, CapNhatNhatKyRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        NhatKyThucTap n = nhatKyRepo.findById(nhatKyId).orElseThrow(BusinessException::khongCoQuyen);
        hoSoService.layVaKiemQuyen(n.getHoSo().getId(), u);
        kiemDangThucTap(n.getHoSo());
        if (!trongHanSua(n.getNgay())) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED,
                    "Chỉ sửa được nhật ký trong 7 ngày gần nhất (Điều 19 khoản 1 điểm c)");
        }
        n.setNoiDung(req.noiDung().trim());
        n.setSoGio(req.soGio());
        n.setKetQua(rong(req.ketQua()));
        return NhatKyResponse.tu(n, true);
    }

    /** #60 — GV nhắc SV mình hướng dẫn quá 5 ngày chưa ghi nhật ký (NT-09). */
    @Transactional
    public List<NhacNhoResponse> nhacNho(NhacNhoRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        List<HoSoThucTap> cuaToi = hoSoRepo.theoGiangVien(u.giangVienId(), null, TrangThaiHoSo.DANG_THUC_TAP);
        List<HoSoThucTap> chon;
        if (req != null && req.hoSoIds() != null && !req.hoSoIds().isEmpty()) {
            Set<Long> ids = new HashSet<>(req.hoSoIds());
            chon = cuaToi.stream().filter(h -> ids.contains(h.getId())).toList();
            if (chon.size() != ids.size()) {
                throw BusinessException.khongCoQuyen();
            }
        } else {
            chon = cuaToi;
        }
        LocalDate moc = LocalDate.now().minusDays(SO_NGAY_QUA_HAN_NHAT_KY);
        List<NhacNhoResponse> daNhac = new ArrayList<>();
        for (HoSoThucTap h : chon) {
            LocalDate cuoi = nhatKyRepo.findTopByHoSoIdOrderByNgayDesc(h.getId()).map(NhatKyThucTap::getNgay).orElse(null);
            LocalDate tinhTu = cuoi != null ? cuoi : h.getDot().getNgayBatDau();
            if (tinhTu.isBefore(moc)) {
                thongBaoService.gui("NT-09", List.of(h.getSinhVien().getNguoiDung().getId()),
                        "GVHD nhắc bạn cập nhật nhật ký thực tập hằng ngày (Điều 19 khoản 1 điểm c)",
                        "/records/" + h.getId() + "/logbooks");
                daNhac.add(new NhacNhoResponse(h.getId(), h.getSinhVien().getMaSv(),
                        h.getSinhVien().getNguoiDung().getHoTen(), cuoi));
            }
        }
        return daNhac;
    }

    // ------------------------------------------------------------------ tiến độ tuần

    /** #61 */
    @Transactional(readOnly = true)
    public List<TienDoResponse> bangTienDo(Long hoSoId) {
        HoSoThucTap h = hoSoService.layVaKiemQuyen(hoSoId, SecurityUtils.currentUser());
        return tienDoRepo.findByHoSoIdOrderByTuan(h.getId()).stream().map(TienDoResponse::tu).toList();
    }

    /** #62 — dòng đã được cán bộ xác nhận thì khóa với SV. */
    @Transactional
    public TienDoResponse capNhatTienDo(Long tienDoId, CapNhatTienDoRequest req) {
        TienDoTuan t = layTienDo(tienDoId);
        kiemDangThucTap(t.getHoSo());
        if (t.daXacNhan()) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Tuần " + t.getTuan() + " đã được cán bộ ĐVHD xác nhận, không sửa được");
        }
        t.setCongViecDuocGiao(rong(req.congViecDuocGiao()));
        t.setKetQuaThucHien(rong(req.ketQuaThucHien()));
        t.setPhanTramHoanThanh(req.phanTramHoanThanh());
        return TienDoResponse.tu(t);
    }

    /** #63 — xác nhận (khóa dòng) hoặc yêu cầu bổ sung (dòng về chờ, NT-08 cho SV). */
    @Transactional
    public TienDoResponse xacNhanTuan(Long tienDoId, XacNhanTienDoRequest req) {
        CurrentUser u = SecurityUtils.currentUser();
        TienDoTuan t = layTienDo(tienDoId);
        HoSoThucTap h = t.getHoSo();
        if (h.getCanBoDvhd() == null || !h.getCanBoDvhd().getId().equals(u.canBoDvhdId())) {
            throw BusinessException.khongCoQuyen();
        }
        if (t.daXacNhan()) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Tuần " + t.getTuan() + " đã được xác nhận");
        }
        if (Boolean.TRUE.equals(req.dongY())) {
            if (t.getCongViecDuocGiao() == null || t.getKetQuaThucHien() == null || t.getPhanTramHoanThanh() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Sinh viên chưa điền đủ tiến độ tuần " + t.getTuan());
            }
            t.setXacNhanDvhdId(u.nguoiDungId());
            t.setNgayXacNhan(LocalDateTime.now());
            t.setYeuCauBoSung(null);
        } else {
            if (req.yeuCauBoSung() == null || req.yeuCauBoSung().isBlank()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Vui lòng nhập nội dung cần bổ sung");
            }
            t.setYeuCauBoSung(req.yeuCauBoSung().trim());
            thongBaoService.gui("NT-08", List.of(h.getSinhVien().getNguoiDung().getId()),
                    "Cán bộ ĐVHD yêu cầu bổ sung tiến độ tuần " + t.getTuan() + ": " + t.getYeuCauBoSung(),
                    "/records/" + h.getId() + "/weekly_progress");
        }
        return TienDoResponse.tu(t);
    }

    // ------------------------------------------------------------------

    private TienDoTuan layTienDo(Long tienDoId) {
        CurrentUser u = SecurityUtils.currentUser();
        TienDoTuan t = tienDoRepo.findById(tienDoId).orElseThrow(BusinessException::khongCoQuyen);
        hoSoService.layVaKiemQuyen(t.getHoSo().getId(), u);
        return t;
    }

    private HoSoThucTap hoSoDangThucTap(CurrentUser u) {
        return hoSoRepo.findBySinhVienIdOrderByIdDesc(u.sinhVienId()).stream()
                .filter(h -> h.getTrangThai() == TrangThaiHoSo.DANG_THUC_TAP)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Bạn không có hồ sơ đang thực tập"));
    }

    private static void kiemDangThucTap(HoSoThucTap h) {
        if (h.getTrangThai() != TrangThaiHoSo.DANG_THUC_TAP) {
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ không ở trạng thái Đang thực tập");
        }
    }

    private static boolean trongHanSua(LocalDate ngay) {
        return !ngay.isBefore(LocalDate.now().minusDays(SO_NGAY_DUOC_SUA - 1L));
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
