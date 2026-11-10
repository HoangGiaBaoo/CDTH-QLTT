import { ApiError } from '../api/client';
import { MA_LOI_CANH_BAO } from '../utils/constants';

/**
 * Hiện nguyên văn message backend. Lỗi nghiệp vụ (hạn mức, khóa, thiếu phiếu…) là cảnh báo vàng; còn lại đỏ.
 * Lỗi từng trường của VALIDATION_ERROR do form tự gắn dưới ô nhập (ApiError.loiTruong).
 */
export default function ErrorAlert({ error }: { error: unknown }) {
  if (!error) return null;
  const e = error instanceof ApiError ? error : new ApiError('INTERNAL_ERROR', 'Đã xảy ra lỗi không xác định');
  const canhBao = MA_LOI_CANH_BAO.has(e.code);
  return (
    <div className={`alert ${canhBao ? 'alert-vang' : 'alert-do'}`} role="alert">
      {e.message}
    </div>
  );
}
