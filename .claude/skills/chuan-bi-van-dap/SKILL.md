---
name: chuan-bi-van-dap
description: Chuẩn bị bảo vệ đề tài QLTT trước hội đồng — các câu hỏi chắc chắn bị hỏi (vì sao chuẩn hóa CLO7, vì sao trung bình trong nhóm trước, vì sao BigDecimal, phân quyền hai lớp, hai bên không thấy điểm nhau), cách giảng thuật toán tính điểm bằng ví dụ số, kịch bản demo một vòng đời, phân vai trình bày cho hai người, checklist trước ngày bảo vệ. Nạp skill này khi được hỏi về vấn đáp, bảo vệ, demo, slide, khi cần giải thích code cho người chưa biết, hoặc khi viết phần kết quả của báo cáo.
---

# Chuẩn bị vấn đáp QLTT

## Phân vai — mỗi người trả lời phần mình làm

| A (Bảo) | B (Văn) |
|---|---|
| Kiến trúc 3 tầng, JWT, phân quyền 2 lớp, 15 mã lỗi | Luồng đăng ký → duyệt → phân công, máy trạng thái hồ sơ |
| Cấu hình đợt nhân bản, vì sao không viết cứng trọng số | Hạn mức cán bộ/GV, giao dịch phân công hàng loạt |
| Đồng chấm, ẩn điểm bên kia, Tổ đánh giá | Kế hoạch, nhật ký, tiến độ, minh chứng tự đối chiếu |
| **Thuật toán tính điểm + unit test** | Báo cáo nhiều phiên bản, phiếu 08a/08b, HPself |
| Thống kê CLO, mục tiêu 90% | Ma trận phân quyền đã kiểm bằng Postman |

Hội đồng có thể hỏi chéo — mỗi người phải nói được **một câu** về mọi UC và **đi qua được ví dụ tính điểm**.

## Câu hỏi chắc chắn gặp

| Câu hỏi | Trả lời ngắn |
|---|---|
| Điểm mới của đề tài so với phần mềm có sẵn? | Không giải pháp khảo sát nào có đồng chấm **tỷ lệ riêng từng CLO** + trung bình trong nhóm + chuẩn hóa chặng theo đúng QĐ 207. Đề tài mô hình hóa đúng chuỗi TTTN-01→08b và biến ràng buộc định lượng (hạn mức, thành phần tổ, đủ minh chứng, đủ phiếu) thành ràng buộc phần mềm |
| Tính CLO7 thế nào khi chặng 1 không có CLO7? | Chuẩn hóa trọng số về các chặng có đánh giá: CLO7 = 0,7·S / 0,7 = S. Không chuẩn hóa thì CLO7 mất 30% — ví dụ của em HP từ 7,7 tụt còn 7,4 |
| Vì sao lấy trung bình trong nhóm trước rồi mới áp tỷ lệ? | Đ10 k3c. Nếu trung bình cả tổ, tổ 2 GV + 1 ĐVHD làm tiếng nói ĐVHD chỉ còn 1/3 thay vì đúng tỷ lệ quy định — tỷ lệ đồng chấm sẽ phụ thuộc số người trong tổ |
| Vì sao dùng BigDecimal? | `double` biểu diễn nhị phân: 8,155 có thể thành 8,15499… và làm tròn ra 8,1 thay vì 8,2. Điểm là dữ liệu pháp lý, sai 0,1 có thể đổi mức đạt |
| Làm tròn lúc nào? | Chỉ ở bước cuối (Đ14 k4a). Có test chứng minh làm tròn sớm cho HP 7,0 thay vì 7,1 |
| Trọng số đổi thì sao? | Cấu hình lưu DB, nhân bản riêng từng đợt; kết quả lưu kèm phiên bản trọng số ⇒ bảng điểm khóa trước không đổi khi Khoa chỉnh cho đợt sau (Quy định rà soát 2 năm/lần) |
| Sao đảm bảo hai bên chấm độc lập? | Chặn ở **service**: API không trả phiếu bên kia khi một trong hai chưa nộp. Thử gọi thẳng API cũng bị 403 |
| SV gõ id hồ sơ người khác thì sao? | Lớp 2 kiểm sở hữu ở service — trả 403, không lộ thông tin. Có Postman test cho từng endpoint |
| Phân công 5 SV mà SV thứ 4 vượt hạn mức? | Hủy cả lô trong một giao dịch, không phân công một phần — phân công nửa vời rất khó lần ra |
| Sửa điểm sau khi nộp? | Chỉ giáo vụ mở lại, lý do bắt buộc, nhật ký lưu điểm cũ; nộp lại thì kết quả tự tính lại và lưu HP trước/sau (Đ14 k4c) |
| Thiếu minh chứng thì sao? | Không chốt điểm (CBR-16), kết luận Không đạt với lý do (d) liệt kê loại còn thiếu theo hình thức thực tập |
| Em kiểm thử thế nào? | Skill `kiem-thu-java` mục cuối |

## Giảng thuật toán — luôn bằng ví dụ số

Dùng đúng ví dụ chuẩn skill `tinh-diem-clo` mục 5, in sẵn một trang A4: bảng chặng 1 → bảng chặng 2 → bảng
tổng hợp → HP. Đi theo **một CLO (CLO1)** từ đầu đến cuối, rồi **CLO7** để nói chuẩn hóa, rồi chỉ màn SCR-21
cho thấy hệ thống ra đúng các con số đó.

## Kịch bản demo (≈ 12 phút, Proposal 11.7)

1. ADMIN: tạo đợt → hệ thống sinh 2 chặng, 7 CLO, rubric (mở SCR-10 cho thấy α và tỷ lệ)
2. ADMIN: duyệt một ĐVHD → tài khoản cán bộ được tạo
3. SV: đăng ký hình thức Doanh nghiệp, chọn cán bộ (thử chọn cán bộ đã đủ 5 ⇒ `QUOTA_EXCEEDED`)
4. Cán bộ: xác nhận tiếp nhận
5. ADMIN: phân công GVHD (thử vượt hạn mức ⇒ hủy cả lô)
6. GV: duyệt ⇒ hồ sơ Đang thực tập, có khung kế hoạch + bảng tiến độ
7. SV: ghi nhật ký, tải minh chứng, xem bảng Đủ/Thiếu
8. *(dùng dữ liệu seed để nhảy thời gian)* Chặng 1: cán bộ nộp phiếu — đăng nhập GV cho thấy **không xem được** điểm cán bộ — GV nộp ⇒ hai bên thấy nhau
9. ADMIN: lập Tổ đánh giá (thử 4 người ⇒ bị chặn vì số chẵn)
10. Thành viên tổ chấm chặng 2 — cán bộ: ô CLO7 bị khóa
11. Hệ thống tự tính ⇒ SCR-21 khớp tờ tính tay ⇒ GV rà, đề xuất thưởng ⇒ ADMIN xác nhận, công bố
12. SV: gửi 08b ⇒ xem kết quả 7 CLO + 4 điều kiện; ADMIN: thống kê tỷ lệ đạt CLO

Chuẩn bị **dữ liệu seed sẵn ở từng mốc** để nếu bước nào lỗi thì nhảy qua được.

## Chỗ hội đồng hay tấn công

- Mở `ScoringService` hỏi một dòng bất kỳ → comment phải có điều khoản + lý do.
- "Sao không dùng `double` cho nhanh?" / "Sao không tính trên SQL?" (logic có nhánh, cần unit test, cần giải thích được).
- "Hai ngưỡng đạt khác nhau ở đâu trong code?" → chỉ đúng chỗ đọc `chuong_trinh_dao_tao`.
- "Tại sao tổ phải lẻ?" (để biểu quyết, Đ10 k3a) — và hỏi ngược "có kiểm sau khi có người vắng không?".
- Gõ thẳng URL / Postman với token vai trò khác.
- "Các điểm còn mơ hồ trong Quy định em xử lý thế nào?" → `docs/01-nghiep-vu.md` mục 10: đã nhận diện, chọn mặc định có lý do, cấu hình được.

## Checklist trước ngày bảo vệ

- [ ] Tag `t6-ban-demo` chạy được trên **máy sẽ dùng để demo**, đã tắt mạng thử
- [ ] `mvnw test` xanh, chụp màn hình
- [ ] Postman runner xanh, xuất báo cáo
- [ ] Seed demo nạp lại sạch trong 1 lệnh
- [ ] Tờ tính tay ví dụ chuẩn in sẵn 3 bản
- [ ] Mỗi người tự giảng lại thuật toán không nhìn tài liệu
- [ ] Danh sách điểm cần xác nhận + câu trả lời
