---
description: Soát code vừa viết (hoặc PR của người kia) theo quy tắc riêng của QLTT — BigDecimal, cấu hình không viết cứng, phân quyền hai lớp, giao dịch, nhật ký, mã lỗi
argument-hint: [file hoặc nhánh; bỏ trống = git diff main...HEAD]
---

# Soát code

Phạm vi: **$ARGUMENTS** (bỏ trống = `git diff main...HEAD` cộng thay đổi chưa commit).

Dùng agent `nguoi-soat-code` với phạm vi trên. Nếu thay đổi đụng `service/scoring/`, `KetQuaService`,
`RubricUtils` hoặc phần tính điểm của phiếu — dùng **thêm** agent `chuyen-gia-tinh-diem`.

Trình bày kết quả gộp, mục nghiêm trọng lên đầu. Không tự sửa — hỏi người dùng muốn sửa mục nào.
