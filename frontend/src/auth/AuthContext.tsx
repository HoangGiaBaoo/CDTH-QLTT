import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { KHOA_TOKEN } from '../api/client';
import type { NguoiDung } from '../types/auth';

interface AuthState {
  /** null khi chưa đăng nhập. */
  nguoiDung: NguoiDung | null;
  /** true trong lúc đọc lại phiên từ token đã lưu (#2). */
  dangTai: boolean;
  dangNhap: (tenDangNhap: string, matKhau: string) => Promise<NguoiDung>;
  dangXuat: () => void;
  /** Gọi lại #2 sau khi đổi hồ sơ cá nhân. */
  taiLai: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Lưu JWT (hạn 8 giờ) trong localStorage và thông tin người dùng hiện tại. Vai trò chỉ dùng để ẩn/hiện menu —
 * backend vẫn kiểm cả vai trò lẫn quyền sở hữu dữ liệu.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(null);
  const [dangTai, setDangTai] = useState(() => localStorage.getItem(KHOA_TOKEN) !== null);

  const taiLai = useCallback(async () => {
    try {
      setNguoiDung(await authApi.layThongTinToi());
    } catch {
      // Token hết hạn hoặc tài khoản bị vô hiệu hóa (filter từ chối token cũ) ⇒ coi như chưa đăng nhập.
      localStorage.removeItem(KHOA_TOKEN);
      setNguoiDung(null);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(KHOA_TOKEN)) {
      taiLai().finally(() => setDangTai(false));
    }
  }, [taiLai]);

  const dangNhap = useCallback(async (tenDangNhap: string, matKhau: string) => {
    const kq = await authApi.dangNhap({ tenDangNhap, matKhau });
    localStorage.setItem(KHOA_TOKEN, kq.token);
    setNguoiDung(kq.nguoiDung);
    return kq.nguoiDung;
  }, []);

  const dangXuat = useCallback(() => {
    localStorage.removeItem(KHOA_TOKEN);
    setNguoiDung(null);
  }, []);

  const value = useMemo(() => ({ nguoiDung, dangTai, dangNhap, dangXuat, taiLai }),
    [nguoiDung, dangTai, dangNhap, dangXuat, taiLai]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider');
  return ctx;
}
