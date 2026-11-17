---
name: giao-dien-react
description: Quy ước frontend React 18 + TypeScript + Vite của QLTT (thư mục frontend/) — gọi API qua một axios client duy nhất, xử lý ApiResponse và mã lỗi, AuthContext lưu JWT, RequireRole bảo vệ route theo bốn vai trò, cấu trúc thư mục theo module, màn hình chấm điểm theo rubric, bảng TTTN-07, hiển thị số liệu kiểu Việt Nam, tông màu và bố cục theo cổng sinh viên HUCE, chữ hiển thị không chứa mã UC/#/CBR. Nạp skill này khi tạo hoặc sửa file trong frontend/, khi làm bất kỳ màn hình SCR-xx nào, hoặc khi nối giao diện với API.
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
- Lỗi hiển thị **nguyên văn `message`** của backend (đã là tiếng Việt, trích điều khoản Quy định, không mã CBR/BR/UC); `VALIDATION_ERROR` thì gắn `errors[].thongDiep` dưới từng ô nhập.
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

## Chữ trên giao diện — không có mã nội bộ

Toàn bộ chữ trên giao diện là tiếng Việt có dấu, viết cho người dùng chứ không cho người làm đồ án.

- **Không** hiện mã thiết kế: `UC04`, `UC11 5a`, `#93`, `CBR-24`, `BR-11.4`, `NT-07`, `RP-01`, `SCR-22`, "bước 8".
  Áp cho chữ trong JSX, `title`, `placeholder`, thông báo client **và** `message` lỗi backend (chuỗi nào lên màn
  hình là thuộc quy tắc này). Mã chỉ được nằm trong comment, tên biến, khóa dữ liệu (`maSuKien`, `?rp=`).
- Cần nêu căn cứ thì trích **Quy định** viết đầy đủ: "(Điều 10 khoản 2)" — không viết tắt "Đ10 k2".
- Tên biểu mẫu chính thức giữ nguyên vì người dùng biết: TTTN-01…TTTN-07, 08a, 08b.
- Không hiện `#id` của bản ghi: "Tổ 3", "Phiếu số 25", không "Tổ #3".
- Màn chưa làm: "Chức năng đang được xây dựng", không ghi mã màn hay người phụ trách.

Soát nhanh trước khi báo xong một màn:
`grep -rnE "UC ?[0-9]|#[0-9]|CBR-|BR-[0-9]|NT-[0-9]|SCR-|RP-0" frontend/src --include=*.tsx` — chỉ được còn trong comment.

## Giao diện — tông màu cổng sinh viên HUCE

Tham chiếu: trang chủ Cổng thông tin sinh viên (sinhvien.huce.edu.vn) — đối chiếu bằng ảnh chụp và CSS của trang.
Mọi màu khai báo một lần ở `:root` trong `styles.css`; màn hình chỉ dùng biến, **không viết mã màu riêng**.

| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--nen` | `#e7ecf0` | Nền trang (xám xanh) |
| `--the` | `#ffffff` | Thẻ, bảng, thanh trên, menu trái — không viền đậm, chỉ `--bong` |
| `--chu` / `--chu-tieu-de` / `--chu-phu` | `#3f4e5a` / `#4e606e` / `#687782` | Chữ thường / tiêu đề / chú thích (xám đá) |
| `--mau-chinh` → `--mau-chinh-dam` | `#0b72c7` → `#005ab7` | Nút chính, link, mục menu đang chọn → khi rê chuột |
| `--mau-nhan` | `#2a9fff` | Biểu tượng, vạch nhấn, viền focus — **không** dùng cho chữ nhỏ (tương phản 2,8:1) |
| `--thuong-hieu` | `#172759` | Tên trường, dấu logo |
| `--xanh-duong-nen`, `--vang-nen`, `--xanh-la-nen`, `--do-nen` | pastel | Ô số liệu (`.stat-*`), badge, cảnh báo — chữ đi kèm dùng biến `*-chu` cùng tông |

Bố cục và thành phần:

- Khung: thanh trên trắng cao 64px (dấu + "Trường Đại học Xây dựng Hà Nội / Quản lý thực tập tốt nghiệp", avatar
  chữ cái, Đăng xuất), menu trái trắng có biểu tượng, nội dung trên `--nen`, chân trang một dòng.
- Biểu tượng: `lucide-react` (nét mảnh), khai báo `icon` cho mỗi mục trong `menu.ts`; trang Tổng quan là lưới ô
  chức năng biểu tượng xanh + nhãn, **không** dòng mô tả.
- Thẻ có tiêu đề: `.the-tieu-de` (chữ đậm xám đá, gạch chân mảnh) như khối "Thông tin sinh viên".
- Ô số liệu `.stat` / `.stat-vang|xanh-duong|xanh-la`: nền pastel, số lớn cùng tông — như "Lịch học trong tuần".
- Font Roboto (Google Fonts, có `subset=vietnamese`), dự phòng Segoe UI / Tahoma. Bo góc 4–6px.
- Tương phản chữ ≥ 4,5:1 (WCAG AA); trạng thái không chỉ dựa vào màu — luôn kèm chữ (badge, ✓/✗).
- Màn hẹp (≤ 640px): không tràn ngang ở 390px; bảng nhiều cột xếp thành thẻ; thanh trên chỉ còn dấu, avatar,
  biểu tượng đăng xuất. Kiểm bằng `ui-test/chup-giao-dien.mjs`.
