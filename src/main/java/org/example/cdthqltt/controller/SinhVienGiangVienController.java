package org.example.cdthqltt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.common.PageResponse;
import org.example.cdthqltt.dto.user.CapNhatGiangVienRequest;
import org.example.cdthqltt.dto.user.CapNhatSinhVienRequest;
import org.example.cdthqltt.dto.user.GiangVienResponse;
import org.example.cdthqltt.dto.user.SinhVienResponse;
import org.example.cdthqltt.service.SinhVienGiangVienService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SinhVienGiangVienController {

    private final SinhVienGiangVienService service;

    /** #11 */
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN','CAN_BO_DVHD')")
    public ApiResponse<PageResponse<SinhVienResponse>> listStudents(@RequestParam(required = false) String keyword,
                                                                    @RequestParam(required = false) String className,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.ok(service.danhSachSinhVien(keyword, className, page, size));
    }

    /** #12 */
    @GetMapping("/students/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SinhVienResponse> getStudent(@PathVariable Long studentId) {
        return ApiResponse.ok(service.chiTietSinhVien(studentId));
    }

    /** #13 */
    @PutMapping("/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SinhVienResponse> updateStudent(@PathVariable Long studentId,
                                                       @Valid @RequestBody CapNhatSinhVienRequest req) {
        return ApiResponse.ok(service.capNhatSinhVien(studentId, req), "Đã cập nhật hồ sơ sinh viên");
    }

    /** #14 */
    @GetMapping("/lecturers")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<GiangVienResponse>> listLecturers(@RequestParam(required = false) String keyword,
                                                              @RequestParam(required = false) String department) {
        return ApiResponse.ok(service.danhSachGiangVien(keyword, department));
    }

    /** #15 */
    @GetMapping("/lecturers/{lecturerId}")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN')")
    public ApiResponse<GiangVienResponse> getLecturer(@PathVariable Long lecturerId) {
        return ApiResponse.ok(service.chiTietGiangVien(lecturerId));
    }

    /** #16 */
    @PutMapping("/lecturers/{lecturerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<GiangVienResponse> updateLecturer(@PathVariable Long lecturerId,
                                                         @Valid @RequestBody CapNhatGiangVienRequest req) {
        return ApiResponse.ok(service.capNhatGiangVien(lecturerId, req), "Đã cập nhật hồ sơ giảng viên");
    }
}
