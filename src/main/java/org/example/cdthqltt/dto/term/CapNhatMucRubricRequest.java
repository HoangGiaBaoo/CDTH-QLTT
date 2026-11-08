package org.example.cdthqltt.dto.term;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** #36 — BR-03.7 (Đ12 k3h): chỉ sửa mô tả hành vi, không có trường mức hay khoảng điểm. */
public record CapNhatMucRubricRequest(
        @NotBlank(message = "Vui lòng nhập mô tả hành vi") @Size(max = 2000) String moTaHanhVi) {
}
