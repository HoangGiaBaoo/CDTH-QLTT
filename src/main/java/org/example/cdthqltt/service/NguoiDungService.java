package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.auth.MatKhauPolicy;
import org.example.cdthqltt.dto.user.*;
import org.example.cdthqltt.entity.*;
import org.example.cdthqltt.entity.enums.TrangThaiDot;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.example.cdthqltt.repository.*;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/** UC01 — quản lý tài khoản và hồ sơ người dùng. */
@Service
@RequiredArgsConstructor
public class NguoiDungService {

    static final Set<TrangThaiDot> DOT_DANG_CHAY = EnumSet.of(TrangThaiDot.DANG_NHAN_DANG_KY, TrangThaiDot.DANG_THUC_HIEN);
    /** Hồ sơ còn hiệu lực: đã gửi và chưa kết thúc. */
    static final Set<TrangThaiHoSo> HO_SO_HIEU_LUC = EnumSet.of(TrangThaiHoSo.CHO_DVHD, TrangThaiHoSo.CHO_GVHD,
            TrangThaiHoSo.DANG_THUC_TAP, TrangThaiHoSo.CHO_DANH_GIA, TrangThaiHoSo.GIAN_DOAN);

    private final NguoiDungRepository nguoiDungRepo;
    private final SinhVienRepository sinhVienRepo;
    private final GiangVienRepository giangVienRepo;
    private final CanBoDvhdRepository canBoRepo;
    private final DonViHuongDanRepository donViRepo;
    private final PasswordEncoder passwordEncoder;
    private final NguoiDungAssembler assembler;
    private final NhatKyHeThongService nhatKyService;

    /** #5 */
    @Transactional(readOnly = true)
    public PageResponse<NguoiDungResponse> danhSach(VaiTro vaiTro, TrangThaiTaiKhoan trangThai, String tuKhoa,
                                                    int page, int size) {
        var kq = nguoiDungRepo.timKiem(vaiTro, trangThai, rong(tuKhoa),
                PageRequest.of(Math.max(page, 0), size <= 0 ? PageResponse.KICH_THUOC_MAC_DINH : size));
        return PageResponse.of(kq, assembler::dung);
    }

    /** #6 */
    @Transactional(readOnly = true)
    public NguoiDungResponse chiTiet(Long id) {
        return assembler.dung(layNguoiDung(id));
    }

    /** #7 — tài khoản + hồ sơ theo vai trò trong một giao dịch: hỏng ở bước nào cũng rollback hết (UC01 7a). */
    @Transactional
    public TaoNguoiDungResponse taoTaiKhoan(TaoNguoiDungRequest req) {
        kiemTrungTaiKhoan(req.tenDangNhap(), req.email());
        String matKhau = req.matKhau() == null || req.matKhau().isBlank() ? MatKhauPolicy.sinhNgauNhien() : req.matKhau();

        NguoiDung n = new NguoiDung();
        n.setTenDangNhap(req.tenDangNhap().trim());
        n.setHoTen(req.hoTen().trim());
        n.setEmail(req.email().trim());
        n.setDienThoai(rong(req.dienThoai()));
        n.setVaiTro(req.vaiTro());
        n.setMatKhauHash(passwordEncoder.encode(matKhau));
        nguoiDungRepo.save(n);

        switch (req.vaiTro()) {
            case SINH_VIEN -> taoHoSoSinhVien(n, batBuoc(req.sinhVien(), "sinh viên"));
            case GIANG_VIEN -> taoHoSoGiangVien(n, batBuoc(req.giangVien(), "giảng viên"));
            case CAN_BO_DVHD -> taoHoSoCanBo(n, batBuoc(req.canBoDvhd(), "cán bộ hướng dẫn"));
            case ADMIN -> { /* giáo vụ không có hồ sơ mở rộng */ }
        }
        nhatKyService.ghiVet("TAO_TAI_KHOAN", "nguoi_dung", n.getId(), null,
                Map.of("tenDangNhap", n.getTenDangNhap(), "vaiTro", n.getVaiTro()));
        return new TaoNguoiDungResponse(assembler.dung(n), matKhau);
    }

    /** #8 */
    @Transactional
    public NguoiDungResponse capNhat(Long id, CapNhatNguoiDungRequest req) {
        NguoiDung n = layNguoiDung(id);
        String email = req.email().trim();
        if (nguoiDungRepo.existsByEmailAndIdNot(email, id)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Email đã được tài khoản khác sử dụng");
        }
        n.setHoTen(req.hoTen().trim());
        n.setEmail(email);
        n.setDienThoai(rong(req.dienThoai()));
        return assembler.dung(n);
    }

    /** #9 — CBR-22: không xóa tài khoản, chỉ vô hiệu hóa; chặn nếu đang hướng dẫn SV trong đợt đang chạy. */
    @Transactional
    public NguoiDungResponse doiTrangThai(Long id, TrangThaiTaiKhoan trangThaiMoi) {
        NguoiDung n = layNguoiDung(id);
        if (n.getTrangThai() == trangThaiMoi) {
            return assembler.dung(n);
        }
        if (trangThaiMoi == TrangThaiTaiKhoan.VO_HIEU_HOA) {
            if (n.getId().equals(SecurityUtils.currentUser().nguoiDungId())) {
                throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Không thể tự vô hiệu hóa tài khoản đang đăng nhập");
            }
            long dangHuongDan = switch (n.getVaiTro()) {
                case GIANG_VIEN -> nguoiDungRepo.demHoSoDangHuongDanCuaGiangVien(n.getId(), DOT_DANG_CHAY, HO_SO_HIEU_LUC);
                case CAN_BO_DVHD -> nguoiDungRepo.demHoSoDangHuongDanCuaCanBo(n.getId(), DOT_DANG_CHAY, HO_SO_HIEU_LUC);
                default -> 0;
            };
            if (dangHuongDan > 0) {
                throw new BusinessException(ErrorCode.RESOURCE_IN_USE, "Người dùng đang hướng dẫn " + dangHuongDan
                        + " sinh viên trong đợt đang chạy; cần đổi người hướng dẫn trước khi vô hiệu hóa");
            }
        }
        TrangThaiTaiKhoan cu = n.getTrangThai();
        n.setTrangThai(trangThaiMoi);
        nhatKyService.ghiVet("DOI_TRANG_THAI_TAI_KHOAN", "nguoi_dung", n.getId(), cu, trangThaiMoi);
        return assembler.dung(n);
    }

    /** #10 — mật khẩu mới trả về một lần; token cũ tự hết hiệu lực vì dấu mật khẩu đổi. */
    @Transactional
    public TaoNguoiDungResponse datLaiMatKhau(Long id) {
        NguoiDung n = layNguoiDung(id);
        String matKhau = MatKhauPolicy.sinhNgauNhien();
        n.setMatKhauHash(passwordEncoder.encode(matKhau));
        n.setSoLanSai(0);
        n.setKhoaDen(null);
        nhatKyService.ghiVet("DAT_LAI_MAT_KHAU", "nguoi_dung", n.getId(), null, null);
        return new TaoNguoiDungResponse(assembler.dung(n), matKhau);
    }

    // ------------------------------------------------------------------
    // Hợp đồng cho UC02 (người B): cán bộ được thêm vào đơn vị trước khi đơn vị được duyệt.
    // ------------------------------------------------------------------

    /**
     * Tạo tài khoản CAN_BO_DVHD ở trạng thái VO_HIEU_HOA (chưa đăng nhập được) — vì bảng can_bo_dvhd
     * bắt buộc có nguoi_dung_id. Tài khoản chỉ được kích hoạt khi đơn vị được phê duyệt (#21).
     */
    @Transactional
    public NguoiDung taoTaiKhoanCanBo(String tenDangNhap, String hoTen, String email, String dienThoai) {
        kiemTrungTaiKhoan(tenDangNhap, email);
        NguoiDung n = new NguoiDung();
        n.setTenDangNhap(tenDangNhap.trim());
        n.setHoTen(hoTen.trim());
        n.setEmail(email.trim());
        n.setDienThoai(rong(dienThoai));
        n.setVaiTro(VaiTro.CAN_BO_DVHD);
        n.setTrangThai(TrangThaiTaiKhoan.VO_HIEU_HOA);
        n.setMatKhauHash(passwordEncoder.encode(MatKhauPolicy.sinhNgauNhien()));
        return nguoiDungRepo.save(n);
    }

    /** Kích hoạt tài khoản cán bộ khi đơn vị được duyệt; trả mật khẩu ban đầu (một lần). */
    @Transactional
    public String kichHoatTaiKhoanCanBo(NguoiDung n) {
        String matKhau = MatKhauPolicy.sinhNgauNhien();
        n.setMatKhauHash(passwordEncoder.encode(matKhau));
        n.setTrangThai(TrangThaiTaiKhoan.HOAT_DONG);
        n.setSoLanSai(0);
        n.setKhoaDen(null);
        return matKhau;
    }

    // ------------------------------------------------------------------

    private void taoHoSoSinhVien(NguoiDung n, TaoNguoiDungRequest.HoSoSinhVien hs) {
        if (sinhVienRepo.existsByMaSv(hs.maSv().trim())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã sinh viên " + hs.maSv() + " đã tồn tại");
        }
        SinhVien sv = new SinhVien();
        sv.setNguoiDung(n);
        sv.setMaSv(hs.maSv().trim());
        sv.setLop(rong(hs.lop()));
        sv.setKhoaHoc(rong(hs.khoaHoc()));
        sv.setNganh(rong(hs.nganh()));
        sv.setKhoaVien(rong(hs.khoaVien()));
        sv.setChuongTrinhDaoTao(hs.chuongTrinhDaoTao());
        sinhVienRepo.save(sv);
    }

    private void taoHoSoGiangVien(NguoiDung n, TaoNguoiDungRequest.HoSoGiangVien hs) {
        if (giangVienRepo.existsByMaGv(hs.maGv().trim())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Mã giảng viên " + hs.maGv() + " đã tồn tại");
        }
        GiangVien gv = new GiangVien();
        gv.setNguoiDung(n);
        gv.setMaGv(hs.maGv().trim());
        gv.setBoMon(rong(hs.boMon()));
        gv.setKhoaVien(rong(hs.khoaVien()));
        gv.setHocHamHocVi(rong(hs.hocHamHocVi()));
        if (hs.soSvToiDa() != null) {
            gv.setSoSvToiDa(hs.soSvToiDa());
        }
        giangVienRepo.save(gv);
    }

    private void taoHoSoCanBo(NguoiDung n, TaoNguoiDungRequest.HoSoCanBo hs) {
        DonViHuongDan dv = donViRepo.findById(hs.donViId())
                .filter(d -> !Boolean.TRUE.equals(d.getDaXoa()))
                .orElseThrow(() -> BusinessException.khongTimThay("đơn vị hướng dẫn"));
        if (dv.getTrangThaiPheDuyet() != TrangThaiPheDuyet.DA_DUYET) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Chỉ tạo tài khoản cán bộ cho đơn vị đã được phê duyệt (CBR-02)");
        }
        if (hs.soNamKinhNghiem() < 3) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Cán bộ hướng dẫn phải có từ 3 năm kinh nghiệm trở lên (Điều 7 khoản 1 điểm c)");
        }
        CanBoDvhd cb = new CanBoDvhd();
        cb.setNguoiDung(n);
        cb.setDonVi(dv);
        cb.setChucVu(rong(hs.chucVu()));
        cb.setSoNamKinhNghiem(hs.soNamKinhNghiem());
        if (hs.soSvToiDa() != null) {
            cb.setSoSvToiDa(hs.soSvToiDa());
        }
        canBoRepo.save(cb);
    }

    private void kiemTrungTaiKhoan(String tenDangNhap, String email) {
        if (nguoiDungRepo.existsByTenDangNhap(tenDangNhap.trim())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Tên đăng nhập " + tenDangNhap + " đã tồn tại");
        }
        if (nguoiDungRepo.existsByEmail(email.trim())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Email " + email + " đã được sử dụng");
        }
    }

    private NguoiDung layNguoiDung(Long id) {
        return nguoiDungRepo.findById(id).orElseThrow(() -> BusinessException.khongTimThay("người dùng"));
    }

    private static <T> T batBuoc(T hoSo, String loai) {
        if (hoSo == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Thiếu thông tin hồ sơ " + loai);
        }
        return hoSo;
    }

    private static String rong(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
