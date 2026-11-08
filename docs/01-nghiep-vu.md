# Nghiệp vụ hệ thống QLTT — bản rút gọn để code

> Nguồn: Quy định TTTN kèm QĐ 207/QĐ-ĐHXDHN (23/01/2026), `BAO-CAO-PHAN-TICH-HE-THONG-QLTT-v1.0.docx`,
> `PROJECT-PROPOSAL-QuanLyThucTap-HUCE.docx`, `QLTT-ThietKe-API-CSDL.xlsx`, `Class_Diagram.pdf`.
> File này **tóm lại** các tài liệu đó cho dễ tra khi code. Khi có mâu thuẫn, tài liệu gốc thắng —
> và ghi điểm mâu thuẫn vào mục 10 "Điểm cần xác nhận".

## 1. Bài toán trong một đoạn

Học phần TTTN: 8 tín chỉ, 8 tuần, học kỳ cuối. Mỗi sinh viên được **hai bên đồng chấm** (GVHD của
Trường và cán bộ hướng dẫn tại ĐVHD) ở **hai chặng** (chặng 1 tuần 4 – 30%, chặng 2 cuối kỳ – 70%)
trên **bảy chuẩn đầu ra (CLO)** có trọng số α cố định, mỗi CLO có **tỷ lệ đồng chấm riêng**. Hệ thống
số hóa chuỗi biểu mẫu TTTN-01 → TTTN-08b và **tự tính điểm** theo Điều 14, xét công nhận theo Điều 15.

Ba UC **không được cắt trong mọi tình huống**: UC08 (chấm chặng 1), UC09 (Tổ đánh giá + chấm chặng 2),
UC10 (tính điểm + công nhận).

## 2. Tác nhân và vai trò

| Vai trò (enum `VaiTro`) | Ai | Làm gì chính |
|---|---|---|
| `ADMIN` | Giáo vụ Khoa, kiêm quản trị | Tài khoản, ĐVHD, đợt/CLO/rubric, phân công GVHD, lập Tổ đánh giá, mở lại phiếu, xác nhận + công bố kết quả, thống kê, nhật ký |
| `GIANG_VIEN` | Giảng viên | Là **GVHD** với SV được phân công; là **thành viên Tổ đánh giá** khi được đưa vào tổ. Duyệt hồ sơ, xác nhận kế hoạch/báo cáo, chấm 2 chặng, rà TTTN-07, đề xuất điểm thưởng |
| `CAN_BO_DVHD` | Cán bộ tại đơn vị tiếp nhận (người ngoài Trường) | Xác nhận tiếp nhận, xác nhận kế hoạch, xác nhận tiến độ tuần, chấm 2 chặng, gửi phiếu 08a |
| `SINH_VIEN` | Sinh viên năm cuối | Đăng ký, kế hoạch, nhật ký, tiến độ, minh chứng, báo cáo, phiếu 08b, tra cứu kết quả |
| *Hệ thống* | Tác vụ tự động | Mở chặng theo lịch, đối chiếu minh chứng, tính điểm khi đủ phiếu, sinh thông báo |

**Phân quyền hai lớp** — cả hai lớp đều bắt buộc:
1. **Vai trò**: kiểm ở `@PreAuthorize` (cột *Quyền* trong `docs/02-api.md`).
2. **Sở hữu dữ liệu**: kiểm ở **service**. SV chỉ thấy của mình; GV chỉ thấy SV mình là GVHD (hoặc
   SV trong tổ mình, với chặng 2); cán bộ ĐVHD chỉ thấy SV mình hướng dẫn. Thiếu quyền sở hữu thì
   trả `ACCESS_DENIED` **không để lộ chi tiết đối tượng** (hoặc `RESOURCE_NOT_FOUND`, thống nhất một cách).

Thứ tự kiểm khi nhiều điều kiện cùng sai: **xác thực/quyền → tồn tại → trạng thái cho phép → phiên
bản dữ liệu → dữ liệu nhập**.

## 3. 24 quy tắc chung (CBR)

| Mã | Nội dung | Căn cứ | Nơi thực thi |
|---|---|---|---|
| CBR-01 | Mỗi SV đúng **một hồ sơ hiệu lực** trong một đợt | Đ5 | UNIQUE(sinh_vien_id, dot_id) + service UC04 |
| CBR-02 | Chỉ ĐVHD `DA_DUYET` mới được SV chọn | Đ7 k1 | UC02, UC04 |
| CBR-03 | Một cán bộ ĐVHD nhận **≤ 5 SV** cùng đợt (`so_sv_toi_da`, mặc định 5) | Đ7 k2c | UC04 gửi + xác nhận |
| CBR-04 | Một GVHD phụ trách **5–10 SV**; hạn mức riêng do giáo vụ đặt | Đ6 k2b | UC01, UC05 |
| CBR-05 | Cán bộ ĐVHD **≥ 3 năm** kinh nghiệm | Đ7 k1c | UC01, UC02 |
| CBR-06 | Mỗi đợt **đúng 2 chặng**: chặng 1 w=0,3; chặng 2 w=0,7 | Đ11 k4 | UC03 |
| CBR-07 | Đúng **7 CLO**; Σα = 100 | Đ9 k2, Đ14 k3 | UC03 |
| CBR-08 | Mỗi CLO: tỷ lệ ĐVHD + tỷ lệ GVHD = 100 | Đ14 k3 | UC03 |
| CBR-09 | **CLO7 chỉ GVHD chấm**; ĐVHD không nhập được CLO7 | Đ14 k3 | UC08, UC09 (service bỏ qua + ghi nhật ký) |
| CBR-10 | Điểm thang 10 phải nằm **trong khoảng của mức** rubric đã chọn | Đ12, Đ13 k2 | UC08, UC09 |
| CBR-11 | Mỗi người chấm **một phiếu / một SV / một chặng** | Đ10 | UNIQUE(ho_so_id, chang_id, nguoi_cham_id) |
| CBR-12 | Phiếu đã nộp **bị khóa**; chỉ ADMIN mở lại, có lý do, ghi nhật ký điểm cũ | Đ14 k4c | UC08 |
| CBR-13 | Chặng 1 mở **đầu tuần thứ 4**; chặng 2 mở **sau ngày kết thúc và đã nộp báo cáo** | Đ10 k2 | Scheduler + UC03 |
| CBR-14 | Tổ đánh giá **≥ 3 người, số lẻ, có GVHD của SV, ≥ 1 thành viên ĐVHD** (xem 10.5) | Đ10 k3a | UC09 |
| CBR-15 | Chặng 2: điểm mỗi CLO = **trung bình trong từng nhóm người chấm** rồi mới áp tỷ lệ | Đ10 k3c | ScoringService |
| CBR-16 | Không chốt điểm khi **thiếu minh chứng bắt buộc** | Đ4, Đ15 k3d | UC10 |
| CBR-17 | Không chốt điểm khi một chặng **thiếu phiếu một bên** | Đ13 k3 | UC10 |
| CBR-18 | Kết quả làm tròn **0,1** (chỉ ở bước cuối) | Đ14 k4a | ScoringService |
| CBR-19 | Ngưỡng đạt CLO: **Mức 1** (CHUAN), **Mức 2** (CLC_STEM) | Đ15 k1-2 | ScoringService |
| CBR-20 | Công nhận hoàn thành khi thỏa **đồng thời 4 điều kiện** Đ15 k3 | Đ15 k3 | ScoringService |
| CBR-21 | Điểm thưởng **≤ 0,5**; HP sau thưởng **≤ 10,0** | Đ18 k4 | UC10 |
| CBR-22 | Dữ liệu đã phát sinh điểm chỉ **xóa mềm** | Đ16 k1 | mọi service |
| CBR-23 | Mỗi CLO được đánh giá **≥ 1 lần** trên 2 chặng; **cảnh báo** khi < 2 lần | Đ11 k2c | UC03, UC10 |
| CBR-24 | Tệp ≤ **20 MB**; pdf, doc, docx, xls, xlsx, jpg, png, mp4 | Quy ước | FileStorageService |

## 4. 15 mã lỗi (bộ xử lý ngoại lệ tập trung)

| Mã | HTTP | Ý nghĩa |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dữ liệu vào không hợp lệ |
| `BUSINESS_RULE_VIOLATION` | 400 | Vi phạm quy tắc nghiệp vụ — **thông điệp kèm trích dẫn điều khoản** |
| `UNAUTHORIZED` | 401 | Chưa đăng nhập / token hết hạn |
| `ACCESS_DENIED` | 403 | Không đủ quyền |
| `RESOURCE_NOT_FOUND` | 404 | Không tìm thấy |
| `DUPLICATE_RESOURCE` | 409 | Trùng dữ liệu duy nhất |
| `RESOURCE_IN_USE` | 409 | Đang được tham chiếu, không xóa được |
| `RESOURCE_LOCKED` | 409 | Đã khóa, cần mở lại trước khi sửa |
| `QUOTA_EXCEEDED` | 409 | Vượt hạn mức GVHD / cán bộ ĐVHD |
| `THIEU_PHIEU_DVHD` | 409 | Thiếu phiếu ĐVHD ở một chặng |
| `THIEU_PHIEU_GVHD` | 409 | Thiếu phiếu GVHD ở một chặng |
| `CLO_CHUA_DUOC_DANH_GIA` | 409 | Một CLO không xuất hiện ở chặng nào |
| `FILE_TOO_LARGE` | 413 | Tệp > 20 MB |
| `UNSUPPORTED_FILE_TYPE` | 415 | Sai định dạng tệp |
| `INTERNAL_ERROR` | 500 | Lỗi không xác định |

Ký hiệu kết thúc luồng trong đặc tả: **TC** (thành công, kể cả danh sách rỗng), **KD** (không tạo thay
đổi mới), **CXĐ** (mất phản hồi, phải đối soát trước khi gửi lại).

## 5. Máy trạng thái

**Hồ sơ thực tập** (`TrangThaiHoSo`):
```
NHAP --gui--> CHO_DVHD --DVHD xac nhan (tang dem can bo)--> CHO_GVHD
     <--DVHD tu choi (ly do)--          <--GVHD tu choi (ly do, GIAM dem can bo)--  (ve NHAP)
CHO_GVHD --(giao vu phan cong) GVHD phe duyet--> DANG_THUC_TAP   [tao khung ke hoach + bang tien do N tuan]
DANG_THUC_TAP --bao cao du 2 xac nhan--> CHO_DANH_GIA
CHO_DANH_GIA --cong bo ket qua--> HOAN_THANH | KHONG_HOAN_THANH
(ADMIN) bat ky trang thai dang chay <--> GIAN_DOAN  (Đ15 k4, bat kha khang)
TU_CHOI: co trong enum nhung luong UC04 tra ve NHAP — xem 10.7
```

**Chặng đánh giá** (`TrangThaiChang`): `CHUA_MO → DANG_MO → DA_DONG → DA_TONG_HOP`.
**Phiếu đánh giá** (`TrangThaiPhieu`): `NHAP → DA_NOP`; chỉ ADMIN: `DA_NOP → MO_LAI` (lý do bắt buộc) → nộp lại → `DA_NOP`.
**Kết quả học phần** (`TrangThaiKetQua`): `CHUA_TINH → DA_TINH → DA_XAC_NHAN → DA_CONG_BO`.
Mở lại một phiếu ⇒ kết quả về `CHUA_TINH` và tự tính lại, ghi nhật ký HP trước/sau.
**ĐVHD** (`TrangThaiPheDuyet`): `CHO_DUYET → DA_DUYET | TU_CHOI | DA_LOAI`. `DA_LOAI`: hồ sơ đang chạy giữ
hiệu lực, chỉ chặn đăng ký mới.
**Đợt** (`TrangThaiDot`): `KHOI_TAO → DANG_NHAN_DANG_KY → DANG_THUC_HIEN → DA_KET_THUC`.
**Kế hoạch học tập** (`TrangThaiKeHoach`): `NHAP → CHO_XAC_NHAN → DA_KHOA` (đủ 2 xác nhận); GVHD mở lại được.

## 6. Cấu hình chấm điểm mặc định (nhân bản riêng cho từng đợt)

| CLO | Tên | α (%) | ĐVHD / GVHD (%) | Nhóm năng lực | Chặng 1 (câu TTTN-04) | Chặng 2 |
|---|---|---|---|---|---|---|
| CLO1 | Áp dụng kiến thức chuyên môn | 20 | 30 / 70 | Kiến thức | C1 | ✓ |
| CLO2 | Phân tích và giải quyết vấn đề | 25 | 30 / 70 | Kiến thức | C4 | ✓ |
| CLO3 | Giao tiếp và trình bày | 10 | 30 / 70 | Kỹ năng | C6 | ✓ |
| CLO4 | Đạo đức nghề nghiệp và an toàn lao động | 10 | 70 / 30 | Thái độ | C2 | ✓ |
| CLO5 | Làm việc nhóm và phối hợp | 10 | 40 / 60 | Kỹ năng | C3 | ✓ |
| CLO6 | Sử dụng công cụ kỹ thuật, phần mềm | 15 | 50 / 50 | Kỹ năng | C5 | ✓ |
| CLO7 | Đánh giá tự thân, phát triển nghề nghiệp | 10 | 0 / 100 | Thái độ | — (không có) | ✓ (chỉ GVHD) |

Câu hỏi chặng 1 (TTTN-04, đúng thứ tự in trên mẫu):
C1 Áp dụng kiến thức vào nhiệm vụ được giao? → CLO1 · C2 Tuân thủ quy định, an toàn, đạo đức nghề nghiệp? → CLO4 ·
C3 Phối hợp nhóm, giao tiếp công việc → CLO5 · C4 Phân tích vấn đề, đề xuất giải pháp → CLO2 ·
C5 Sử dụng công cụ, phần mềm kỹ thuật → CLO6 · C6 Viết báo cáo tiến độ, phản hồi → CLO3.
Chặng 2 (TTTN-05): 7 dòng CLO1…CLO7. Tổng **13 câu hỏi**.

**Rubric 5 mức** (Đ13 k2, khoảng cố định, Khoa chỉ được sửa *mô tả hành vi*):

| Mức | Khoảng điểm | Lưu `diem_min` / `diem_max` | Điểm giữa (gợi ý, HPself) |
|---|---|---|---|
| 0 | [0; 4) | 0,00 / 4,00 | 2,00 |
| 1 | [4; 5,5) | 4,00 / 5,50 | 4,75 |
| 2 | [5,5; 7) | 5,50 / 7,00 | 6,25 |
| 3 | [7; 8,5) | 7,00 / 8,50 | 7,75 |
| 4 | [8,5; 10] | 8,50 / 10,00 | 9,25 |

Quy ước so khớp: `diem_min ≤ điểm < diem_max`, riêng mức 4 là `≤ 10`. (Quy ước này phải dùng **cùng
một hàm** cho cả kiểm CBR-10 lẫn quy đổi mức — xem skill `tinh-diem-clo`.)

## 7. Thuật toán tính điểm (UC10) — tóm tắt

Chi tiết + ví dụ tính tay: skill `.claude/skills/tinh-diem-clo/SKILL.md`.

1. **Hợp nhất trong nhóm**: với mỗi chặng k, CLO i: `D̄ik` = TB điểm các phiếu `DA_NOP` nhóm ĐVHD
   (bỏ thành viên vắng mặt), `Ḡik` tương tự nhóm GVHD.
2. **Áp tỷ lệ đồng chấm**: `S_ik = r_dvhd_i·D̄ik + r_gvhd_i·Ḡik` (tỷ lệ /100). Nhóm có tỷ lệ > 0 mà
   không có phiếu ⇒ `THIEU_PHIEU_DVHD` / `THIEU_PHIEU_GVHD`.
3. **Tổng hợp chặng có chuẩn hóa**: `CLO_i = Σk w_k·S_ik / Σk w_k` chỉ trên các chặng **có đánh giá CLO i**.
   CLO7 chỉ có ở chặng 2 ⇒ `CLO7 = S_7,2` (không phải 0,7·S). CLO không có ở chặng nào ⇒ `CLO_CHUA_DUOC_DANH_GIA`.
4. **Điểm học phần**: `HP = Σ α_i·CLO_i / 100 + điểm_thưởng`, chặn trần 10,0, làm tròn 0,1.
5. **Quy đổi mức** (bảng mục 6) cho từng CLO và cho HP.
6. **Xét công nhận** (Đ15 k3) — Đạt khi **cả bốn**: (a) tham gia đủ 2 chặng; (b) CLO1 **và** CLO2 ≥ ngưỡng
   (Mức 1 CHUAN / Mức 2 CLC_STEM); (c) HP ≥ Mức 1; (d) đủ minh chứng bắt buộc. Không đạt ⇒ luôn trả
   **danh sách lý do**.
7. **Nhóm năng lực** (TTTN-07 mục IV): Kiến thức = TB(CLO1, CLO2); Kỹ năng = TB(CLO3, CLO5, CLO6);
   Thái độ = TB(CLO4, CLO7).

Phụ: **cờ lệch điểm** khi |S_ĐVHD − S_GVHD| > 2,0 ở cùng CLO, cùng chặng (Đ20 k3) — chỉ cảnh báo cho giáo vụ.

## 8. Minh chứng bắt buộc theo hình thức thực tập (Điều 4)

| Hình thức | Minh chứng bắt buộc |
|---|---|
| `DOANH_NGHIEP` | Phiếu đăng ký TTTN-01 có xác nhận ĐVHD · Nhật ký thực tập · Kế hoạch học tập · Báo cáo thực tập · Phiếu phản hồi ĐVHD (08a) · Phiếu phản hồi SV (08b) |
| `NGHIEN_CUU` | Đề cương nghiên cứu · Nhật ký nghiên cứu · Sản phẩm nghiên cứu · Phiếu đánh giá của GVHD |
| `KHOI_NGHIEP` | Kế hoạch kinh doanh · Nhật ký nhóm · Báo cáo kết quả · Xác nhận của cố vấn |
| `CONG_DONG` | Kế hoạch hoạt động · Nhật ký, ảnh/video minh chứng · Thư cảm ơn từ ĐVHD · Nhận xét, đánh giá của GVHD |
| `NOI_BO` | Quyết định tiếp nhận · Báo cáo công việc · Xác nhận của ĐVHD · Nhận xét, đánh giá của GVHD |
| `QUOC_TE` | Hợp đồng trao đổi / Biên bản thỏa thuận · Giấy chứng nhận hoàn thành · Báo cáo kết quả song ngữ · Nhận xét, đánh giá của GVHD. **Điều kiện: ≥ 6 tuần** (Đ4 k6) |

**Lưu ý thiết kế**: nhiều loại minh chứng **do hệ thống tự sinh** (kế hoạch đã khóa, nhật ký, báo cáo đã
xác nhận, phiếu 08a/08b, phiếu đăng ký đã được ĐVHD xác nhận). Hàm đối chiếu (`/evidences/checklist`)
phải coi các bản ghi đó là "đã có", không bắt SV tải lại. Đề xuất: `loai_minh_chung` dùng **mã cố định**
(ví dụ `KE_HOACH_HOC_TAP`, `NHAT_KY`, `BAO_CAO_THUC_TAP`, `PHAN_HOI_08A`, `PHAN_HOI_08B`, `PHIEU_DANG_KY`)
và mỗi mã có *nguồn*: `UPLOAD` hoặc một bảng hệ thống. Danh sách mã chốt trong seed `loai_minh_chung_bat_buoc`.

## 9. Các UC — điểm mấu chốt khi code

| UC | Người | Luồng chính | Bẫy cần nhớ |
|---|---|---|---|
| UC01 Tài khoản | A | Tạo user + hồ sơ mở rộng **một giao dịch**, mật khẩu ban đầu BCrypt, trả mật khẩu cho giáo vụ | Lỗi ghi hồ sơ ⇒ rollback cả user. Không đổi vai trò/mã định danh qua `/auth/profile`. Vô hiệu hóa GV/cán bộ đang hướng dẫn SV đợt đang chạy ⇒ chặn |
| UC02 ĐVHD | B | Tạo (`CHO_DUYET`) → thêm cán bộ (≥3 năm) → duyệt (≥1 cán bộ) ⇒ **tạo tài khoản CAN_BO_DVHD** | Xóa ĐVHD có hồ sơ ⇒ `RESOURCE_IN_USE`, gợi ý "Loại khỏi danh mục". SV được đề xuất ĐVHD mới (`CHO_DUYET`) |
| UC03 Đợt | A | Tạo đợt ⇒ sinh 2 chặng (mốc chặng 1 = đầu tuần 4, chặng 2 = ngày sau kết thúc), nhân bản 7 CLO + 35 mức + 13 câu | Sửa trọng số khi đã có phiếu nộp ⇒ chặn. Chỉ sửa mô tả rubric, không thêm/bớt mức. Gia hạn ⇒ tính lại mốc chặng 2 + thông báo |
| UC04 Đăng ký | B | NHAP → gửi (CBR-01, CBR-03, quốc tế ≥6 tuần) → ĐVHD xác nhận (+đếm) → GVHD duyệt ⇒ DANG_THUC_TAP + khung kế hoạch + N dòng tiến độ | GVHD từ chối phải **giảm bộ đếm** cán bộ. Danh sách cán bộ chỉ hiện người còn hạn mức |
| UC05 Phân công | B | Phân công nhiều SV cho một GV **trong một giao dịch** | Vượt hạn mức ⇒ **hủy toàn bộ**, trả số còn nhận được. Đổi GV khi GV cũ đã nộp phiếu ⇒ chặn |
| UC06 Kế hoạch | B | N dòng tuần + 1 dòng Tổng kết; đủ 3 nội dung/dòng; hạn **5 ngày làm việc** từ ngày bắt đầu | Quá hạn vẫn cho nộp, gắn `nop_muon`. Đủ 2 xác nhận ⇒ khóa + ghi nhận minh chứng |
| UC07 Nhật ký/tiến độ/minh chứng | B | 1 nhật ký/ngày, sửa trong 7 ngày; tiến độ tuần 0–100%, cán bộ xác nhận ⇒ khóa dòng | Yêu cầu bổ sung ⇒ dòng về chờ + thông báo. Xóa minh chứng khi đã chốt điểm ⇒ `RESOURCE_LOCKED`. GV nhắc SV >5 ngày không ghi |
| UC08 Chặng 1 | A | Mỗi bên 1 phiếu 6 câu; chọn mức → điểm trong khoảng → nộp ⇒ khóa | **Hai bên không thấy điểm của nhau trước khi cả hai nộp — chặn ở service**. Nhận xét chung bắt buộc |
| UC09 Tổ + chặng 2 | A | Lập tổ (kiểm 3 điều kiện) → mở chặng 2 khi báo cáo đã nộp → mỗi thành viên chấm 7 CLO | ĐVHD gửi CLO7 ⇒ service **bỏ qua + ghi nhật ký**. Vắng mặt ⇒ loại khỏi TB; nhóm ĐVHD trống ⇒ `THIEU_PHIEU_DVHD` |
| UC10 Tính điểm | A | Tự chạy khi đủ phiếu → `DA_TINH` → GVHD rà + đề xuất thưởng → ADMIN xác nhận → công bố ⇒ hồ sơ HOAN_THANH/KHONG_HOAN_THANH | Lưu kèm phiên bản trọng số. Mở lại phiếu ⇒ về `CHUA_TINH` + tính lại + nhật ký HP trước/sau |
| UC11 Báo cáo | B | pdf/docx ≤20 MB, **mỗi lần nộp là phiên bản mới**, ĐVHD rồi GVHD xác nhận ⇒ CHO_DANH_GIA | Nộp muộn: vẫn nhận, gắn nhãn + số ngày trễ. Đã có xác nhận ⇒ chỉ GVHD mở lại mới thay tệp |
| UC12 Phản hồi | B | 08a: 6 tiêu chí 0–4; 08b: 6 mục hài lòng 1–5 + tự đánh giá 7 CLO + 4 câu tự luận | **SV chỉ xem điểm chính thức sau khi gửi 08b**. HPself dùng cùng công thức HP với điểm giữa khoảng. Chỉ số tự nhận thức = TB |mức tự đánh giá − mức chính thức| trên 7 CLO, tính sau khi công bố |
| UC13 Tra cứu/thống kê | A | SV xem 7 CLO + HP + 4 điều kiện, **không thấy điểm từng người chấm**; ADMIN xem RP-01…RP-06, mục tiêu ≥ 90% đạt (Đ24 k2) | Thống kê phản hồi 08b không lộ danh tính |

Báo cáo: RP-01 bảng kết quả toàn đợt · RP-02 tỷ lệ đạt theo CLO · RP-03 tiến độ chấm · RP-04 tình trạng
minh chứng · RP-05 chỉ số tự nhận thức · RP-06 thống kê phản hồi 08b.

Màn hình (đã nhắc trong đặc tả): SCR-03 tài khoản · SCR-06 hồ sơ cá nhân · SCR-07/08 ĐVHD + cán bộ ·
SCR-09/10 đợt + CLO · SCR-11 đăng ký · SCR-12 duyệt hồ sơ · SCR-13 phân công · SCR-14 kế hoạch ·
SCR-15 nhật ký · SCR-16 tiến độ · SCR-17 minh chứng · SCR-18 chấm chặng 1 · SCR-19 Tổ đánh giá ·
SCR-20 chấm chặng 2 · SCR-21 TTTN-07 · SCR-22 báo cáo · SCR-23 phản hồi · SCR-24 kết quả SV · SCR-25 thống kê.

Thông báo trong ứng dụng: mã `NT-01…NT-15` (bảng `thong_bao.ma_su_kien`). Tài liệu gốc **chưa liệt kê**
nội dung 15 mã — danh sách đề xuất (chốt lại khi code `ThongBaoService`):
NT-01 hồ sơ chờ ĐVHD xác nhận · NT-02 ĐVHD từ chối · NT-03 cần phân công GVHD · NT-04 kết quả phân công ·
NT-05 GVHD từ chối · NT-06 hồ sơ được duyệt · NT-07 kế hoạch chờ xác nhận · NT-08 yêu cầu bổ sung tiến độ ·
NT-09 nhắc ghi nhật ký · NT-10 chặng 1 mở · NT-11 thành lập Tổ đánh giá · NT-12 chặng 2 mở ·
NT-13 phiếu bị mở lại · NT-14 kết quả công bố · NT-15 gia hạn đợt / đổi mốc.

## 10. Điểm cần xác nhận với GVHD (đã chọn mặc định để code không bị chặn)

| # | Vấn đề | Mặc định đang dùng |
|---|---|---|
| 10.1 | Quy đổi **mức đạt** dùng điểm đã làm tròn 0,1 hay điểm đầy đủ? (3,96 → 4,0 là Mức 1 hay Mức 0) | Dùng **điểm đã làm tròn** — đó là điểm SV và hội đồng nhìn thấy |
| 10.2 | HP tính từ CLO đầy đủ hay CLO đã làm tròn? (có thể lệch 0,1 so với cộng tay trên TTTN-07) | Từ **CLO đầy đủ** (đúng câu "chỉ làm tròn ở bước cuối" trong báo cáo phân tích) |
| 10.3 | Nhóm năng lực tính TB cộng hay TB có trọng số α? | **TB cộng** (TTTN-07 ghi "điểm trung bình nhóm") |
| 10.4 | Điều kiện (c) HP ≥ Mức 1 có nâng lên Mức 2 cho CLC_STEM không? | **Không** — Đ15 k3c chỉ ghi Mức 1; chỉ (b) phân biệt chương trình |
| 10.5 | Đ10 k3a đòi **2 giảng viên** (GVHD + 1 GV khác) + ≥1 ĐVHD; CBR-14 chỉ ghi "có GVHD" | Kiểm theo **Quy định**: nhóm GVHD ≥ 2 người, có GVHD của **từng** SV trong tổ, nhóm ĐVHD ≥ 1 người đã hướng dẫn SV đó |
| 10.6 | Nguồn để "sao chép 7 CLO, 35 mức, 13 câu" khi tạo đợt (bảng `chuan_dau_ra.dot_id` NOT NULL) | Seed một **đợt mẫu** `ma_dot = 'MAU-QD207'`, ẩn khỏi danh sách; tạo đợt mới = nhân bản từ đợt mẫu |
| 10.7 | Trạng thái hồ sơ `TU_CHOI` dùng khi nào? (UC04 trả về NHAP) | Từ chối ⇒ **NHAP + lý do** theo UC04; giữ enum `TU_CHOI` nhưng chưa dùng |
| 10.8 | "5 ngày làm việc" có trừ ngày lễ? | Chỉ trừ **thứ 7, chủ nhật** |
| 10.9 | `phien_ban_trong_so` VARCHAR(50) lưu gì? | `"{maDot}@{yyyyMMddHHmm}"` của lần sửa cấu hình cuối; cấu hình khóa sau khi có phiếu nộp nên vậy là đủ truy vết |
| 10.10 | Điểm thưởng: Đ18 k4 đòi "hai bên đánh giá mức 4 + báo cáo cải tiến được chấp nhận" | Hệ thống chỉ chặn > 0,5 và trần 10; điều kiện còn lại do GVHD đề xuất, ADMIN duyệt (ghi nhật ký) |
| 10.11 | Điểm từng chặng (cột 1–6 TTTN-07) không có cột lưu trong `ket_qua_hoc_phan` | **Tính lại khi đọc** từ `diem_clo_chi_tiet` bằng cùng ScoringService |

## 11. Ngoài phạm vi (không code)

QA cấp Trường (CAPA, PDCA, RACI) · khiếu nại, xử lý vi phạm · bảo hiểm, an toàn lao động, công tác phí ·
ghi hình (chỉ lưu đường dẫn) · job board · SSO, đồng bộ CSDL đào tạo · app di động native · gửi email/SMS.
