# Tiến độ QLTT

> File này được hook đầu phiên đọc (4000 ký tự đầu) — **phần đầu giữ ngắn**. Chi tiết bàn giao ở cuối file.
> Kế hoạch đầy đủ: `docs/04-ke-hoach.md`.

**Cập nhật 12/11/2026**: Backend xong cả 13 UC (#1–#102). Seed V4 xong + kiểm chứng; CSDL dev ở V1–V4.
`mvnw test` xanh 21/21. Khung frontend xong. **Màn FE: SCR-09/10 xong** (A). **Chưa có**: các màn SCR còn lại,
cập nhật docs, Postman.

## Bảng 6 tuần

| Tuần | Mốc | A (Bảo) | B (Văn) |
|---|---|---|---|
| 1 | `t1-nen-tang` | ✅ | ✅ |
| 2 | `t2-dang-ky-den-thuc-tap` | ✅ | ✅ |
| 3 | `t3-cham-chang-1` | ✅ | ✅ |
| 4 | `t4-luong-day-du` | ✅ | ✅ |
| 5 | `t5-thong-ke` | ✅ backend (UC13 RP-01…06 + Excel) · 🔶 FE (SCR-09/10 ✅) | ✅ seed V4 · ✅ khung FE · ⬜ Postman · ⬜ màn FE |
| 6 | `t6-ban-demo` | ⬜ | ⬜ |

Chưa tag mốc nào (`t1`…`t5`) — tag trên `main` khi chốt.

## Việc tiếp theo (theo thứ tự)

1. **Màn hình FE** — thay `PlaceholderPage` bằng trang thật (khai báo trong `TRANG` ở `frontend/src/App.tsx`, quyền lấy
   từ `frontend/src/menu.ts`). Thứ tự theo kịch bản demo: A — ~~SCR-09/10~~ ✅, SCR-18/20, SCR-19, SCR-21, SCR-24, SCR-25,
   SCR-03, SCR-06, chuông thông báo; B — SCR-11, SCR-12 (+ trang chi tiết hồ sơ cho GV/cán bộ), SCR-13, SCR-14…17,
   SCR-07/08, SCR-22, SCR-23.
2. **Docs** — bổ sung `docs/01-nghiep-vu.md` mục 10 các quyết định 10.12–10.14 và các quyết định khác (danh sách
   ở *Bàn giao › Quyết định cần ghi*); sửa mô tả NT-07, NT-12, NT-13, NT-14.
3. **B** — Postman collection 4 vai trò; `README.md` hướng dẫn chạy demo.
4. **Trước demo**: `docker compose down -v` để xóa dữ liệu thử nghiệm trong CSDL dev, rồi chạy lại (Flyway nạp V1–V4).
   Mọi thao tác thử trên CSDL dev từ giờ đều làm bẩn kịch bản demo.

## Lưu ý quan trọng

- Commit **thẳng lên `main`**, không qua nhánh/PR (người dùng yêu cầu để kịp tiến độ) — lệch `.claude/rules/git.md`.
- Commit **luân phiên đúng tài khoản chủ phần việc** (A = HoangGiaBaoo, B = SAKER205); **không** thêm Co-Authored-By,
  không có chữ "claude" trong commit. Một số subject đã > 72 ký tự — từ nay giữ ≤ 72.
- Tài khoản ADMIN demo là `giaovu` / `Qltt@2026` (không phải `admin`). Mọi tài khoản seed dùng `Qltt@2026`.

## Điểm cần xác nhận với GVHD

`docs/01-nghiep-vu.md` mục 10 (10.1–10.11 đã ghi; 10.12–10.14 mới quyết định trong code, chưa ghi vào tài liệu).

---

# Bàn giao chi tiết (phiên 08/11/2026)

## Trạng thái code theo UC

| UC | Endpoint | Chủ | Commit |
|---|---|---|---|
| Nền tảng, auth, nhật ký, thông báo | #1–#4, #100–#102 | A | `777450d`, `3e70b84` |
| UC01 tài khoản | #5–#16 | A | `f680b7a`, `420cca2` |
| UC02 ĐVHD | #17–#25 | B | `9cb22a6` |
| UC03 đợt, chặng, cấu hình | #26–#38 | A | `2b4f20b`, `3014623` |
| UC04 đăng ký | #39–#47 | B | `5758b87` |
| UC05 phân công | #48–#51 | B | `5f43e41` |
| UC06 kế hoạch | #52–#56 | B | `b5cca9c` |
| UC07 nhật ký, tiến độ, minh chứng | #57–#68 | B | `8e75a6e`, `a49e27d` |
| UC08 phiếu đánh giá | #69–#76 | A | `30ecbf0` |
| UC09 Tổ đánh giá | #77–#81 | A | `ec9b029` |
| UC10 kết quả, TTTN-07 Word | #82–#88 | A | `99046df`, `2906db6` |
| UC11 báo cáo TTTN-06 | #89–#93 | B | `5ef5efa` |
| UC12 phản hồi 08a/08b, HPself | #94–#97 | B | `5d350d8` |
| UC13 thống kê RP-01…06, Excel | #98–#99 | A | `98c4bc9` |
| ScoringService + 12 ca test | — | A | `ae57568`, `2d237cc` |

Đã thử bằng curl: vòng đời đầy đủ của 1 hồ sơ cho ra đúng ví dụ tính tay (CLO 8,2/7,2/7,2/8,8/7,7/7,4/7,5; HP 7,7;
thưởng 0,2 ⇒ 7,9). Mọi RP-01…RP-06 khớp dữ liệu; vai trò khác ADMIN gọi `/api/statistics` ⇒ 403.

## Quyết định cần ghi vào `docs/01-nghiep-vu.md` mục 10

- **10.12** Tài khoản cán bộ ĐVHD tạo ở trạng thái `VO_HIEU_HOA`, chỉ kích hoạt khi ĐVHD được duyệt.
- **10.13** Sửa α một CLO (#34) phải gửi kèm `dieuChinhAlphaKhac` (đổi α các CLO khác trong cùng lần lưu); hệ thống
  kiểm Σα = 100 sau khi áp tất cả (CBR-07).
- **10.14** Thiếu minh chứng **không chặn** tính điểm ⇒ kết quả `KHONG_DAT` lý do (d). Khi xác nhận (#86) nếu minh
  chứng hoặc 08a/08b thay đổi sau lần tính gần nhất ⇒ chặn, yêu cầu Tính lại (Điều 15 khoản 3).
- Hạn mức cán bộ (CBR-03) chỉ đếm sau khi cán bộ xác nhận tiếp nhận, theo từng đợt.
- Không mở lại phiếu khi kết quả đã công bố; mở lại phiếu ⇒ kết quả về `CHUA_TINH`, nộp lại ⇒ tự tính lại.
- Thành viên vắng mặt: phiếu của họ không vào phép tính; chặng cuối cần đủ phiếu của mọi thành viên không vắng.
- Nhật ký chỉ ghi/sửa trong 7 ngày gần nhất; nhắc khi quá 5 ngày không ghi.
- Báo cáo TTTN-06: cán bộ ĐVHD xác nhận trước, GVHD sau; đủ hai xác nhận ⇒ hồ sơ `CHO_DANH_GIA`.
- 08a/08b gửi được khi hồ sơ `CHO_DANH_GIA`, `HOAN_THANH`, `KHONG_HOAN_THANH`; phần A (tự đánh giá CLO) của 08b
  chỉ sinh viên thấy; 08a "tích cực" = trung bình 6 tiêu chí ≥ 3 (dùng cho KPI 80% Điều 24 khoản 2).
- Điểm thưởng: GVHD đề xuất (#85), giáo vụ duyệt khi xác nhận (#86), tối đa 0,5 (Điều 18 khoản 4).

## Seed V4 — đã viết và kiểm chứng (10/11/2026)

`src/main/resources/db/migration/V4__seed_kich_ban_demo.sql` (877 dòng) sinh bằng `scripts/seed/gen_v4.py` (bộ tính
điểm Decimal sao từ `ScoringService`, tự assert từng ca); kiểm chứng bằng `scripts/seed/verify_v4.py` trên CSDL thử
(hướng dẫn ở đầu file). V4 đã merge thì không sinh đè — đổi dữ liệu bằng migration mới. Mật khẩu mọi tài khoản `Qltt@2026`. Tên đơn vị/người hư cấu, email đuôi `.test`.

**Tài khoản mới**: cán bộ `cb.son`, `cb.trang` (Sao Mai), `cb.quang`, `cb.yen` (Hồng Hà, **hạn mức 1**), `cb.duc`
(Viện Thăng Long), `cb.phuong` (Bình Minh — ĐVHD `CHO_DUYET`, tài khoản `VO_HIEU_HOA`); SV K66 `sv.nam` … `sv.toan`;
SV K67 `sv.mai`, `sv.nga`, `sv.phat`, `sv.quan`, `sv.thu`.

**Đợt `TTTN-2025-HK2`** (02/03–26/04/2026, `DA_KET_THUC`, đã công bố) — 3 Tổ, 59 phiếu, 08a+08b đủ cả 10 hồ sơ:

| SV | Ca | CLO1…CLO7 | HP | Kết luận |
|---|---|---|---|---|
| sv.nam | Ví dụ tính tay chuẩn | 8,2 7,2 7,2 8,8 7,7 7,4 7,5 | 7,7 | Đạt |
| sv.oanh | Thưởng 0,3 đẩy Mức 3 → Mức 4 | 8,4 8,4 7,9 8,6 8,3 7,9 8,3 | 8,6 | Đạt |
| sv.phong | CLO2 = 3,0 Mức 0 | | 5,9 | Không đạt (b) |
| sv.quyen | CLC/STEM, CLO2 = 5,0 Mức 1 | | 6,9 | Không đạt (b) |
| sv.tai | Chuẩn, cùng CLO2 = 5,0 (đối chứng) | | 6,9 | Đạt |
| sv.uyen | CLC/STEM giỏi | | 9,1 Mức 4 | Đạt |
| sv.vinh | Nghiên cứu, thiếu Sản phẩm nghiên cứu | | 7,6 | Không đạt (d) |
| sv.xuan | Tổ 3: gv.hoa vắng (phiếu 2,0 bị loại), gv.tung thay | | 7,1 | Đạt |
| sv.thao | HP Mức 1, vừa đủ | | 4,7 | Đạt |
| sv.toan | HP < 4, CLO1/CLO2 Mức 0 | | 3,4 | Không đạt (b)+(c) |

**Đợt `TTTN-2026-HK1`** (07/09–01/11/2026, `DANG_THUC_HIEN`, hai chặng `DANG_MO`) — mốc demo:

| Bước | Dữ liệu sẵn | Thao tác live |
|---|---|---|
| 3 | `cb.yen` hạn mức 1, chưa có SV | Trong đợt tạo live: sv.khanh đăng ký cb.yen → cb.yen xác nhận → sv.linh chọn cb.yen ⇒ `QUOTA_EXCEEDED` |
| 4 | sv.dung `CHO_DVHD`, cán bộ cb.duc | cb.duc xác nhận (#45) |
| 5 | sv.giang, sv.mai `CHO_GVHD` chưa GVHD; gv.hoa 4/5 | Phân công cả hai cho gv.hoa ⇒ hủy cả lô; phân cho gv.minh ⇒ được |
| 6 | sv.ha `CHO_GVHD`, đã phân gv.lan | gv.lan duyệt ⇒ 9 dòng kế hoạch + 8 dòng tiến độ |
| 7 | sv.cuong có kế hoạch khóa, 24 nhật ký, tuần 8 chưa xác nhận | Ghi nhật ký hôm nay, tải minh chứng, xem bảng Đủ/Thiếu |
| 8 | sv.binh: cb.quang đã nộp chặng 1, gv.lan mới nháp | gv.lan mở phiếu cán bộ ⇒ 403 (BR-08.7); nộp ⇒ xem được |
| 9 | sv.nga…sv.thu `DANG_THUC_TAP` (GVHD gv.hoa; cán bộ cb.son/cb.quang) | Lập tổ 4 người ⇒ bị chặn số chẵn |
| 10–11 | sv.an `CHO_DANH_GIA`; tổ gv.tung/gv.lan/cb.son; hai GV đã nộp chặng 2; có 08a, **chưa có 08b** | cb.son nộp CLO1–6 = 8 7 7 9 8 8 ⇒ tự tính HP 7,7 nhưng Không đạt (d) thiếu 08b → SV gửi 08b → TTTN-07 cảnh báo dữ liệu đổi → giáo vụ Tính lại ⇒ Đạt. Muốn đi thẳng tới Đạt: cho SV gửi 08b trước bước 10 |

**Đã kiểm chứng** trên CSDL thử riêng `qltt_seedtest` (đã xóa sau khi thử): Flyway nạp V1–V4 sạch; RP-01…RP-06 chạy
được; 10 bảng TTTN-07 chỉ có cảnh báo chuẩn hóa CLO7 (đúng); SV K66 xem được kết quả, 08a/08b, chỉ số tự nhận thức;
đưa 10 kết quả về `DA_TINH` rồi gọi #84 ⇒ **Java tính lại khớp seed ở mọi cột**; bước 4, 5, 6, 8, 10 chạy đúng như bảng.

## Khung frontend (10/11/2026)

React 18.3 + TS 5.6 + Vite 6 + React Router 6 + axios, CSS thuần (`src/styles.css`, biến màu ở `:root`).
`npm --prefix frontend install` rồi `npm --prefix frontend run dev` (cổng 5173 — khớp CORS backend); backend khác cổng
8080 thì tạo `frontend/.env.local` từ `.env.example`.

- `api/client.ts`: axios duy nhất, gắn Bearer, chuẩn hóa lỗi thành `ApiError(code, message, errors)`; 401 (trừ lúc
  đăng nhập) ⇒ xóa token, về `/login?hetPhien=1`. `layData()` bóc `data` của `ApiResponse`.
- `auth/AuthContext.tsx` (token `qltt_token` trong localStorage, đọc lại phiên bằng #2), `auth/RequireRole.tsx`.
- `menu.ts`: một danh mục màn hình theo 4 vai trò (SCR, người phụ trách, mô tả) — App sinh route + menu từ đây.
- `components/`: `StatusBadge` (màu cố định theo enum), `ErrorAlert` (lỗi nghiệp vụ vàng, lỗi khác đỏ, nguyên văn
  `message`), `Loading`. `utils/format.ts` (điểm 7,7 · dd/MM/yyyy), `utils/constants.ts` (nhãn mọi enum).
- Trang: đăng nhập (nút điền nhanh tài khoản demo chỉ hiện ở `npm run dev`), tổng quan theo vai trò, 403, 404,
  giữ chỗ cho 19 màn SCR.
- Đã thử với backend: preflight CORS từ 5173, đăng nhập sai/đúng, `/auth/me`, 401 không token đều đúng cấu trúc.
- Trang con không có trên menu (chi tiết một bản ghi) khai báo ở `TRANG_CON` trong `App.tsx`, tự ghi quyền.
- `components/ConfirmDialog` dùng chung cho thao tác khó hoàn tác (nộp phiếu, chuyển trạng thái…).

### SCR-09/10 Đợt thực tập (A, 12/11/2026)

`pages/terms/`: `TermListPage` (SCR-09: danh sách, lọc, tạo đợt — xem trước số tuần và mốc 2 chặng theo đúng cách
backend tính), `TermDetailPage` (SCR-10: các bước trạng thái đợt có hỏi lại, sửa thông tin/gia hạn, mở/đóng chặng),
`CloConfigSection` (sửa α + tỷ lệ ĐVHD, GVHD = 100 − ĐVHD, Σα hiện trực tiếp; lưu bằng #34 kèm `dieuChinhAlphaKhac`),
`RubricLevels` (5 mức, sửa mô tả hành vi), `QuestionSection` (ma trận CLO × chặng — CLO7 chỉ chặng 2 ⇒ chuẩn hóa).
Đã thử bằng Edge headless trên CSDL tạm (không đụng CSDL dev): 28/28 ca — tạo đợt, trùng mã, Σα = 105 bị chặn
(Điều 9 k2), lưu 4 CLO, rubric, gia hạn tính lại mốc chặng 2, chuyển trạng thái + cảnh báo CBR-23, đóng/mở chặng,
đợt có phiếu đã nộp khóa sửa α, đợt đã kết thúc chỉ xem, GV gõ thẳng URL ⇒ 403.

## Môi trường thử hiện tại

CSDL dev đã `down -v` ngày 10/11/2026 và nạp lại sạch V1–V4 (chỉ thêm dữ liệu của `mvnw test`, không thao tác API).
