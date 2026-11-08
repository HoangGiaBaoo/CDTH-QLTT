package org.example.cdthqltt.controller;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.audit.NhatKyResponse;
import org.example.cdthqltt.service.NhatKyHeThongService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit_logs")
@RequiredArgsConstructor
public class NhatKyHeThongController {

    private final NhatKyHeThongService nhatKyService;

    /** #100 — chỉ đọc. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<NhatKyResponse>> list(
            @RequestParam(required = false) String objectType,
            @RequestParam(required = false) Long objectId,
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.ok(nhatKyService.traCuu(objectType, objectId, actorId, from, to, page, size));
    }
}
