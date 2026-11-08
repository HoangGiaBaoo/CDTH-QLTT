---
description: Đối chiếu code hiện có với kế hoạch 6 tuần của hai người, báo còn thiếu gì, ai đang chậm, nên cắt gì nếu trễ
allowed-tools: Read, Grep, Glob, Bash
---

# Kiểm tiến độ

## Thu thập

1. Đọc `docs/04-ke-hoach.md` (lịch, phân công, thứ tự cắt) và `docs/TIEN-DO.md`.
2. Xác định **hôm nay thuộc tuần mấy** của kế hoạch (tuần 1 bắt đầu 09/11/2026).
3. Quét code:
   - Endpoint đã có: grep `@(Get|Post|Put|Delete)Mapping` + `@RequestMapping` trong `controller/`, ghép với 102 dòng `docs/02-api.md`, **tách theo người phụ trách A/B**.
   - Entity: so với 28 bảng (bảng 2.2 kế hoạch).
   - Migration Flyway đã có.
   - `ScoringServiceTest`: số ca; chạy `./mvnw -q test` nếu biên dịch được.
   - `frontend/src/pages/`: màn SCR nào đã có.
4. `git log --oneline --since=<đầu tuần> main`, tách theo tác giả, để biết mỗi người đã merge gì.

## Báo cáo

```
## Tuần 3 / 6 (23/11–29/11) — mốc t3-cham-chang-1

|         | Endpoint | Màn hình | Ghi chú |
|---|---|---|---|
| A (Bảo) | 31/54 | 6/12 | ScoringService 10/12 test |
| B (Văn) | 30/48 | 7/11 | đúng hạn |

## Mốc tuần này: CHƯA ĐẠT — thiếu: ...
## Nợ mốc tuần trước: ...
## Đang chờ nhau: A chờ MinhChungService.doiChieu (B) ...
## Đề xuất
- Ưu tiên tuần tới: ...
- Nếu trễ > 3 ngày: cắt <mục theo thứ tự ở kế hoạch mục 6>
```

Không bao giờ đề xuất cắt UC08, UC09, UC10. Hỏi người dùng có muốn cập nhật `docs/TIEN-DO.md` theo báo cáo không (agent `cap-nhat-tai-lieu`).
