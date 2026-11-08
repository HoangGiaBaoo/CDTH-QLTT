package org.example.cdthqltt.controller;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.report.BaoCaoResponse;
import org.example.cdthqltt.service.BaoCaoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** UC11 — #89 … #93. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BaoCaoController {

    private final BaoCaoService baoCaoService;

    /** #89 */
    @GetMapping("/internship_records/{recordId}/reports")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<BaoCaoResponse>> list(@PathVariable Long recordId) {
        return ApiResponse.ok(baoCaoService.danhSach(recordId));
    }

    /** #90 — {@code checklistConfirmed}: SV đã tích đủ sáu phần của mẫu TTTN-06. */
    @PostMapping(value = "/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<BaoCaoResponse> submit(@RequestParam Long recordId,
                                              @RequestParam(defaultValue = "false") boolean checklistConfirmed,
                                              @RequestParam("file") MultipartFile file) {
        BaoCaoResponse kq = baoCaoService.nop(recordId, checklistConfirmed, file);
        return ApiResponse.ok(kq, kq.nopMuon()
                ? "Đã nộp báo cáo — nộp muộn " + kq.soNgayTre() + " ngày so với hạn của đợt"
                : "Đã nộp báo cáo, chờ ĐVHD và GVHD xác nhận");
    }

    /** #91 */
    @GetMapping("/reports/{reportId}/file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable Long reportId) {
        return baoCaoService.taiVe(reportId);
    }

    /** #92 */
    @PutMapping("/reports/{reportId}/confirmation")
    @PreAuthorize("hasAnyRole('CAN_BO_DVHD','GIANG_VIEN')")
    public ApiResponse<BaoCaoResponse> confirm(@PathVariable Long reportId) {
        BaoCaoResponse kq = baoCaoService.xacNhan(reportId);
        return ApiResponse.ok(kq, kq.daDuXacNhan()
                ? "Báo cáo đã đủ hai xác nhận, hồ sơ chuyển Chờ đánh giá cuối kỳ" : "Đã xác nhận báo cáo");
    }

    /** #93 */
    @PutMapping("/reports/{reportId}/reopen")
    @PreAuthorize("hasRole('GIANG_VIEN')")
    public ApiResponse<BaoCaoResponse> reopen(@PathVariable Long reportId) {
        return ApiResponse.ok(baoCaoService.moLai(reportId), "Đã mở lại báo cáo cho sinh viên nộp phiên bản mới");
    }
}
