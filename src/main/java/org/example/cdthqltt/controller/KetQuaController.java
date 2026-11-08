package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.dto.result.*;
import org.example.cdthqltt.service.KetQuaService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** UC10 — kết quả học phần #82 … #88. */
@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class KetQuaController {

    private final KetQuaService ketQuaService;

    /** #82 */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<List<KetQuaTomTatResponse>> list(@RequestParam(required = false) Long termId) {
        return ApiResponse.ok(ketQuaService.danhSach(termId));
    }

    /** #87 — khai báo trước /{recordId} cho dễ đọc; Spring vẫn ưu tiên đường dẫn tĩnh. */
    @PutMapping("/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CongBoResponse> publish(@RequestBody(required = false) CongBoRequest req) {
        CongBoResponse kq = ketQuaService.congBo(req);
        return ApiResponse.ok(kq, "Đã công bố " + kq.soDaCongBo() + " kết quả: " + kq.soHoanThanh()
                + " hoàn thành, " + kq.soKhongHoanThanh() + " không hoàn thành");
    }

    /** #83 */
    @GetMapping("/{recordId}")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD','SINH_VIEN')")
    public ApiResponse<KetQuaChiTietResponse> get(@PathVariable Long recordId) {
        return ApiResponse.ok(ketQuaService.chiTiet(recordId));
    }

    /** #84 */
    @PostMapping("/{recordId}/calculate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BangTongHopResponse> calculate(@PathVariable Long recordId) {
        return ApiResponse.ok(ketQuaService.chayTinhDiem(recordId), "Đã tính lại điểm học phần");
    }

    /** #85 */
    @PutMapping("/{recordId}/review")
    @PreAuthorize("hasRole('GIANG_VIEN')")
    public ApiResponse<BangTongHopResponse> review(@PathVariable Long recordId, @Valid @RequestBody NhanXetKetQuaRequest req) {
        return ApiResponse.ok(ketQuaService.nhanXet(recordId, req), "Đã lưu nhận xét và đề xuất điểm thưởng");
    }

    /** #86 */
    @PutMapping("/{recordId}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BangTongHopResponse> confirm(@PathVariable Long recordId,
                                                    @Valid @RequestBody(required = false) XacNhanKetQuaRequest req) {
        return ApiResponse.ok(ketQuaService.xacNhan(recordId, req), "Đã xác nhận kết quả học phần");
    }

    /** #88 */
    @GetMapping("/{recordId}/export")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN')")
    public ResponseEntity<Resource> export(@PathVariable Long recordId) {
        return ketQuaService.xuatTTTN07(recordId);
    }
}
