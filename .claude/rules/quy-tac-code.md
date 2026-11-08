# Quy tắc viết code — luôn áp dụng

Viết như lập trình viên Spring bình thường: Lombok, Stream API, record, `Optional`, annotation đầy đủ.
Những mục dưới đây **không phải phong cách** — là đúng/sai, hoặc là điều hội đồng sẽ soi.

## Năm điều không thương lượng

| Quy tắc | Vì sao |
|---|---|
| **Điểm, trọng số, tỷ lệ dùng `BigDecimal`** — không `double`/`float` ở `service/scoring/`, không ở field `diem*`, `trongSo*`, `tyLe*`, `hp*`, `chiSo*` | Công thức hai lớp trọng số + làm tròn 0,1: `double` cho 8,15 → 8,1 thay vì 8,2. CSDL cũng là `DECIMAL` |
| **Không viết cứng cấu hình chấm điểm** (0,3/0,7, α, tỷ lệ đồng chấm, khoảng rubric, hạn mức 5/10) trong service | Quy định cập nhật 2 năm/lần (Đ26); mọi giá trị đọc từ bảng `chang_danh_gia`, `chuan_dau_ra`, `muc_rubric`, `giang_vien`, `can_bo_dvhd`. Chỉ seed SQL được chứa con số |
| **Kiểm quyền sở hữu dữ liệu ở service**, không chỉ `@PreAuthorize` vai trò | Hội đồng sẽ đăng nhập SV A rồi gõ id hồ sơ của SV B. Xem `.claude/rules/bao-mat.md` |
| **Thao tác ghi nhiều bảng nằm trong một `@Transactional`** | Tạo user + hồ sơ, phân công hàng loạt, phê duyệt ĐVHD + tạo tài khoản: hỏng giữa chừng phải rollback hết (UC01 7a, UC05 4a) |
| **Không xóa vật lý dữ liệu đã phát sinh điểm** — chuyển trạng thái / `da_xoa = true` | CBR-22, Đ16 k1 |

## BigDecimal đúng cách

- Tạo từ chuỗi hoặc từ DB: `new BigDecimal("0.3")`, **không** `new BigDecimal(0.3)` (ra 0,29999…).
- `divide` luôn kèm độ chính xác: `a.divide(b, MathContext.DECIMAL64)` — chia 3 điểm cho 3 người là số vô hạn, thiếu `MathContext` sẽ ném `ArithmeticException`.
- Làm tròn **chỉ ở bước cuối**, luôn `setScale(1, RoundingMode.HALF_UP)`. Không `setScale(1)` trơn.
- So sánh bằng `compareTo`, không `equals` (`2.0` khác `2.00` theo `equals`).

## Quy ước đặt tên — bám theo tài liệu thiết kế

Thiết kế (class diagram, CSDL) đặt tên **tiếng Việt không dấu**; API đặt **tiếng Anh**. Giữ nguyên như vậy để
đối chiếu một–một với tài liệu khi vấn đáp:

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Bảng, cột | snake_case tiếng Việt không dấu, **đúng `docs/03-csdl.md`** | `ho_so_thuc_tap`, `trong_so_alpha` |
| Entity, field | PascalCase / camelCase tiếng Việt không dấu, **đúng `Class_Diagram.pdf`** | `HoSoThucTap.trongSoAlpha` |
| Enum + giá trị | đúng tên trong thiết kế, lưu `@Enumerated(EnumType.STRING)` | `TrangThaiHoSo.CHO_DVHD` |
| Service / method nghiệp vụ | tiếng Việt không dấu như class diagram | `HoSoThucTapService.guiDangKy()`, `ScoringService.tinhDiem()` |
| Controller | tên class theo class diagram, method theo hành động REST | `HoSoThucTapController.submit()` |
| URL | **đúng `docs/02-api.md`**, tiếng Anh snake_case | `/api/internship_records/{record_id}/submit` |
| DTO | `record` trong `dto/<module>/`, hậu tố `Request` / `Response` | `GuiDangKyRequest`, `HoSoResponse` |
| Package | chữ thường tiếng Anh theo tầng | `controller`, `service.scoring` |
| Hằng số nghiệp vụ | không có trong code (xem điều 2 ở trên) | — |

Không có trong thiết kế thì đặt theo cùng kiểu với phần đã có. **Không trộn** `HoSo` với `InternshipRecord` cho cùng một khái niệm.

**Comment tiếng Việt** (có dấu, file UTF-8). Comment trả lời **tại sao** và **trích điều khoản**:
`// Đ15 k3b: chỉ CLO1, CLO2 là điều kiện công nhận; CLO khác dưới ngưỡng vẫn có thể Đạt`.
Không viết comment kể lại dòng code.

**Thông điệp lỗi trả về** (`message`) là tiếng Việt có dấu, đủ để hiển thị thẳng lên giao diện; lỗi
`BUSINESS_RULE_VIOLATION` **kèm trích dẫn điều khoản** (ví dụ "… (Điều 7 khoản 2 điểm c)").

**Commit message tiếng Anh** — xem `.claude/rules/git.md`.

## Kiểu dữ liệu

| Loại | Kiểu Java | Cột |
|---|---|---|
| Điểm, trọng số, tỷ lệ, điểm thưởng | `BigDecimal` | `DECIMAL` |
| Mức rubric 0–4, thứ tự, tuần, phần trăm | `Integer` / `int` | `TINYINT` / `INT` |
| Trạng thái, vai trò, hình thức | `enum` + `EnumType.STRING` | `ENUM` / `VARCHAR` |
| Ngày / thời điểm | `LocalDate` / `LocalDateTime` | `DATE` / `DATETIME` |
| JSON phiếu phản hồi | `String` + `@JdbcTypeCode(SqlTypes.JSON)` hoặc `Map` | `JSON` |

## Cấu trúc và cách làm việc

1. Đúng cấu trúc thư mục ở `docs/04-ke-hoach.md` mục 3. **Chỉ sửa file thuộc phần mình** (mục 2 kế hoạch); cần đụng file người kia thì báo trước.
2. Controller mỏng: nhận request, `@Valid`, gọi service, bọc `ApiResponse`. **Mọi logic + kiểm quyền sở hữu ở service.**
3. Không trả entity ra ngoài controller — luôn map sang DTO (tránh lộ `matKhauHash`, tránh vòng lặp JSON).
4. `service/scoring/` là **Java thuần**: không `@Autowired` repository, không gọi DB. Service khác nạp dữ liệu rồi truyền vào.
5. Làm từng bước nhỏ, xong một endpoint thì tóm tắt rồi mới đi tiếp. Không tự thêm chức năng ngoài `docs/02-api.md`.
6. Schema chỉ đổi bằng migration Flyway **mới**; không sửa migration đã merge; `ddl-auto=validate`.
7. Không tạo file `.md` mới ngoài `docs/` trừ khi được yêu cầu.

## Vẫn phải giải thích được

Mỗi người bảo vệ phần của mình. Đoạn nào không giảng lại được bằng tiếng Việt thì gõ `/giai-thich`; giảng
mãi không ra thì viết lại cho đơn giản. `/van-dap` để tập trả lời.
