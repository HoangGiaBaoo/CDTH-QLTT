---
name: tinh-diem-clo
description: Thuật toán tính điểm chuẩn đầu ra (CLO) và điểm học phần TTTN theo Điều 13–15 Quy định QĐ 207 — hợp nhất trong nhóm người chấm, tỷ lệ đồng chấm ĐVHD/GVHD, trọng số chặng 30/70 có chuẩn hóa cho CLO7, làm tròn 0,1, quy đổi mức, bốn điều kiện công nhận, nhóm năng lực, HPself và chỉ số tự nhận thức. Nạp skill này BẤT CỨ KHI NÀO đụng tới ScoringService, package service/scoring, RubricUtils, KetQuaHocPhan, phiếu đánh giá (UC08/UC09), kết quả (UC10), tự đánh giá 08b (UC12), thống kê CLO (UC13), hoặc khi viết/sửa ScoringServiceTest. Đây là phần lõi không được cắt của đồ án.
---

# Tính điểm CLO và điểm học phần

Căn cứ: Điều 10 k3c, 11 k4, 13, 14, 15, 18 k4 của Quy định; UC10 trong báo cáo phân tích; mẫu TTTN-07.
Tóm tắt nghiệp vụ: `docs/01-nghiep-vu.md` mục 6–7, điểm cần xác nhận mục 10.

## 1. Ký hiệu

| Ký hiệu | Nghĩa | Nguồn dữ liệu |
|---|---|---|
| k ∈ {1, 2} | chặng | `chang_danh_gia.thu_tu` |
| w_k | trọng số chặng (0,300 / 0,700) | `chang_danh_gia.trong_so_w` |
| i ∈ 1..7 | CLO | `chuan_dau_ra.ma_clo` |
| α_i | trọng số CLO (%) | `chuan_dau_ra.trong_so_alpha` |
| rD_i, rG_i | tỷ lệ ĐVHD / GVHD (%), rD + rG = 100 | `ty_le_dvhd`, `ty_le_gvhd` |
| x_{p,i} | điểm CLO i trên phiếu p | `diem_clo_chi_tiet.diem` |

Chỉ dùng phiếu `trang_thai = DA_NOP`. Chặng 2 bỏ phiếu của thành viên `vang_mat = true`.
"CLO i được đánh giá ở chặng k" ⇔ tồn tại `cau_hoi_danh_gia` của chặng k trỏ tới CLO i (chặng 1 **không** có CLO7).

## 2. Sáu bước

**Bước 1 — trung bình trong nhóm** (CBR-15, Đ10 k3c):
`D̄_ik = TB{ x_{p,i} : p thuộc nhóm DVHD, chặng k }`, `Ḡ_ik` tương tự nhóm GVHD.
Chặng 1 mỗi nhóm thường chỉ 1 phiếu; chặng 2 nhóm GVHD có ≥ 2 người (GVHD + GV khác).

**Bước 2 — áp tỷ lệ đồng chấm**: `S_ik = (rD_i·D̄_ik + rG_i·Ḡ_ik) / 100`.
- Nhóm có tỷ lệ > 0 nhưng không có phiếu nào ⇒ dừng, `THIEU_PHIEU_DVHD` / `THIEU_PHIEU_GVHD` (kèm tên chặng).
- Nhóm có tỷ lệ = 0 (ĐVHD ở CLO7) ⇒ bỏ qua nhóm đó, kể cả khi có ai lỡ gửi điểm.

**Bước 3 — tổng hợp chặng, có chuẩn hóa** (Đ14 k1):
`CLO_i = Σ_{k có đánh giá i} w_k·S_ik  /  Σ_{k có đánh giá i} w_k`
- CLO1–6: (0,3·S_i1 + 0,7·S_i2) / 1,0.
- CLO7: 0,7·S_72 / 0,7 = S_72. **Bỏ phép chia là lỗi kinh điển số 1** — CLO7 chỉ còn 70% giá trị.
- Không chặng nào có CLO i ⇒ `CLO_CHUA_DUOC_DANH_GIA`. Chỉ 1 chặng ⇒ hợp lệ nhưng ghi cảnh báo CBR-23.

**Bước 4 — điểm học phần** (Đ14 k2, Đ18 k4):
`HP = min(10, Σ α_i·CLO_i / 100 + thưởng)`, thưởng ∈ [0; 0,5]. Làm tròn **sau cùng**.

**Bước 5 — quy đổi mức** (Đ13 k2) cho từng CLO và HP — trên **giá trị đã làm tròn 0,1** (mặc định 10.1).

**Bước 6 — công nhận** (Đ15 k3), Đạt khi cả bốn:
(a) hồ sơ có đủ kết quả cả 2 chặng · (b) mức CLO1 **và** CLO2 ≥ ngưỡng (CHUAN: 1, CLC_STEM: 2) ·
(c) mức HP ≥ 1 · (d) `MinhChungService.doiChieu(hoSoId).du()`.
Không đạt ⇒ `ly_do_khong_dat` liệt kê **mọi** điều kiện trượt, mỗi dòng trích điểm (a)/(b)/(c)/(d).

Kèm theo: nhóm năng lực = TB cộng — Kiến thức (CLO1, 2), Kỹ năng (CLO3, 5, 6), Thái độ (CLO4, 7).
Cờ lệch: |S_ĐVHD − S_GVHD| > 2,0 (so trên D̄ và Ḡ) ở cùng CLO, cùng chặng ⇒ cảnh báo, không chặn.

## 3. Làm tròn và quy đổi mức — một chỗ duy nhất

```java
// RubricUtils — dùng chung cho kiểm CBR-10 khi nộp phiếu, quy đổi mức, HPself.
// Khoảng [diem_min; diem_max), riêng mức cao nhất đóng ở 10. Đọc từ muc_rubric của đợt, không viết cứng.
public static int xacDinhMuc(BigDecimal diem, List<MucRubric> bangMuc) { ... }
public static BigDecimal lamTron(BigDecimal x) { return x.setScale(1, RoundingMode.HALF_UP); }
public static BigDecimal diemGiuaKhoang(MucRubric m) {
    return m.getDiemMin().add(m.getDiemMax()).divide(BigDecimal.TWO, MathContext.DECIMAL64);
}
```

Mọi phép trung gian `MathContext.DECIMAL64`; chỉ `lamTron` ở **bước 4–5**. Lưu `diem_clo1..7` đã làm tròn,
nhưng HP tính từ CLO **chưa làm tròn** (mặc định 10.2).

## 4. Thiết kế lớp — Java thuần

```java
// service/scoring — KHONG @Autowired repository; KetQuaService nap du lieu roi goi vao.
public record CauHinhClo(String maClo, BigDecimal alpha, BigDecimal tyLeDvhd, BigDecimal tyLeGvhd,
                         Set<Integer> changCoDanhGia) {}
public record CauHinhChang(int thuTu, BigDecimal trongSo) {}
public record PhieuDiem(int chang, NhomNguoiCham nhom, Long nguoiChamId, Map<String, BigDecimal> diemTheoClo) {}
public record DauVaoTinhDiem(List<CauHinhChang> chang, List<CauHinhClo> clo, List<MucRubric> bangMuc,
                             List<PhieuDiem> phieu, ChuongTrinhDaoTao chuongTrinh,
                             BigDecimal diemThuong, boolean duMinhChung, List<String> loaiMinhChungThieu) {}
public record KetQuaTinhDiem(Map<String, Map<Integer, DiemChang>> diemChang, // cot 1-6 TTTN-07
                             Map<String, BigDecimal> diemClo,               // da lam tron
                             BigDecimal diemHp, int mucHp, Map<String, Integer> mucClo,
                             KetLuan ketLuan, List<String> lyDoKhongDat,
                             BigDecimal nhomKienThuc, BigDecimal nhomKyNang, BigDecimal nhomThaiDo,
                             List<String> canhBao) {}
public record DiemChang(BigDecimal tbDvhd, BigDecimal tbGvhd, BigDecimal diemChang) {}

public class ScoringService {          // dang ky @Component cung duoc, mien la khong phu thuoc DB
    public KetQuaTinhDiem tinhDiem(DauVaoTinhDiem dauVao) { ... }   // nem BusinessException khi thieu phieu
    public BigDecimal tinhHpTuDiemClo(Map<String, BigDecimal> diemClo, List<CauHinhClo> clo) { ... } // dung lai cho HPself
}
```

Tên trong class diagram: `tinhDiem`, `hopNhatNhomNguoiCham`, `chuanHoaTrongSoChang`, `tinhDiemHocPhan`,
`xacDinhMuc`, `xetCongNhanHoanThanh`, `tongHopNhomNangLuc` — giữ đúng các tên này cho method con.

`KetQuaService.chayTinhDiem(hoSoId)` (có `@Transactional`): kiểm quyền → nạp cấu hình đợt + phiếu + minh
chứng → `scoringService.tinhDiem(...)` → ghi `ket_qua_hoc_phan` (+ `phien_ban_trong_so`, `ngay_tinh`,
`trang_thai = DA_TINH`) → `nhatKyHeThong.ghiVet("TINH_DIEM", ..., hpTruoc, hpSau)`.
Tự chạy khi phiếu cuối cùng của chặng 2 được nộp, và khi một phiếu mở lại được nộp lại.

## 5. Ví dụ chuẩn tính tay — dùng cho test #1 và khi vấn đáp

SV chương trình **CHUAN**, đủ minh chứng, không thưởng. Cấu hình mặc định (mục 6 `docs/01-nghiep-vu.md`).

**Chặng 1** (w = 0,3) — mỗi bên 1 phiếu:

| CLO | ĐVHD | GVHD | rD/rG | S_i1 |
|---|---|---|---|---|
| 1 | 7,0 | 8,0 | 30/70 | 0,3·7 + 0,7·8 = **7,70** |
| 2 | 6,5 | 7,0 | 30/70 | 1,95 + 4,90 = **6,85** |
| 3 | 6,0 | 7,0 | 30/70 | **6,70** |
| 4 | 8,0 | 9,0 | 70/30 | 0,7·8 + 0,3·9 = **8,30** |
| 5 | 7,5 | 8,0 | 40/60 | **7,80** |
| 6 | 7,0 | 6,0 | 50/50 | **6,50** |
| 7 | — | — | 0/100 | không đánh giá |

**Chặng 2** (w = 0,7) — tổ 3 người: GV A (GVHD), GV B (nhóm GVHD), cán bộ C (nhóm ĐVHD):

| CLO | A | B | Ḡ | C = D̄ | S_i2 |
|---|---|---|---|---|---|
| 1 | 8 | 9 | 8,5 | 8 | 0,3·8 + 0,7·8,5 = **8,35** |
| 2 | 7 | 8 | 7,5 | 7 | **7,35** |
| 3 | 8 | 7 | 7,5 | 7 | **7,35** |
| 4 | 9 | 9 | 9,0 | 9 | **9,00** |
| 5 | 8 | 7 | 7,5 | 8 | 0,4·8 + 0,6·7,5 = **7,70** |
| 6 | 7 | 8 | 7,5 | 8 | **7,75** |
| 7 | 8 | 7 | 7,5 | (bỏ qua) | 1,0·7,5 = **7,50** |

**Tổng hợp**:

| CLO | Công thức | Đầy đủ | Làm tròn | Mức | α |
|---|---|---|---|---|---|
| 1 | 0,3·7,70 + 0,7·8,35 | 8,155 | **8,2** | 3 | 20 |
| 2 | 0,3·6,85 + 0,7·7,35 | 7,200 | **7,2** | 3 | 25 |
| 3 | 0,3·6,70 + 0,7·7,35 | 7,155 | **7,2** | 3 | 10 |
| 4 | 0,3·8,30 + 0,7·9,00 | 8,790 | **8,8** | 4 | 10 |
| 5 | 0,3·7,80 + 0,7·7,70 | 7,730 | **7,7** | 3 | 10 |
| 6 | 0,3·6,50 + 0,7·7,75 | 7,375 | **7,4** | 3 | 15 |
| 7 | 0,7·7,50 / 0,7 | 7,500 | **7,5** | 3 | 10 |

HP = 0,20·8,155 + 0,25·7,2 + 0,10·7,155 + 0,10·8,79 + 0,10·7,73 + 0,15·7,375 + 0,10·7,5
= 1,631 + 1,8 + 0,7155 + 0,879 + 0,773 + 1,10625 + 0,75 = **7,65475 → 7,7 (Mức 3)**.
Nhóm: Kiến thức 7,6775 → **7,7** · Kỹ năng 7,42 → **7,4** · Thái độ 8,145 → **8,1**. Kết luận **ĐẠT**.

**Nếu quên chuẩn hóa CLO7** (lấy 0,7·7,5 = 5,25): HP = 7,42975 → **7,4** — sai 0,3 điểm. Đây là câu trả lời
cho "vì sao phải chuẩn hóa".

**Ca làm tròn sớm** (test #12): CLO1–6 cùng 7,04 (hai bên, hai chặng đều chấm 7,04), CLO7 = 7,14.
HP đúng = 0,9·7,04 + 0,1·7,14 = 7,05 → **7,1**. Nếu làm tròn CLO trước (7,0 và 7,1) rồi mới tính:
0,9·7,0 + 0,1·7,1 = 7,01 → 7,0 — **sai**.

## 6. HPself và chỉ số tự nhận thức (UC12)

- HPself: mỗi CLO lấy mức tự đánh giá 0–4 → `diemGiuaKhoang` (2,00 · 4,75 · 6,25 · 7,75 · 9,25) → `tinhHpTuDiemClo` → làm tròn 0,1. Cùng α của đợt.
- Chỉ số tự nhận thức = (1/7)·Σ |mức tự đánh giá_i − mức chính thức_i|, làm tròn 0,01; ≥ 0, càng gần 0 càng tự nhận thức đúng. **Chỉ tính sau khi kết quả `DA_CONG_BO`.**

## 7. Lỗi kinh điển — kiểm theo thứ tự này

1. CLO7 không chuẩn hóa trọng số chặng (mục 5).
2. TB cả tổ chung một rổ thay vì TB trong từng nhóm rồi mới áp tỷ lệ.
3. Làm tròn trung gian (từng chặng, từng CLO) rồi mới tính tiếp.
4. `double`, `new BigDecimal(0.3)`, `divide` không `MathContext`, `setScale` không `RoundingMode`.
5. Viết cứng 0,3/0,7/α/tỷ lệ thay vì đọc cấu hình đợt.
6. Tính cả phiếu `NHAP`/`MO_LAI` hoặc phiếu của thành viên vắng mặt.
7. ĐVHD có điểm CLO7 lọt vào phép tính.
8. Điều kiện (b) kiểm mọi CLO thay vì chỉ CLO1, CLO2 — hoặc dùng ngưỡng Mức 1 cho SV CLC_STEM.
9. Không chặn trần 10 sau khi cộng thưởng.
10. Mức tính trên điểm chưa làm tròn ở chỗ này, đã làm tròn ở chỗ khác (phải cùng một hàm).
