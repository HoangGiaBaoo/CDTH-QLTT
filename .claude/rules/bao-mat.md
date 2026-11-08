# Quy tắc bảo mật — luôn áp dụng

Vừa đủ cho đồ án, không làm quá. Nhưng các điểm dưới đây hội đồng hay thử trực tiếp trên Postman.

## Phân quyền hai lớp — lớp nào cũng bắt buộc

| Lớp | Ở đâu | Kiểm cái gì |
|---|---|---|
| 1. Vai trò | `@PreAuthorize("hasRole('ADMIN')")` trên **từng** method controller | Cột *Quyền* trong `docs/02-api.md` |
| 2. Sở hữu dữ liệu | **service**, đầu mỗi method nhận id | SV chỉ hồ sơ của mình · GV chỉ SV mình là GVHD (chặng 2: thêm SV trong tổ mình) · cán bộ ĐVHD chỉ SV mình hướng dẫn · ADMIN toàn bộ |

Dùng chung `HoSoThucTapService.layVaKiemQuyen(hoSoId, currentUser)` cho mọi thứ treo dưới một hồ sơ — đừng
mỗi service tự viết một kiểu. Thiếu quyền ⇒ `ACCESS_DENIED`, **không** để lộ chi tiết hồ sơ trong `message`.

## Những chỗ đặc thù của QLTT — dễ sót

- [ ] **Hai bên đồng chấm không thấy điểm nhau** cho đến khi cả hai đã nộp (UC08, BR-08.7). Chặn ở service: `GET /api/assessments/{id}` của người khác trong cùng chặng ⇒ `ACCESS_DENIED` nếu phiếu của mình chưa `DA_NOP` hoặc phiếu kia chưa `DA_NOP`.
- [ ] **ĐVHD không nhập được CLO7** (CBR-09) — ẩn trên giao diện là chưa đủ; service bỏ giá trị + ghi `nhat_ky_he_thong`.
- [ ] **SV không thấy điểm từng người chấm** (UC13) — DTO kết quả cho SV không có trường điểm phiếu.
- [ ] **SV chỉ xem kết quả khi đã công bố và đã gửi 08b** (BR-12.5).
- [ ] **Thống kê phản hồi 08b không lộ danh tính** (RP-06).
- [ ] **Mọi thay đổi ảnh hưởng điểm ghi nhật ký** (Đ14 k4c): nộp/mở lại phiếu, tính lại điểm (HP trước/sau), đổi GVHD, sửa trọng số, điểm thưởng, xác nhận/công bố.
- [ ] Người chấm phải đúng là GVHD / cán bộ của SV (chặng 1) hoặc thành viên **không vắng mặt** của tổ chứa SV (chặng 2).

## Xác thực

- JWT HS256, hạn **8 giờ**, payload: id người dùng + vai trò. Bí mật đọc từ biến môi trường / `application-dev.yml`, không hard-code trong `.java`.
- Mật khẩu **BCrypt**, kể cả trong seed SQL (lưu chuỗi hash, ghi chú mật khẩu gốc ở comment seed cho tài khoản demo).
- Mật khẩu ≥ 8 ký tự, có chữ và số. Sai **5 lần liên tiếp ⇒ khóa 15 phút** (`so_lan_sai`, `khoa_den`); thông báo không nói rõ sai tên hay sai mật khẩu.
- Tài khoản `VO_HIEU_HOA` không đăng nhập được, token cũ của nó cũng bị từ chối ở filter.
- 401 và 403 trả **JSON cùng cấu trúc `ApiResponse`** (cấu hình `AuthenticationEntryPoint` + `AccessDeniedHandler`), không trả trang HTML.

## Tệp tải lên

- Kiểm **cả đuôi tệp lẫn content-type**, ≤ 20 MB (CBR-24; báo cáo chỉ pdf/docx). Cấu hình thêm `spring.servlet.multipart.max-file-size=20MB` để chặn sớm.
- Lưu bằng **tên sinh ngẫu nhiên** (`uuid.ext`), tên gốc chỉ lưu trong cột `ten_file`. Không bao giờ ghép đường dẫn từ tên tệp người dùng gửi (path traversal).
- Tải về **chỉ qua endpoint có kiểm quyền** (#67, #91); thư mục `uploads/` không được phục vụ tĩnh.
- `uploads/` nằm ngoài git (`.gitignore`).

## Danh sách kiểm khi soát code

- [ ] Không có mật khẩu, JWT secret thật trong file `.java` hoặc commit lên git
- [ ] Không nối chuỗi vào JPQL/SQL — dùng tham số `:ten` hoặc method query
- [ ] Mọi method controller (trừ `/api/auth/login`) có `@PreAuthorize`
- [ ] Không trả entity — DTO không có `matKhauHash`, `soLanSai`, `khoaDen`
- [ ] CORS chỉ mở cho origin frontend dev (`http://localhost:5173`), không `*` khi có credentials
- [ ] Swagger UI chỉ bật ở profile `dev`
