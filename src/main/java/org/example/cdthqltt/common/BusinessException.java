package org.example.cdthqltt.common;

import lombok.Getter;

/**
 * Lỗi nghiệp vụ có mã chuẩn. {@code message} hiển thị thẳng lên giao diện nên viết tiếng Việt có dấu;
 * với BUSINESS_RULE_VIOLATION kèm trích điều khoản Quy định.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode code;

    public BusinessException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public static BusinessException khongTimThay(String doiTuong) {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy " + doiTuong);
    }

    public static BusinessException khongCoQuyen() {
        return new BusinessException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền thực hiện thao tác này");
    }
}
