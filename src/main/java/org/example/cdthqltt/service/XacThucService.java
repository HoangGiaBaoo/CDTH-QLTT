package org.example.cdthqltt.service;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.auth.CapNhatHoSoCaNhanRequest;
import org.example.cdthqltt.dto.auth.DangNhapRequest;
import org.example.cdthqltt.dto.auth.DangNhapResponse;
import org.example.cdthqltt.dto.auth.DoiMatKhauRequest;
import org.example.cdthqltt.dto.user.NguoiDungResponse;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.repository.NguoiDungRepository;
import org.example.cdthqltt.security.CurrentUser;
import org.example.cdthqltt.security.JwtService;
import org.example.cdthqltt.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class XacThucService {

    // Không nói rõ sai tên hay sai mật khẩu để tránh dò tên đăng nhập.
    private static final String SAI_THONG_TIN = "Tên đăng nhập hoặc mật khẩu không đúng";
    private static final DateTimeFormatter GIO_PHUT = DateTimeFormatter.ofPattern("HH:mm");

    private final NguoiDungRepository nguoiDungRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NguoiDungAssembler assembler;
    private final NhatKyHeThongService nhatKyService;

    @Value("${app.auth.so-lan-sai-toi-da:5}")
    private int soLanSaiToiDa;

    @Value("${app.auth.thoi-gian-khoa-phut:15}")
    private int thoiGianKhoaPhut;

    /** #1 — sai 5 lần liên tiếp thì khóa 15 phút; bộ đếm phải được lưu dù request trả lỗi. */
    @Transactional(noRollbackFor = BusinessException.class)
    public DangNhapResponse dangNhap(DangNhapRequest req) {
        NguoiDung n = nguoiDungRepo.findByTenDangNhap(req.tenDangNhap().trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, SAI_THONG_TIN));

        LocalDateTime now = LocalDateTime.now();
        if (n.getKhoaDen() != null && n.getKhoaDen().isAfter(now)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED,
                    "Tài khoản tạm khóa do nhập sai mật khẩu nhiều lần, vui lòng thử lại sau "
                            + n.getKhoaDen().format(GIO_PHUT));
        }

        if (!passwordEncoder.matches(req.matKhau(), n.getMatKhauHash())) {
            int soLan = n.getSoLanSai() + 1;
            if (soLan >= soLanSaiToiDa) {
                n.setKhoaDen(now.plusMinutes(thoiGianKhoaPhut));
                n.setSoLanSai(0);
                throw new BusinessException(ErrorCode.UNAUTHORIZED,
                        "Nhập sai mật khẩu " + soLanSaiToiDa + " lần liên tiếp, tài khoản bị tạm khóa "
                                + thoiGianKhoaPhut + " phút");
            }
            n.setSoLanSai(soLan);
            throw new BusinessException(ErrorCode.UNAUTHORIZED, SAI_THONG_TIN);
        }

        if (!n.dangHoatDong()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ giáo vụ Khoa");
        }

        n.setSoLanSai(0);
        n.setKhoaDen(null);
        JwtService.TokenDaPhat token = jwtService.phatHanh(n);
        return new DangNhapResponse(token.token(), token.hetHan(), assembler.dung(n));
    }

    /** #2 */
    @Transactional(readOnly = true)
    public NguoiDungResponse layThongTinHienTai() {
        return assembler.dung(layNguoiDungHienTai());
    }

    /** #3 */
    @Transactional
    public NguoiDungResponse capNhatHoSo(CapNhatHoSoCaNhanRequest req) {
        NguoiDung n = layNguoiDungHienTai();
        String email = req.email().trim();
        if (nguoiDungRepo.existsByEmailAndIdNot(email, n.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Email đã được tài khoản khác sử dụng");
        }
        n.setHoTen(req.hoTen().trim());
        n.setEmail(email);
        n.setDienThoai(req.dienThoai() == null || req.dienThoai().isBlank() ? null : req.dienThoai().trim());
        return assembler.dung(n);
    }

    /** #4 — đổi xong thì token cũ hết hiệu lực (dấu mật khẩu trong JWT không còn khớp). */
    @Transactional
    public void doiMatKhau(DoiMatKhauRequest req) {
        NguoiDung n = layNguoiDungHienTai();
        if (!passwordEncoder.matches(req.matKhauHienTai(), n.getMatKhauHash())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mật khẩu hiện tại không đúng");
        }
        if (req.matKhauHienTai().equals(req.matKhauMoi())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        n.setMatKhauHash(passwordEncoder.encode(req.matKhauMoi()));
        nhatKyService.ghiVet("DOI_MAT_KHAU", "nguoi_dung", n.getId(), null, null);
    }

    private NguoiDung layNguoiDungHienTai() {
        CurrentUser u = SecurityUtils.currentUser();
        return nguoiDungRepo.findById(u.nguoiDungId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }
}
