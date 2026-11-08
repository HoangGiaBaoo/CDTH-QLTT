# Quy tắc kiểm thử — luôn áp dụng

Không chạy theo % phủ code. Mục tiêu: **chứng minh được bộ máy tính điểm đúng Quy định** và **ma trận
phân quyền không thủng** — hai thứ hội đồng chắc chắn hỏi.

## Bắt buộc 1 — `ScoringServiceTest` (người A)

JUnit 5 thuần, **không Spring context, không MySQL**, chạy dưới 1 giây. Dữ liệu cứng tính tay, kết quả
mong đợi ghi trong comment. Tối thiểu 12 ca (Proposal 11.6 + báo cáo phân tích kết luận):

| # | Tên test | Kiểm |
|---|---|---|
| 1 | `tinhDiemKhopViDuTinhTay` | Ví dụ chuẩn trong skill `tinh-diem-clo`: CLO1 = 8,2 … HP = 7,7 |
| 2 | `clo7ChiCoChang2DuocChuanHoaTrongSo` | CLO7 = S₇,₂ chứ không phải 0,7 × S₇,₂ (ví dụ chuẩn: không chuẩn hóa ⇒ HP 7,4 — sai) |
| 3 | `trungBinhTrongNhomTruocKhiApTyLe` | Tổ có 2 GV + 1 ĐVHD: lấy TB nhóm GV trước (CBR-15), không TB cả 3 người |
| 4 | `thanhVienVangMatBiLoaiKhoiTrungBinh` | Phiếu của người vắng mặt không vào phép tính |
| 5 | `thieuPhieuDvhdNemLoi` | Chặng 1 không có phiếu ĐVHD ⇒ `THIEU_PHIEU_DVHD` |
| 6 | `vangMatLamTrongNhomDvhdNemLoi` | Thành viên ĐVHD duy nhất vắng ⇒ `THIEU_PHIEU_DVHD` |
| 7 | `cloKhongDuocDanhGiaONaoNemLoi` | Bỏ câu hỏi CLO7 ở chặng 2 ⇒ `CLO_CHUA_DUOC_DANH_GIA` |
| 8 | `diemThuongBiChanTran10` | HP 9,8 + thưởng 0,5 ⇒ 10,0 |
| 9 | `nguongDatKhacNhauChoChuanVaClcStem` | Cùng CLO2 = 5,0: CHUAN đạt (Mức 1), CLC_STEM không đạt (cần Mức 2) |
| 10 | `khongDatTraDuLyDo` | Thiếu minh chứng + CLO1 Mức 0 ⇒ `KHONG_DAT` với **đủ 2 lý do** |
| 11 | `xacDinhMucTaiBienKhoang` | 3,99→0 · 4,0→1 · 5,5→2 · 7,0→3 · 8,5→4 · 10→4 |
| 12 | `lamTronChiOBuocCuoi` | Ca mà làm tròn CLO trước rồi mới tính HP cho ra kết quả khác (xem skill) |

Thêm khi có: `canhBaoLechDiemTren2`, `nhomNangLucTinhDung`, `hpSelfDungDiemGiuaKhoang`, `chiSoTuNhanThucKhongAm`.

## Bắt buộc 2 — Ma trận phân quyền (người B chủ trì, tuần 5–6)

Postman collection chia thư mục theo 4 vai trò. Mỗi endpoint ít nhất: **1 ca đúng vai trò → 2xx** và
**1 ca sai vai trò → 403**; endpoint có "chỉ xem của mình" thêm **1 ca đúng vai trò nhưng dữ liệu người khác → 403**.
Xuất kết quả chạy (Collection Runner) làm minh chứng kiểm thử.

## Nên có — test nhỏ cho quy tắc dễ sai

Chỉ viết khi quy tắc có tính toán hoặc biên:
- `NgayLamViecUtils` — hạn 5 ngày làm việc bắt đầu từ thứ 5 / thứ 6 (B)
- Đếm hạn mức cán bộ ĐVHD khi xác nhận rồi GVHD từ chối (bộ đếm phải về như cũ) (B)
- Kiểm thành phần Tổ đánh giá: 3 người chẵn/lẻ, thiếu ĐVHD, chỉ 1 GV (A)
- Kiểm định dạng / dung lượng tệp (B)

Vừa sửa một lỗi khó ⇒ viết test chặn lỗi đó tái phát.

Không viết test cho CRUD đơn thuần, không dựng Testcontainers.

## Lệnh chạy

```
.\mvnw.cmd test                                   # PowerShell
./mvnw test -Dtest=ScoringServiceTest             # Git Bash, một lớp
```
