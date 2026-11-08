package org.example.cdthqltt.security;

import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CurrentUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CurrentUser user)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }
        return user;
    }

    /** Dùng cho tác vụ chạy nền (lịch mở chặng) — không có người dùng thì trả null. */
    public static CurrentUser currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof CurrentUser user ? user : null;
    }
}
