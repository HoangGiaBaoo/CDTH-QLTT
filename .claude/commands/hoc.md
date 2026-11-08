---
description: Rút bài học từ phiên làm việc, ghi vào docs/BAI-HOC.md để cả nhóm không vấp lại
---

# Rút bài học cuối phiên

1. Nhìn lại phiên này: chỗ nào **mất thời gian vô ích** — lỗi build khó tìm, hiểu sai đặc tả, cấu hình Boot 4 khác Boot 3, xung đột git, nhầm phân quyền…
2. Với mỗi chỗ, viết **một mục ngắn** vào cuối `docs/BAI-HOC.md` (tạo file nếu chưa có):

```
## 2026-11-12 · B · Flyway checksum mismatch
- Triệu chứng: app không khởi động sau khi pull
- Nguyên nhân: sửa V1__schema.sql đã merge
- Cách đúng: thêm V5__..., không sửa migration cũ
```

3. Chỉ ghi điều **không suy ra được từ code**. Không chép lại quy tắc đã có trong `.claude/rules/`.
4. Nếu bài học đủ chung để thành quy tắc (ví dụ một lỗi mà hook nên bắt tự động), đề xuất sửa `.claude/rules/` hoặc `.claude/hooks/kiem-tra-quy-tac.js` — **hỏi trước khi sửa**.
5. Báo lại đã ghi những mục nào. Nhắc commit `docs/BAI-HOC.md` cùng PR gần nhất để người kia cũng đọc được.
