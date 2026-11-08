package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.assessment.*;
import org.example.cdthqltt.entity.enums.TrangThaiPhieu;
import org.example.cdthqltt.service.PhieuDanhGiaService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC08 / UC09 — phiếu đánh giá #69 … #76. */
@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class PhieuDanhGiaController {

    private final PhieuDanhGiaService phieuService;

    /** #69 */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<List<PhieuResponse>> list(@RequestParam(required = false) Long termId,
                                                 @RequestParam(required = false) Integer stage,
                                                 @RequestParam(required = false) TrangThaiPhieu status) {
        return ApiResponse.ok(phieuService.danhSach(termId, stage, status));
    }

    /** #70 */
    @GetMapping("/form")
    @PreAuthorize("hasAnyRole('GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<BieuMauResponse> form(@RequestParam Long recordId, @RequestParam Integer stage) {
        return ApiResponse.ok(phieuService.bieuMau(recordId, stage));
    }

    /** #76 — khai báo trước /{assessmentId} cho dễ đọc; Spring vẫn ưu tiên đường dẫn tĩnh. */
    @GetMapping("/deviation_warnings")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<CanhBaoLechResponse>> deviationWarnings(@RequestParam(required = false) Long termId) {
        return ApiResponse.ok(phieuService.canhBaoLech(termId));
    }

    /** #71 */
    @GetMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<PhieuResponse> get(@PathVariable Long assessmentId) {
        return ApiResponse.ok(phieuService.chiTiet(assessmentId));
    }

    /** #72 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<PhieuResponse> create(@Valid @RequestBody TaoPhieuRequest req) {
        return ApiResponse.ok(phieuService.tao(req), "Đã lưu nháp phiếu đánh giá");
    }

    /** #73 */
    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<PhieuResponse> update(@PathVariable Long assessmentId, @Valid @RequestBody CapNhatPhieuRequest req) {
        return ApiResponse.ok(phieuService.capNhat(assessmentId, req), "Đã lưu nháp phiếu đánh giá");
    }

    /** #74 */
    @PutMapping("/{assessmentId}/submit")
    @PreAuthorize("hasAnyRole('GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<PhieuResponse> submit(@PathVariable Long assessmentId) {
        return ApiResponse.ok(phieuService.nop(assessmentId), "Đã nộp phiếu, phiếu đã được khóa");
    }

    /** #75 */
    @PutMapping("/{assessmentId}/reopen")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PhieuResponse> reopen(@PathVariable Long assessmentId, @Valid @RequestBody MoLaiPhieuRequest req) {
        return ApiResponse.ok(phieuService.moLai(assessmentId, req), "Đã mở lại phiếu cho người chấm sửa");
    }
}
