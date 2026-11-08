package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.hostorg.*;
import org.example.cdthqltt.entity.enums.TrangThaiPheDuyet;
import org.example.cdthqltt.service.DonViHuongDanService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC02 — #17 … #25. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DonViHuongDanController {

    private final DonViHuongDanService donViService;

    /** #17 */
    @GetMapping("/host_organizations")
    @PreAuthorize("hasAnyRole('ADMIN','SINH_VIEN')")
    public ApiResponse<List<DonViResponse>> list(@RequestParam(required = false) TrangThaiPheDuyet status,
                                                 @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(donViService.danhSach(status, keyword));
    }

    /** #18 */
    @GetMapping("/host_organizations/{orgId}")
    @PreAuthorize("hasAnyRole('ADMIN','CAN_BO_DVHD','SINH_VIEN')")
    public ApiResponse<DonViResponse> get(@PathVariable Long orgId) {
        return ApiResponse.ok(donViService.chiTiet(orgId));
    }

    /** #19 */
    @PostMapping("/host_organizations")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SINH_VIEN')")
    public ApiResponse<DonViResponse> create(@Valid @RequestBody DonViRequest req) {
        return ApiResponse.ok(donViService.tao(req), "Đã ghi nhận đơn vị, chờ giáo vụ phê duyệt");
    }

    /** #20 */
    @PutMapping("/host_organizations/{orgId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DonViResponse> update(@PathVariable Long orgId, @Valid @RequestBody DonViRequest req) {
        return ApiResponse.ok(donViService.capNhat(orgId, req), "Đã cập nhật đơn vị");
    }

    /** #21 */
    @PutMapping("/host_organizations/{orgId}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PheDuyetDonViResponse> approval(@PathVariable Long orgId, @Valid @RequestBody PheDuyetDonViRequest req) {
        return ApiResponse.ok(donViService.pheDuyet(orgId, req), "Đã cập nhật trạng thái phê duyệt");
    }

    /** #22 */
    @DeleteMapping("/host_organizations/{orgId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long orgId) {
        donViService.xoa(orgId);
        return ApiResponse.thanhCong("Đã xóa đơn vị");
    }

    /** #23 */
    @GetMapping("/host_organizations/{orgId}/supervisors")
    @PreAuthorize("hasAnyRole('ADMIN','SINH_VIEN')")
    public ApiResponse<List<CanBoResponse>> listSupervisors(@PathVariable Long orgId) {
        return ApiResponse.ok(donViService.danhSachCanBo(orgId));
    }

    /** #24 */
    @PostMapping("/host_organizations/{orgId}/supervisors")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CanBoResponse> addSupervisor(@PathVariable Long orgId, @Valid @RequestBody ThemCanBoRequest req) {
        return ApiResponse.ok(donViService.themCanBo(orgId, req), "Đã thêm cán bộ hướng dẫn");
    }

    /** #25 */
    @PutMapping("/supervisors/{supervisorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CanBoResponse> updateSupervisor(@PathVariable Long supervisorId,
                                                       @Valid @RequestBody CapNhatCanBoRequest req) {
        return ApiResponse.ok(donViService.capNhatCanBo(supervisorId, req), "Đã cập nhật cán bộ hướng dẫn");
    }
}
