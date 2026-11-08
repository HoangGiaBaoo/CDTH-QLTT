# QLTT — Hệ thống Quản lý Thực tập tốt nghiệp (HUCE)

Đồ án môn Chuyên đề Tổng hợp, Nhóm 29, GVHD Phạm Hữu Tùng. Hai người:
**A = Hoàng Gia Bảo** (nền tảng, UC01, UC03, UC08–UC10, UC13) · **B = Trần Đức Văn** (UC02, UC04–UC07, UC11, UC12, khung frontend).
Nghiệp vụ theo Quy định TTTN kèm QĐ 207/QĐ-ĐHXDHN. Ba UC không được cắt: **UC08, UC09, UC10**.

Stack: Spring Boot 4.1.1 · Java 21 · MySQL 8 · Flyway · Spring Security JWT · REST (không render giao diện) · React 18 + TS + Vite trong `frontend/`.

## Tài liệu — đọc phần liên quan trước khi code

| File | Nội dung |
|---|---|
| `docs/01-nghiep-vu.md` | CBR, 15 mã lỗi, máy trạng thái, cấu hình CLO, minh chứng, bảng UC, **điểm cần xác nhận** |
| `docs/02-api.md` | 102 endpoint, quyền, người phụ trách (sinh từ Excel, không sửa tay) |
| `docs/03-csdl.md` | 28 bảng (sinh từ Excel, không sửa tay) |
| `docs/04-ke-hoach.md` | Phân công 2 người, hợp đồng hàm, lịch 6 tuần, thứ tự cắt |
| `docs/TIEN-DO.md` | Tiến độ hiện tại, việc tiếp theo |

Tài liệu gốc (docx, pdf, xlsx) ở `docs/tai-lieu-goc/`; khi bản tóm tắt mâu thuẫn tài liệu gốc thì tài liệu gốc thắng.

## Quy tắc luôn áp dụng

@.claude/rules/quy-tac-code.md
@.claude/rules/bao-mat.md
@.claude/rules/kiem-thu.md
@.claude/rules/git.md

## Lệnh

```
docker compose up -d                 # MySQL 8
.\mvnw.cmd spring-boot:run           # PowerShell  (Git Bash: ./mvnw spring-boot:run)
.\mvnw.cmd test
npm --prefix frontend run dev
```

Lệnh gõ nhanh của nhóm: `/ke-hoach` `/soat-code` `/soat-nghiep-vu` `/soat-tinh-diem` `/kiem-tra` `/tien-do`
`/giai-thich` `/van-dap` `/hoc` — xem `.claude/README.md`.
