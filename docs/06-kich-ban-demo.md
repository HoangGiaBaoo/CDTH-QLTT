# Kịch bản demo một vòng đời hồ sơ (≈ 12–15 phút)

Bám dữ liệu seed V4 (`docs/TIEN-DO.md` › *Seed V4*). Mọi tài khoản seed dùng mật khẩu **`Qltt@2026`**.
Bước 1–3 làm trên **đợt mới tạo trực tiếp**; bước 4–12 dùng đợt seed **`TTTN-2026-HK1`** (dữ liệu dựng sẵn ở từng mốc,
bước nào trục trặc thì nhảy sang bước sau, không phụ thuộc nhau).

Mỗi lần chuyển người, chỉ vào **chuông thông báo** trên thanh trên: người nhận việc tiếp theo thấy số đỏ, bấm vào là
mở đúng màn cần xử lý.

## Chuẩn bị (trước giờ demo 15 phút)

| Việc | Lệnh / thao tác |
|---|---|
| CSDL sạch | `docker compose down -v` → `docker compose up -d` (Flyway nạp lại V1–V4 khi backend chạy) |
| Backend | `.\mvnw.cmd spring-boot:run` — chờ dòng `Started CdthQlttApplication` |
| Giao diện | `npm --prefix frontend run dev` → mở http://localhost:5173 |
| Hoặc bản chạy thật | http://221.121.0.89 (xem `docs/05-trien-khai.md`; CSDL VPS đã có thao tác thử thì không còn sạch) |
| Trình duyệt | Mỗi vai trò một cửa sổ ẩn danh riêng (giáo vụ, giảng viên, cán bộ, sinh viên) để khỏi đăng xuất / đăng nhập lại |

Trang đăng nhập ở chế độ dev có nút điền nhanh 4 tài khoản mẫu.

## Tài khoản dùng trong kịch bản

| Vai trò | Tài khoản | Dùng ở bước |
|---|---|---|
| Giáo vụ | `giaovu` (Nguyễn Thị Giáo Vụ) | 1, 2, 5, 9, 11, 12 |
| Giảng viên | `gv.lan` (Trần Thị Lan), `gv.tung` (Phạm Hữu Tùng) | 6, 8, 11 |
| Cán bộ ĐVHD | `cb.yen` (Phan Hải Yến, hạn mức 1), `cb.duc` (Tạ Minh Đức), `cb.son` (Ngô Thanh Sơn) | 3, 4, 10 |
| Sinh viên | `sv.khanh`, `sv.linh`, `sv.cuong`, `sv.an` | 3, 7, 12 |

## Các bước

### 1. Giáo vụ tạo đợt — cấu hình chấm điểm sinh tự động
`giaovu` → **Đợt thực tập** → **+ Tạo đợt mới**: mã `TTTN-2027-HK1`, học kỳ 1, năm học `2027-2028`, 04/01/2027 –
28/02/2027 → **Tạo đợt**.
- Thấy: sang trang chi tiết đợt, 2 chặng (30% / 70%), bảng 7 CLO kèm α và tỷ lệ đồng chấm, 35 mức rubric, 13 câu hỏi.
- Bấm **Chuyển sang: Đang nhận đăng ký** → hệ thống kiểm Σα = 100 rồi mới mở.
- Nói: *cấu hình chấm không viết cứng trong code — đọc từ bảng của đợt, Quy định đổi thì sửa ở đây (Điều 26).*

### 2. Giáo vụ phê duyệt ĐVHD — tài khoản cán bộ được kích hoạt
**Đơn vị hướng dẫn** → khung vàng "Có 1 đơn vị đang chờ phê duyệt" → **Xem các đơn vị này** → *Công ty TNHH Kỹ thuật Bình
Minh* → **Phê duyệt** → xác nhận.
- Thấy: trạng thái Đã duyệt; khung xanh hiện **tên đăng nhập `cb.phuong` + mật khẩu ban đầu** (chỉ hiện một lần);
  tài khoản cán bộ chuyển *Hoạt động*.
- Thử nhanh (tùy chọn): đăng nhập `cb.phuong` bằng mật khẩu vừa hiện.
- Nói: *duyệt và kích hoạt tài khoản trong một giao dịch — hỏng giữa chừng thì cả hai cùng hoàn tác.*

### 3. Sinh viên đăng ký — chặn vượt hạn mức cán bộ
Thứ tự quan trọng (cb.yen chỉ nhận 1 sinh viên):
1. `sv.linh` → **Đăng ký thực tập** → hình thức *Thực tập tại doanh nghiệp*, đơn vị *Hồng Hà*, cán bộ *Phan Hải Yến*,
   nhập đề tài → **Lưu nháp** (chưa gửi).
2. `sv.khanh` → làm như trên, tích cam kết → **Gửi đăng ký** → trạng thái *Chờ ĐVHD xác nhận*.
3. `cb.yen` → chuông 🔔 1 → bấm thông báo → **Xác nhận tiếp nhận** sv.khanh.
4. Quay lại `sv.linh` → mở bản nháp: báo cán bộ đã hết hạn mức → tích cam kết → **Gửi đăng ký** ⇒ cảnh báo vàng
   *"… đã nhận đủ … (Điều 7 khoản 2 điểm c)"*.
- Nói: *hạn mức đếm động theo đợt, chỉ tính khi cán bộ đã xác nhận.*

### 4. Cán bộ xác nhận tiếp nhận (dữ liệu seed)
`cb.duc` → chuông 🔔 1 "Sinh viên Phạm Thị Dung gửi đăng ký…" → bấm → **Xác nhận tiếp nhận** → hồ sơ sang *Chờ GVHD*.
- Giáo vụ sẽ nhận thông báo "cần phân công GVHD".

### 5. Giáo vụ phân công GVHD — vượt hạn mức thì hủy cả lô
`giaovu` → **Phân công GVHD** (đợt TTTN-2026-HK1) → tích *Hoàng Văn Giang* + *Lương Thị Mai* → chọn **Đỗ Thu Hoà** (4/5)
→ **Phân công** ⇒ bị chặn, **không ai được phân** (cả lô hoàn tác). Chọn lại **Lê Quang Minh** → được.
- Nói: *một @Transactional cho cả lô — UC05 4a.*

### 6. Giảng viên duyệt — sinh khung kế hoạch và bảng tiến độ
`gv.lan` → **Sinh viên hướng dẫn** → *Vũ Thu Hà* (Chờ GVHD) → **Phê duyệt** ⇒ *Đang thực tập*; mở kế hoạch học tập
(9 dòng: 8 tuần + tổng kết) và tiến độ tuần (8 dòng).

### 7. Sinh viên trong kỳ thực tập
`sv.cuong` → **Nhật ký thực tập** (ghi nhật ký hôm nay) → **Minh chứng** (tải lên một tệp pdf/docx ≤ 20 MB) → xem bảng
**Đủ / Thiếu** theo hình thức thực tập.

### 8. Chặng 1 — hai bên đồng chấm không thấy điểm nhau
`gv.lan` → **Phiếu đánh giá** → chặng 1 → *Trần Thị Bình* → **Tiếp tục** (phiếu nháp): cán bộ Đinh Văn Quang đã nộp
nhưng **không thấy điểm** của cán bộ. Chọn mức/điểm, nhận xét chung → **Nộp phiếu** ⇒ giờ mới xem được phiếu cán bộ.
- Nói: *chặn ở service chứ không chỉ ẩn ở giao diện — gõ thẳng id phiếu cũng bị 403.*

### 9. Giáo vụ lập Tổ đánh giá — số thành viên phải lẻ
`giaovu` → **Tổ đánh giá** → **+ Thành lập tổ** → chọn sinh viên (Hà Thúy Nga…) → thêm 4 thành viên ⇒ bị chặn
(Điều 10 khoản 3a); bỏ một người còn 3 → **Thành lập**.

### 10. Chặng 2 — cán bộ ĐVHD không chấm CLO7
**Nên làm trước bước này:** `sv.an` → **Phản hồi 08b** → gửi phiếu (để kết quả ra *Đạt* ngay, không phải tính lại).
`cb.son` → **Phiếu đánh giá** → chặng 2 → *Nguyễn Văn An*: ô **CLO7 bị khóa**. Nhập CLO1…CLO6 = **8 · 7 · 7 · 9 · 8 · 8**
→ **Nộp phiếu** ⇒ đủ phiếu, hệ thống **tự tính điểm**.

### 11. Kết quả TTTN-07 khớp tờ tính tay → xác nhận, công bố
`giaovu` → **Kết quả học phần** → *Nguyễn Văn An*: CLO 8,2 · 7,2 · 7,2 · 8,8 · 7,7 · 7,4 · 7,5 → **HP 7,7**, Đạt.
- Đặt tờ tính tay bên cạnh (skill `tinh-diem-clo`): đi một CLO (CLO1) từ phiếu → trung bình nhóm → tỷ lệ đồng chấm →
  trọng số chặng; rồi CLO7 để nói **chuẩn hóa trọng số** (thiếu chuẩn hóa ⇒ 7,4, sai).
- `gv.tung` (GVHD): **Đề xuất điểm thưởng** (tùy chọn, ≤ 0,5) → `giaovu`: **Xác nhận** → **Công bố**.
- **Xuất TTTN-07 (.docx)** để cho thấy biểu mẫu.
- Nếu quên bước 08b: kết quả ra *Không đạt (d)* → sinh viên gửi 08b → bảng báo dữ liệu đã đổi → **Tính lại** ⇒ Đạt.

### 12. Sinh viên xem kết quả · Giáo vụ thống kê
`sv.an` → **Kết quả của tôi**: 7 CLO, biểu đồ, 4 điều kiện công nhận (không có điểm từng người chấm).
`giaovu` → **Thống kê**: tỷ lệ đạt từng CLO, phân bố mức, xuất Excel (đợt `TTTN-2025-HK2` có đủ 10 ca mẫu).

## Nếu hội đồng hỏi thử trực tiếp

| Câu thử | Làm gì |
|---|---|
| "Sinh viên A xem hồ sơ sinh viên B?" | Đăng nhập `sv.an`, sửa id trên thanh địa chỉ `/records/<id khác>` ⇒ không có quyền |
| "Cán bộ vào trang giáo vụ?" | `cb.son` gõ `/host-orgs` ⇒ trang 403 |
| "Đổi mật khẩu thì token cũ còn dùng được không?" | **Hồ sơ cá nhân** → đổi mật khẩu ⇒ bị đăng xuất, token cũ trả 401 |
| "Sai mật khẩu nhiều lần?" | Sai 5 lần ⇒ khóa 15 phút, thông báo không nói rõ sai tên hay sai mật khẩu |
| "Điểm có làm tròn đúng không?" | `.\mvnw.cmd test -Dtest=ScoringServiceTest` — 12+ ca tính tay, chạy < 1 giây |
| "Xóa giảng viên đang hướng dẫn?" | `giaovu` → **Tài khoản** → *Đỗ Thu Hoà* → **Vô hiệu hóa** ⇒ bị chặn (đang hướng dẫn 4 sinh viên); hệ thống không xóa tài khoản, chỉ vô hiệu hóa |

## Màn Tài khoản (nếu bị hỏi)

`giaovu` → **Tài khoản**: tạo sinh viên / giảng viên / cán bộ kèm hồ sơ trong một giao dịch, mật khẩu ban đầu chỉ hiện
một lần; đổi chương trình đào tạo của sinh viên (quyết định ngưỡng đạt CLO1, CLO2); đặt lại mật khẩu; vô hiệu hóa.
Tài khoản cán bộ của đơn vị chưa duyệt (`cb.phuong`) không kích hoạt tay được — chỉ kích hoạt qua phê duyệt đơn vị
(bước 2). Không tạo / sửa tài khoản trên CSDL demo trước buổi demo nếu không định `down -v` lại.
