package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.auth.CapNhatHoSoCaNhanRequest;
import org.example.cdthqltt.dto.auth.DangNhapRequest;
import org.example.cdthqltt.dto.auth.DangNhapResponse;
import org.example.cdthqltt.dto.auth.DoiMatKhauRequest;
import org.example.cdthqltt.dto.user.NguoiDungResponse;
import org.example.cdthqltt.service.XacThucService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService xacThucService;

    /** #1 — PUBLIC. */
    @PostMapping("/login")
    public ApiResponse<DangNhapResponse> login(@Valid @RequestBody DangNhapRequest req) {
        return ApiResponse.ok(xacThucService.dangNhap(req), "Đăng nhập thành công");
    }

    /** #2 */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NguoiDungResponse> me() {
        return ApiResponse.ok(xacThucService.layThongTinHienTai());
    }

    /** #3 */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NguoiDungResponse> updateProfile(@Valid @RequestBody CapNhatHoSoCaNhanRequest req) {
        return ApiResponse.ok(xacThucService.capNhatHoSo(req), "Đã cập nhật hồ sơ cá nhân");
    }

    /** #4 */
    @PutMapping("/change_password")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> changePassword(@Valid @RequestBody DoiMatKhauRequest req) {
        xacThucService.doiMatKhau(req);
        return ApiResponse.thanhCong("Đã đổi mật khẩu, vui lòng đăng nhập lại");
    }
}
