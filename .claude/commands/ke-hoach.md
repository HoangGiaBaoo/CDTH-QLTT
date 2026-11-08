---
description: Lập kế hoạch từng bước nhỏ cho một UC/endpoint trước khi code, bám kế hoạch 6 tuần và phân công 2 người, chờ xác nhận mới làm
argument-hint: <UC hoặc việc cần làm, ví dụ "UC08 nộp phiếu">
---

# Lập kế hoạch trước khi code

Việc: **$ARGUMENTS**

Dùng agent `nguoi-lap-ke-hoach` để lập kế hoạch theo đúng định dạng của agent đó (phụ thuộc, các bước nhỏ
thử được, rủi ro, ước lượng so với mốc tuần trong `docs/04-ke-hoach.md`).

Sau khi có kế hoạch:
1. Trình bày kế hoạch cho người dùng.
2. Nếu việc **không thuộc phần của người đang làm** (bảng phân công mục 2) — nói rõ và hỏi đã thống nhất đổi chưa.
3. **Dừng lại, chờ xác nhận.** Không viết code cho đến khi người dùng đồng ý (hoặc sửa kế hoạch).
