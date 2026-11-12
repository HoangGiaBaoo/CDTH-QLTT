import axios, { AxiosError } from 'axios';
import type { ApiResponse, LoiTruong } from '../types/api';

export const KHOA_TOKEN = 'qltt_token';

/** Lỗi đã chuẩn hóa từ ApiResponse — component hiển thị nguyên văn `message` (đã là tiếng Việt, có trích điều khoản). */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly errors: LoiTruong[] = [],
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Lỗi trường theo tên trường, để gắn dưới từng ô nhập khi VALIDATION_ERROR. */
  loiTruong(truong: string): string | undefined {
    return this.errors.find((e) => e.truong === truong)?.thongDiep;
  }
}

/** Client axios DUY NHẤT của ứng dụng — không gọi axios trực tiếp trong component. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  timeout: 30000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(KHOA_TOKEN);
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiResponse<unknown>>) => {
    const status = err.response?.status;
    const body = err.response?.data;
    // Sai mật khẩu cũng trả 401 — chỉ đẩy về trang đăng nhập khi phiên hết hạn, không phải lúc đang đăng nhập.
    const laDangNhap = err.config?.url?.endsWith('/auth/login');
    if (status === 401 && !laDangNhap) {
      localStorage.removeItem(KHOA_TOKEN);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?hetPhien=1';
      }
    }
    if (!err.response) {
      return Promise.reject(new ApiError('INTERNAL_ERROR', 'Không kết nối được máy chủ, vui lòng thử lại'));
    }
    return Promise.reject(
      new ApiError(body?.code ?? 'INTERNAL_ERROR', body?.message ?? 'Đã xảy ra lỗi máy chủ', body?.errors ?? [], status),
    );
  },
);

/** Lấy `data` từ ApiResponse — dùng trong mọi hàm của api/<module>.ts. */
export function layData<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data as T;
}

/** Như layData nhưng giữ cả `message` thành công (ví dụ "Đã tạo đợt và nạp cấu hình…") để hiện cho người dùng. */
export function layPhanHoi<T>(res: { data: ApiResponse<T> }): { data: T; message?: string } {
  return { data: res.data.data as T, message: res.data.message };
}
