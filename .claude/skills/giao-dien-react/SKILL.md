---
name: giao-dien-react
description: Quy ước frontend React 18 + TypeScript + Vite của QLTT (thư mục frontend/) — gọi API qua một axios client duy nhất, xử lý ApiResponse và mã lỗi, AuthContext lưu JWT, RequireRole bảo vệ route theo bốn vai trò, cấu trúc thư mục theo module, màn hình chấm điểm theo rubric, bảng TTTN-07, hiển thị số liệu kiểu Việt Nam. Nạp skill này khi tạo hoặc sửa file trong frontend/, khi làm bất kỳ màn hình SCR-xx nào, hoặc khi nối giao diện với API.
---

# Frontend QLTT

## Cấu trúc

```
frontend/src/
├── api/          client.ts (axios duy nhat) + <module>.ts (moi file mot nhom endpoint trong docs/02-api.md)
├── auth/         AuthContext.tsx, RequireRole.tsx
├── components/   dung chung: DataTable, StatusBadge, ConfirmDialog, FileUpload, RubricLevelPicker
├── layouts/      AppLayout.tsx (menu theo vai tro), AuthLayout.tsx
├── pages/<module>/   moi SCR mot file, ten tieng Anh PascalCase: AssessmentFormPage.tsx (SCR-18)
├── types/        kieu TypeScript khop DTO backend (ten truong giu nguyen camelCase tieng Viet khong dau)
└── utils/        format.ts (diem, ngay), constants.ts (nhan hien thi cua enum)
```

Ai làm màn nào thì sửa `pages/<module>` và `api/<module>.ts` của mình; `components/` dùng chung — sửa thì báo người kia.

## Gọi API — chỉ qua `api/client.ts`

```ts
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('qltt_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  res => res,
  err => {
    const body = err.response?.data as ApiResponse<unknown> | undefined;
    if (err.response?.status === 401) { localStorage.removeItem('qltt_token'); window.location.href = '/login'; }
    return Promise.reject(new ApiError(body?.code ?? 'INTERNAL_ERROR', body?.message ?? 'Lỗi kết nối máy chủ', body?.errors));
  });
```

- Không gọi `axios.get('http://...')` rải rác trong component.
- Lỗi hiển thị **nguyên văn `message`** của backend (đã là tiếng Việt có trích điều khoản); `VALIDATION_ERROR` thì gắn `errors[].thongDiep` dưới từng ô nhập.
- `QUOTA_EXCEEDED`, `RESOURCE_LOCKED`… không phải lỗi hệ thống — hiện cảnh báo vàng, không hiện "Đã xảy ra lỗi".

## Phân quyền trên giao diện

`<RequireRole roles={['ADMIN']}>` bọc route; menu ẩn mục không thuộc vai trò. **Đây chỉ là tiện lợi** —
backend vẫn phải chặn (hội đồng sẽ thử bằng Postman).

## Màn hình đặc thù

- **SCR-18/20 chấm điểm**: mỗi CLO một dòng — chọn mức 0–4 (`RubricLevelPicker`) → hiện mô tả hành vi của mức
  + điền sẵn điểm giữa khoảng → cho chỉnh trong `[diemMin; diemMax)` (mức 4 tới 10), bước 0,1. Viền đỏ dòng
  thiếu / sai khoảng. Nút "Lưu nháp" và "Nộp phiếu" (hỏi xác nhận: nộp xong bị khóa). Người chấm nhóm ĐVHD:
  dòng CLO7 **disabled**. Chưa tới lượt xem điểm bên kia thì không hiển thị gì của bên kia.
- **SCR-21 TTTN-07**: bảng đúng bố cục mẫu — cột (1) ĐVHD c1, (2) GVHD c1, (3) TB c1, (4) ĐVHD c2, (5) GVHD c2,
  (6) TB c2, (7) CLOᵢ, (8) αᵢ, (9) CLOᵢ×αᵢ; dưới là HP + mức, bảng 3 nhóm năng lực, 4 điều kiện công nhận
  (✓/✗ kèm lý do).
- **SCR-24 kết quả SV**: không có cột điểm từng người chấm. Chưa gửi 08b ⇒ chuyển sang SCR-23 kèm giải thích.
- **SCR-17 minh chứng**: bảng đối chiếu Đủ/Thiếu theo hình thức thực tập; tải lên kiểm trước ở client (≤ 20 MB,
  đuôi cho phép) nhưng **vẫn dựa vào backend**.

## Định dạng hiển thị

| Dữ liệu | Hiển thị |
|---|---|
| Điểm | 1 chữ số thập phân, dấu phẩy: `7,7` (`n.toLocaleString('vi-VN', {minimumFractionDigits: 1, maximumFractionDigits: 1})`) |
| Trọng số / tỷ lệ | `20%`, `30 / 70` |
| Ngày / giờ | `dd/MM/yyyy`, `dd/MM/yyyy HH:mm` |
| Enum | nhãn tiếng Việt trong `utils/constants.ts` — `CHO_DVHD` → "Chờ ĐVHD xác nhận" |
| Trạng thái | `StatusBadge` màu cố định: nháp xám · chờ vàng · đang chạy xanh dương · xong xanh lá · từ chối/không đạt đỏ |

Toàn bộ chữ trên giao diện là tiếng Việt có dấu.
