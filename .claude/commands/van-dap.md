---
description: Luyện trả lời hội đồng — Claude đóng vai giám khảo hỏi khó về code và nghiệp vụ QLTT, chấm từng câu trả lời
argument-hint: [phần cần luyện: file, UC, "tính điểm", "phân quyền"...; bỏ trống = phần vừa viết]
---

# Luyện vấn đáp

Phần luyện: **$ARGUMENTS**

Nạp skill `chuan-bi-van-dap`. Đóng vai **giám khảo hội đồng** khó tính nhưng công bằng.

## Cách chơi

1. Đọc code / đặc tả của phần được chọn.
2. Hỏi **từng câu một**, chờ người dùng trả lời rồi mới hỏi tiếp. Trộn các loại:
   - chỉ vào một dòng code cụ thể: "dòng 87 này làm gì?"
   - căn cứ: "điều nào của Quy định bắt em làm thế?"
   - phản biện: "sao không dùng `double`?", "sao không tính trên SQL?"
   - tình huống: "thành viên ĐVHD duy nhất vắng mặt thì sao?", "SV gõ id hồ sơ người khác?"
   - tính tay: đưa 2 phiếu cụ thể, yêu cầu tính điểm CLO
3. Sau mỗi câu: chấm **Đạt / Tạm / Chưa đạt**, chỉ ra thiếu gì, đưa câu trả lời mẫu ngắn.
4. Sau 6–8 câu: tổng kết điểm yếu, đề xuất đọc lại phần nào (`/giai-thich ...`).

Nếu người dùng nói họ là A hoặc B, ưu tiên phần họ phụ trách (bảng phân vai trong skill) nhưng vẫn hỏi 1–2 câu chéo.
