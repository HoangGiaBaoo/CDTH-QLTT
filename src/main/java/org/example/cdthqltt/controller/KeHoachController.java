package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.studyplan.CapNhatKeHoachRequest;
import org.example.cdthqltt.dto.studyplan.KeHoachResponse;
import org.example.cdthqltt.service.KeHoachService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** UC06 — #52 … #56. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KeHoachController {

    private final KeHoachService keHoachService;

    /** #52 */
    @GetMapping("/internship_records/{recordId}/study_plan")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<KeHoachResponse> get(@PathVariable Long recordId) {
        return ApiResponse.ok(keHoachService.theoHoSo(recordId));
    }

    /** #53 */
    @PutMapping("/study_plans/{planId}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<KeHoachResponse> update(@PathVariable Long planId, @Valid @RequestBody CapNhatKeHoachRequest req) {
        return ApiResponse.ok(keHoachService.capNhat(planId, req), "Đã lưu kế hoạch");
    }

    /** #54 */
    @PutMapping("/study_plans/{planId}/submit")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<KeHoachResponse> submit(@PathVariable Long planId) {
        KeHoachResponse kq = keHoachService.guiXacNhan(planId);
        return ApiResponse.ok(kq, Boolean.TRUE.equals(kq.nopMuon())
                ? "Đã gửi kế hoạch — quá hạn 5 ngày làm việc nên được gắn nhãn Nộp muộn"
                : "Đã gửi kế hoạch, chờ ĐVHD và GVHD xác nhận");
    }

    /** #55 */
    @PutMapping("/study_plans/{planId}/confirmation")
    @PreAuthorize("hasAnyRole('CAN_BO_DVHD','GIANG_VIEN')")
    public ApiResponse<KeHoachResponse> confirm(@PathVariable Long planId) {
        return ApiResponse.ok(keHoachService.xacNhan(planId), "Đã xác nhận kế hoạch");
    }

    /** #56 */
    @PutMapping("/study_plans/{planId}/reopen")
    @PreAuthorize("hasRole('GIANG_VIEN')")
    public ApiResponse<KeHoachResponse> reopen(@PathVariable Long planId) {
        return ApiResponse.ok(keHoachService.moLai(planId), "Đã mở lại kế hoạch cho sinh viên sửa");
    }
}
