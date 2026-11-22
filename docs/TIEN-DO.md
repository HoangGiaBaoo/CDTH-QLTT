# Tiến độ QLTT

> File này được hook đầu phiên đọc (4000 ký tự đầu) — **phần đầu giữ ngắn**. Chi tiết bàn giao ở cuối file.
> Kế hoạch đầy đủ: `docs/04-ke-hoach.md`.

**Cập nhật 21/11/2026**: Backend xong cả 13 UC (#1–#102); `mvnw test` xanh; seed V4 đã kiểm chứng.
**Tổ đánh giá chấm theo từng SV** (docs/01 mục 10.5): người chấm chặng 2 của SV = các GV của tổ + cán bộ của chính
SV (TTTN-05 "3 bản mỗi SV"); cán bộ đơn vị khác không chấm/không xem; V5 sửa seed tổ 3 đợt HK2. **Đủ mọi màn FE** (không còn trang giữ chỗ): A — SCR-03, 06, 09/10, 18/20, 19, 21, 24, 25, chuông
thông báo · B — SCR-07/08, 11…17, 22, 23. **Luồng demo 12 bước đi được trọn trên giao diện** — kịch bản từng cú bấm:
`docs/06-kich-ban-demo.md`. Giao diện theo tông cổng sinh viên HUCE, không có mã nội bộ trong chữ hiển thị.
**CI/CD + VPS** (`docs/05-trien-khai.md`): mỗi push `main` tự test rồi triển khai lên
http://221.121.0.89. Còn lại: tập kịch bản demo trên CSDL sạch, docs mục 10, Postman, tag mốc.

## Bảng 6 tuần

| Tuần | Mốc | A (Bảo) | B (Văn) |
|---|---|---|---|
| 1 | `t1-nen-tang` | ✅ | ✅ |
| 2 | `t2-dang-ky-den-thuc-tap` | ✅ | ✅ |
| 3 | `t3-cham-chang-1` | ✅ | ✅ |
| 4 | `t4-luong-day-du` | ✅ | ✅ |
| 5 | `t5-thong-ke` | ✅ backend (UC13 RP-01…06 + Excel) · ✅ FE (SCR-03 ✅ · SCR-06 ✅ · SCR-09/10 ✅ · SCR-18/20 ✅ · SCR-19 ✅ · SCR-21 ✅ · SCR-24 ✅ · SCR-25 ✅ · chuông ✅) | ✅ seed V4 · ✅ khung FE · ⬜ Postman · ✅ FE (SCR-07/08 ✅ · SCR-11 ✅ · SCR-12 ✅ · SCR-13 ✅ · SCR-14 ✅ · SCR-15 ✅ · SCR-16 ✅ · SCR-17 ✅ · SCR-22 ✅ · SCR-23 ✅) |
| 6 | `t6-ban-demo` | ⬜ | ⬜ |

Chưa tag mốc nào (`t1`…`t5`) — tag trên `main` khi chốt.

## Việc tiếp theo (theo thứ tự)

1. **Trước demo** — bật Docker Desktop, `docker compose down -v` rồi `up -d` để CSDL dev sạch (Flyway nạp lại V1–V5),
   đi trọn một lượt `docs/06-kich-ban-demo.md` liền mạch, rồi `down -v` lần nữa trước giờ demo (bước 1 tạo đợt
   `TTTN-2027-HK1` nên tập xong là CSDL bẩn). Đổi CSS/chữ dùng chung thì chạy lại bộ hồi quy (`chay-hoi-quy.sh`,
   để ngoài git trên máy này).
2. **Docs** — bổ sung `docs/01-nghiep-vu.md` mục 10 các quyết định 10.12–10.14 và các quyết định khác (danh sách
   ở *Bàn giao › Quyết định cần ghi*); sửa mô tả NT-07, NT-12, NT-13, NT-14.
3. **B** — Postman collection 4 vai trò; `README.md` hướng dẫn chạy demo.
4. **VPS hết hạn 14/12/2026** — gia hạn nếu bảo vệ sau ngày đó. Không sửa migration cũ (CSDL VPS sống lâu dài).

## Lưu ý quan trọng

- Commit **thẳng lên `main`**, không qua nhánh/PR (người dùng yêu cầu để kịp tiến độ) — lệch quy tắc nhánh/PR ở `docs/04-ke-hoach.md` mục 7.
- Commit **luân phiên đúng tài khoản chủ phần việc** (A = HoangGiaBaoo, B = SAKER205); **không** thêm Co-Authored-By.
  Một số subject đã > 72 ký tự — từ nay giữ ≤ 72.
- Tài khoản ADMIN demo là `giaovu` / `Qltt@2026` (không phải `admin`). Mọi tài khoản seed dùng `Qltt@2026`.
- **Không thử API trên CSDL dev** (làm bẩn kịch bản demo) — thử màn FE trên CSDL tạm riêng, cổng 3307 (*Bàn giao*).
- Mỗi màn xong: build + thử trình duyệt ⇒ báo người dùng ⇒ **hỏi trước khi commit/push**; người dùng thường trả lời
  "commit push rồi làm tiếp SCR-xx".

## Điểm cần xác nhận với GVHD

`docs/01-nghiep-vu.md` mục 10 (10.1–10.11 đã ghi; 10.12–10.14 mới quyết định trong code, chưa ghi vào tài liệu).

---

# Bàn giao chi tiết (bắt đầu 08/11/2026, cập nhật 14/11/2026)

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

- **10.12** Tài khoản cán bộ ĐVHD tạo ở trạng thái `VO_HIEU_HOA`, chỉ kích hoạt khi ĐVHD được duyệt; giáo vụ không
  kích hoạt tay (#9) được tài khoản cán bộ của đơn vị Chờ duyệt / Từ chối.
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

**Đợt `TTTN-2025-HK2`** (02/03–26/04/2026, `DA_KET_THUC`, đã công bố) — 3 Tổ, 51 phiếu (V5 bỏ 8 phiếu của tổ 3 theo luật chấm từng SV), 08a+08b đủ cả 10 hồ sơ. Tổ 3: gv.lan + gv.hoa (vắng) → gv.tung thay, cb.quang chấm Xuân/Thảo/Toàn, cb.duc chấm Vinh:

| SV | Ca | CLO1…CLO7 | HP | Kết luận |
|---|---|---|---|---|
| sv.nam | Ví dụ tính tay chuẩn | 8,2 7,2 7,2 8,8 7,7 7,4 7,5 | 7,7 | Đạt |
| sv.oanh | Thưởng 0,3 đẩy Mức 3 → Mức 4 | 8,4 8,4 7,9 8,6 8,3 7,9 8,3 | 8,6 | Đạt |
| sv.phong | CLO2 = 3,0 Mức 0 | | 5,9 | Không đạt (b) |
| sv.quyen | CLC/STEM, CLO2 = 5,0 Mức 1 | | 6,9 | Không đạt (b) |
| sv.tai | Chuẩn, cùng CLO2 = 5,0 (đối chứng) | | 6,9 | Đạt |
| sv.uyen | CLC/STEM giỏi | | 9,1 Mức 4 | Đạt |
| sv.vinh | Nghiên cứu, thiếu Sản phẩm nghiên cứu | | 7,7 | Không đạt (d) |
| sv.xuan | Tổ 3: gv.hoa vắng (phiếu 2,0 bị loại), gv.tung thay | | 7,0 | Đạt |
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
Các ô dẫn tới `/records/:id/study_plan|logbooks|weekly_progress|evidences|reports|feedbacks` (tên đổi ở SCR-14 cho
trùng link thông báo backend) — `MAN_THEO_DOI_HO_SO` ở `App.tsx`, chỗ giữ cho tới khi SCR-15…17, 22, 23 xong. Thêm `api/studyPlans.ts`, `api/progress.ts`, `api/reports.ts`,
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
`/records` ⇒ 403, `/records/{id}` của mình vẫn là SCR-11 (từ SCR-14, `/records/{id}/study_plan` của mình mở được).

### SCR-13 Phân công GVHD (B, 12/11/2026)

`pages/assignments/AssignmentPage` (`/assignments`, ADMIN): chọn đợt (giữ trong URL `?dot=` — nút "Phân công GVHD" của
SCR-12 mang theo đợt của hồ sơ; mặc định đợt Đang thực hiện rồi Đang nhận đăng ký). Ô số liệu: chờ phân công, đã có GVHD,
giảng viên còn nhận, chỗ còn trống. Hai cột như UC05 bước 2: SV chờ phân công (#49, chọn nhiều, tìm) và giảng viên
(`LecturerPicker`: thanh "đã nhận / hạn mức", còn nhận x). Thanh dưới (dính đáy màn) tóm tắt lựa chọn; chọn nhiều hơn số
còn nhận ⇒ **báo trước** "vượt hạn mức" nhưng **không khóa nút** — backend chặn và hủy cả lô (UC05 4a), giao diện giữ lựa
chọn để chọn GV khác. Hỏi lại liệt kê SV trong lô. Danh sách đã phân công (#48) lọc theo GV + tìm, tên SV dẫn sang SCR-12;
`ChangeLecturerDialog` đổi GVHD (#51, GV mới + lý do bắt buộc, lỗi hiện **trong** hộp thoại, không mất lý do đã nhập).
NT-04 gửi GV và SV với đường dẫn `/assignments` ⇒ `menu.ts` thêm `vaoThem` (vai trò mở được đường dẫn nhưng không thấy
trên menu); trang chuyển GV sang `/records`, SV sang `/my-record`. Thêm `api/assignments.ts`, `types/assignment.ts`.
Đã thử 33/33 ca trên CSDL tạm: **bước 5** sv.giang + sv.mai cho gv.hoa (4/5) ⇒ cảnh báo trước, QUOTA_EXCEEDED "chỉ còn
nhận được 1", backend vẫn 2 SV chờ + gv.hoa 4/5; đổi sang gv.minh ⇒ phân công 2 SV, gv.minh 1 → 3/6, nhận NT-04; lọc theo
GV; đổi GVHD sv.an (gv.tung đã nộp phiếu) ⇒ RESOURCE_LOCKED trong hộp thoại, giữ lý do; đổi sv.ha gv.lan → gv.minh ⇒ dòng
hiện lý do, nhật ký `DOI_GVHD`; SCR-12 hiện GVHD mới; đợt 2027 (sv.khanh được cb.yen xác nhận) mở từ nút SCR-12 đúng đợt;
GV mở `/assignments` ⇒ `/records`, SV ⇒ `/my-record`; GV gọi #49 ⇒ 403; cán bộ mở `/assignments` ⇒ 403.

### SCR-14 Kế hoạch học tập TTTN-02 (B, 12/11/2026)

`pages/studyPlans/StudyPlanPage` — một trang, hai đường: SV `/my-record/plan` (hồ sơ qua #40) và `/records/:id/study_plan`
(`StudyPlanRoute`; đích NT-07 cho **cả bốn vai trò** — backend `layVaKiemQuyen` chặn người ngoài hồ sơ, giao diện chỉ hiện
`message` ACCESS_DENIED). Để đường con trùng link thông báo backend (`/study_plan`, `/logbooks`, `/weekly_progress`,
`/reports`), `MAN_THEO_DOI_HO_SO` đổi tên cả 6 đường con và mở cho SV; `RecordTracking`, `RequiredEvidence` sửa link theo.
#52 tải khung N tuần + Tổng kết; mỗi tuần kèm khoảng ngày tính từ ngày bắt đầu đợt (`lich.ts`, chỉ để dễ hình dung). Đầu
trang: hạn nộp (backend tính: ngày làm việc thứ 5 từ ngày bắt đầu đợt, Đ6 k3a) + "còn x ngày làm việc / đã quá hạn"
(chỉ nhắc, bỏ T7–CN như backend), ngày gửi, nhãn Nộp muộn, giờ xác nhận của ĐVHD và GVHD. SV khi Bản nháp + hồ sơ Đang
thực tập: bảng ô nhập, đếm "x/N dòng đủ ba nội dung", **Lưu nháp** (#53, gửi cả bảng) và **Gửi xác nhận** (lưu nếu có đổi
rồi #54; hỏi lại, báo trước quá hạn ⇒ Nộp muộn và số dòng còn thiếu — vẫn để backend quyết). Gửi bị VALIDATION_ERROR ⇒
hiện nguyên văn lời backend + tô đỏ ô trống. Cán bộ của hồ sơ / GVHD: **Xác nhận** (#55) khi Chờ xác nhận và mình chưa xác
nhận; đủ hai ⇒ báo đã khóa. GVHD: **Mở lại** (#56, nút đỏ, nói rõ mất cả hai xác nhận) khi Chờ xác nhận / Đã khóa. Giáo
vụ, thành viên tổ: chỉ đọc. Hồ sơ chưa duyệt ⇒ "Chưa có kế hoạch" + lời backend. Mở lại không xóa ngày gửi/Nộp muộn
(backend tính lại khi gửi lần sau) nên ô đổi nhãn "Gửi lần trước". `api/studyPlans.ts` thêm #53–#56, `types/studyPlan.ts`
thêm `CapNhatKeHoachRequest` (sửa chú thích `hanNop`: tính từ ngày bắt đầu đợt, không phải ngày duyệt).
Đã thử 56/56 ca trên CSDL tạm: **bước 6–7** gv.lan duyệt sv.ha ⇒ 9 dòng, hạn 11/09/2026 đã qua; sv.ha từ menu: tuần 1
07/09–13/09, tuần 8 26/10–01/11, 27 ô, Lưu nháp khóa khi chưa đổi; điền 8 tuần ⇒ 8/9, lưu, tải lại còn; gửi thiếu ⇒
"còn thiếu: Tổng kết", 3 ô đỏ; điền đủ, gửi ⇒ "quá hạn 5 ngày làm việc… Nộp muộn", backend `nopMuon = true`; SV gọi #53 ⇒
RESOURCE_LOCKED, #55 ⇒ 403; cb.trang mở từ ô SCR-12 ⇒ chỉ nút Xác nhận ⇒ ĐVHD ✓, chờ GVHD; cb.trang #56 ⇒ 403, xác nhận
lần 2 ⇒ "Bạn đã xác nhận kế hoạch này"; gv.lan xác nhận ⇒ Đã khóa (ô SCR-12 cũng Đã khóa), mở lại ⇒ Bản nháp, hai xác
nhận trống, nhật ký `MO_LAI_KE_HOACH`; sv.ha mở link NT-07 ⇒ sửa lại được, có thông báo trỏ đúng link; sv.cuong (seed Đã
khóa) chỉ đọc; sv.cuong / gv.minh mở kế hoạch sv.ha ⇒ không có quyền, không lộ nội dung; gv.minh (GVHD sv.cuong) chỉ nút
Mở lại; cb.quang không nút; giáo vụ chỉ đọc, #56 ⇒ 403; sv.giang (Chờ GVHD) ⇒ "Chưa có kế hoạch".

### SCR-15 Nhật ký thực tập (B, 12/11/2026)

`pages/logbooks/LogbookPage` — SV `/my-record/logbook` (hồ sơ qua #40) và `/records/:id/logbooks` (`LogbookRoute`, đích NT-09
và lối từ ô Nhật ký của SCR-12). #57 cả danh sách, nhóm theo tuần của đợt (mới nhất trước, mỗi nhóm có khoảng ngày, số ngày,
số giờ; ngày sau ngày kết thúc đợt gom vào "Sau ngày kết thúc đợt"), tab lọc theo tuần có số đếm. Ô số liệu: số ngày đã
ghi, tổng giờ, ghi gần nhất (x ngày trước), tuần hiện tại. Mỗi dòng: thứ + ngày, "ghi lúc HH:mm" hoặc "ghi bù dd/MM HH:mm"
khi ghi muộn (từ `ngayTao`). SV khi hồ sơ Đang thực tập: form **Thêm nhật ký** (#58: ngày — `max` hôm nay, `min` ngày bắt
đầu đợt —, số giờ, nội dung *, kết quả; lỗi VALIDATION_ERROR gắn dưới ô); chọn ngày đã có bản ghi ⇒ gợi ý + nút "Sửa bản
ghi ngày này" (vẫn để backend trả DUPLICATE_RESOURCE nếu gửi). Sửa ngay trên dòng (#59) — nút Sửa theo cờ `suaDuoc` backend
trả, dòng quá 7 ngày hiện "Đã khóa". GVHD: nút **Nhắc ghi nhật ký** (#60 một SV) trên trang này và trên `/records` (#60
không truyền danh sách — backend tự lọc SV quá 5 ngày; kết quả liệt kê tên + ngày ghi cuối; rỗng ⇒ lời backend màu xanh
dương, không phải lỗi) — `RemindLogbook`, `KetQuaNhacNho`. Cán bộ, giáo vụ: chỉ xem. `utils/lich.ts` (chuyển từ
`pages/studyPlans/`) thêm `tuanCua`, `thu`, `homNayIso`, `soNgayTruoc`; `api/progress.ts` thêm #58–#60.
Đã thử 46/46 ca trên CSDL tạm + chạy lại 58/58 ca SCR-12: gv.minh mở từ SCR-12 ⇒ 24 ngày, 192 giờ, ghi gần nhất 30/10 (13
ngày trước), 8 nhóm tuần, lọc Tuần 3; nhắc sv.cuong ⇒ "Đã nhắc 1 sinh viên"; nhắc từ `/records` ⇒ liệt kê sv.cuong "ghi lần
cuối 30/10/2026"; sv.cuong nhận NT-09 trỏ `/records/{id}/logbooks`; bản ghi cũ đều "Đã khóa"; ghi trống ⇒ lỗi dưới ô Nội
dung; 25 giờ ⇒ "Số giờ tối đa 24"; ngày cách 8 ngày ⇒ BUSINESS_RULE_VIOLATION Điều 19 k1c; ngày tương lai ⇒ chặn; ghi hôm
nay ⇒ 25 ngày, nhóm "Sau ngày kết thúc đợt"; gửi trùng ⇒ DUPLICATE_RESOURCE; sửa 30 giờ ⇒ lỗi trong dòng, 7,5 ⇒ "Đã cập nhật
nhật ký", tổng 199,5; SV gọi #59 bản ghi 30/10 ⇒ RESOURCE_LOCKED; gv.minh nhắc lại ⇒ "Không có sinh viên nào quá 5 ngày…";
cb.quang, giáo vụ chỉ xem (#58, #60 ⇒ 403); gv.lan, sv.ha mở nhật ký sv.cuong ⇒ không có quyền; gv.lan #60 cho sv.cuong ⇒
ACCESS_DENIED; sv.ha (Chờ GVHD) ⇒ chưa ghi được; sv.an (Chờ đánh giá) ⇒ chỉ xem.
Còn nợ (backend UC07, B): thông điệp DUPLICATE_RESOURCE của #58 in ngày dạng `2026-11-12` thay vì `12/11/2026`.

### SCR-16 Tiến độ tuần TTTN-03 (B, 14/11/2026)

`pages/progress/WeeklyProgressPage` — SV `/my-record/progress` (hồ sơ qua #40) và `/records/:id/weekly_progress`
(`WeeklyProgressRoute`, đích NT-08 và lối từ ô Tiến độ của SCR-12). Bảng theo mẫu TTTN-03 (#61): tuần + khoảng ngày,
công việc được giao, kết quả thực hiện, % hoàn thành (thanh), xác nhận ĐVHD. Trạng thái dòng suy từ dữ liệu (không có
enum backend): Đã xác nhận (xanh lá, kèm giờ) · Cần bổ sung (đỏ, có `yeuCauBoSung` chưa xác nhận) · Chờ xác nhận (vàng,
đủ ba nội dung — cùng điều kiện #63 kiểm) · Chưa đủ nội dung / Chưa cập nhật (xám). Ô số liệu: x/N đã xác nhận, chờ,
cần bổ sung, tuần hiện tại. Mỗi dòng có lối "Nhật ký (n ngày)" mở danh sách nhật ký của tuần ngay dưới dòng (#57 tải
một lần, nhóm theo `tuanCua` như SCR-15) — cán bộ của hồ sơ được mở sẵn những tuần đang chờ mình (UC07 bước 6).
SV khi hồ sơ Đang thực tập: Cập nhật / Sửa ngay trên dòng chưa xác nhận (#62, lỗi `phanTramHoanThanh` dưới ô), dòng đã
xác nhận "Đã khóa"; có yêu cầu bổ sung ⇒ cảnh báo đầu trang + nội dung yêu cầu dưới dòng. Cán bộ ĐVHD của hồ sơ: Xác nhận
(hỏi lại; dòng chưa đủ ⇒ báo trước nhưng vẫn để backend từ chối, lỗi hiện trong hộp thoại) và Yêu cầu bổ sung (hộp thoại,
nội dung bắt buộc ≤ 500 ký tự, NT-08 tới SV). GVHD, giáo vụ: chỉ xem. `api/progress.ts` thêm #62, #63; `types/progress.ts`
thêm `CapNhatTienDoRequest`, `XacNhanTienDoRequest`. Backend giữ `yeuCauBoSung` sau khi SV sửa (chỉ xóa khi cán bộ xác
nhận) nên dòng vẫn "Cần bổ sung" tới khi cán bộ xem lại — thông báo lưu của SV nói rõ "Cán bộ ĐVHD sẽ xem lại tuần x".
Đã thử 48/48 ca trên CSDL tạm: sv.cuong từ menu ⇒ 8 dòng, 7/8 đã xác nhận, tuần 8 90% Chờ xác nhận, nhật ký tuần 1 mở/đóng;
150% ⇒ "Phần trăm hoàn thành từ 0 đến 100" dưới ô; 100% ⇒ lưu, backend khớp; SV #62 tuần đã xác nhận ⇒ RESOURCE_LOCKED,
#63 ⇒ 403; cb.quang từ ô SCR-12 ⇒ nhắc "1 tuần … chờ bạn xác nhận", nhật ký tuần 8 mở sẵn; yêu cầu bổ sung (nút khóa khi
trống) ⇒ Cần bổ sung, sv.cuong nhận NT-08 trỏ `/records/{id}/weekly_progress`; SV mở link ⇒ cảnh báo + sửa; cán bộ xác
nhận ⇒ 8/8, Đã khóa, hết dòng yêu cầu; xác nhận lần 2 ⇒ RESOURCE_LOCKED; gv.minh, giáo vụ chỉ xem; sv.ha Chờ GVHD ⇒
"Chưa có bảng tiến độ", gv.lan duyệt ⇒ 8 dòng Chưa cập nhật, chỉ điền công việc ⇒ Chưa đủ nội dung, đủ ⇒ Chờ xác nhận
60%; cb.trang xác nhận tuần trống ⇒ "Sinh viên chưa điền đủ tiến độ tuần 2" trong hộp thoại; cb.trang mở / gọi #63 hồ sơ
sv.cuong ⇒ ACCESS_DENIED; sv.cuong mở tiến độ sv.ha ⇒ không có quyền; sv.an Chờ đánh giá ⇒ chỉ xem; màn 390px không tràn.

### SCR-17 Minh chứng (B, 17/11/2026)

`pages/evidences/EvidencePage` — SV `/my-record/evidence` (hồ sơ qua #40) và `/records/:id/evidences` (`EvidenceRoute`,
lối từ ô Minh chứng của SCR-12 và từ `RequiredEvidence`). Ô số liệu: x/N loại bắt buộc đã có, số tệp + tổng dung lượng,
tuần hiện tại. **Bảng đối chiếu** (#65, BR-07.6, điều kiện (d) Đ15 k3, CBR-16): mỗi loại bắt buộc của hình thức thực tập
một dòng — mục hệ thống tự ghi nhận có câu "khi nào được coi là Đã có" (mô tả lại `MinhChungService.coTuHeThong`, chỉ để
giải thích) + lối "Mở →" sang màn có dữ liệu đó; mục SV tải lên có số tệp, nút Xem tệp (lọc danh sách theo loại) và Tải
lên (chọn sẵn loại). Đang thực tập ⇒ mục chưa có xám "Chưa có", badge "Chưa đủ"; từ Chờ đánh giá ⇒ "Thiếu" vàng + dòng
tô vàng + "Còn thiếu: …" (cùng quy ước ô SCR-12). `EvidenceUploadForm` (SV, hồ sơ Đang thực tập / Chờ đánh giá — cùng
tập `DUOC_TAI_LEN` backend): loại = các loại TAI_LEN của danh mục (loại còn thiếu lên đầu, ghi "(bắt buộc, chưa có)") +
"Minh chứng khác"; hình thức Doanh nghiệp mọi mục đều do hệ thống ghi nhận nên chỉ còn "Minh chứng khác" kèm lời nhắc;
tuần liên quan (mặc định tuần hiện tại nếu còn trong đợt); tệp — **kiểm trước ở client** ≤ 20 MB + đuôi
pdf/doc/docx/xls/xlsx/jpg/jpeg/png/mp4 (cùng `FileStorageService`) ⇒ lỗi dưới ô + khóa nút; lỗi FILE_TOO_LARGE /
UNSUPPORTED_FILE_TYPE của backend (ví dụ content-type không khớp đuôi) cũng hiện dưới ô; thanh tiến độ tải lên; #66 nới
timeout riêng 10 phút. **Danh sách** (#64): biểu tượng đuôi, tên gốc + dung lượng, loại, tuần + khoảng ngày, giờ tải; lọc
loại + tuần (có số đếm, giữ trong URL `?loai=&tuan=`, lọc trên danh sách đã tải — #64 vẫn nhận `type`, `week`). Tải về
#67 qua `utils/taiTep.ts` (lỗi như tệp không có trên đĩa hiện nguyên văn). SV xóa #68 (hỏi lại; tệp duy nhất của loại bắt
buộc ⇒ nhắc mục sẽ thành chưa có; lỗi hiện trong hộp thoại); minh chứng đã khóa (giáo vụ xác nhận kết quả #86) ⇒ "Đã khóa"
thay nút Xóa + cảnh báo đầu trang. Cán bộ, GVHD, giáo vụ: chỉ xem + tải. Màn < 640px hai bảng xếp thành thẻ.
`api/evidences.ts` thêm #64, #66–#68; `types/evidence.ts` thêm `MinhChung`, `TaiLenMinhChungRequest`; `format.dungLuong`.
**Sửa backend UC07**: #65 trả danh mục theo mã chữ cái (MySQL đọc qua chỉ mục unique) ⇒ repository thêm `OrderById` để
đúng thứ tự seed / Điều 4 (Phiếu đăng ký, Nhật ký, Kế hoạch, Báo cáo, 08a, 08b). Ảnh hưởng cả SCR-11/12 (chỉ thứ tự).
Đã thử 71/71 ca trên CSDL tạm (backend chạy với `--app.storage.dir` riêng của bộ thử) + chạy lại 58/58 ca SCR-12:
sv.cuong 6 dòng đúng thứ tự Đ4, khớp #65, "Chưa đủ 3/6"; chỉ "Minh chứng khác"; 21 MB, .txt ⇒ chặn ở client; tệp .pdf
content-type text/plain ⇒ client cho qua, backend "Nội dung tệp không khớp với đuôi .pdf" dưới ô, không lưu; ảnh tuần 8
⇒ backend `tuan` 8, người tải sv.cuong, 48000 byte; pdf không gắn tuần; lọc Tuần 8 / Không gắn tuần / Bỏ lọc; #64 lọc
backend; tải về đúng tên + kích thước; xóa ⇒ nhật ký `XOA_MINH_CHUNG`, tệp trên đĩa mất; #66 thẳng 21 MB ⇒ FILE_TOO_LARGE,
.txt ⇒ UNSUPPORTED_FILE_TYPE, loại hệ thống ⇒ VALIDATION_ERROR, tuần 9 ⇒ "Tuần phải từ 1 đến 8"; SV xem hồ sơ khác ⇒ 403.
sv.binh (đổi sang Nghiên cứu trong CSDL tạm): Đề cương + Sản phẩm "(bắt buộc, chưa có)", nút Tải lên chọn sẵn loại, docx
⇒ Sản phẩm "✓ Đã có", Xem tệp lọc đúng, xóa tệp duy nhất ⇒ cảnh báo rồi về Chưa có. cb.quang từ ô SCR-12 ⇒ chỉ Tải về,
#66/#68 ⇒ 403; gv.minh, giáo vụ chỉ xem; cb.son ⇒ ACCESS_DENIED (#67 cũng 403). sv.an Chờ đánh giá ⇒ "Thiếu 1/6" (08b),
vẫn tải được; khóa giữa chừng ⇒ bấm Xóa nhận "Hồ sơ đã chốt điểm…" (UC07 8a) trong hộp thoại, tải lại ⇒ "Đã khóa". sv.ha
Chờ GVHD ⇒ không form, #66 ⇒ RESOURCE_LOCKED. sv.vinh (HK2) ⇒ Thiếu Sản phẩm nghiên cứu, tệp seed không có trên đĩa ⇒
"Không tìm thấy tệp", #68 ⇒ RESOURCE_LOCKED. Màn 390px không tràn.
Còn nợ (backend UC07, B): sau khi giáo vụ xác nhận (hồ sơ vẫn Chờ đánh giá tới lúc công bố) SV vẫn tải thêm được, tệp
mới không bị khóa — không đổi kết quả đã xác nhận, nhưng có thể chặn `taiLen` khi hồ sơ đã có minh chứng khóa.

### SCR-22 Báo cáo TTTN-06 (B, 17/11/2026)

`pages/reports/ReportPage` — SV `/my-record/report` (hồ sơ qua #40) và `/records/:id/reports` (`ReportRoute`, đích NT-07
cho cán bộ/GVHD, NT-13 cho SV, lối từ ô Báo cáo của SCR-12). Ô số liệu: hạn nộp (`hanNopBaoCao`, đợt chưa đặt hạn thì
ngày kết thúc — cùng mốc `BaoCaoService.soNgayTre`) + còn / đã quá bao nhiêu ngày khi chưa nộp, phiên bản hiện tại + số
lần nộp, x/2 xác nhận. **Phiên bản hiện hành**: tệp + nhãn Nộp muộn N ngày (cả ở đầu trang), Tải về #91; thanh 3 bước
ĐVHD xác nhận hoàn thành kế hoạch → GVHD xác nhận đủ điều kiện chấm → Chờ đánh giá cuối kỳ (tên người + thời điểm).
Nút theo người: cán bộ ĐVHD của hồ sơ "Xác nhận hoàn thành kế hoạch thực tập"; GVHD "Xác nhận đủ điều kiện chấm" (khóa
+ "Chờ cán bộ ĐVHD xác nhận trước" khi ĐVHD chưa xác nhận) và "Mở lại cho sinh viên thay tệp" khi đã có xác nhận
(Đang thực tập / Chờ đánh giá); hộp thoại dùng lời xác nhận mục IV mẫu TTTN-06, mở lại khi Chờ đánh giá nhắc hồ sơ quay
về Đang thực tập; lỗi backend hiện trong hộp thoại. `ReportSubmitForm` (SV, Đang thực tập, bản mới nhất chưa có xác
nhận nào): **sáu ô Phần 1–6 mục II** (kèm gợi ý nội dung, đếm x/6, chưa tích đủ ⇒ lỗi dưới danh mục, không gọi #90) +
khung **yêu cầu trình bày mục III** (bìa/mục lục, ≥ 20 trang A4, Times New Roman 13, giãn dòng 1,5, lề 3–2–2–2,
đánh số, trang ký xác nhận); quá hạn ⇒ cảnh báo vàng Nộp muộn (UC11 5a); tệp pdf/docx kiểm trước ở client như SCR-17.
Bản mới nhất đã có xác nhận ⇒ không form, hướng dẫn liên hệ GVHD mở lại (6a, BR-11.4). **Các phiên bản đã nộp** (#89):
mọi phiên bản, bản cũ chữ nhạt, mỗi bản tải về được. Người khác chỉ xem. Màn < 640px bảng xếp thành thẻ.
Tách `utils/tepTaiLen.ts` (`kiemTep(tệp, đuôi)`, `LOI_TEP`, `duoiTep`, `TOI_DA_TEP`) dùng chung với `EvidenceUploadForm`;
`.mc-tien-do` đổi tên `.tai-len-tien-do`. `api/reports.ts` thêm #90–#93; `types/report.ts` thêm `NopBaoCaoRequest`.
Đã thử 63/63 ca trên CSDL tạm + chạy lại 71/71 ca SCR-17: sv.cuong hạn 06/11 "đã quá 11 ngày"; bấm Nộp khi trống ⇒ "Còn
6 phần chưa tích" + "Chưa chọn tệp"; 5/6 ⇒ vẫn chặn, không lưu; 21 MB, .doc ⇒ chặn ở client; .pdf content-type text/plain ⇒
backend báo dưới ô, không lưu; v1 pdf ⇒ thông điệp backend "nộp muộn 11 ngày", CSDL `nop_muon` 1, NT-07 tới cb.quang +
gv.minh đúng link; v2 docx ⇒ 2 phiên bản, tải về v1 + v2 đúng tên + kích thước. gv.minh trước ĐVHD ⇒ nút khóa, #92 ⇒
BUSINESS_RULE_VIOLATION, #93 ⇒ "chưa có xác nhận nào". cb.quang xác nhận v2 ⇒ bước 1 ✓, 1/2; lần 2 ⇒ RESOURCE_LOCKED;
#92 trên v1 ⇒ "phiên bản mới nhất". SV ⇒ không form, #90 ⇒ RESOURCE_LOCKED (BR-11.4); `checklistConfirmed=false` ⇒
VALIDATION_ERROR. gv.minh mở lại ⇒ 0/2, nhật ký `MO_LAI_BAO_CAO`, NT-13; SV từ link NT-13 nộp v3; cb.quang + gv.minh xác
nhận ⇒ "đủ hai xác nhận", hồ sơ CHO_DANH_GIA, NT-12, ô SCR-12 "Phiên bản 3 · Nộp muộn 11 ngày"; mở lại khi Chờ đánh giá
⇒ về Đang thực tập. sv.an: đủ xác nhận, không form; tệp seed không có trên đĩa ⇒ "Không tìm thấy tệp"; gv.tung mở lại ⇒
"Tổ đánh giá đã nộp phiếu cuối kỳ…" trong hộp thoại, hồ sơ giữ Chờ đánh giá; gv.lan (Tổ, không phải GVHD) không nút.
SV khác ⇒ không có quyền, không lộ tên tệp; cb.son #89/#91 ⇒ 403; cán bộ khác #92 ⇒ ACCESS_DENIED; giáo vụ chỉ xem, #92/#93
⇒ 403; sv.ha Chờ GVHD ⇒ không form, #90 ⇒ RESOURCE_LOCKED; sv.nam HK2 ⇒ chỉ xem. Màn 390px không tràn.
Ghi chú demo: hôm nay đã qua hạn nộp báo cáo HK1 (06/11/2026) nên mọi bản SV nộp trong demo đều gắn Nộp muộn.

### Giao diện theo cổng sinh viên HUCE (18/11/2026)

Tông màu, bố cục tham khảo sinhvien.huce.edu.vn: thanh trên trắng + tên trường xanh đậm, nền xám xanh, thẻ trắng bóng nhẹ,
chữ xám đen, icon xanh da trời, ô số liệu nền pastel, chân trang khoa. Biến màu ở `frontend/src/styles.css`. Font Roboto (Google Fonts, có tiếng Việt); icon `lucide-react@0.468.0` —
mỗi mục `menu.ts` một icon, trang Tổng quan là lưới ô icon (bỏ dòng mô tả có mã UC/#). Logo trường **chưa** đưa vào
(đang dùng biểu tượng mũ tốt nghiệp) — muốn dùng logo thật thì cần tệp logo được phép dùng.
Bỏ mã nội bộ (UC, #endpoint, CBR, BR, NT, RP, SCR, `#id`) khỏi mọi chữ hiển thị và `message` backend; giữ trích điều khoản
đầy đủ ("Điều 10 khoản 2") và tên biểu mẫu (TTTN-xx, 08a, 08b). Đã chụp 15 màn (cả 390px) — không tràn ngang; chạy lại
bộ hồi quy terms, panels, grading, myresult, report, evidence, register sau khi đổi chữ.

### SCR-23 Phản hồi TTTN-08a / 08b (B, 18/11/2026)

`pages/feedbacks/`: `FeedbackPage` (+ `FeedbackRoute` cho `/records/:recordId/feedbacks`), `Form08b`, `Form08a`,
`PhieuDaGui` (`Xem08a`, `Xem08b`, `TuNhanThucCard`), `BangHpSelf`, `MucDoChon`, `bieuMau.ts` (chữ biểu mẫu theo Quy định);
`api/feedbacks.ts` (#94–#97), `types/feedback.ts`. SV `/my-record/feedback`; ô Phản hồi của SCR-12 mở `/records/:id/feedbacks`.
- **SV** (từ Chờ đánh giá trở đi): phiếu 08b đúng bố cục mẫu — I thông tin chung, A.1 sáu nội dung mức 1–5 + ghi chú,
  ý kiến khác, A.2 phản hồi mở; B tự đánh giá 7 CLO mức 0–4 + minh chứng; C bốn câu; D bảng (1)–(4) + HPself (5) tự
  tính lại qua #95 sau mỗi lần đổi mức; II cam kết. Bấm gửi khi thiếu ⇒ liệt kê đủ chỗ thiếu một lần + tô đỏ từng hàng.
  Hộp thoại nêu HPself. Gửi xong chỉ xem; chỉ số tự nhận thức (#97) hiện sau công bố, kèm bảng lệch từng CLO; 08a của
  ĐVHD chỉ hiện sau công bố (backend lọc). Từ SCR-24 sang thì hiện lý do (`state.tuKetQua`).
- **Cán bộ ĐVHD** của SV: phiếu 08a sáu tiêu chí mức 0–4 + nhận xét, ý kiến bổ sung; cán bộ khác ⇒ lỗi quyền.
- **GVHD / giáo vụ**: xem hai phiếu; 08b không có phần A, phản hồi mở (backend không trả — thống kê ẩn danh); GVHD
  thêm thẻ chỉ số tự nhận thức sau công bố.

Đã thử trên CSDL tạm (43/43 ca): sv.cuong Đang thực tập ⇒ cảnh báo, không form; sv.an từ SCR-24 sang có lý do; gửi trống
⇒ liệt kê thiếu A 1–6, B CLO1–7, C 1–4, cam kết + 13 hàng đỏ; 6/7 CLO ⇒ HPself "—"; đủ 7 ⇒ HPself giao diện = #95 = cột
`hp_self` (7,6); gửi lần 2 ⇒ DUPLICATE_RESOURCE; #95 hồ sơ SV khác ⇒ ACCESS_DENIED; nhật ký GUI_PHAN_HOI. cb.son: seed đã
có 08a của sv.an (06/11) ⇒ chỉ xem; xóa dòng đó trên CSDL tạm ⇒ form 08a, gửi đủ 6 tiêu chí. gv.tung thấy hai phiếu,
không thấy phần A/phản hồi mở; cb.quang ⇒ lỗi quyền. sv.nam (đã công bố) thấy 08a + chỉ số 0,00 khớp CSDL; GVHD sv.nam
thấy thẻ chỉ số; giáo vụ không thấy phần A, không thẻ chỉ số. 390px không tràn; không mã nội bộ trên màn; console sạch.
Ghi chú demo: seed có sẵn 08a cho sv.an nên demo phía cán bộ chỉ xem được — muốn demo gửi 08a cần hồ sơ khác tới Chờ đánh giá.

### SCR-07/08 Đơn vị hướng dẫn (B, 20/11/2026)

`pages/hostOrgs/`: `HostOrgListPage` (SCR-07: lọc trạng thái, tìm theo từ khóa #17, khung vàng "N đơn vị chờ phê duyệt",
thêm đơn vị #19 ⇒ sang chi tiết), `HostOrgDetailPage` (SCR-08: thông tin + sửa #20; nút quyết định theo trạng thái đúng
máy trạng thái của `DonViHuongDanService.pheDuyet` — Chờ duyệt: Phê duyệt / Từ chối, Đã duyệt: Loại khỏi danh mục, Từ
chối / Đã loại: Phê duyệt lại; từ chối / loại bắt buộc lý do; duyệt ⇒ bảng **tên đăng nhập + mật khẩu ban đầu** chỉ
hiện một lần #21; xóa mềm #22 — đã có hồ sơ ⇒ RESOURCE_IN_USE), `HostOrgForm`, `SupervisorDialog` (thêm cán bộ kèm tài
khoản #24 — đơn vị đã duyệt thì kích hoạt ngay và hiện mật khẩu; sửa chức vụ / kinh nghiệm / hạn mức #25). Bảng cán bộ
có "đang hướng dẫn / hạn mức" (#23). Màn hẹp: hai bảng xếp thành thẻ. `api/hostOrgs.ts` thêm #20–#22, #24, #25.
Đã thử (`ui-test/test-hostorgs.mjs`, 52 ca): thêm trống ⇒ lỗi dưới ô; duyệt khi chưa có cán bộ ⇒ chặn; kinh nghiệm 2 năm
⇒ "Điều 7 khoản 1 điểm c"; duyệt ⇒ mật khẩu 10 ký tự, tài khoản Hoạt động; loại khóa nút khi chưa có lý do; xóa Sao Mai ⇒
chặn; duyệt Bình Minh ⇒ `cb.phuong` đăng nhập được bằng mật khẩu vừa hiện; cán bộ gõ `/host-orgs` ⇒ 403; 390px không tràn.

### Chuông thông báo + SCR-06 Hồ sơ cá nhân (A, 20/11/2026)

`components/NotificationBell.tsx` gắn vào `AppLayout` (thanh trên): số chưa đọc (#101 `unread=true&size=1` ⇒ `total`),
đếm lại khi chuyển màn và mỗi 30 giây; bảng 10 thông báo gần nhất (lọc Tất cả / Chưa đọc, Xem thêm), bấm ⇒ #102 đánh dấu
đã đọc + mở `duongDan`; Esc / bấm ngoài để đóng; 390px phủ ngang dưới thanh trên. Không hiện `maSuKien`.
`pages/profile/ProfilePage.tsx` (SCR-06): thông tin theo vai trò (chỉ xem), sửa họ tên / email / điện thoại (#3, nạp lại
#2), đổi mật khẩu (#4: kiểm nhập lại ở client, chính sách mật khẩu do backend) ⇒ đăng xuất, nạp lại
`/login?doiMatKhau=1` (LoginPage hiện thông báo xanh). Đã thử: cb.duc chuông 1 ⇒ bấm ⇒ `/records/14`, chuông về 0; cb.duc
xác nhận ⇒ giáo vụ chuông 2, mục mới ở đầu "Vừa xong"; sai mật khẩu hiện tại / không khớp / yếu ⇒ báo, ở lại trang; đổi
được ⇒ token cũ 401, đăng nhập bằng mật khẩu mới.

### SCR-03 Tài khoản (A, 20/11/2026)

`pages/users/`: `UserListPage` (`/users`, #5 — lọc vai trò / trạng thái / tìm theo họ tên, tên đăng nhập, email; 15 dòng
một trang; bộ lọc + trang giữ trong URL `?vaiTro=&trangThai=&q=&trang=`, mở chi tiết mang theo để nút quay lại về đúng
chỗ; cột Hồ sơ tóm tắt mã SV · lớp · chương trình / mã GV · bộ môn / đơn vị · chức vụ), `UserCreateForm` (#7 — vai trò
quyết định khối hồ sơ; cán bộ chỉ chọn đơn vị đã duyệt; bỏ trống mật khẩu ⇒ hệ thống sinh; lỗi `sinhVien.maSv`… gắn dưới
ô), `UserDetailPage` (`/users/:userId`, #6 — sửa thông tin #8, hồ sơ SV #13 (chương trình đào tạo đổi ngưỡng CLO1,
CLO2), hồ sơ GV #16 (hạn mức), cán bộ chỉ xem + "Mở đơn vị"; Vô hiệu hóa / Kích hoạt #9 có hỏi lại — tài khoản đang đăng
nhập không có nút Vô hiệu hóa; Đặt lại mật khẩu #10), `MatKhauMotLan` (mật khẩu ban đầu / đặt lại chỉ hiện một lần).
`api/users.ts` thêm #6–#10, #13, #16; `types/user.ts`.
**Sửa backend UC01** `NguoiDungService.doiTrangThai`: kích hoạt tay tài khoản cán bộ của đơn vị Chờ duyệt / Từ chối ⇒
BUSINESS_RULE_VIOLATION (quyết định 10.12) — trước đây kích hoạt được, và khi duyệt đơn vị (#21) tài khoản đã Hoạt động
nên không còn cấp mật khẩu ban đầu ⇒ hỏng bước demo 2. Đơn vị đã loại vẫn mở lại được (hồ sơ đang chạy giữ hiệu lực).
Đã thử 41/41 ca trên CSDL tạm (`ui-test/test-users.mjs`): 34 tài khoản / 3 trang; lọc Giảng viên ghi vào URL, mở chi
tiết rồi quay lại vẫn lọc, tải lại trang 2 vẫn trang 2; tạo trống ⇒ lỗi dưới ô (cả mã SV lồng); trùng `sv.an` ⇒ báo
trùng, form giữ; tạo SV ⇒ mật khẩu 10 ký tự đăng nhập được; GV hạn mức 12 ⇒ "Hạn mức sinh viên từ 5 đến 10"; cán bộ 2
năm ⇒ Điều 7; sửa thông tin, hồ sơ SV (Chuẩn), hồ sơ GV (hạn mức 6, TS.); đặt lại ⇒ mật khẩu cũ 401; vô hiệu hóa ⇒
không đăng nhập được, kích hoạt lại được; gv.hoa đang hướng dẫn 4 SV ⇒ chặn; cb.phuong ⇒ chặn kích hoạt, khung vàng, sau
đó duyệt Bình Minh vẫn cấp mật khẩu; giáo vụ không tự vô hiệu hóa được; GV mở `/users` ⇒ 403; 390px không tràn.

## CI/CD + triển khai VPS (A, 14–15/11/2026)

Cách vận hành, bí mật, quay về bản cũ: `docs/05-trien-khai.md`. Đã làm:
- VPS đã được phiên bài tập môn MD05 (`D:\JavaProject\md05_ss10`) cấu hình sẵn: user `deploy` (sudo, group docker), chỉ
  SSH key, root bị chặn, Docker 29, UFW. Container `nginx-8080`/`nginx-8081` ở `~/bai4` là bài nộp môn đó — không xóa.
- Phiên này thêm: khóa `github-actions-qltt` vào `deploy`, swap 2 GB, UFW mở 80, `~/qltt/.env` sinh ngẫu nhiên trên VPS.
- File mới: `Dockerfile`, `.dockerignore`, `frontend/Dockerfile`, `frontend/nginx.conf`, `frontend/.dockerignore`,
  `deploy/docker-compose.prod.yml`, `deploy/deploy.sh`, `deploy/known_hosts`, `.github/workflows/ci-cd.yml`;
  `.gitattributes` thêm `*.sh eol=lf`. Không đổi code Java/TS, không đổi lệnh dev.
- Đã thử ở máy bằng Docker (cổng 18080): Flyway V1–V4, profile `prod`, Swagger 404, đăng nhập + màn SCR-16 qua Nginx,
  đường dẫn SPA mở thẳng, tạo lại backend không 502, tệp 15 MB qua được, 23 MB ⇒ JSON `FILE_TOO_LARGE`; RAM ~0,7 GB.
  `actionlint` sạch.

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
4. Thử trên **CSDL tạm** (MySQL container `qltt-mysql-uitest` cổng 3307, DB `qltt_uitest`, Flyway tự nạp V1–V5) + backend
   cổng 8081 trỏ CSDL đó + Vite 5173 với `VITE_API_URL=http://localhost:8081/api`; trình duyệt Edge headless qua CDP.
   Bộ thử (driver `cdp.mjs`, `test-<màn>.mjs`, `moi-truong.sh`) để ngoài git, trên máy này — vị trí ghi trong ghi chú
   riêng. Mỗi lần chạy kịch bản cần CSDL vừa tạo lại (kịch bản tự sinh dữ liệu). Xong thì tắt hết, xóa container tạm.
5. Xem ảnh chụp (bảng tràn, chữ xuống dòng, trạng thái), sửa, chạy lại; ghi mục `### SCR-xx` ở trên (làm gì, đã thử gì).

## File dùng chung đã sửa — cần báo Văn

`api/records.ts` (#39–#44: `danhSach`, `cuaToi`, `chiTiet`, `tao`, `capNhat`, `gui`), `types/record.ts`
(`HinhThucThucTap`, `HinhThucLamViec`, `HoSoRequest`), `api/client.ts` (đọc lỗi JSON khi tải blob), `utils/taiTep.ts`,
`format.so2`, `components/ConfirmDialog` (`rong`), `TermSelect`, `RubricLevelPicker`, `App.tsx`, `menu.ts`
(`/assessments` thêm ADMIN), `styles.css`, `format.dungLuong` (SCR-17), `utils/tepTaiLen.ts` (SCR-22). Liên kết từ SCR-24 sang SCR-23 truyền `state.tuKetQua` (thông điệp BR-12.5).
Đợt đổi giao diện 18/11 (cả hai phần): `menu.ts` bỏ `moTa`, thêm `icon`; `layouts/*`, `components/Brand.tsx`, `HomePage`,
`PlaceholderPage`, đầu `styles.css` (biến màu mới); gói `lucide-react@0.468.0`; bỏ mã nội bộ khỏi chữ ở mọi màn của A và B
và khỏi `message` của các service backend (`KetQuaService`, `PhieuDanhGiaService`, `ScoringService`, `ThongKeService`…).
Đợt 20/11: `AppLayout` gắn chuông; `LoginPage` thêm thông báo `?doiMatKhau=1`; `styles.css` ≤ 640px cắt tên hệ thống
bằng "…" để chừa chỗ chuông; `api/hostOrgs.ts`, `types/hostOrg.ts` mở rộng #20–#25. SCR-03: `App.tsx` (route `/users`, `/users/:userId`), cuối
`styles.css` khối `.tk-*`, `api/users.ts` (#6–#10, #13, #16), `types/user.ts`.
Backend UC02: đặc tả ghi đề xuất ĐVHD mới "thông báo giáo vụ" nhưng #19 chưa gửi (15 mã NT chưa có mã cho việc này).

## Môi trường thử hiện tại

CSDL dev đã `down -v` ngày 10/11/2026 và nạp lại sạch V1–V4 (chỉ thêm dữ liệu của `mvnw test`, không thao tác API).
Hồi quy toàn bộ 20/11/2026 (sau SCR-07/08, chuông, SCR-06): 16 kịch bản, 644 ca, 0 lỗi. SCR-03 (20/11): 41/41 ca; chỉ
thêm khối CSS `.tk-*` và route riêng nên không chạy lại hồi quy. Không có tiến trình thử nào đang chạy; container tạm
`qltt-mysql-uitest` đã xóa.
