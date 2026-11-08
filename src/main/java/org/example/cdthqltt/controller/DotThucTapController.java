package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.term.*;
import org.example.cdthqltt.entity.enums.HinhThucThucTap;
import org.example.cdthqltt.entity.enums.TrangThaiDot;
import org.example.cdthqltt.service.DotThucTapService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC03 — #26 … #38. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DotThucTapController {

    private final DotThucTapService dotService;

    /** #26 */
    @GetMapping("/terms")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<DotResponse>> list(@RequestParam(required = false) String academicYear,
                                               @RequestParam(required = false) String semester,
                                               @RequestParam(required = false) TrangThaiDot status) {
        return ApiResponse.ok(dotService.danhSach(academicYear, semester, status));
    }

    /** #27 */
    @GetMapping("/terms/{termId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<DotResponse> get(@PathVariable Long termId) {
        return ApiResponse.ok(dotService.chiTiet(termId));
    }

    /** #28 */
    @PostMapping("/terms")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DotResponse> create(@Valid @RequestBody TaoDotRequest req) {
        return ApiResponse.ok(dotService.taoDot(req), "Đã tạo đợt và nạp cấu hình 7 CLO, 35 mức rubric, 13 câu hỏi");
    }

    /** #29 */
    @PutMapping("/terms/{termId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DotResponse> update(@PathVariable Long termId, @Valid @RequestBody CapNhatDotRequest req) {
        return ApiResponse.ok(dotService.capNhat(termId, req), "Đã cập nhật đợt");
    }

    /** #30 */
    @PutMapping("/terms/{termId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DotResponse> changeStatus(@PathVariable Long termId, @Valid @RequestBody DoiTrangThaiDotRequest req) {
        return ApiResponse.ok(dotService.doiTrangThai(termId, req.trangThai()), "Đã chuyển trạng thái đợt");
    }

    /** #31 */
    @GetMapping("/terms/{termId}/stages")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ChangResponse>> listStages(@PathVariable Long termId) {
        return ApiResponse.ok(dotService.danhSachChang(termId));
    }

    /** #32 */
    @PutMapping("/stages/{stageId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ChangResponse> changeStageStatus(@PathVariable Long stageId,
                                                        @Valid @RequestBody DoiTrangThaiChangRequest req) {
        return ApiResponse.ok(dotService.doiTrangThaiChang(stageId, req.trangThai()), "Đã cập nhật trạng thái chặng");
    }

    /** #33 */
    @GetMapping("/terms/{termId}/clos")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<CloResponse>> listClos(@PathVariable Long termId) {
        return ApiResponse.ok(dotService.danhSachClo(termId));
    }

    /** #34 — trả toàn bộ 7 CLO sau khi sửa để giao diện vẽ lại bảng. */
    @PutMapping("/clos/{cloId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<CloResponse>> updateClo(@PathVariable Long cloId, @Valid @RequestBody CapNhatCloRequest req) {
        return ApiResponse.ok(dotService.capNhatClo(cloId, req), "Đã cập nhật trọng số");
    }

    /** #35 */
    @GetMapping("/clos/{cloId}/rubric_levels")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<MucRubricResponse>> listRubricLevels(@PathVariable Long cloId) {
        return ApiResponse.ok(dotService.danhSachMucRubric(cloId));
    }

    /** #36 */
    @PutMapping("/rubric_levels/{levelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MucRubricResponse> updateRubricLevel(@PathVariable Long levelId,
                                                            @Valid @RequestBody CapNhatMucRubricRequest req) {
        return ApiResponse.ok(dotService.capNhatMucRubric(levelId, req), "Đã cập nhật mô tả hành vi");
    }

    /** #37 */
    @GetMapping("/stages/{stageId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<List<CauHoiResponse>> listQuestions(@PathVariable Long stageId) {
        return ApiResponse.ok(dotService.danhSachCauHoi(stageId));
    }

    /** #38 */
    @GetMapping("/required_evidence_types")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<LoaiMinhChungResponse>> listRequiredEvidenceTypes(
            @RequestParam(required = false) HinhThucThucTap internshipType) {
        return ApiResponse.ok(dotService.danhMucMinhChung(internshipType));
    }
}
