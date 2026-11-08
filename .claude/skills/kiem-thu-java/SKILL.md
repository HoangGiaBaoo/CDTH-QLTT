---
name: kiem-thu-java
description: Cách viết test cho QLTT — JUnit 5 thuần cho ScoringService và RubricUtils với dữ liệu tính tay (12 ca bắt buộc), test nhỏ cho quy tắc có biên (ngày làm việc, hạn mức, thành phần Tổ đánh giá, tệp), Postman collection kiểm ma trận phân quyền bốn vai trò. Nạp skill này khi viết test, khi sửa lỗi cần test chặn tái phát, khi chuẩn bị bảng kết quả kiểm thử, hoặc khi cần trả lời câu hỏi "em kiểm thử thế nào".
---

# Kiểm thử QLTT

Danh sách ca bắt buộc: `.claude/rules/kiem-thu.md`. Ví dụ tính tay: skill `tinh-diem-clo` mục 5.

## Khuôn test tính điểm — JUnit thuần, không Spring

```java
class ScoringServiceTest {

    private final ScoringService scoring = new ScoringService();   // khong @SpringBootTest: chay < 1 giay, khong can MySQL

    @Test
    void tinhDiemKhopViDuTinhTay() {
        // Vi du chuan skill tinh-diem-clo muc 5. Tinh tay:
        // CLO1 = 0,3*7,70 + 0,7*8,35 = 8,155 -> 8,2 ; CLO7 = S72 = 7,5 (chuan hoa)
        // HP = 7,65475 -> 7,7 (Muc 3), ket luan DAT
        DauVaoTinhDiem dauVao = DuLieuMau.viDuChuan();
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao);

        assertThat(kq.diemClo().get("CLO1")).isEqualByComparingTo("8.2");
        assertThat(kq.diemClo().get("CLO7")).isEqualByComparingTo("7.5");
        assertThat(kq.diemHp()).isEqualByComparingTo("7.7");
        assertThat(kq.mucHp()).isEqualTo(3);
        assertThat(kq.ketLuan()).isEqualTo(KetLuan.DAT);
    }

    @Test
    void thieuPhieuDvhdNemLoi() {
        DauVaoTinhDiem dauVao = DuLieuMau.viDuChuanBoPhieu(1, NhomNguoiCham.DVHD);
        assertThatThrownBy(() -> scoring.tinhDiem(dauVao))
            .isInstanceOf(BusinessException.class)
            .extracting("code").isEqualTo(ErrorCode.THIEU_PHIEU_DVHD);
    }
}
```

- `DuLieuMau` (trong `src/test`) dựng cấu hình mặc định 7 CLO + 2 chặng + 5 mức và các phiếu bằng builder ngắn — mỗi test chỉ sửa đúng chỗ nó cần.
- So `BigDecimal` bằng `isEqualByComparingTo("7.7")` — không `isEqualTo` (7.7 ≠ 7.70).
- Mỗi test có comment **phép tính tay** ra kết quả mong đợi. Hội đồng hỏi "sao biết 7,7 là đúng" ⇒ chỉ vào comment.
- Tên test tiếng Việt không dấu, mô tả hành vi: `clo7ChiCoChang2DuocChuanHoaTrongSo`.
- `@ParameterizedTest @CsvSource` cho bảng biên: `"3.99,0", "4.0,1", "5.49,1", "5.5,2", "8.5,4", "10,4"`.

## Test nhỏ cho quy tắc có biên

| Lớp | Ca nên có |
|---|---|
| `NgayLamViecUtils.congNgayLamViec(start, 5)` | bắt đầu thứ 2 → thứ 2 tuần sau · bắt đầu thứ 5 → thứ 5 tuần sau · bắt đầu thứ 7 |
| Kiểm thành phần Tổ | 3 người đủ · 4 người (chẵn) · 3 người không có ĐVHD · 3 người chỉ 1 GV · có người vắng làm số người thành chẵn |
| Hạn mức cán bộ | xác nhận 5 hồ sơ rồi hồ sơ thứ 6 bị chặn · GVHD từ chối 1 hồ sơ thì hồ sơ thứ 6 gửi được |
| `FileStorageService` | 20 MB đúng biên · 20 MB + 1 byte · `.exe` đổi tên thành `.pdf` (content-type sai) |

Logic ở service có repository: tách phần tính toán ra hàm/lớp thuần để test, đừng dựng cả Spring context chỉ để test một phép so sánh.

## Ma trận phân quyền — Postman

```
QLTT.postman_collection.json
├── 00 Đăng nhập (lưu token từng vai trò vào biến collection: tokenAdmin, tokenGv, tokenCb, tokenSv, tokenSv2)
├── 01 ADMIN / 02 GIANG_VIEN / 03 CAN_BO_DVHD / 04 SINH_VIEN
└── 05 Sở hữu dữ liệu (SV2 đọc hồ sơ SV1, GV khác đọc phiếu, cán bộ xem phiếu bên kia trước khi nộp...)
```

Mỗi request có tab *Tests*: `pm.test("403", () => pm.response.to.have.status(403)); pm.expect(pm.response.json().code).to.eql("ACCESS_DENIED");`.
Chạy Collection Runner, xuất kết quả → chụp vào báo cáo kiểm thử. Dữ liệu chạy dựa trên seed demo, không phụ thuộc thứ tự tay.

## Trả lời "em kiểm thử thế nào"

1. Bộ máy tính điểm: N unit test, dữ liệu tính tay, phủ đủ trường hợp biên Proposal 11.6 — chạy `mvnw test` ngay trước hội đồng.
2. Phân quyền: Postman M request, mỗi endpoint thử đúng vai trò / sai vai trò / sai chủ sở hữu.
3. Luồng đầu–cuối: kịch bản demo một vòng đời trên dữ liệu seed.
