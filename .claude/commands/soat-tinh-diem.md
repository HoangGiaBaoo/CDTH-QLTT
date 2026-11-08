---
description: Soát bộ máy tính điểm (ScoringService, RubricUtils, KetQuaService, HPself) — chuẩn hóa CLO7, trung bình trong nhóm, làm tròn cuối, điều kiện công nhận, chạy ScoringServiceTest
---

# Soát tính điểm

Dùng agent `chuyen-gia-tinh-diem` để soát toàn bộ phần tính điểm hiện có:
`service/scoring/`, `RubricUtils`, `KetQuaService`, phần tính điểm chặng / cờ lệch trong `PhieuDanhGiaService`,
HPself + chỉ số tự nhận thức trong `PhanHoiService`, và `ScoringServiceTest`.

Yêu cầu agent **đi qua ví dụ chuẩn** (skill `tinh-diem-clo` mục 5) bằng chính code hiện tại và chạy test thật.

Trình bày: kết luận → lỗi mức 1/2/3 → bảng đi qua ví dụ → đoạn giảng lại cho người bảo vệ.
Chạy lệnh này **sau mỗi lần sửa** phần tính điểm.
