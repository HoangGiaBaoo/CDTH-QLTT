package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.assignment.DoiGvhdRequest;
import org.example.cdthqltt.dto.assignment.PhanCongRequest;
import org.example.cdthqltt.dto.assignment.PhanCongResponse;
import org.example.cdthqltt.dto.assignment.UngVienPhanCongResponse;
import org.example.cdthqltt.service.PhanCongService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC05 — #48 … #51. */
@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class PhanCongController {

    private final PhanCongService phanCongService;

    /** #48 */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','SINH_VIEN')")
    public ApiResponse<List<PhanCongResponse>> list(@RequestParam(required = false) Long termId) {
        return ApiResponse.ok(phanCongService.danhSach(termId));
    }

    /** #49 */
    @GetMapping("/candidates")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UngVienPhanCongResponse> candidates(@RequestParam(required = false) Long termId) {
        return ApiResponse.ok(phanCongService.ungVien(termId));
    }

    /** #50 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PhanCongResponse>> create(@Valid @RequestBody PhanCongRequest req) {
        List<PhanCongResponse> kq = phanCongService.phanCongHangLoat(req);
        return ApiResponse.ok(kq, "Đã phân công " + kq.size() + " sinh viên");
    }

    /** #51 */
    @PutMapping("/{assignmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PhanCongResponse> update(@PathVariable Long assignmentId, @Valid @RequestBody DoiGvhdRequest req) {
        return ApiResponse.ok(phanCongService.doiGvhd(assignmentId, req), "Đã đổi giảng viên hướng dẫn");
    }
}
