package org.example.cdthqltt.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.common.ApiResponse;
import org.example.cdthqltt.common.ErrorCode;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** 401/403 sinh ra trong filter không đi qua @RestControllerAdvice — ghi cùng cấu trúc ApiResponse ở đây. */
@Component
@RequiredArgsConstructor
public class JsonSecurityHandlers {

    private final JsonMapper jsonMapper;

    public AuthenticationEntryPoint entryPoint() {
        return (request, response, ex) -> ghi(response, ErrorCode.UNAUTHORIZED,
                "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> ghi(response, ErrorCode.ACCESS_DENIED,
                "Bạn không có quyền thực hiện thao tác này");
    }

    private void ghi(HttpServletResponse response, ErrorCode code, String message) throws IOException {
        response.setStatus(code.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(jsonMapper.writeValueAsString(ApiResponse.loi(code, message)));
    }
}
