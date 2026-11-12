/**
 * Tải tệp từ endpoint có kiểm quyền (#67, #88, #91, #99): gọi qua api client (có JWT) với responseType 'blob' rồi
 * lưu bằng thẻ <a download> — không mở thẳng URL vì trình duyệt sẽ không gửi kèm token.
 */
export function luuTep(blob: Blob, tenTep: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = tenTep;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Trình duyệt cần URL còn sống tới khi bắt đầu tải.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Tên tệp trong Content-Disposition; ưu tiên dạng filename*=UTF-8'' (tên có dấu tiếng Việt). */
export function tenTepTuHeader(header: string | undefined | null): string | undefined {
  if (!header) return undefined;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim().replace(/^"|"$/g, ''));
    } catch {
      /* rơi xuống dạng thường */
    }
  }
  const thuong = /filename="?([^";]+)"?/i.exec(header);
  return thuong?.[1];
}
