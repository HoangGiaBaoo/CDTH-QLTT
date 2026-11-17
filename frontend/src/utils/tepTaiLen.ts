import { dungLuong } from './format';

/**
 * Kiểm tệp trước khi tải lên (minh chứng #66, báo cáo #90) — giống `FileStorageService.KICH_THUOC_TOI_DA` (CBR-24).
 * Chỉ để báo sớm, không tải 20 MB lên rồi mới biết; backend vẫn kiểm lại cả đuôi lẫn content-type.
 */
export const TOI_DA_TEP = 20 * 1024 * 1024;

/** Lỗi về chính tệp — hiện dưới ô chọn tệp thay vì hộp lỗi chung. */
export const LOI_TEP = new Set(['FILE_TOO_LARGE', 'UNSUPPORTED_FILE_TYPE']);

export function duoiTep(ten: string): string {
  const i = ten.lastIndexOf('.');
  return i < 0 ? '' : ten.slice(i + 1).toLowerCase();
}

/** Thông điệp lỗi của tệp, hoặc `undefined` khi tệp qua được lần kiểm ở client. */
export function kiemTep(f: File, duoiChoPhep: string[], moTaDuoi = duoiChoPhep.join(', ')): string | undefined {
  if (f.size === 0) return 'Tệp rỗng, hãy chọn tệp khác.';
  if (f.size > TOI_DA_TEP) return `Tệp nặng ${dungLuong(f.size)}, vượt quá 20 MB.`;
  const duoi = duoiTep(f.name);
  if (!duoiChoPhep.includes(duoi)) {
    return `Định dạng ${duoi ? `.${duoi}` : 'không có đuôi'} không được hỗ trợ, chỉ nhận ${moTaDuoi}.`;
  }
  return undefined;
}
