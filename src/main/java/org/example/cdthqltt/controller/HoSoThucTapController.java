package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.record.DoiTrangThaiHoSoRequest;
import org.example.cdthqltt.dto.record.HoSoRequest;
import org.example.cdthqltt.dto.record.HoSoResponse;
import org.example.cdthqltt.dto.record.QuyetDinhRequest;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiHoSo;
import org.example.cdthqltt.service.HoSoThucTapService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC04 — #39 … #47. */
@RestController
@RequestMapping("/api/internship_records")
@RequiredArgsConstructor
public class HoSoThucTapController {

    private final HoSoThucTapService hoSoService;

    /** #39 */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<List<HoSoResponse>> list(@RequestParam(required = false) Long termId,
                                                @RequestParam(required = false) TrangThaiHoSo status,
                                                @RequestParam(required = false) HinhThucThucTap internshipType) {
        return ApiResponse.ok(hoSoService.danhSach(termId, status, internshipType));
    }

    /** #40 */
    @GetMapping("/me")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HoSoResponse> getMe() {
        return ApiResponse.ok(hoSoService.cuaToi());
    }

    /** #41 */
    @GetMapping("/{recordId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<HoSoResponse> get(@PathVariable Long recordId) {
        return ApiResponse.ok(hoSoService.chiTiet(recordId));
    }

    /** #42 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HoSoResponse> create(@Valid @RequestBody HoSoRequest req) {
        return ApiResponse.ok(hoSoService.tao(req), "Đã lưu bản nháp hồ sơ");
    }

    /** #43 */
    @PutMapping("/{recordId}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HoSoResponse> update(@PathVariable Long recordId, @Valid @RequestBody HoSoRequest req) {
        return ApiResponse.ok(hoSoService.capNhat(recordId, req), "Đã lưu bản nháp hồ sơ");
    }

    /** #44 */
    @PutMapping("/{recordId}/submit")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HoSoResponse> submit(@PathVariable Long recordId) {
        return ApiResponse.ok(hoSoService.guiDangKy(recordId), "Đã gửi đăng ký, chờ ĐVHD xác nhận");
    }

    /** #45 */
    @PutMapping("/{recordId}/host_confirmation")
    @PreAuthorize("hasRole('CAN_BO_DVHD')")
    public ApiResponse<HoSoResponse> hostConfirmation(@PathVariable Long recordId, @Valid @RequestBody QuyetDinhRequest req) {
        return ApiResponse.ok(hoSoService.xacNhanTiepNhan(recordId, req), "Đã ghi nhận quyết định của ĐVHD");
    }

    /** #46 */
    @PutMapping("/{recordId}/lecturer_approval")
    @PreAuthorize("hasRole('GIANG_VIEN')")
    public ApiResponse<HoSoResponse> lecturerApproval(@PathVariable Long recordId, @Valid @RequestBody QuyetDinhRequest req) {
        return ApiResponse.ok(hoSoService.pheDuyet(recordId, req), "Đã ghi nhận quyết định của GVHD");
    }

    /** #47 */
    @PutMapping("/{recordId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<HoSoResponse> changeStatus(@PathVariable Long recordId, @Valid @RequestBody DoiTrangThaiHoSoRequest req) {
        return ApiResponse.ok(hoSoService.doiTrangThaiGianDoan(recordId, req), "Đã cập nhật trạng thái hồ sơ");
    }
}
