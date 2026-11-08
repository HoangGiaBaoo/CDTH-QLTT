package org.example.cdthqltt.dto.auth;

import org.example.cdthqltt.dto.user.NguoiDungResponse;

import java.time.Instant;

public record DangNhapResponse(String token, Instant hetHan, NguoiDungResponse nguoiDung) {
}
