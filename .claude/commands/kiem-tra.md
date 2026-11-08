---
description: Chạy biên dịch + test backend (và build frontend nếu có), báo cáo gọn kèm gợi ý sửa
allowed-tools: Bash, Read, Grep, Glob
---

# Kiểm tra build và test

Chạy lần lượt, dừng ở bước đầu tiên lỗi:

1. `./mvnw -q compile`
2. `./mvnw -q test`
3. Nếu có thư mục `frontend/` và có thay đổi trong đó so với `main`: `npm --prefix frontend run build`

Báo cáo:

```
## Kết quả
compile:  OK / LỖI
test:     12/12 xanh (ScoringServiceTest 12, ...) / 2 đỏ
frontend: OK / LỖI / bỏ qua

## Lỗi (nếu có)
- <file:dòng> <thông điệp gốc rút gọn>
  Nguyên nhân có thể: ...
  Gợi ý sửa: ...
```

Lỗi khởi động / Flyway / Boot 4 phức tạp: đề xuất dùng agent `sua-loi-build`.
Không tự sửa code trừ khi người dùng bảo. Báo kết quả thật — không nói test xanh khi chưa chạy.
