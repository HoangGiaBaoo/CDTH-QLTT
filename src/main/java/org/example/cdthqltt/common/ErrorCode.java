package org.example.cdthqltt.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 15 mã lỗi chuẩn của QLTT (BCPT mục 7, docs/01-nghiep-vu.md mục 3). */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST),
    BUSINESS_RULE_VIOLATION(HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT),
    RESOURCE_IN_USE(HttpStatus.CONFLICT),
    RESOURCE_LOCKED(HttpStatus.CONFLICT),
    QUOTA_EXCEEDED(HttpStatus.CONFLICT),
    THIEU_PHIEU_DVHD(HttpStatus.CONFLICT),
    THIEU_PHIEU_GVHD(HttpStatus.CONFLICT),
    CLO_CHUA_DUOC_DANH_GIA(HttpStatus.CONFLICT),
    FILE_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE),
    UNSUPPORTED_FILE_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus httpStatus;
}
