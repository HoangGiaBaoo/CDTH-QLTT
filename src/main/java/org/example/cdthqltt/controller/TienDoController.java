package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.progress.*;
import org.example.cdthqltt.service.TienDoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** UC07 — nhật ký #57 … #60, tiến độ tuần #61 … #63. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TienDoController {

    private final TienDoService tienDoService;

    /** #57 */
    @GetMapping("/internship_records/{recordId}/logbooks")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<NhatKyResponse>> listLogbooks(
            @PathVariable Long recordId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.ok(tienDoService.danhSachNhatKy(recordId, from, to));
    }

    /** #58 */
    @PostMapping("/logbooks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<NhatKyResponse> createLogbook(@Valid @RequestBody NhatKyRequest req) {
        return ApiResponse.ok(tienDoService.ghiNhatKy(req), "Đã ghi nhật ký");
    }

    /** #59 */
    @PutMapping("/logbooks/{logbookId}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<NhatKyResponse> updateLogbook(@PathVariable Long logbookId, @Valid @RequestBody CapNhatNhatKyRequest req) {
        return ApiResponse.ok(tienDoService.suaNhatKy(logbookId, req), "Đã cập nhật nhật ký");
    }

    /** #60 */
    @PostMapping("/logbooks/reminders")
    @PreAuthorize("hasRole('GIANG_VIEN')")
    public ApiResponse<List<NhacNhoResponse>> remind(@RequestBody(required = false) NhacNhoRequest req) {
        List<NhacNhoResponse> kq = tienDoService.nhacNho(req);
        return ApiResponse.ok(kq, kq.isEmpty() ? "Không có sinh viên nào quá 5 ngày chưa ghi nhật ký"
                : "Đã nhắc " + kq.size() + " sinh viên");
    }

    /** #61 */
    @GetMapping("/internship_records/{recordId}/weekly_progress")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<TienDoResponse>> listProgress(@PathVariable Long recordId) {
        return ApiResponse.ok(tienDoService.bangTienDo(recordId));
    }

    /** #62 */
    @PutMapping("/weekly_progress/{progressId}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<TienDoResponse> updateProgress(@PathVariable Long progressId, @Valid @RequestBody CapNhatTienDoRequest req) {
        return ApiResponse.ok(tienDoService.capNhatTienDo(progressId, req), "Đã cập nhật tiến độ tuần");
    }

    /** #63 */
    @PutMapping("/weekly_progress/{progressId}/confirmation")
    @PreAuthorize("hasRole('CAN_BO_DVHD')")
    public ApiResponse<TienDoResponse> confirmProgress(@PathVariable Long progressId, @Valid @RequestBody XacNhanTienDoRequest req) {
        return ApiResponse.ok(tienDoService.xacNhanTuan(progressId, req),
                Boolean.TRUE.equals(req.dongY()) ? "Đã xác nhận tiến độ tuần" : "Đã gửi yêu cầu bổ sung cho sinh viên");
    }
}
