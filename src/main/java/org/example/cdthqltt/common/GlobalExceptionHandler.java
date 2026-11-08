package org.example.cdthqltt.common;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

/** Ánh xạ mọi ngoại lệ về {@link ApiResponse} với 15 mã lỗi chuẩn; không trả stacktrace ra ngoài. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> nghiepVu(BusinessException ex) {
        return tra(ex.getCode(), ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> duLieuNhap(MethodArgumentNotValidException ex) {
        List<LoiTruong> loi = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new LoiTruong(f.getField(), thongDiep(f)))
                .toList();
        return tra(ErrorCode.VALIDATION_ERROR, "Dữ liệu nhập không hợp lệ", loi);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> rangBuoc(ConstraintViolationException ex) {
        List<LoiTruong> loi = ex.getConstraintViolations().stream()
                .map(v -> new LoiTruong(v.getPropertyPath().toString(), v.getMessage()))
                .toList();
        return tra(ErrorCode.VALIDATION_ERROR, "Dữ liệu nhập không hợp lệ", loi);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ApiResponse<Void>> saiDinhDang(Exception ex) {
        return tra(ErrorCode.VALIDATION_ERROR, "Yêu cầu sai định dạng hoặc thiếu tham số", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> khongCoQuyen(AccessDeniedException ex) {
        return tra(ErrorCode.ACCESS_DENIED, "Bạn không có quyền thực hiện thao tác này", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> chuaXacThuc(AuthenticationException ex) {
        return tra(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn", null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> tepQuaLon(MaxUploadSizeExceededException ex) {
        return tra(ErrorCode.FILE_TOO_LARGE, "Tệp vượt quá 20 MB (CBR-24)", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> trungDuLieu(DataIntegrityViolationException ex) {
        // Lỗi UNIQUE/FK lọt qua bước kiểm ở service (thường do hai request đồng thời).
        log.warn("Vi phạm ràng buộc CSDL: {}", ex.getMostSpecificCause().getMessage());
        return tra(ErrorCode.DUPLICATE_RESOURCE, "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc", null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> khongCoDuongDan(NoResourceFoundException ex) {
        return tra(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đường dẫn", null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> saiPhuongThuc(HttpRequestMethodNotSupportedException ex) {
        return tra(ErrorCode.VALIDATION_ERROR, "Phương thức HTTP không được hỗ trợ", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> khac(Exception ex) {
        log.error("Lỗi không mong đợi", ex);
        return tra(ErrorCode.INTERNAL_ERROR, "Đã có lỗi hệ thống, vui lòng thử lại", null);
    }

    private static String thongDiep(FieldError f) {
        return f.getDefaultMessage() != null ? f.getDefaultMessage() : "Giá trị không hợp lệ";
    }

    private static ResponseEntity<ApiResponse<Void>> tra(ErrorCode code, String message, List<LoiTruong> loi) {
        return ResponseEntity.status(code.getHttpStatus()).body(ApiResponse.loi(code, message, loi));
    }
}
