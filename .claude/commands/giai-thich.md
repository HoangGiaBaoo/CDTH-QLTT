---
description: Giảng lại code QLTT bằng tiếng Việt như dạy người chưa biết, kèm ví dụ số chạy tay và câu trả lời mẫu cho hội đồng
argument-hint: <tên file, tên hàm, hoặc "phần vừa viết">
---

# Giải thích code bằng tiếng Việt

Đối tượng: **$ARGUMENTS** (bỏ trống = phần code vừa viết trong phiên này).

Người nghe là sinh viên sẽ bảo vệ trực tiếp: hội đồng mở file, chỉ một dòng và hỏi *"dòng này làm gì, sao
viết thế này, căn cứ điều nào của Quy định"*. Giảng như dạy người mới học Java, dùng từ tiếng Việt khi có.

## Cấu trúc

1. **Phần này để làm gì** — một câu theo nghĩa nghiệp vụ, gắn với UC và biểu mẫu.
   > Sai: "Hàm này duyệt List<PhieuDanhGia> rồi group by nhóm."
   > Đúng: "Hàm này gom các phiếu chấm chặng 2 của Tổ đánh giá thành điểm của phía Trường và phía doanh nghiệp, rồi trộn theo tỷ lệ của từng chuẩn đầu ra — đúng cột (4)(5)(6) của mẫu TTTN-07."
2. **Đầu vào / đầu ra** bằng nghĩa nghiệp vụ ("nhận các phiếu đã nộp của 3 thành viên tổ").
3. **Đi qua từng bước bám một ví dụ số** — phần tính điểm dùng ví dụ chuẩn trong skill `tinh-diem-clo` mục 5; phần khác tự dựng ví dụ nhỏ (2 SV, 1 cán bộ còn 1 chỗ…). Đây là phần quan trọng nhất.
4. **Vì sao viết thế này** — 2–3 quyết định: vì sao `@Transactional`, vì sao kiểm sở hữu ở service, vì sao `BigDecimal`, vì sao đọc trọng số từ DB, vì sao làm tròn ở cuối… kèm điều khoản Quy định / mã CBR.
5. **Nếu hội đồng chỉ vào dòng này** — chọn 2–3 dòng dễ bị hỏi nhất, viết sẵn câu trả lời ngắn, tự tin.

Kết thúc: *"Chỗ nào chưa rõ thì nói, tôi giảng lại chỗ đó kỹ hơn."*

Nếu đoạn code khó giải thích quá — nói thẳng nên viết lại cho đơn giản, kèm đề xuất. Code không giải thích được là code cần sửa.
