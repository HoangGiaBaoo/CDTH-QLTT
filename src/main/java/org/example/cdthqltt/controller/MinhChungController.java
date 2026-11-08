package org.example.cdthqltt.controller;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.evidence.DoiChieuResponse;
import org.example.cdthqltt.dto.evidence.MinhChungResponse;
import org.example.cdthqltt.service.MinhChungService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** UC07 — minh chứng #64 … #68. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MinhChungController {

    private final MinhChungService minhChungService;

    /** #64 */
    @GetMapping("/internship_records/{recordId}/evidences")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<MinhChungResponse>> list(@PathVariable Long recordId,
                                                     @RequestParam(required = false) String type,
                                                     @RequestParam(required = false) Integer week) {
        return ApiResponse.ok(minhChungService.danhSach(recordId, type, week));
    }

    /** #65 */
    @GetMapping("/internship_records/{recordId}/evidences/checklist")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<DoiChieuResponse> checklist(@PathVariable Long recordId) {
        return ApiResponse.ok(minhChungService.bangDoiChieu(recordId));
    }

    /** #66 */
    @PostMapping(value = "/evidences", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<MinhChungResponse> upload(@RequestParam Long recordId,
                                                 @RequestParam String type,
                                                 @RequestParam(required = false) Integer week,
                                                 @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(minhChungService.taiLen(recordId, type, week, file), "Đã tải lên minh chứng");
    }

    /** #67 */
    @GetMapping("/evidences/{evidenceId}/file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable Long evidenceId) {
        return minhChungService.taiVe(evidenceId);
    }

    /** #68 */
    @DeleteMapping("/evidences/{evidenceId}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<Void> delete(@PathVariable Long evidenceId) {
        minhChungService.xoa(evidenceId);
        return ApiResponse.thanhCong("Đã xóa minh chứng");
    }
}
