# Tiến độ QLTT

> File này được hook đầu phiên đọc (4000 ký tự đầu) — **phần đầu giữ ngắn**. Chi tiết bàn giao ở cuối file.
> Kế hoạch đầy đủ: `docs/04-ke-hoach.md`.

**Cập nhật 12/11/2026 (cuối phiên)**: Backend xong cả 13 UC (#1–#102); `mvnw test` xanh 21/21; seed V4 đã kiểm chứng;
CSDL dev ở V1–V4. **Màn FE đã xong**: A — SCR-09/10, 18/20, 19, 21, 24, 25 · B — SCR-11, 12. **Việc kế tiếp: SCR-13**
(mục 1 dưới). Còn lại: các màn khác, docs mục 10, Postman. Cách làm + cách thử một màn: *Bàn giao › Cách làm một màn FE*.

## Bảng 6 tuần

| Tuần | Mốc | A (Bảo) | B (Văn) |
|---|---|---|---|
| 1 | `t1-nen-tang` | ✅ | ✅ |
| 2 | `t2-dang-ky-den-thuc-tap` | ✅ | ✅ |
| 3 | `t3-cham-chang-1` | ✅ | ✅ |
| 4 | `t4-luong-day-du` | ✅ | ✅ |
| 5 | `t5-thong-ke` | ✅ backend (UC13 RP-01…06 + Excel) · 🔶 FE (SCR-09/10 ✅ · SCR-18/20 ✅ · SCR-19 ✅ · SCR-21 ✅ · SCR-24 ✅ · SCR-25 ✅) | ✅ seed V4 · ✅ khung FE · ⬜ Postman · 🔶 FE (SCR-11 ✅ · SCR-12 ✅) |
| 6 | `t6-ban-demo` | ⬜ | ⬜ |

Chưa tag mốc nào (`t1`…`t5`) — tag trên `main` khi chốt.

## Việc tiếp theo (theo thứ tự)

1. **SCR-13 Phân công GVHD (B) — làm ngay.** `/assignments` (menu ADMIN, đích NT-03 và nút "Phân công GVHD" của
   SCR-12): chọn đợt; #49 trả SV chưa có GVHD + giảng viên kèm "đã nhận / hạn mức"; chọn nhiều SV → một giảng viên → #50
   (vượt hạn mức ⇒ QUOTA_EXCEEDED, **hủy cả lô** — UC05 4a); danh sách đã phân công #48; đổi GVHD kèm lý do #51 (chặn khi
   GV cũ đã có phiếu nộp). Thử theo bước demo 5: sv.giang + sv.mai cho gv.hoa (4/5) ⇒ hủy cả lô; cho gv.minh ⇒ được.
   Sau đó, theo kịch bản demo — B: SCR-14…17 (bản cho cán bộ thay chỗ giữ `/records/:id/plan|logbook|progress|evidence`),
   SCR-07/08, SCR-22, SCR-23 (`/records/:id/report|feedback`); A: SCR-03 (mở rộng `api/users.ts`), SCR-06 (#3, #4),
   chuông thông báo (#101, #102). Phần B vẫn commit bằng SAKER205.
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
- **Không thử API trên CSDL dev** (làm bẩn kịch bản demo) — thử màn FE trên CSDL tạm riêng, cổng 3307 (*Bàn giao*).
- Mỗi màn xong: build + thử trình duyệt ⇒ báo người dùng ⇒ **hỏi trước khi commit/push**; người dùng thường trả lời
  "commit push rồi làm tiếp SCR-xx".

## Điểm cần xác nhận với GVHD

`docs/01-nghiep-vu.md` mục 10 (10.1–10.11 đã ghi; 10.12–10.14 mới quyết định trong code, chưa ghi vào tài liệu).

---

# Bàn giao chi tiết (bắt đầu 08/11/2026, cập nhật 12/11/2026)

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

### SCR-18/20 Phiếu đánh giá (A, 12/11/2026)

`pages/assessments/`: `AssessmentListPage` — GV/cán bộ: tab 2 chặng, chặng 1 lấy SV từ #39, chặng 2 lấy SV của tổ
mình tham gia (#77), ghép phiếu của mình (#69); giáo vụ: `AssessmentOversight` (mọi phiếu + cảnh báo lệch > 2,0 #76).
`GradingPage` (`/assessments/form?recordId=&stage=`) — `components/RubricLevelPicker` chọn mức ⇒ hiện mô tả hành vi +
điền điểm giữa khoảng, viền đỏ khi thiếu / sai khoảng (cùng quy tắc nửa mở như `RubricUtils`), Lưu nháp / Nộp (hỏi lại),
nhóm ĐVHD thấy dòng CLO7 tắt kèm CBR-09, không hiện gì của người chấm kia. `AssessmentDetailPage`
(`/assessments/:id`, đích của NT-13) — người chấm mở phiếu mình ⇒ sang trang chấm; giáo vụ xem + Mở lại có lý do (#75).
Menu `/assessments` thêm ADMIN ("Giám sát phiếu chấm"). `components/TermSelect` (chọn đợt) dùng lại cho SCR-19/21/25.
`api/records.ts`, `types/record.ts` lúc đó mới có #39, #41 (SCR-11 đã mở rộng tới #44).
Đã thử trên CSDL tạm, seed V4: 25/25 ca — gv.lan tiếp tục nháp sv.binh rồi nộp; cán bộ chưa nộp không xem được phiếu
GV (BR-08.7); cb.son chấm chặng 2 sv.an (CLO7 tắt); giáo vụ mở lại phiếu gv.tung, gv.tung sửa từ link NT-13 và nộp lại;
cán bộ mở SV không phải của mình ⇒ chặn; SV vào `/assessments` ⇒ 403.

### SCR-19 Tổ đánh giá (A, 12/11/2026)

`pages/panels/`: `PanelListPage` (#77 — giáo vụ thấy mọi tổ + số SV chưa xếp tổ; thành viên thấy tổ mình),
`PanelCreatePage` (`/panels/new`, #79 — chọn SV chưa xếp tổ, nút thêm nhanh GVHD + cán bộ của SV đã chọn, chọn chủ
tịch, bảng kiểm CBR-14 ✓/✗ theo `thanhPhan.ts` cùng điều kiện với `ToDanhGiaService.kiemThanhPhan`; trực tuyến bắt
ghi chú phê duyệt), `PanelDetailPage` (`/panels/:id`, đích NT-11, cả SV xem được tổ mình — #78; giáo vụ sửa buổi #80,
vắng mặt / có mặt lại có lý do + người thay thế #81; vắng làm nhóm ĐVHD trống ⇒ cảnh báo THIEU_PHIEU_DVHD; thành viên có
mặt có nút "Chấm chặng 2"). `api/users.ts` mới có #5 (SCR-03 mở rộng).
Đã thử 20/20 ca trên CSDL tạm: 2 người ⇒ chặn Đ10 k3a; trực tuyến thiếu phê duyệt ⇒ chặn Đ10 k3b; lập tổ sv.binh
(gv.lan, cb.quang, gv.tung); cán bộ vắng ⇒ cảnh báo; gv.tung vắng + gv.hoa thay ⇒ vẫn đạt; SV ngoài tổ ⇒ ACCESS_DENIED.

### SCR-21 Kết quả học phần — TTTN-07 (A, 12/11/2026)

`pages/results/`: `ResultListPage` (#82 — bảng kết quả toàn đợt, cột CLO lấy từ dữ liệu, ô đếm theo trạng thái, lọc
kết quả/kết luận/tìm; giáo vụ chọn kết quả đã xác nhận để công bố hoặc công bố cả đợt #87), `ResultDetailPage`
(`/results/:id`, #83 — đủ 6 mục mẫu TTTN-07; giáo vụ Tính điểm/Tính lại #84, Xác nhận kèm duyệt điểm thưởng #86,
Công bố #87; GVHD của SV nhập nhận xét + đề xuất thưởng #85; giáo vụ và GV xuất Word #88; cán bộ chỉ xem),
`CloScoreTable` (mục II, cột (1)…(9) như bản Word, hai chặng chọn giống `XuatBangTongHopWord.haiChang`),
`RecognitionConditions` (4 điều kiện Đ15 k3 ✓/✗, ghép lý do theo tiền tố "(a)"…"(d)" của `ScoringService`),
`ReviewForm`. Giao diện không tự tính điểm; trần thưởng 0,5 để backend chặn (trích Đ18 k4).
Dùng chung: `utils/taiTep.ts` (tải tệp có JWT — B dùng cho #67, #91), `api/client.ts` đọc được lỗi JSON khi tải
tệp (`responseType: 'blob'`), `format.so2` cho cột trung gian.
Đã thử 39/39 ca trên CSDL tạm: HK2 khớp seed (sv.nam cột (7) 8,2 … 7,5, HP 7,7; sv.toan (b)+(c); sv.vinh (d); sv.oanh
thưởng 0,3); xuất `TTTN-07_2151220101.docx`; sv.an thiếu phiếu cb.son ⇒ THIEU_PHIEU; cb.son nộp ⇒ tự tính HP 7,7 Không
đạt (d); xác nhận khi chưa có nhận xét ⇒ chặn; GVHD thưởng 0,6 ⇒ chặn Đ18 k4, 0,2 ⇒ HP 7,9; SV gửi 08b ⇒ cảnh báo dữ
liệu đổi, xác nhận bị chặn tới khi Tính lại ⇒ Đạt; duyệt thưởng 0,1 ⇒ HP 7,8 Đã xác nhận; công bố đã chọn ⇒ Hoàn thành;
gv.lan (tổ) không có form nhận xét; cb.son không có nút; SV vào `/results` ⇒ 403.

### SCR-24 Kết quả của tôi (A, 12/11/2026)

`pages/results/MyResultPage` (`/my-result` lấy hồ sơ qua #40; `/results/:id` — đích NT-14 — qua `ResultEntryPage`:
SV ⇒ SCR-24, cán bộ ⇒ TTTN-07): điểm học phần + mức + kết luận, radar 7 trục (`CloRadar`, SVG thuần, một chuỗi màu
chính, tooltip khi rê/Tab; bảng điểm bên dưới là bản xem dạng bảng), bảng 7 CLO (trọng số, điểm, mức), 4 điều kiện
(dùng chung `RecognitionConditions`), nhóm năng lực, nhận xét GVHD. Không có điểm từng người chấm — #83 cho SV không
trả các trường đó. Chưa công bố / chưa gửi 08b (BR-12.5, nhánh 3a) ⇒ hiện nguyên văn thông điệp backend, giải thích
hai điều kiện và nút sang SCR-23 (`/my-record/feedback`, kèm `state.tuKetQua` để B hiển thị nếu muốn).
`api/records.ts` thêm `cuaToi` (#40). Chỉ số tự nhận thức (#97) để ở SCR-23 (B), SCR-24 chỉ dẫn link.
Đã thử 19/19 ca trên CSDL tạm: JSON #83 của SV không có `theoChang`/`dvhd`/`gvhd`/`canhBao`; sv.nam 7 CLO khớp seed,
HP 7,7 Đạt, tooltip radar; mở `/results/{id}` của mình ⇒ SCR-24, của SV khác ⇒ ACCESS_DENIED; sv.toan Không đạt
(b)+(c); sv.an chưa công bố ⇒ giải thích + nút SCR-23; sv.tai đã công bố nhưng xóa 08b ⇒ "Bạn cần gửi phiếu
phản hồi TTTN-08b…"; giáo vụ mở `/results/{id}` vẫn là TTTN-07.

### SCR-25 Thống kê (A, 12/11/2026)

`pages/statistics/StatisticsPage` (`/statistics`, chỉ ADMIN): chọn đợt + 6 tab RP-01…RP-06 (tab giữ trong URL
`?rp=`), ô chỉ số lấy từ `tongHop`, bảng chung đọc `cot`/`dong` của #98, ghi chú, nút "Xuất Excel" (#99, tên tệp từ
`Content-Disposition`). Biểu đồ (`ReportCharts`, CSS thuần): RP-02 thanh ngang tỷ lệ đạt từng CLO + vạch mục tiêu
(Đ24 k2) + ✓/✗, cột chồng 100% phân bố Mức 0–4 (thang một màu xanh nhạt → đậm, đã chạy `validate_palette --ordinal`);
RP-03 thanh tiến độ "đã nộp / cần có" theo chặng × nhóm. Mọi con số do backend tính, giao diện chỉ hiển thị; mã enum
đổi sang nhãn tiếng Việt; ý kiến RP-06 tách thành danh sách riêng, không tên SV.
**Sửa lỗi backend** `ThongKeService`: RP-05 và RP-06 trả 500 (NPE) với đợt chưa công bố kết quả / chưa có phiếu 08b —
dòng dùng `List.of` mà ô trung bình là `null` ⇒ đổi sang `Arrays.asList` (Excel đã xử lý ô `null`). Đây đúng là đợt
mặc định khi demo (HK1 đang chấm).
Đã thử 18/18 ca trên CSDL tạm + 12 tổ hợp báo cáo × đợt đều 200: RP-01 HK2 10 dòng, 60%; RP-02 nhãn CLO2 70% khớp API,
7 vạch mục tiêu, tooltip đoạn "n SV · x%", xuất `RP-02_TTTN-2025-HK2.xlsx`; RP-03 HK1 thanh theo chặng × nhóm; RP-04
có sv.vinh; RP-05 7 CLO; RP-06 không lộ tên SV; mở thẳng `?rp=RP-05`; giảng viên vào `/statistics` ⇒ 403.

### SCR-11 Đăng ký thực tập (B, 12/11/2026)

`pages/records/MyRecordPage` (`/my-record`; `/records/:id` — đích NT-01/02/05/06 — qua `RecordEntryPage`: SV ⇒ SCR-11,
cán bộ ⇒ chỗ giữ SCR-12). Chọn hồ sơ: #40 trả hồ sơ đợt đang chạy thì mở hồ sơ đó; hồ sơ thuộc đợt đã kết thúc mà có
đợt đang nhận đăng ký ⇒ phiếu mới cho đợt đó, kèm đường xem hồ sơ cũ; không có đợt mở ⇒ trạng thái trống.
`RegistrationForm` (Bản nháp / bị trả về): 6 hình thức (Đ4), danh mục minh chứng bắt buộc lấy từ #65 sau khi lưu nháp
(`RequiredEvidence`, không viết sẵn ở giao diện), ĐVHD đã duyệt (#17) → cán bộ còn hạn mức kèm "đang nhận x/y" (#23),
nội dung, ô cam kết ⇒ mới bấm được Gửi; Gửi = lưu (#42/#43) rồi #44, có hỏi lại. Đơn vị / cán bộ đã lưu nay hết chỗ vẫn
hiện (khóa) kèm nhắc chọn lại; QUOTA_EXCEEDED ⇒ tải lại danh sách cán bộ (7b); DUPLICATE_RESOURCE ⇒ báo CBR-01 và mở
hồ sơ hiện có (7a). Hồ sơ bị trả về ⇒ hiện lý do. "Đề xuất đơn vị mới" (#19, luồng thay thế) ⇒ đơn vị Chờ duyệt.
`RecordSummary` (đã gửi): thanh bước vòng đời, việc tiếp theo theo trạng thái, phiếu TTTN-01, minh chứng Đã có / Chưa
có (xám — nhiều mục chưa tới hạn; đối chiếu Đủ/Thiếu đầy đủ để SCR-17), lối tắt sang SCR-14…24.
Thêm: `api/hostOrgs.ts` (#17–#19, #23), `api/evidences.ts` (#65), `types/hostOrg.ts`, `types/evidence.ts`; `api/records.ts`
có `tao`/`capNhat`/`gui`; `ConfirmDialog` thêm `rong` (hộp thoại chứa form).
Đã thử 34/34 ca trên CSDL tạm (giáo vụ tạo + mở đăng ký đợt TTTN-2027-HK1 như bước demo 3): chưa có đợt ⇒ trống; chỉ 3
ĐVHD đã duyệt (không có Bình Minh); lưu khi chưa chọn hình thức ⇒ lỗi dưới ô; doanh nghiệp 6 minh chứng, nghiên cứu 4;
thiếu đề tài ⇒ "Hồ sơ còn thiếu…"; quốc tế 4 tuần ⇒ Đ4 k6; sv.khanh gửi cb.yen ⇒ Chờ ĐVHD; sv.linh nháp cb.yen (vẫn 0/1
vì CHO_DVHD chưa chiếm chỗ) → cb.yen xác nhận sv.khanh → sv.linh gửi ⇒ QUOTA_EXCEEDED Đ7 k2c; đổi cb.trang ⇒ gửi được;
cb.trang từ chối ⇒ mở `/records/{id}` thấy lý do + form; đề xuất Ánh Dương ⇒ Chờ duyệt; sv.nam (HK2 xong) ⇒ phiếu mới
+ link hồ sơ cũ; tạo trùng ⇒ CBR-01 (Điều 5); sv.cuong Đang thực tập ⇒ GVHD, lối tắt; SV mở hồ sơ người khác ⇒ 403.

### SCR-12 Hồ sơ thực tập (B, 12/11/2026)

`pages/records/RecordListPage` (`/records`, menu ADMIN "Hồ sơ thực tập", GV/cán bộ "Sinh viên hướng dẫn"): #39 theo đợt
(giáo vụ mặc định đợt Đang thực hiện; GV/cán bộ mặc định "Tất cả đợt" vì phạm vi nhỏ), tab trạng thái có số đếm + lọc
hình thức + tìm (mã SV, họ tên, đơn vị) — lọc trạng thái/hình thức làm ở giao diện trên danh sách của đợt để tab có số đếm
(#39 vẫn nhận `status`, `internshipType` cho Postman); bộ lọc giữ trong URL. Nhắc "x sinh viên chờ bạn xác nhận / phê
duyệt" (dòng tô vàng), giáo vụ được nhắc hồ sơ chờ phân công + nút sang SCR-13.
`RecordDetailPage` (`/records/:id` qua `RecordEntryPage` cho ADMIN/GV/cán bộ): thanh bước, thẻ "việc cần làm" chỉ cho
đúng người — cán bộ của hồ sơ khi Chờ ĐVHD (#45 xác nhận/từ chối), GVHD đã phân công khi Chờ GVHD (#46 phê duyệt/từ
chối) — từ chối bắt lý do; giáo vụ #47 Gián đoạn (khi Chờ GVHD / Đang thực tập / Chờ đánh giá, khớp `CHUYEN_HOP_LE`) và
Khôi phục, lý do bắt buộc. GVHD từ chối ⇒ mất phân công nên quay về danh sách kèm thông báo. QUOTA_EXCEEDED khi cán bộ
xác nhận ⇒ cảnh báo vàng + gợi ý từ chối. Khối Sinh viên + phiếu TTTN-01 (`RecordInfo`, tách từ `RecordSummary`, SCR-11
dùng chung; thanh bước tách thành `RecordStepper`). Trước khi duyệt: danh mục minh chứng bắt buộc (`RequiredEvidence`
thêm `xemHoSoSinhVien`). Sau khi duyệt: `RecordTracking` — 6 ô tóm tắt + lối sang: kế hoạch #52, nhật ký #57, tiến độ
#61, minh chứng #65 (đang thực tập ⇒ "Chưa có" xám; từ Chờ đánh giá ⇒ "Thiếu" vàng), báo cáo #89, phản hồi 08a/08b #94
(cán bộ không có dòng 08b vì #94 không trả); thêm ô TTTN-07 khi đã tới đánh giá. Ô lỗi riêng ô đó báo.
Các ô dẫn tới `/records/:id/plan|logbook|progress|evidence|report|feedback` — **chỗ giữ** (`MAN_THEO_DOI_HO_SO` ở
`App.tsx`) cho bản cán bộ của SCR-14…17, 22, 23. Thêm `api/studyPlans.ts`, `api/progress.ts`, `api/reports.ts`,
`api/feedbacks.ts` + `types/` tương ứng (mới có các GET; màn sau mở rộng). `api/records.ts` thêm `xacNhanTiepNhan`,
`pheDuyet`, `doiTrangThai`; `vongDoi.ts` thêm `GIAN_DOAN_DUOC`, `tinhTrangChoCanBo`.
Hạn nộp kế hoạch = 5 ngày làm việc từ **ngày bắt đầu đợt** (Đ6 k3a, UC06 4a) nên hồ sơ duyệt muộn như sv.ha hiện hạn đã
qua — đúng quy định, không phải lỗi.
Đã thử 59/59 ca trên CSDL tạm + chạy lại 34/34 ca SCR-11: giáo vụ HK1 11 hồ sơ, tab đếm đúng, nhắc 2 hồ sơ chờ phân công;
lọc + tìm + quay lại giữ bộ lọc; Tất cả đợt 21 dòng; sv.cuong: 24 ngày nhật ký, 7/8 tuần, kế hoạch Đã khóa, Gián đoạn
(lý do bắt buộc) → Khôi phục về Đang thực tập, nhật ký hệ thống 2 dòng; sv.an: 08a có, 08b chưa, ô TTTN-07 mở
`/results/{id}`; cb.son không thấy dòng 08b; **bước 4** cb.duc xác nhận sv.dung ⇒ Chờ GVHD; cb.duc mở hồ sơ khác ⇒
ACCESS_DENIED; **bước 6** gv.lan duyệt sv.ha ⇒ 9 dòng kế hoạch + 8 dòng tiến độ; gv.lan từ chối sv.giang ⇒ Bản nháp, mất
quyền xem; **bước 3** cb.yen (hạn mức 1) xác nhận sv.khanh rồi sv.linh ⇒ QUOTA_EXCEEDED Đ7 k2c, từ chối kèm lý do; SV vào
`/records` hoặc `/records/{id}/plan` ⇒ 403, `/records/{id}` của mình vẫn là SCR-11.

## Cách làm một màn FE (cho phiên sau)

1. Đọc `frontend/src/menu.ts` (đường dẫn, vai trò, endpoint của màn), mục UC trong `docs/02-api.md`, đặc tả UC trong
   `docs/tai-lieu-goc/BAO-CAO-PHAN-TICH-HE-THONG-QLTT-v1.0.docx` (luồng chính + nhánh 3a, 7b…) và **DTO/service backend**
   thật (tên trường, thông điệp lỗi) — giao diện không tự kiểm quy tắc, chỉ hiện nguyên văn `message`.
2. Code: `types/<module>.ts` khớp DTO, `api/<module>.ts` (một hàm một endpoint, ghi số #), `pages/<module>/*.tsx`;
   khai báo trang trong `TRANG` (mục menu) hoặc `TRANG_CON` (trang con, đích thông báo `/xxx/:id`) ở `App.tsx`;
   CSS thêm cuối `styles.css` thành một khối có tiêu đề màn. Mẫu sẵn: form + lỗi dưới ô (`RegistrationForm`,
   `TermForm`), bảng + lọc (`ResultListPage`), hộp thoại có lý do (`ConfirmDialog`, `PanelDetailPage`), tải tệp
   (`utils/taiTep.ts`), chọn đợt (`TermSelect`), thanh bước (`.stepper`). Đích thông báo mà SV và cán bộ cùng mở ⇒ trang
   "Entry" rẽ theo vai trò (`ResultEntryPage`, `RecordEntryPage`).
3. `npx tsc --noEmit -p frontend` + `npm --prefix frontend run build`.
4. Thử trên **CSDL tạm** (MySQL container `qltt-mysql-uitest` cổng 3307, DB `qltt_uitest`, Flyway tự nạp V1–V4) + backend
   cổng 8081 trỏ CSDL đó + Vite 5173 với `VITE_API_URL=http://localhost:8081/api`; trình duyệt Edge headless qua CDP.
   Bộ thử (driver `cdp.mjs`, `test-<màn>.mjs`, `moi-truong.sh`) để ngoài git, trên máy này — vị trí ghi trong memory của
   Claude. Mỗi lần chạy kịch bản cần CSDL vừa tạo lại (kịch bản tự sinh dữ liệu). Xong thì tắt hết, xóa container tạm.
5. Xem ảnh chụp (bảng tràn, chữ xuống dòng, trạng thái), sửa, chạy lại; ghi mục `### SCR-xx` ở trên (làm gì, đã thử gì).

## File dùng chung đã sửa — cần báo Văn

`api/records.ts` (#39–#44: `danhSach`, `cuaToi`, `chiTiet`, `tao`, `capNhat`, `gui`), `types/record.ts`
(`HinhThucThucTap`, `HinhThucLamViec`, `HoSoRequest`), `api/client.ts` (đọc lỗi JSON khi tải blob), `utils/taiTep.ts`,
`format.so2`, `components/ConfirmDialog` (`rong`), `TermSelect`, `RubricLevelPicker`, `App.tsx`, `menu.ts`
(`/assessments` thêm ADMIN), `styles.css`. Liên kết từ SCR-24 sang SCR-23 truyền `state.tuKetQua` (thông điệp BR-12.5).
Backend UC02: đặc tả ghi đề xuất ĐVHD mới "thông báo giáo vụ" nhưng #19 chưa gửi (15 mã NT chưa có mã cho việc này).

## Môi trường thử hiện tại

CSDL dev đã `down -v` ngày 10/11/2026 và nạp lại sạch V1–V4 (chỉ thêm dữ liệu của `mvnw test`, không thao tác API).
Không có tiến trình thử nào đang chạy; container tạm `qltt-mysql-uitest` đã xóa.
