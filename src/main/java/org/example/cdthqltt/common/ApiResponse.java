package org.example.cdthqltt.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Vỏ chuẩn của mọi phản hồi, kể cả 401/403 sinh ra trong filter. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, String code, String message, T data, List<LoiTruong> errors) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", null, data, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, "OK", message, data, null);
    }

    public static ApiResponse<Void> thanhCong(String message) {
        return new ApiResponse<>(true, "OK", message, null, null);
    }

    public static ApiResponse<Void> loi(ErrorCode code, String message) {
        return new ApiResponse<>(false, code.name(), message, null, null);
    }

    public static ApiResponse<Void> loi(ErrorCode code, String message, List<LoiTruong> errors) {
        return new ApiResponse<>(false, code.name(), message, null, errors);
    }
}
