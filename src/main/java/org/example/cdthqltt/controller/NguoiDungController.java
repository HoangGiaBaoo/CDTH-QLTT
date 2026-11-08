package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.user.*;
import org.example.cdthqltt.entity.enums.TrangThaiTaiKhoan;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.example.cdthqltt.service.NguoiDungService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** UC01 — chỉ ADMIN (giáo vụ Khoa). */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    /** #5 */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<NguoiDungResponse>> list(@RequestParam(required = false) VaiTro role,
                                                             @RequestParam(required = false) TrangThaiTaiKhoan status,
                                                             @RequestParam(required = false) String keyword,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.ok(nguoiDungService.danhSach(role, status, keyword, page, size));
    }

    /** #6 */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<NguoiDungResponse> get(@PathVariable Long userId) {
        return ApiResponse.ok(nguoiDungService.chiTiet(userId));
    }

    /** #7 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TaoNguoiDungResponse> create(@Valid @RequestBody TaoNguoiDungRequest req) {
        return ApiResponse.ok(nguoiDungService.taoTaiKhoan(req), "Đã tạo tài khoản");
    }

    /** #8 */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<NguoiDungResponse> update(@PathVariable Long userId, @Valid @RequestBody CapNhatNguoiDungRequest req) {
        return ApiResponse.ok(nguoiDungService.capNhat(userId, req), "Đã cập nhật tài khoản");
    }

    /** #9 */
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<NguoiDungResponse> changeStatus(@PathVariable Long userId,
                                                       @Valid @RequestBody DoiTrangThaiTaiKhoanRequest req) {
        return ApiResponse.ok(nguoiDungService.doiTrangThai(userId, req.trangThai()), "Đã đổi trạng thái tài khoản");
    }

    /** #10 */
    @PutMapping("/{userId}/reset_password")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TaoNguoiDungResponse> resetPassword(@PathVariable Long userId) {
        return ApiResponse.ok(nguoiDungService.datLaiMatKhau(userId), "Đã đặt lại mật khẩu");
    }
}
