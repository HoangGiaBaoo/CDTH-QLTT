package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.feedback.*;
import org.example.cdthqltt.service.PhanHoiService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC12 — phản hồi hai chiều và tự đánh giá CLO #94 … #97. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PhanHoiController {

    private final PhanHoiService phanHoiService;

    /** #94 */
    @GetMapping("/internship_records/{recordId}/feedbacks")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD','SINH_VIEN')")
    public ApiResponse<List<PhanHoiResponse>> list(@PathVariable Long recordId) {
        return ApiResponse.ok(phanHoiService.danhSach(recordId));
    }

    /** #95 */
    @PostMapping("/feedbacks/self_score_preview")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HpSelfResponse> selfScorePreview(@Valid @RequestBody XemTruocHpSelfRequest req) {
        return ApiResponse.ok(phanHoiService.xemTruocHpSelf(req));
    }

    /** #96 */
    @PostMapping("/feedbacks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('CAN_BO_DVHD','SINH_VIEN')")
    public ApiResponse<PhanHoiResponse> send(@Valid @RequestBody GuiPhanHoiRequest req) {
        return ApiResponse.ok(phanHoiService.gui(req), "Đã gửi phiếu phản hồi");
    }

    /** #97 */
    @GetMapping("/feedbacks/{feedbackId}/self_awareness")
    @PreAuthorize("hasAnyRole('SINH_VIEN','GIANG_VIEN')")
    public ApiResponse<TuNhanThucResponse> selfAwareness(@PathVariable Long feedbackId) {
        return ApiResponse.ok(phanHoiService.tuNhanThuc(feedbackId));
    }
}
