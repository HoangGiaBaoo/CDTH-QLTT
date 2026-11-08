# Cấu hình Claude Code cho QLTT

Thư mục này giúp Claude Code làm việc **đúng nghiệp vụ Quy định TTTN QĐ 207** và đúng cách chia việc của
nhóm 2 người. Được viết lại ngày 08/11/2026 từ bộ cấu hình của một dự án khác (MPRoute — tối ưu tuyến giao
hàng); toàn bộ phần CVRP / OR-Tools / Thymeleaf đã bỏ.

Commit thư mục này lên git để cả hai người dùng chung (trừ `settings.local.json` — cấu hình riêng từng máy).

## Có gì trong đây

```
CLAUDE.md (gốc repo)     Nạp 4 file rules vào mọi phiên + bảng tài liệu
.claude/
├── settings.json        Quyền chạy lệnh + đăng ký 2 hook
├── settings.local.json  Riêng từng máy, không commit
├── rules/               Luôn áp dụng
│   ├── quy-tac-code.md    BigDecimal, không viết cứng cấu hình, đặt tên theo thiết kế, cấu trúc
│   ├── bao-mat.md         Phân quyền 2 lớp, JWT, ẩn điểm, tệp tải lên
│   ├── kiem-thu.md        12 ca ScoringServiceTest + ma trận phân quyền Postman
│   └── git.md             Nhánh, PR, Conventional Commits, tag mốc
├── skills/              Claude tự nạp khi gặp việc liên quan
│   ├── tinh-diem-clo/       ← quan trọng nhất: công thức, ví dụ tính tay, lỗi kinh điển
│   ├── nghiep-vu-qltt/      bản đồ nghiệp vụ, mã lỗi, trạng thái, Tổ đánh giá
│   ├── spring-boot-api/     mẫu code Boot 4: response, lỗi, JWT, entity, service, controller
│   ├── giao-dien-react/     quy ước frontend, màn chấm điểm, TTTN-07
│   ├── kiem-thu-java/       khuôn test, Postman
│   └── chuan-bi-van-dap/    câu hỏi hội đồng, kịch bản demo, phân vai
├── agents/              Agent chuyên trách
│   ├── chuyen-gia-tinh-diem.md   soát + giảng thuật toán tính điểm
│   ├── nguoi-soat-code.md        soát trước khi merge
│   ├── soat-nghiep-vu.md         đối chiếu UC với đặc tả
│   ├── nguoi-lap-ke-hoach.md     chia việc thành bước nhỏ
│   ├── sua-loi-build.md          lỗi Maven / Boot 4 / Flyway / MySQL / Vite
│   └── cap-nhat-tai-lieu.md      giữ docs/ và TIEN-DO.md khớp code
├── commands/            Lệnh gõ nhanh bằng dấu /
└── hooks/
    ├── kiem-tra-quy-tac.js   sau mỗi lần ghi/sửa file
    └── khoi-dong-phien.js    đầu mỗi phiên
```

## Lệnh gõ nhanh

| Lệnh | Dùng khi nào |
|---|---|
| `/ke-hoach <việc>` | Trước khi làm một UC / nhóm endpoint — lập bước nhỏ, chờ đồng ý mới code |
| `/soat-code [phạm vi]` | Trước khi mở PR, và khi review PR của người kia |
| `/soat-nghiep-vu <UC>` | Xong một UC, kiểm đủ luồng / nhánh / mã lỗi chưa |
| `/soat-tinh-diem` | **Sau mỗi lần sửa phần tính điểm** (A) |
| `/kiem-tra` | Biên dịch + test (+ build frontend) |
| `/tien-do` | Cuối tuần — so với kế hoạch 6 tuần, ai chậm, cắt gì |
| `/giai-thich <file/hàm>` | Muốn được giảng lại code bằng tiếng Việt kèm ví dụ số |
| `/van-dap [phần]` | Luyện trả lời hội đồng |
| `/hoc` | Cuối phiên — ghi bài học vào `docs/BAI-HOC.md` |

Agent: Claude tự gọi khi phù hợp; muốn gọi thẳng thì nói *"dùng agent chuyen-gia-tinh-diem soát KetQuaService"*.

## Hook

| Hook | Khi nào | Làm gì |
|---|---|---|
| `kiem-tra-quy-tac.js` | Sau mỗi Write/Edit | Bắt: `double`/`float` cho điểm, `new BigDecimal(0.3)`, `setScale` thiếu `RoundingMode`, `divide` thiếu `MathContext`, viết cứng 0,3/0,7 trong `service/scoring/`, mật khẩu không qua `encode`, JPQL nối chuỗi, xóa vật lý bảng có điểm, controller thiếu `@PreAuthorize`, import Jackson 2, `System.out`; `ddl-auto=update`, URL MySQL thiếu timezone, secret ghi thẳng; migration thiếu utf8mb4 / dùng FLOAT / seed mật khẩu thuần; frontend gọi URL tuyệt đối. **Không soi phong cách.** |
| `khoi-dong-phien.js` | Mở phiên / `/clear` | Nhắc bối cảnh, luật vàng, tài liệu, và 4000 ký tự đầu `docs/TIEN-DO.md` |

Phát hiện gì thì Claude nhận thông báo và tự sửa; không chặn thao tác của bạn.

## Sửa hoặc tắt

- Tắt hook: xóa khối tương ứng trong `settings.json`.
- Thêm quy tắc kiểm tự động: sửa `hooks/kiem-tra-quy-tac.js` (JavaScript thuần, chạy bằng Node). Chỉ thêm quy tắc **ít báo nhầm**.
- Đổi quy tắc code: sửa `rules/` — nạp vào mọi phiên qua `CLAUDE.md`.
- GVHD chốt một "điểm cần xác nhận": ghi vào `docs/01-nghiep-vu.md` mục 10, rồi sửa skill `tinh-diem-clo` / `nghiep-vu-qltt` nếu ảnh hưởng.
- Đổi phân công / lịch: sửa `docs/04-ke-hoach.md`, cập nhật dòng "Hai người" trong `hooks/khoi-dong-phien.js` và `CLAUDE.md`.
