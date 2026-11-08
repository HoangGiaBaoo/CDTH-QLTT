package org.example.cdthqltt.dto.auth;

import java.security.SecureRandom;

/** Chính sách mật khẩu (UC01): tối thiểu 8 ký tự, có cả chữ và số. */
public final class MatKhauPolicy {

    public static final String MAU = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$";
    public static final String THONG_DIEP = "Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số";

    private static final String CHU = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String SO = "23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private MatKhauPolicy() {
    }

    public static boolean hopLe(String matKhau) {
        return matKhau != null && matKhau.matches(MAU);
    }

    /** Sinh mật khẩu ban đầu 10 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I). */
    public static String sinhNgauNhien() {
        StringBuilder sb = new StringBuilder();
        String tatCa = CHU + SO;
        for (int i = 0; i < 8; i++) {
            sb.append(tatCa.charAt(RANDOM.nextInt(tatCa.length())));
        }
        sb.append(CHU.charAt(RANDOM.nextInt(CHU.length())));
        sb.append(SO.charAt(RANDOM.nextInt(SO.length())));
        return sb.toString();
    }
}
