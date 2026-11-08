package org.example.cdthqltt.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.cdthqltt.entity.NguoiDung;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

/** Phát hành và kiểm JWT HS256, hạn 8 giờ; payload gồm id người dùng và vai trò. */
@Service
public class JwtService {

    static final String CLAIM_VAI_TRO = "vaiTro";
    /** Dấu vân tay mật khẩu: đổi/đặt lại mật khẩu thì token cũ tự mất hiệu lực (buộc đăng nhập lại, #4). */
    static final String CLAIM_DAU_MAT_KHAU = "mk";

    private final SecretKey khoa;
    private final long soGioHieuLuc;

    public JwtService(@Value("${app.jwt.secret}") String biMat,
                      @Value("${app.jwt.expiration-hours:8}") long soGioHieuLuc) {
        if (biMat == null || biMat.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret phải dài ít nhất 32 byte (đặt biến môi trường JWT_SECRET)");
        }
        this.khoa = Keys.hmacShaKeyFor(biMat.getBytes(StandardCharsets.UTF_8));
        this.soGioHieuLuc = soGioHieuLuc;
    }

    public record TokenDaPhat(String token, Instant hetHan) {
    }

    public TokenDaPhat phatHanh(NguoiDung nguoiDung) {
        Instant now = Instant.now();
        Instant hetHan = now.plus(soGioHieuLuc, ChronoUnit.HOURS);
        String token = Jwts.builder()
                .subject(String.valueOf(nguoiDung.getId()))
                .claim(CLAIM_VAI_TRO, nguoiDung.getVaiTro().name())
                .claim(CLAIM_DAU_MAT_KHAU, dauMatKhau(nguoiDung.getMatKhauHash()))
                .issuedAt(Date.from(now))
                .expiration(Date.from(hetHan))
                .signWith(khoa, Jwts.SIG.HS256)
                .compact();
        return new TokenDaPhat(token, hetHan);
    }

    /** Trả claims nếu token hợp lệ và chưa hết hạn; sai chữ ký / hết hạn ⇒ rỗng. */
    public Optional<Claims> doc(String token) {
        try {
            return Optional.of(Jwts.parser().verifyWith(khoa).build().parseSignedClaims(token).getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public boolean khopMatKhau(Claims claims, NguoiDung nguoiDung) {
        return dauMatKhau(nguoiDung.getMatKhauHash()).equals(claims.get(CLAIM_DAU_MAT_KHAU, String.class));
    }

    private static String dauMatKhau(String matKhauHash) {
        try {
            byte[] bam = MessageDigest.getInstance("SHA-256").digest(matKhauHash.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bam, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
