---
name: nghiep-vu-qltt
description: Quy tắc nghiệp vụ của hệ thống Quản lý Thực tập tốt nghiệp (QLTT) HUCE theo Quy định QĐ 207 — bốn vai trò và phân quyền hai lớp, 24 quy tắc CBR, 15 mã lỗi, máy trạng thái hồ sơ/chặng/phiếu/kết quả/ĐVHD/kế hoạch, sáu hình thức thực tập và minh chứng bắt buộc, Tổ đánh giá, các biểu mẫu TTTN-01…08b, 13 use case. Nạp skill này khi làm BẤT KỲ chức năng nghiệp vụ nào (tài khoản, ĐVHD, đợt, đăng ký, phân công, kế hoạch, nhật ký, minh chứng, phiếu chấm, Tổ đánh giá, kết quả, báo cáo, phản hồi, thống kê), khi chuyển trạng thái, khi chọn mã lỗi, hoặc khi đối chiếu code với đặc tả.
---

# Nghiệp vụ QLTT — bản đồ tra nhanh

Tài liệu đầy đủ (đọc phần liên quan **trước khi code**):
- `docs/01-nghiep-vu.md` — CBR, mã lỗi, trạng thái, cấu hình CLO, minh chứng, bảng UC, **điểm cần xác nhận**
- `docs/02-api.md` — 102 endpoint, quyền, người phụ trách
- `docs/03-csdl.md` — 28 bảng, ràng buộc
- Skill `tinh-diem-clo` — thuật toán UC10
- Tài liệu gốc ở `docs/tai-lieu-goc/`: Quy định QĐ 207 (pdf), báo cáo phân tích (docx), proposal (docx), class diagram (pdf)

## Việc đầu tiên khi nhận một UC

1. Mở mục UC tương ứng trong `docs/01-nghiep-vu.md` mục 9 và các endpoint trong `docs/02-api.md`.
2. Liệt kê **mọi nhánh** (3a, 7b…) của UC trong báo cáo phân tích → mỗi nhánh là một `if` + một mã lỗi.
3. Xác định CBR liên quan → mỗi CBR là một dòng kiểm ở service (hoặc ràng buộc DB).
4. Xác định chuyển trạng thái → kiểm "trạng thái hiện tại có cho phép không" **trước** khi kiểm dữ liệu nhập.
5. Xác định ai phải nhận thông báo (NT-xx) và có phải ghi nhật ký hệ thống không.

## Phân quyền

Lớp 1 vai trò (`@PreAuthorize`) + lớp 2 sở hữu (service). Chi tiết `.claude/rules/bao-mat.md`.

| Ai | Thấy hồ sơ nào |
|---|---|
| ADMIN | tất cả |
| GIANG_VIEN | hồ sơ có `phan_cong_gvhd.giang_vien_id` = mình; chặng 2 thêm hồ sơ thuộc tổ mình là thành viên không vắng |
| CAN_BO_DVHD | hồ sơ có `ho_so_thuc_tap.can_bo_dvhd_id` = mình; chặng 2 thêm hồ sơ thuộc tổ mình |
| SINH_VIEN | hồ sơ có `sinh_vien_id` = mình |

Thứ tự kiểm: **quyền → tồn tại → trạng thái → phiên bản → dữ liệu nhập**.

## Chọn mã lỗi

| Tình huống | Mã |
|---|---|
| Thiếu trường, sai định dạng, ngày kết thúc ≤ bắt đầu, hạn mức GV ngoài 5–10, còn tuần kế hoạch trống, điểm ngoài khoảng mức, thưởng > 0,5 | `VALIDATION_ERROR` |
| Vi phạm Quy định: kinh nghiệm < 3 năm, quốc tế < 6 tuần, tổ chẵn / thiếu ĐVHD, Σα ≠ 100 | `BUSINESS_RULE_VIOLATION` + trích điều khoản |
| Cán bộ đủ 5 SV, GV vượt hạn mức (phân công hàng loạt: hủy cả lô, báo số còn nhận được) | `QUOTA_EXCEEDED` |
| Phiếu đã nộp, kế hoạch đã khóa, dòng tuần đã xác nhận, minh chứng sau chốt điểm, sửa trọng số khi đã có phiếu | `RESOURCE_LOCKED` |
| Xóa ĐVHD đã có hồ sơ | `RESOURCE_IN_USE` |
| SV đã có hồ sơ trong đợt, trùng tên đăng nhập/email/mã | `DUPLICATE_RESOURCE` |
| Thiếu phiếu một bên khi tính điểm | `THIEU_PHIEU_DVHD` / `THIEU_PHIEU_GVHD` |
| CLO không có câu hỏi ở chặng nào | `CLO_CHUA_DUOC_DANH_GIA` |

Một số nhánh **không phải lỗi** mà kết thúc KD/TC kèm cờ: nộp kế hoạch muộn (`nop_muon`), nộp báo cáo
muộn (nhãn + số ngày), lệch điểm > 2,0 (cờ cảnh báo), mới một bên nộp phiếu (chờ).

## Máy trạng thái hồ sơ — chuyển nào, ai bấm, kèm gì

| Từ → Đến | Ai | Điều kiện / tác dụng phụ |
|---|---|---|
| NHAP → CHO_DVHD | SV gửi | CBR-01, ĐVHD `DA_DUYET`, cán bộ còn hạn mức (CBR-03), quốc tế ≥ 6 tuần; NT cho cán bộ |
| CHO_DVHD → CHO_GVHD | Cán bộ xác nhận | **tăng** bộ đếm cán bộ; NT cho giáo vụ phân công |
| CHO_DVHD → NHAP | Cán bộ từ chối | lý do bắt buộc; NT cho SV |
| CHO_GVHD → DANG_THUC_TAP | GVHD (đã được phân công) duyệt | tạo `ke_hoach_hoc_tap` + N+1 `muc_ke_hoach` + N `tien_do_tuan` |
| CHO_GVHD → NHAP | GVHD từ chối | lý do; **giảm** bộ đếm cán bộ |
| DANG_THUC_TAP → CHO_DANH_GIA | hệ thống, khi báo cáo đủ 2 xác nhận | mở điều kiện chặng 2 |
| CHO_DANH_GIA → HOAN_THANH / KHONG_HOAN_THANH | ADMIN công bố | theo `ket_luan`; khóa minh chứng (`da_khoa`) |
| (đang chạy) ↔ GIAN_DOAN | ADMIN | Đ15 k4; đánh giá bù vẫn đủ 2 chặng |

"Bộ đếm" cán bộ / GV: **đếm động bằng truy vấn** (số hồ sơ ở trạng thái đang hiệu lực) an toàn hơn lưu
cột đếm — CSDL thiết kế không có cột đếm. Hồ sơ "hiệu lực" để đếm hạn mức cán bộ: CHO_GVHD trở đi, trừ
NHAP / TU_CHOI; với GV: có bản ghi `phan_cong_gvhd` trong đợt.

## Tổ đánh giá (UC09) — điều kiện thành lập

Với **từng** SV trong tổ (bảng `to_danh_gia_ho_so`), các thành viên **không vắng mặt** phải thỏa:
tổng ≥ 3 và lẻ · có GVHD của SV đó · nhóm GVHD ≥ 2 người (Đ10 k3a — mặc định 10.5) · nhóm ĐVHD ≥ 1 người,
là cán bộ đã hướng dẫn SV đó. Thành viên nhóm GVHD phải có vai trò `GIANG_VIEN`, nhóm DVHD là `CAN_BO_DVHD`.
Trực tuyến ⇒ bắt buộc `ghi_chu_phe_duyet` (Trưởng Khoa đồng ý).

## Mốc thời gian

- Số tuần = từ `ngay_bat_dau` đến `ngay_ket_thuc` (mặc định 8).
- Chặng 1 mở: ngày đầu tuần thứ 4 = `ngay_bat_dau + 21 ngày`.
- Chặng 2 mở: ngày sau `ngay_ket_thuc` **và** báo cáo của SV đã đủ 2 xác nhận (với SV chưa đủ: chặn, liệt kê).
- Kế hoạch học tập: hạn 5 ngày làm việc kể từ `ngay_bat_dau` (bỏ thứ 7, CN).
- Nhật ký: 1 bản ghi/ngày; chỉ sửa bản ghi trong 7 ngày gần nhất; GV nhắc khi > 5 ngày không ghi.
- Gia hạn đợt ⇒ tính lại mốc chặng 2 + NT-15.

## Biểu mẫu ↔ bảng

TTTN-01 → `ho_so_thuc_tap` · TTTN-02 → `ke_hoach_hoc_tap` + `muc_ke_hoach` · TTTN-03 → `tien_do_tuan` (+
`nhat_ky_thuc_tap`) · TTTN-04 / 05 → `phieu_danh_gia` + `diem_clo_chi_tiet` · TTTN-06 → `bao_cao_thuc_tap`
(yêu cầu: ≥ 20 trang A4, Times New Roman 13, giãn 1,5, lề 3-2-2-2; 6 phần bắt buộc tích đủ trước khi nộp) ·
TTTN-07 → `ket_qua_hoc_phan` (+ tính lại điểm chặng khi hiển thị) · TTTN-08a / 08b → `phan_hoi` (`du_lieu_tieu_chi` JSON).

## Ngoài phạm vi — từ chối khéo nếu được yêu cầu

CAPA/PDCA, khiếu nại, bảo hiểm, ghi hình (chỉ lưu link), job board, SSO, app native, email/SMS.
