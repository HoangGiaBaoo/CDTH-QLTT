package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.panel.CapNhatToRequest;
import org.example.cdthqltt.dto.panel.TaoToRequest;
import org.example.cdthqltt.dto.panel.ToDanhGiaResponse;
import org.example.cdthqltt.dto.panel.VangMatRequest;
import org.example.cdthqltt.service.ToDanhGiaService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC09 — #77 … #81. */
@RestController
@RequestMapping("/api/panels")
@RequiredArgsConstructor
public class ToDanhGiaController {

    private final ToDanhGiaService toService;

    /** #77 */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<List<ToDanhGiaResponse>> list(@RequestParam(required = false) Long termId) {
        return ApiResponse.ok(toService.danhSach(termId));
    }

    /** #78 */
    @GetMapping("/{panelId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ToDanhGiaResponse> get(@PathVariable Long panelId) {
        return ApiResponse.ok(toService.chiTiet(panelId));
    }

    /** #79 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ToDanhGiaResponse> create(@Valid @RequestBody TaoToRequest req) {
        return ApiResponse.ok(toService.thanhLap(req), "Đã thành lập Tổ đánh giá");
    }

    /** #80 */
    @PutMapping("/{panelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ToDanhGiaResponse> update(@PathVariable Long panelId, @Valid @RequestBody CapNhatToRequest req) {
        return ApiResponse.ok(toService.capNhat(panelId, req), "Đã cập nhật Tổ đánh giá");
    }

    /** #81 */
    @PutMapping("/{panelId}/members/{memberId}/absence")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ToDanhGiaResponse> absence(@PathVariable Long panelId, @PathVariable Long memberId,
                                                  @Valid @RequestBody VangMatRequest req) {
        ToDanhGiaResponse kq = toService.doiVangMat(panelId, memberId, req);
        return ApiResponse.ok(kq, kq.canhBao().isEmpty() ? "Đã cập nhật thành viên"
                : "Đã cập nhật; thành phần tổ chưa đạt điều kiện, cần bổ sung người thay thế");
    }
}
