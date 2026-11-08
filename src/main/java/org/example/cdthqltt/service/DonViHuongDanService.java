package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.hostorg.*;
import org.example.cdthqltt.entity.CanBoDvhd;
import org.example.cdthqltt.entity.DonViHuongDan;
import org.example.cdthqltt.entity.DotThucTap;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.repository.CanBoDvhdRepository;
import org.example.cdthqltt.repository.DonViHuongDanRepository;
import org.example.cdthqltt.repository.DotThucTapRepository;
import org.example.cdthqltt.repository.HoSoThucTapRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** UC02 — danh mục Đơn vị hướng dẫn và cán bộ hướng dẫn. */
@Service
@RequiredArgsConstructor
public class DonViHuongDanService {

    /** Đ7 k1c (CBR-05): cán bộ hướng dẫn tối thiểu 3 năm kinh nghiệm — ngưỡng của Quy định, không phải cấu hình chấm. */
    private static final int KINH_NGHIEM_TOI_THIEU = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DonViHuongDanRepository donViRepo;
    private final CanBoDvhdRepository canBoRepo;
    private final HoSoThucTapRepository hoSoRepo;
    private final DotThucTapRepository dotRepo;
    private final NguoiDungService nguoiDungService;
    private final NhatKyHeThongService nhatKyService;

    /** #17 — SINH_VIEN chỉ thấy đơn vị Đã duyệt (CBR-02). */
    @Transactional(readOnly = true)
    public List<DonViResponse> danhSach(TrangThaiPheDuyet trangThai, String tuKhoa) {
        CurrentUser u = SecurityUtils.currentUser();
        TrangThaiPheDuyet loc = u.laSinhVien() ? TrangThaiPheDuyet.DA_DUYET : trangThai;
        return donViRepo.timKiem(loc, rong(tuKhoa)).stream()
                .map(d -> DonViResponse.from(d, canBoRepo.findByDonViIdOrderById(d.getId()).size()))
                .toList();
    }

    /** #18 — cán bộ chỉ xem đơn vị của mình; sinh viên chỉ xem đơn vị đã duyệt. */
    @Transactional(readOnly = true)
    public DonViResponse chiTiet(Long id) {
        CurrentUser u = SecurityUtils.currentUser();
        DonViHuongDan d = layDonVi(id);
        if (u.laCanBoDvhd()) {
            CanBoDvhd cb = canBoRepo.findById(u.canBoDvhdId()).orElseThrow(BusinessException::khongCoQuyen);
            if (!cb.getDonVi().getId().equals(id)) {
                throw BusinessException.khongCoQuyen();
            }
        }
        if (u.laSinhVien() && d.getTrangThaiPheDuyet() != TrangThaiPheDuyet.DA_DUYET) {
            throw BusinessException.khongTimThay("đơn vị hướng dẫn");
        }
        return DonViResponse.from(d, canBoRepo.findByDonViIdOrderById(id).size());
    }

    /** #19 — luôn vào trạng thái Chờ duyệt, kể cả khi giáo vụ tạo. */
    @Transactional
    public DonViResponse tao(DonViRequest req) {
        String ma = rong(req.maDvhd());
        if (ma == null) {
            ma = sinhMaDonVi();
        } else if (donViRepo.existsByMaDvhd(ma)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã ĐVHD " + ma + " đã tồn tại");
        }
        DonViHuongDan d = new DonViHuongDan();
        d.setMaDvhd(ma);
        ganThongTin(d, req);
        d.setTrangThaiPheDuyet(TrangThaiPheDuyet.CHO_DUYET);
        donViRepo.save(d);
        nhatKyService.ghiVet("TAO_DVHD", "don_vi_huong_dan", d.getId(), null, Map.of("maDvhd", ma));
        return DonViResponse.from(d, 0);
    }

    /** #20 */
    @Transactional
    public DonViResponse capNhat(Long id, DonViRequest req) {
        DonViHuongDan d = layDonVi(id);
        String ma = rong(req.maDvhd());
        if (ma != null && !ma.equals(d.getMaDvhd())) {
            if (donViRepo.existsByMaDvhd(ma)) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã ĐVHD " + ma + " đã tồn tại");
            }
            d.setMaDvhd(ma);
        }
        ganThongTin(d, req);
        return DonViResponse.from(d, canBoRepo.findByDonViIdOrderById(id).size());
    }

    /**
     * #21 — phê duyệt / từ chối / loại khỏi danh mục. Duyệt thì kích hoạt tài khoản cán bộ trong cùng giao dịch:
     * kích hoạt hỏng giữa chừng thì đơn vị cũng không chuyển Đã duyệt.
     */
    @Transactional
    public PheDuyetDonViResponse pheDuyet(Long id, PheDuyetDonViRequest req) {
        DonViHuongDan d = layDonVi(id);
        TrangThaiPheDuyet cu = d.getTrangThaiPheDuyet();
        TrangThaiPheDuyet moi = req.quyetDinh();
        Set<TrangThaiPheDuyet> hopLe = switch (moi) {
            case DA_DUYET -> EnumSet.of(TrangThaiPheDuyet.CHO_DUYET, TrangThaiPheDuyet.TU_CHOI, TrangThaiPheDuyet.DA_LOAI);
            case TU_CHOI -> EnumSet.of(TrangThaiPheDuyet.CHO_DUYET);
            case DA_LOAI -> EnumSet.of(TrangThaiPheDuyet.DA_DUYET);
            case CHO_DUYET -> throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Quyết định chỉ được là DA_DUYET, TU_CHOI hoặc DA_LOAI");
        };
        if (!hopLe.contains(cu)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Không thể chuyển đơn vị từ " + cu + " sang " + moi);
        }
        String lyDo = rong(req.lyDo());
        if (moi != TrangThaiPheDuyet.DA_DUYET && lyDo == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Vui lòng nhập lý do từ chối / loại khỏi danh mục");
        }

        List<PheDuyetDonViResponse.TaiKhoanCanBo> kichHoat = new ArrayList<>();
        List<CanBoDvhd> canBos = canBoRepo.findByDonViIdOrderById(id);
        if (moi == TrangThaiPheDuyet.DA_DUYET) {
            // UC02 6a: phải có ít nhất một cán bộ hướng dẫn.
            if (canBos.isEmpty()) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Đơn vị chưa có cán bộ hướng dẫn nào, cần bổ sung tối thiểu một cán bộ trước khi phê duyệt");
            }
            for (CanBoDvhd cb : canBos) {
                NguoiDung n = cb.getNguoiDung();
                if (n.getTrangThai() == TrangThaiTaiKhoan.VO_HIEU_HOA) {
                    String matKhau = nguoiDungService.kichHoatTaiKhoanCanBo(n);
                    kichHoat.add(new PheDuyetDonViResponse.TaiKhoanCanBo(cb.getId(), n.getTenDangNhap(), n.getHoTen(), matKhau));
                }
            }
        }
        // UC02 5b: đơn vị bị loại — hồ sơ đang chạy giữ nguyên hiệu lực, chỉ chặn đăng ký mới (kiểm ở UC04).
        d.setTrangThaiPheDuyet(moi);
        d.setLyDo(lyDo);
        d.setNgayPheDuyet(LocalDate.now());
        d.setNguoiPheDuyetId(SecurityUtils.currentUser().nguoiDungId());
        nhatKyService.ghiVet("PHE_DUYET_DVHD", "don_vi_huong_dan", id, cu, Map.of("trangThai", moi, "lyDo", lyDo == null ? "" : lyDo));
        return new PheDuyetDonViResponse(DonViResponse.from(d, canBos.size()), kichHoat);
    }

    /** #22 — xóa mềm; đơn vị đã gắn hồ sơ thì chặn (UC02 ngoại lệ). */
    @Transactional
    public void xoa(Long id) {
        DonViHuongDan d = layDonVi(id);
        if (hoSoRepo.existsByDonViId(id)) {
            throw new BusinessException(ErrorCode.RESOURCE_IN_USE,
                    "Đơn vị đã có hồ sơ thực tập gắn vào, không xóa được; hãy dùng chức năng Loại khỏi danh mục");
        }
        d.setDaXoa(true);
        nhatKyService.ghiVet("XOA_DVHD", "don_vi_huong_dan", id, d.getMaDvhd(), null);
    }

    /** #23 — kèm số đang hướng dẫn / hạn mức; sinh viên chỉ thấy cán bộ còn hạn mức của đơn vị đã duyệt. */
    @Transactional(readOnly = true)
    public List<CanBoResponse> danhSachCanBo(Long donViId) {
        CurrentUser u = SecurityUtils.currentUser();
        DonViHuongDan d = layDonVi(donViId);
        Long dotId = dotDangChay();
        if (u.laSinhVien()) {
            if (d.getTrangThaiPheDuyet() != TrangThaiPheDuyet.DA_DUYET) {
                throw BusinessException.khongTimThay("đơn vị hướng dẫn");
            }
            return canBoRepo.findByDonViIdOrderById(donViId).stream()
                    .filter(cb -> cb.getNguoiDung().dangHoatDong())
                    .map(cb -> CanBoResponse.choSinhVien(cb, demDangHuongDan(cb, dotId)))
                    .filter(r -> r.soDangHuongDan() < r.soSvToiDa())
                    .toList();
        }
        return canBoRepo.findByDonViIdOrderById(donViId).stream()
                .map(cb -> CanBoResponse.from(cb, demDangHuongDan(cb, dotId), null))
                .toList();
    }

    /** #24 — tài khoản tạo ở trạng thái vô hiệu; nếu đơn vị đã duyệt thì kích hoạt ngay. */
    @Transactional
    public CanBoResponse themCanBo(Long donViId, ThemCanBoRequest req) {
        DonViHuongDan d = layDonVi(donViId);
        if (d.getTrangThaiPheDuyet() == TrangThaiPheDuyet.DA_LOAI || d.getTrangThaiPheDuyet() == TrangThaiPheDuyet.TU_CHOI) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Đơn vị đã bị từ chối / loại khỏi danh mục, không thêm cán bộ được");
        }
        kiemKinhNghiem(req.soNamKinhNghiem());
        NguoiDung n = nguoiDungService.taoTaiKhoanCanBo(req.tenDangNhap(), req.hoTen(), req.email(), req.dienThoai());
        CanBoDvhd cb = new CanBoDvhd();
        cb.setNguoiDung(n);
        cb.setDonVi(d);
        cb.setChucVu(rong(req.chucVu()));
        cb.setSoNamKinhNghiem(req.soNamKinhNghiem());
        if (req.soSvToiDa() != null) {
            cb.setSoSvToiDa(req.soSvToiDa());
        }
        canBoRepo.save(cb);
        String matKhau = d.getTrangThaiPheDuyet() == TrangThaiPheDuyet.DA_DUYET ? nguoiDungService.kichHoatTaiKhoanCanBo(n) : null;
        nhatKyService.ghiVet("THEM_CAN_BO", "can_bo_dvhd", cb.getId(), null, Map.of("donViId", donViId, "tenDangNhap", n.getTenDangNhap()));
        return CanBoResponse.from(cb, 0L, matKhau);
    }

    /** #25 */
    @Transactional
    public CanBoResponse capNhatCanBo(Long canBoId, CapNhatCanBoRequest req) {
        CanBoDvhd cb = canBoRepo.findById(canBoId).orElseThrow(() -> BusinessException.khongTimThay("cán bộ hướng dẫn"));
        kiemKinhNghiem(req.soNamKinhNghiem());
        Long dotId = dotDangChay();
        long dangHuongDan = demDangHuongDan(cb, dotId);
        if (req.soSvToiDa() < dangHuongDan) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Cán bộ đang hướng dẫn " + dangHuongDan + " sinh viên, không thể đặt hạn mức thấp hơn (Điều 7 khoản 2 điểm c)");
        }
        Integer hanMucCu = cb.getSoSvToiDa();
        cb.setChucVu(rong(req.chucVu()));
        cb.setSoNamKinhNghiem(req.soNamKinhNghiem());
        cb.setSoSvToiDa(req.soSvToiDa());
        if (!hanMucCu.equals(req.soSvToiDa())) {
            nhatKyService.ghiVet("DOI_HAN_MUC_CAN_BO", "can_bo_dvhd", cb.getId(), hanMucCu, req.soSvToiDa());
        }
        return CanBoResponse.from(cb, dangHuongDan, null);
    }

    // ------------------------------------------------------------------

    /** Số SV cán bộ đang hướng dẫn trong đợt đang chạy — đếm động (CBR-03). */
    public long demDangHuongDan(CanBoDvhd cb, Long dotId) {
        return dotId == null ? 0 : hoSoRepo.demTheoCanBo(cb.getId(), dotId, NhomTrangThaiHoSo.TINH_HAN_MUC_CAN_BO);
    }

    private Long dotDangChay() {
        return dotRepo.findByTrangThaiInOrderByNgayBatDauDesc(NguoiDungService.DOT_DANG_CHAY).stream()
                .findFirst().map(DotThucTap::getId).orElse(null);
    }

    private static void kiemKinhNghiem(int soNam) {
        if (soNam < KINH_NGHIEM_TOI_THIEU) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Cán bộ hướng dẫn phải có từ 3 năm kinh nghiệm trở lên (Điều 7 khoản 1 điểm c)");
        }
    }

    private DonViHuongDan layDonVi(Long id) {
        return donViRepo.findById(id).filter(d -> !Boolean.TRUE.equals(d.getDaXoa()))
                .orElseThrow(() -> BusinessException.khongTimThay("đơn vị hướng dẫn"));
    }

    private static void ganThongTin(DonViHuongDan d, DonViRequest req) {
        d.setTen(req.ten().trim());
        d.setDiaChi(req.diaChi().trim());
        d.setLinhVuc(req.linhVuc().trim());
        d.setNguoiDaiDien(req.nguoiDaiDien().trim());
        d.setDienThoai(rong(req.dienThoai()));
        d.setEmail(rong(req.email()));
    }

    private String sinhMaDonVi() {
        String ma;
        do {
            ma = "DV" + (100000 + RANDOM.nextInt(900000));
        } while (donViRepo.existsByMaDvhd(ma));
        return ma;
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
