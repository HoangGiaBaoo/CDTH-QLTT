package org.example.cdthqltt.controller;

import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.notification.ThongBaoResponse;
import org.example.cdthqltt.service.ThongBaoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    /** #101 */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<ThongBaoResponse>> list(@RequestParam(defaultValue = "false") boolean unread,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.ok(thongBaoService.cuaToi(unread, page, size));
    }

    /** #102 */
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ThongBaoResponse> read(@PathVariable Long notificationId) {
        return ApiResponse.ok(thongBaoService.danhDauDaDoc(notificationId));
    }
}
