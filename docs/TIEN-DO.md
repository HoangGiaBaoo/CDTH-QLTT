# Tiến độ QLTT

> File này được hook đầu phiên đọc (4000 ký tự đầu) — **giữ ngắn**. Ghi chép dài để vào commit / PR.
> Cập nhật sau mỗi lần merge vào `main`. Kế hoạch đầy đủ: `docs/04-ke-hoach.md`.

**Hôm nay đang ở**: Tuần 0 — đã có tài liệu, `.claude/` đã chỉnh cho QLTT, chưa có code nghiệp vụ.

## Bảng 6 tuần

| Tuần | Thời gian | Mốc | A (Bảo) | B (Văn) |
|---|---|---|---|---|
| 1 | 09/11–15/11 | `t1-nen-tang`: đăng nhập 4 vai trò, Flyway 28 bảng | ⬜ | ⬜ |
| 2 | 16/11–22/11 | `t2-dang-ky-den-thuc-tap`: đăng ký → DANG_THUC_TAP | ⬜ | ⬜ |
| 3 | 23/11–29/11 | `t3-cham-chang-1`: ScoringService + test, chấm chặng 1 | ⬜ | ⬜ |
| 4 | 30/11–06/12 | `t4-luong-day-du`: trọn vòng đời tới công bố | ⬜ | ⬜ |
| 5 | 07/12–13/12 | `t5-thong-ke`: tra cứu, thống kê, dữ liệu demo | ⬜ | ⬜ |
| 6 | 14/12–20/12 | `t6-ban-demo`: kiểm thử, đóng băng 18/12 | ⬜ | ⬜ |

Ký hiệu: ⬜ chưa làm · 🟨 đang làm · ✅ xong mốc · 🟥 trễ

## Việc tiếp theo

**A (Bảo)**
1. Commit lần đầu lên `main` (repo đang ở nhánh `master`, chưa có commit nào)
2. Thêm dependency vào `pom.xml`, `application.yml`, toàn bộ enum
3. `common/` (ApiResponse, ErrorCode, GlobalExceptionHandler) + stub hợp đồng mục 4

**B (Văn)**
1. `docker-compose.yml` MySQL 8
2. `V1__schema.sql` 28 bảng theo `docs/03-csdl.md`
3. Stub hợp đồng mục 4 của kế hoạch

## Đang chờ nhau

_(chưa có)_

## Điểm cần xác nhận với GVHD

Xem `docs/01-nghiep-vu.md` mục 10 — 11 điểm, đã chọn mặc định để code không bị chặn.
