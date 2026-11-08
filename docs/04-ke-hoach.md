# Kế hoạch code chi tiết — 2 người, 6 tuần

> **A = Hoàng Gia Bảo** (kiến trúc + lõi đánh giá) · **B = Trần Đức Văn** (quy trình thực tập + nền giao diện)
> Lập ngày 08/11/2026. Theo dõi tiến độ hằng ngày ở `docs/TIEN-DO.md`.

## 0. Giả định — sửa ngay nếu sai

| Giả định | Giá trị | Nếu khác thì |
|---|---|---|
| Thời gian còn lại | **6 tuần: 09/11 → 20/12/2026** (lịch Sprint trong Proposal đã hết hạn 30/10) | Co/giãn tuần 5–6; tuần 1–4 giữ nguyên thứ tự |
| Backend | Spring Boot **4.1.1**, Java **21** (đúng `pom.xml` hiện tại), MySQL 8, Flyway | Proposal ghi Java 17 — Boot 4 chạy được trên 17, nhưng thống nhất một bản JDK cho cả hai máy |
| Frontend | React 18 + TypeScript + Vite, **cùng repo** trong thư mục `frontend/` | Tách repo thì bỏ mục FE khỏi `.claude/hooks` |
| Phạm vi | 13 UC, 102 endpoint, 28 bảng — đúng `docs/02-api.md`, `docs/03-csdl.md` | Cắt theo mục 6, không cắt UC08/09/10 |

## 1. Nguyên tắc chia việc

- **Chia dọc theo UC**, mỗi người làm **cả backend lẫn màn hình** của UC mình. Cả hai đều phải bảo
  vệ được phần của mình, nên không chia "một người BE, một người FE".
- A cầm **lõi đánh giá** (UC08–UC10) vì đó là phần không được cắt và khó nhất; B cầm **chuỗi quy trình**
  (UC02, UC04–UC07, UC11, UC12) — nhiều endpoint, nhiều upload tệp, nhiều luồng trạng thái.
- Khối lượng: A **54** endpoint (ít luồng nhưng thuật toán khó), B **48** endpoint (nhiều luồng, nhiều tệp).
- Mỗi entity / service / controller có **đúng một chủ** → hai người gần như không sửa chung file.
  Cần sửa file của người kia thì nhắn trước, hoặc nhờ chủ file sửa.

## 2. Phân công chi tiết

### 2.1. Theo UC và endpoint (`docs/02-api.md`)

| Người | UC | Nhóm endpoint | Số |
|---|---|---|---|
| A | Nền tảng: bảo mật JWT, `ApiResponse`, 15 mã lỗi, nhật ký hệ thống, thông báo | 1, 15 (#100–102) | 7 |
| A | UC01 Tài khoản, sinh viên, giảng viên | 2, 3 | 12 |
| A | UC03 Đợt, chặng, CLO, rubric, câu hỏi, loại minh chứng | 5 | 13 |
| A | UC08 + UC09 Phiếu đánh giá, Tổ đánh giá | 10, 11 | 13 |
| A | UC10 Tính điểm, xác nhận, công bố, xuất TTTN-07 | 12 | 7 |
| A | UC13 Thống kê RP-01…06, xuất Excel | 15 (#98–99) | 2 |
| B | Nền tảng: docker-compose MySQL, Flyway V1 schema, lưu trữ tệp, khung frontend | — | — |
| B | UC02 ĐVHD và cán bộ hướng dẫn | 4 | 9 |
| B | UC04 Đăng ký và phê duyệt hồ sơ | 6 | 9 |
| B | UC05 Phân công GVHD | 7 | 4 |
| B | UC06 Kế hoạch học tập | 8 | 5 |
| B | UC07 Nhật ký, tiến độ tuần, minh chứng | 9 | 12 |
| B | UC11 Báo cáo thực tập | 13 | 5 |
| B | UC12 Phản hồi và tự đánh giá | 14 | 4 |

### 2.2. Theo entity (28 bảng — `docs/03-csdl.md`)

| A (17) | B (11) |
|---|---|
| `NguoiDung`, `SinhVien`, `GiangVien` · `DotThucTap`, `ChangDanhGia`, `ChuanDauRa`, `MucRubric`, `CauHoiDanhGia`, `LoaiMinhChungBatBuoc` · `ToDanhGia`, `ToDanhGiaHoSo`, `ThanhVienToDanhGia`, `PhieuDanhGia`, `DiemCloChiTiet`, `KetQuaHocPhan` · `NhatKyHeThong`, `ThongBao` · **toàn bộ enum** | `DonViHuongDan`, `CanBoDvhd` · `HoSoThucTap`, `PhanCongGvhd` · `KeHoachHocTap`, `MucKeHoach`, `NhatKyThucTap`, `TienDoTuan`, `MinhChung` · `BaoCaoThucTap`, `PhanHoi` |

### 2.3. Theo màn hình (frontend)

| A | B |
|---|---|
| Đăng nhập, layout theo vai trò, SCR-03 tài khoản, SCR-06 hồ sơ cá nhân, SCR-09/10 đợt + CLO/rubric, SCR-18 chấm chặng 1, SCR-19 Tổ đánh giá, SCR-20 chấm chặng 2, SCR-21 TTTN-07, SCR-24 kết quả SV, SCR-25 thống kê, chuông thông báo | Khung Vite + axios + route guard, SCR-07/08 ĐVHD, SCR-11 đăng ký, SCR-12 duyệt hồ sơ, SCR-13 phân công, SCR-14 kế hoạch, SCR-15 nhật ký, SCR-16 tiến độ, SCR-17 minh chứng + bảng đối chiếu, SCR-22 báo cáo, SCR-23 phản hồi 08a/08b |

## 3. Cấu trúc mã nguồn (chốt ngày 1, không đổi giữa chừng)

```
CDTH-QLTT/
├── docker-compose.yml                 MySQL 8 utf8mb4 (B)
├── pom.xml
├── src/main/java/org/example/cdthqltt/
│   ├── common/        ApiResponse, PageResponse, ErrorCode, BusinessException, GlobalExceptionHandler   (A)
│   ├── config/        SecurityConfig, CorsConfig, OpenApiConfig (A) · StorageProperties (B)
│   ├── security/      JwtService, JwtAuthFilter, CurrentUser, SecurityUtils                             (A)
│   ├── entity/        28 entity — chủ theo bảng 2.2
│   ├── entity/enums/  toàn bộ enum                                                                       (A)
│   ├── repository/
│   ├── dto/<module>/  record request/response, mỗi module một thư mục
│   ├── service/       nghiệp vụ, mỗi UC một service chính
│   ├── service/scoring/   ScoringService + input/output record — Java thuần, KHÔNG phụ thuộc Spring/JPA (A)
│   ├── service/storage/   FileStorageService                                                             (B)
│   ├── scheduler/     ChangScheduler — mở chặng theo lịch                                                (A)
│   └── controller/
├── src/main/resources/
│   ├── application.yml, application-dev.yml
│   └── db/migration/  V1__schema.sql (B) · V2__seed_cau_hinh_mau.sql (A) · V3__seed_tai_khoan_demo.sql (A) · V4__seed_kich_ban_demo.sql (B, tuần 5)
├── src/test/java/org/example/cdthqltt/service/scoring/ScoringServiceTest.java   (A)
└── frontend/          Vite + React 18 + TS (B dựng khung; ai làm màn nào sửa file màn đó)
    └── src/{api,auth,components,layouts,pages/<module>,types}
```

## 4. Hợp đồng giữa hai người — chốt chữ ký hàm ngày 2 tuần 1

Mỗi bên commit **stub** (chữ ký đúng, thân `throw new UnsupportedOperationException()` hoặc trả giá trị
giả) trước, để người kia code song song không phải chờ.

**A cung cấp cho B**
| Hàm | Dùng ở đâu |
|---|---|
| `SecurityUtils.currentUser()` → `CurrentUser(nguoiDungId, vaiTro, sinhVienId, giangVienId, canBoDvhdId)` | mọi service kiểm sở hữu |
| `new BusinessException(ErrorCode, message)` + `ApiResponse<T>` | mọi nơi |
| `NhatKyHeThongService.ghiVet(hanhVi, doiTuong, doiTuongId, truoc, sau)` | đổi GVHD, mở lại kế hoạch/báo cáo |
| `ThongBaoService.gui(maSuKien, nguoiNhanIds, noiDung, duongDan)` | mọi luồng có thông báo |
| `NguoiDungService.taoTaiKhoanCanBo(...)` → tài khoản + mật khẩu ban đầu | UC02 phê duyệt ĐVHD |
| `DotThucTapService.layDotDangMo()`, `layChang(dotId, thuTu)` | UC04, UC06, UC11 |
| `RubricUtils.xacDinhMuc(BigDecimal)`, `RubricUtils.diemGiuaKhoang(int muc)`, `ScoringService.tinhHpTuDiemClo(...)` | UC12 HPself, chỉ số tự nhận thức |

**B cung cấp cho A**
| Hàm | Dùng ở đâu |
|---|---|
| `HoSoThucTapService.layVaKiemQuyen(hoSoId, currentUser)` → `HoSoThucTap` hoặc ném `ACCESS_DENIED` | UC08–UC10, UC13 |
| `HoSoThucTapService.chuyenTrangThai(hoSo, trangThaiMoi, lyDo)` | UC10 công bố → HOAN_THANH / KHONG_HOAN_THANH |
| `PhanCongService.layGvhd(hoSoId)` → `GiangVien` | UC08 xác định người chấm, UC09 kiểm thành phần tổ |
| `MinhChungService.doiChieu(hoSoId)` → `KetQuaDoiChieu(boolean du, List<String> loaiConThieu)` | UC10 điều kiện (d), RP-04 |
| `BaoCaoService.daDuXacNhan(hoSoId)` | mở chặng 2 (CBR-13) |
| `PhanHoiService.daGui08b(hoSoId)` | UC13 SV xem kết quả |

## 5. Lịch 6 tuần

Mỗi tuần kết thúc bằng **mốc chạy được** + tag git. Chưa đạt mốc thì tuần sau ưu tiên trả nợ mốc trước.

### Tuần 1 (09/11 – 15/11) · Nền tảng — mốc `t1-nen-tang`

| Ngày | A | B |
|---|---|---|
| T2 | Thêm dependency vào `pom.xml` (webmvc, data-jpa, security, validation, flyway + flyway-mysql, mysql-connector-j, lombok, springdoc 3.x, jjwt 0.12.x); `application.yml` + profile dev; **toàn bộ enum** | `docker-compose.yml` MySQL 8 utf8mb4 + timezone `Asia/Ho_Chi_Minh`; bắt đầu `V1__schema.sql` (28 bảng từ `docs/03-csdl.md`, đủ FK, UNIQUE, CHECK) |
| T3 | `common/`: `ApiResponse`, `PageResponse`, `ErrorCode` (15 mã), `BusinessException`, `GlobalExceptionHandler`; **commit stub các hàm mục 4** | Xong `V1__schema.sql`, app khởi động + Flyway migrate sạch; **commit stub các hàm mục 4** |
| T4 | Entity nhóm 1, 2 (của A); `JwtService`, `JwtAuthFilter`, `SecurityConfig` (stateless, CORS cho `localhost:5173`, 401/403 trả JSON chuẩn) | Entity của B (bảng 2.2), repository tương ứng; `FileStorageService` (kiểm 20 MB + đuôi tệp + MIME, lưu `uploads/{hoSoId}/{uuid}.{ext}`) |
| T5 | `POST /api/auth/login` (khóa 15 phút sau 5 lần sai), `GET /api/auth/me`, đổi mật khẩu, hồ sơ cá nhân | Khung `frontend/`: Vite + TS + React Router + axios (gắn Bearer, bắt 401 → về login), `AuthContext`, `RequireRole` |
| T6 | Entity nhóm 4, 5 (của A); `V2__seed_cau_hinh_mau.sql` (đợt mẫu `MAU-QD207`: 2 chặng, 7 CLO, 35 mức, 13 câu; 6 hình thức × loại minh chứng bắt buộc); `V3__seed_tai_khoan_demo.sql` (mỗi vai trò ≥ 2 tài khoản) | Layout chung + menu theo vai trò; màn đăng nhập gọi API thật |
| T7 | Swagger UI chạy, test login từ Postman; review PR của B | Review PR của A; thử toàn bộ khung trên máy mình |

**Mốc tuần 1**: `mvnw spring-boot:run` trên **cả hai máy** → Flyway tạo 28 bảng + seed → đăng nhập 4 vai
trò bằng Postman và bằng giao diện → gọi endpoint sai vai trò ra 403 JSON đúng chuẩn.

### Tuần 2 (16/11 – 22/11) · Danh mục + đăng ký — mốc `t2-dang-ky-den-thuc-tap`

**A**
- [ ] UC01: `/api/users` (5–10) — tạo user + hồ sơ mở rộng **một giao dịch**, mật khẩu ban đầu, vô hiệu hóa có kiểm đang hướng dẫn; `/api/students`, `/api/lecturers` (11–16) có lọc theo sở hữu
- [ ] `taoTaiKhoanCanBo` thật (thay stub) cho B
- [ ] UC03: `/api/terms` (26–31) — tạo đợt = nhân bản từ đợt mẫu, tính số tuần, mốc chặng 1 (đầu tuần 4), mốc chặng 2 (ngày sau kết thúc); chuyển trạng thái đợt; gia hạn tính lại mốc
- [ ] UC03: CLO/rubric/câu hỏi/loại minh chứng (32–38) — Σα = 100, tỷ lệ cộng 100, chặn sửa khi đã có phiếu nộp, rubric chỉ sửa mô tả
- [ ] `NhatKyHeThongService`, `ThongBaoService` thật + endpoint 100–102
- [ ] FE: SCR-03, SCR-06, SCR-09, SCR-10, chuông thông báo

**B**
- [ ] UC02: `/api/host_organizations`, `/supervisors` (17–25) — phê duyệt tạo tài khoản cán bộ (gọi `taoTaiKhoanCanBo`), loại khỏi danh mục, xóa mềm + `RESOURCE_IN_USE`, SV đề xuất đơn vị
- [ ] UC04: `/api/internship_records` (39–47) — nháp, gửi (CBR-01, CBR-03, quốc tế ≥ 6 tuần), ĐVHD xác nhận/từ chối (đếm), GVHD duyệt/từ chối (giảm đếm), gián đoạn; khởi tạo khung kế hoạch + N dòng tiến độ khi duyệt
- [ ] UC05: `/api/assignments` (48–51) — phân công hàng loạt **một giao dịch**, vượt hạn mức hủy toàn bộ, đổi GVHD có lý do + nhật ký
- [ ] `layVaKiemQuyen`, `chuyenTrangThai`, `layGvhd` thật (thay stub) cho A
- [ ] FE: SCR-07, SCR-08, SCR-11, SCR-12, SCR-13

**Mốc tuần 2**: trên giao diện — ADMIN tạo đợt + duyệt ĐVHD → SV đăng ký → cán bộ xác nhận → ADMIN phân
công → GV duyệt → hồ sơ `DANG_THUC_TAP` có sẵn khung kế hoạch và 8 dòng tiến độ.

### Tuần 3 (23/11 – 29/11) · Lõi tính điểm + chặng 1 + quá trình — mốc `t3-cham-chang-1`

**A**
- [ ] `service/scoring/`: `ScoringService` **Java thuần** (input = các phiếu đã nộp + cấu hình đợt, output = điểm từng chặng, 7 CLO, HP, mức, 4 điều kiện, nhóm năng lực, cảnh báo) — làm **đầu tuần**, trước UC08
- [ ] `ScoringServiceTest`: tối thiểu 12 ca trong `.claude/rules/kiem-thu.md`, ca chuẩn là ví dụ tính tay trong skill `tinh-diem-clo` (HP = 7,7)
- [ ] UC08: `/api/assessments` (69–76) — biểu mẫu chấm theo nhóm (ĐVHD không có CLO7), lưu nháp, nộp (đủ câu, CBR-10, nhận xét chung), khóa; **ẩn điểm bên kia đến khi cả hai nộp (ở service)**; mở lại + nhật ký điểm cũ; cờ lệch > 2,0
- [ ] `ChangScheduler` (`@Scheduled` hằng ngày) mở chặng 1 đúng mốc + thông báo NT-10; endpoint mở/đóng thủ công (32)
- [ ] FE: SCR-18 (chọn mức → hiện mô tả hành vi + gợi ý điểm giữa khoảng → chỉnh điểm trong khoảng)

**B**
- [ ] UC06: `/study_plan`, `/api/study_plans` (52–56) — đủ N+1 dòng × 3 nội dung, hạn 5 ngày làm việc, `nop_muon`, 2 xác nhận → khóa + ghi nhận minh chứng, GV mở lại + nhật ký
- [ ] UC07: nhật ký (57–60) — 1 bản/ngày, sửa trong 7 ngày, GV nhắc SV > 5 ngày không ghi
- [ ] UC07: tiến độ tuần (61–63) — 0–100%, cán bộ xác nhận khóa dòng / yêu cầu bổ sung + thông báo
- [ ] UC07: minh chứng (64–68) — upload multipart, tải về có kiểm quyền, xóa (chặn khi đã khóa), **`doiChieu` coi bản ghi hệ thống là minh chứng** (xem `docs/01-nghiep-vu.md` mục 8)
- [ ] FE: SCR-14, SCR-15, SCR-16, SCR-17

**Mốc tuần 3**: `mvnw test` xanh với ≥ 12 ca tính điểm; GV và cán bộ chấm chặng 1 cho cùng một SV trên
giao diện, người này không thấy điểm người kia trước khi cả hai nộp; SV ghi nhật ký, tiến độ, upload minh chứng và thấy bảng Đủ/Thiếu.

### Tuần 4 (30/11 – 06/12) · Chặng 2 + kết quả + báo cáo — mốc `t4-luong-day-du`

**A**
- [ ] UC09: `/api/panels` (77–81) — kiểm thành phần tổ theo `docs/01-nghiep-vu.md` 10.5 cho **từng** SV trong tổ; vắng mặt + thay thế kiểm lại điều kiện; thông báo NT-11
- [ ] Chặng 2 dùng lại luồng phiếu UC08 với 7 CLO; nhóm người chấm lấy từ `thanh_vien_to_danh_gia`; ĐVHD gửi CLO7 ⇒ bỏ qua + ghi nhật ký; mở chặng 2 chỉ khi `daDuXacNhan`
- [ ] UC10: `/api/results` (82–87) — tự tính khi đủ phiếu (CBR-16, CBR-17), lưu kèm phiên bản trọng số, GVHD rà + đề xuất thưởng ≤ 0,5, ADMIN xác nhận, công bố ⇒ gọi `chuyenTrangThai`; mở lại phiếu ⇒ `CHUA_TINH` + tính lại + nhật ký HP trước/sau
- [ ] FE: SCR-19, SCR-20, SCR-21 (bảng TTTN-07 đủ cột 1–9)

**B**
- [ ] UC11: `/reports`, `/api/reports` (89–93) — pdf/docx ≤ 20 MB, mỗi lần nộp là phiên bản mới, nộp muộn + số ngày trễ, ĐVHD rồi GVHD xác nhận ⇒ `CHO_DANH_GIA`, GV mở lại
- [ ] UC12: `/feedbacks` (94–97) — 08a (6 tiêu chí 0–4), 08b (6 mục 1–5, 7 CLO tự đánh giá, 4 câu tự luận, cam kết); HPself xem trước (gọi `RubricUtils` + `ScoringService` của A); chỉ số tự nhận thức sau công bố; `daGui08b`
- [ ] Kiểm thử chéo luồng UC04→UC07 của chính mình theo ma trận quyền
- [ ] FE: SCR-22, SCR-23

**Mốc tuần 4 (quan trọng nhất)**: chạy trọn một vòng đời trên giao diện — đăng ký → … → chấm 2 chặng →
hệ thống tự tính → GVHD rà → ADMIN xác nhận, công bố → hồ sơ `HOAN_THANH`. Điểm trên SCR-21 **khớp tính tay**.

### Tuần 5 (07/12 – 13/12) · Tra cứu, thống kê, dữ liệu demo — mốc `t5-thong-ke`

**A**
- [ ] UC13: SV xem kết quả (83) — chỉ khi đã công bố **và** đã gửi 08b, không có điểm từng người chấm
- [ ] RP-01…RP-06 (`/api/results`, `/api/statistics/{report_type}`), đối chiếu mục tiêu ≥ 90%
- [ ] Xuất Excel thống kê (99) bằng Apache POI
- [ ] *(nâng cao)* Xuất TTTN-07 ra Word (88); biểu đồ radar 7 trục ở SCR-24
- [ ] FE: SCR-24, SCR-25

**B**
- [ ] `V4__seed_kich_ban_demo.sql` (hoặc `DemoDataRunner` chỉ chạy profile `demo`): 1 đợt đã chấm xong ~10 SV đủ các trường hợp (đạt, không đạt vì CLO2, không đạt vì thiếu minh chứng, CLC_STEM, có điểm thưởng)
- [ ] Postman collection theo 4 vai trò (mỗi endpoint: 1 ca đúng quyền + 1 ca sai quyền)
- [ ] Rà lại toàn bộ thông báo NT-01…NT-15 đã sinh đúng chỗ
- [ ] Đánh bóng FE các màn của mình (trạng thái rỗng, lỗi, loading, thông báo lỗi tiếng Việt từ `message`)

**Cả hai**: review chéo toàn bộ code của người kia bằng `/soat-code` và `/soat-nghiep-vu`.

### Tuần 6 (14/12 – 20/12) · Kiểm thử và hoàn thiện — mốc `t6-ban-demo`

| A | B |
|---|---|
| Unit test bao phủ mọi nhánh `ScoringService`; sửa lỗi lõi | Chạy Postman toàn bộ, lập bảng kết quả kiểm thử ma trận phân quyền |
| Kịch bản demo 1 vòng đời (Proposal mục 11.7), tập 3 lần | Kiểm thử tích hợp đầu–cuối trên dữ liệu demo sạch |
| Slide phần kiến trúc + thuật toán tính điểm | Slide phần quy trình + giao diện |
| Cập nhật tài liệu (nhờ Claude dùng agent `cap-nhat-tai-lieu`) | Hướng dẫn cài đặt chạy demo trong `README.md` |

**Thứ 6 18/12**: đóng băng code, tag `t6-ban-demo`. Từ đó chỉ sửa lỗi chặn demo.

## 6. Thứ tự cắt khi chậm

Cắt **từ trên xuống**, không bao giờ chạm UC08, UC09, UC10, UC01, UC04:

1. Xuất TTTN-07 ra Word (#88)
2. Biểu đồ radar, chỉ số tự nhận thức trên giao diện (giữ API)
3. Xuất Excel (#99)
4. RP-05, RP-06
5. Nhắc nhở nhật ký (#60), SV đề xuất ĐVHD mới
6. Gián đoạn / đánh giá bù (#47)
7. Màn hình của UC12 (giữ API 08b vì UC13 phụ thuộc)

## 7. Cách làm việc chung

- **Nhánh**: `main` luôn chạy được. Mỗi việc một nhánh `feat/<uc>-<mo-ta-ngan>` (ví dụ `feat/uc08-nop-phieu`).
  Xem `.claude/rules/git.md`.
- **PR nhỏ, review trong 24 giờ**. Người kia review bằng `/soat-code` trước khi bấm merge. Không tự merge PR của mình.
- **Đồng bộ 15 phút mỗi tối** (hoặc nhắn): hôm nay xong gì, mai làm gì, đang chờ hàm nào của người kia.
  Cập nhật `docs/TIEN-DO.md` sau mỗi lần merge.
- **Migration Flyway không bao giờ sửa file đã merge** — cần đổi schema thì thêm `V5__...sql` mới.
  Đặt số phiên bản bằng cách nhắn nhau trước để khỏi trùng.
- **Definition of Done** của một endpoint: biên dịch được · chạy đúng trên Swagger/Postman với vai trò
  đúng **và** bị chặn với vai trò sai · mọi nhánh lỗi trong đặc tả UC trả đúng mã lỗi · ghi nhật ký/thông
  báo nếu đặc tả yêu cầu · có màn hình gọi được (hoặc ghi rõ còn nợ).

## 8. Rủi ro và cách đỡ

| Rủi ro | Cách đỡ |
|---|---|
| Spring Boot 4 mới: một số thư viện / ví dụ trên mạng còn viết cho Boot 3 (Jackson 2, tên starter cũ) | Dùng agent `sua-loi-build`; đọc skill `spring-boot-api` mục "Boot 4"; không chép cấu hình Boot 3 mù quáng |
| Thuật toán tính điểm sai ở các ca biên (CLO7, vắng mặt, trần 10) | Viết `ScoringService` thuần + test **trước** khi nối vào UC10; `/soat-tinh-diem` sau mỗi lần sửa |
| Hai người cùng sửa một file → xung đột | Chủ sở hữu file theo mục 2; stub hợp đồng ngày 2 |
| B bị nghẽn vì chờ hàm của A (hoặc ngược lại) | Stub trả dữ liệu giả ngay tuần 1; hàm thật xong muộn nhất cuối tuần 2 |
| Tuần 4 không đạt mốc vòng đời | Cắt theo mục 6 ngay đầu tuần 5, không cố làm tiếp phần nâng cao |
