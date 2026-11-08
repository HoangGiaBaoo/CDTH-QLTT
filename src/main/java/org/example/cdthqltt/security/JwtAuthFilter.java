package org.example.cdthqltt.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.cdthqltt.entity.NguoiDung;
import org.example.cdthqltt.entity.enums.VaiTro;
import org.example.cdthqltt.repository.CanBoDvhdRepository;
import org.example.cdthqltt.repository.GiangVienRepository;
import org.example.cdthqltt.repository.NguoiDungRepository;
import org.example.cdthqltt.repository.SinhVienRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Đọc "Authorization: Bearer ..." và dựng {@link CurrentUser}. Token hỏng/hết hạn thì bỏ qua —
 * request đi tiếp như ẩn danh và bị {@code JsonAuthEntryPoint} trả 401 nếu endpoint cần đăng nhập.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String TIEN_TO = "Bearer ";

    private final JwtService jwtService;
    private final NguoiDungRepository nguoiDungRepo;
    private final SinhVienRepository sinhVienRepo;
    private final GiangVienRepository giangVienRepo;
    private final CanBoDvhdRepository canBoRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(TIEN_TO)) {
            jwtService.doc(header.substring(TIEN_TO.length()).trim())
                    .flatMap(this::dungNguoiDung)
                    .ifPresent(user -> {
                        var auth = new UsernamePasswordAuthenticationToken(user, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.vaiTro().name())));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
        }
        chain.doFilter(request, response);
    }

    private Optional<CurrentUser> dungNguoiDung(Claims claims) {
        Long id;
        try {
            id = Long.valueOf(claims.getSubject());
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
        return nguoiDungRepo.findById(id)
                // Tài khoản bị vô hiệu hóa thì token cũ cũng bị từ chối; đổi mật khẩu thì token cũ hết hiệu lực.
                .filter(NguoiDung::dangHoatDong)
                .filter(n -> jwtService.khopMatKhau(claims, n))
                .map(this::sangCurrentUser);
    }

    private CurrentUser sangCurrentUser(NguoiDung n) {
        VaiTro vt = n.getVaiTro();
        Long sinhVienId = vt == VaiTro.SINH_VIEN ? sinhVienRepo.findByNguoiDungId(n.getId()).map(s -> s.getId()).orElse(null) : null;
        Long giangVienId = vt == VaiTro.GIANG_VIEN ? giangVienRepo.findByNguoiDungId(n.getId()).map(g -> g.getId()).orElse(null) : null;
        Long canBoId = vt == VaiTro.CAN_BO_DVHD ? canBoRepo.findByNguoiDungId(n.getId()).map(c -> c.getId()).orElse(null) : null;
        return new CurrentUser(n.getId(), vt, sinhVienId, giangVienId, canBoId);
    }
}
