package org.example.cdthqltt.controller;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.stats.BaoCaoThongKeResponse;
import org.example.cdthqltt.service.ThongKeService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** UC13 — báo cáo thống kê toàn đợt #98, #99 (reportType: RP-01 … RP-06). */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    /** #98 */
    @GetMapping("/{reportType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BaoCaoThongKeResponse> get(@PathVariable String reportType,
                                                  @RequestParam(required = false) Long termId) {
        return ApiResponse.ok(thongKeService.lapBaoCao(reportType, termId));
    }

    /** #99 */
    @GetMapping("/{reportType}/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> export(@PathVariable String reportType,
                                           @RequestParam(required = false) Long termId) {
        return thongKeService.xuatExcel(reportType, termId);
    }
}
