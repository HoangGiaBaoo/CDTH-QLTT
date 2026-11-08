package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.entity.enums.ChuongTrinhDaoTao;
import org.example.cdthqltt.entity.enums.KetLuan;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.example.cdthqltt.entity.enums.NhomNguoiCham.DVHD;
import static org.example.cdthqltt.entity.enums.NhomNguoiCham.GVHD;

/**
 * Kiểm bộ máy tính điểm theo Điều 13–15 Quy định. JUnit thuần — không Spring, không MySQL.
 * Cấu hình dùng đúng giá trị mặc định của đợt mẫu MAU-QD207 (V2): w = 0,3 / 0,7; α = 20, 25, 10, 10, 10, 15, 10;
 * tỷ lệ ĐVHD/GVHD: CLO1–3 30/70, CLO4 70/30, CLO5 40/60, CLO6 50/50, CLO7 0/100; chặng 1 không có CLO7.
 */
class ScoringServiceTest {

    private final ScoringService scoring = new ScoringService();

    private static final List<KhoangMuc> BANG_MUC = List.of(
            new KhoangMuc(0, bd("0.00"), bd("4.00")),
            new KhoangMuc(1, bd("4.00"), bd("5.50")),
            new KhoangMuc(2, bd("5.50"), bd("7.00")),
            new KhoangMuc(3, bd("7.00"), bd("8.50")),
            new KhoangMuc(4, bd("8.50"), bd("10.00")));

    private static final List<String> MA_CLO = List.of("CLO1", "CLO2", "CLO3", "CLO4", "CLO5", "CLO6", "CLO7");

    // ------------------------------------------------------------------ 12 ca bắt buộc

    @Test
    @DisplayName("1. Khớp ví dụ tính tay: CLO1 = 8,2 … HP = 7,7, Đạt")
    void tinhDiemKhopViDuTinhTay() {
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieuViDu()));

        // CLO1 = 0,3·7,70 + 0,7·8,35 = 8,155 → 8,2 (double sẽ cho 8,1 vì 8,155 không biểu diễn chính xác)
        assertBang(kq.diemCloDayDu().get("CLO1"), "8.155");
        assertThat(kq.diemClo()).containsExactlyEntriesOf(diemTheoClo("8.2", "7.2", "7.2", "8.8", "7.7", "7.4", "7.5"));
        assertThat(kq.mucClo()).containsExactlyEntriesOf(mucTheoClo(3, 3, 3, 4, 3, 3, 3));
        // HP = 1,631 + 1,8 + 0,7155 + 0,879 + 0,773 + 1,10625 + 0,75 = 7,65475 → 7,7 (Mức 3)
        assertBang(kq.diemHp(), "7.7");
        assertThat(kq.mucHp()).isEqualTo(3);
        // Kiến thức (8,155 + 7,2)/2 = 7,6775 → 7,7 · Kỹ năng (7,155 + 7,73 + 7,375)/3 = 7,42 → 7,4 · Thái độ (8,79 + 7,5)/2 = 8,145 → 8,1
        assertBang(kq.nhomKienThuc(), "7.7");
        assertBang(kq.nhomKyNang(), "7.4");
        assertBang(kq.nhomThaiDo(), "8.1");
        assertThat(kq.ketLuan()).isEqualTo(KetLuan.DAT);
        assertThat(kq.lyDoKhongDat()).isEmpty();
    }

    @Test
    @DisplayName("2. CLO7 chỉ có chặng 2 được chuẩn hóa: CLO7 = S₇,₂ chứ không phải 0,7·S₇,₂")
    void clo7ChiCoChang2DuocChuanHoaTrongSo() {
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieuViDu()));

        // 0,7·7,5 / 0,7 = 7,5
        assertBang(kq.diemCloDayDu().get("CLO7"), "7.5");
        assertBang(kq.diemHp(), "7.7");

        // Nếu quên chuẩn hóa: CLO7 = 5,25 ⇒ HP = 7,42975 → 7,4 — lệch 0,3 điểm.
        Map<String, BigDecimal> khongChuanHoa = new LinkedHashMap<>(kq.diemCloDayDu());
        khongChuanHoa.put("CLO7", bd("5.25"));
        assertBang(RubricUtils.lamTron(scoring.tinhHpTuDiemClo(khongChuanHoa, cauHinhClo())), "7.4");
    }

    @Test
    @DisplayName("3. Trung bình trong nhóm trước rồi mới áp tỷ lệ (CBR-15)")
    void trungBinhTrongNhomTruocKhiApTyLe() {
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieuViDu()));

        // CLO1 chặng 2: GV A = 8, GV B = 9 ⇒ Ḡ = 8,5; cán bộ C = 8 ⇒ S = 0,3·8 + 0,7·8,5 = 8,35.
        // Nếu trung bình cả 3 người chung một rổ: (8 + 9 + 8)/3 = 8,333… — sai.
        DiemChang d = kq.diemChang().get("CLO1").get(2);
        assertBang(d.tbGvhd(), "8.5");
        assertBang(d.tbDvhd(), "8");
        assertBang(d.diemChang(), "8.35");
    }

    @Test
    @DisplayName("4. Phiếu của thành viên vắng mặt không vào phép tính")
    void thanhVienVangMatBiLoaiKhoiTrungBinh() {
        List<PhieuDiem> phieu = new ArrayList<>(phieuViDu());
        // GV D vắng mặt nhưng phiếu toàn 0 điểm lỡ được nộp — nếu bị tính, Ḡ CLO1 chặng 2 sẽ là (8+9+0)/3.
        phieu.add(new PhieuDiem(2, GVHD, 99L, true, diemTheoClo("0", "0", "0", "0", "0", "0", "0")));

        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieu));

        assertBang(kq.diemChang().get("CLO1").get(2).tbGvhd(), "8.5");
        assertBang(kq.diemHp(), "7.7");
    }

    @Test
    @DisplayName("5. Chặng 1 không có phiếu ĐVHD ⇒ THIEU_PHIEU_DVHD")
    void thieuPhieuDvhdNemLoi() {
        List<PhieuDiem> phieu = phieuViDu().stream()
                .filter(p -> !(p.chang() == 1 && p.nhom() == DVHD)).toList();

        assertThatThrownBy(() -> scoring.tinhDiem(dauVao(phieu)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Chặng 1")
                .extracting(e -> ((BusinessException) e).getCode()).isEqualTo(ErrorCode.THIEU_PHIEU_DVHD);
    }

    @Test
    @DisplayName("6. Thành viên ĐVHD duy nhất của Tổ vắng mặt ⇒ THIEU_PHIEU_DVHD")
    void vangMatLamTrongNhomDvhdNemLoi() {
        List<PhieuDiem> phieu = phieuViDu().stream()
                .map(p -> p.chang() == 2 && p.nhom() == DVHD
                        ? new PhieuDiem(p.chang(), p.nhom(), p.nguoiChamId(), true, p.diemTheoClo()) : p)
                .toList();

        assertThatThrownBy(() -> scoring.tinhDiem(dauVao(phieu)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Chặng 2")
                .extracting(e -> ((BusinessException) e).getCode()).isEqualTo(ErrorCode.THIEU_PHIEU_DVHD);
    }

    @Test
    @DisplayName("7. Bỏ câu hỏi CLO7 ở chặng 2 ⇒ CLO_CHUA_DUOC_DANH_GIA")
    void cloKhongDuocDanhGiaONaoNemLoi() {
        List<CauHinhClo> clo = cauHinhClo().stream()
                .map(c -> c.maClo().equals("CLO7")
                        ? new CauHinhClo("CLO7", c.alpha(), c.tyLeDvhd(), c.tyLeGvhd(), Set.of(), c.bangMuc()) : c)
                .toList();
        DauVaoTinhDiem dv = new DauVaoTinhDiem(cauHinhChang(), clo, BANG_MUC, phieuViDu(),
                ChuongTrinhDaoTao.CHUAN, null, true, List.of());

        assertThatThrownBy(() -> scoring.tinhDiem(dv))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CLO7")
                .extracting(e -> ((BusinessException) e).getCode()).isEqualTo(ErrorCode.CLO_CHUA_DUOC_DANH_GIA);
    }

    @Test
    @DisplayName("8. HP 9,8 + thưởng 0,5 ⇒ chặn trần 10,0")
    void diemThuongBiChanTran10() {
        DauVaoTinhDiem dv = dauVao(phieuDeu(ma -> "9.8"), ChuongTrinhDaoTao.CHUAN, bd("0.5"), true, List.of());

        KetQuaTinhDiem kq = scoring.tinhDiem(dv);

        assertBang(kq.diemHp(), "10.0");
        assertThat(kq.mucHp()).isEqualTo(4);
    }

    @Test
    @DisplayName("9. Cùng CLO2 = 5,0: Chuẩn đạt (Mức 1), CLC/STEM không đạt (cần Mức 2)")
    void nguongDatKhacNhauChoChuanVaClcStem() {
        List<PhieuDiem> phieu = phieuDeu(ma -> ma.equals("CLO2") ? "5.0" : "7.0");

        KetQuaTinhDiem chuan = scoring.tinhDiem(dauVao(phieu, ChuongTrinhDaoTao.CHUAN, null, true, List.of()));
        KetQuaTinhDiem stem = scoring.tinhDiem(dauVao(phieu, ChuongTrinhDaoTao.CLC_STEM, null, true, List.of()));

        assertThat(chuan.mucClo().get("CLO2")).isEqualTo(1);
        assertThat(chuan.ketLuan()).isEqualTo(KetLuan.DAT);
        assertThat(stem.ketLuan()).isEqualTo(KetLuan.KHONG_DAT);
        assertThat(stem.lyDoKhongDat()).singleElement().asString()
                .startsWith("(b)").contains("CLO2").contains("Điều 15 khoản 3 điểm b");
    }

    @Test
    @DisplayName("10. Thiếu minh chứng + CLO1 Mức 0 ⇒ Không đạt với đủ 2 lý do")
    void khongDatTraDuLyDo() {
        // CLO1 = 3,0 (Mức 0), còn lại 7,0 ⇒ HP = 0,2·3 + 0,8·7 = 6,2 (Mức 2) — điều kiện (c) vẫn đạt.
        List<PhieuDiem> phieu = phieuDeu(ma -> ma.equals("CLO1") ? "3.0" : "7.0");

        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieu, ChuongTrinhDaoTao.CHUAN, null, false, List.of("Nhật ký thực tập")));

        assertBang(kq.diemHp(), "6.2");
        assertThat(kq.ketLuan()).isEqualTo(KetLuan.KHONG_DAT);
        assertThat(kq.lyDoKhongDat()).hasSize(2);
        assertThat(kq.lyDoKhongDat().get(0)).startsWith("(b)").contains("CLO1 đạt Mức 0");
        assertThat(kq.lyDoKhongDat().get(1)).startsWith("(d)").contains("Nhật ký thực tập");
    }

    @Test
    @DisplayName("11. Quy đổi mức tại biên khoảng: 3,99→0 · 4,0→1 · 5,5→2 · 7,0→3 · 8,5→4 · 10→4")
    void xacDinhMucTaiBienKhoang() {
        assertThat(RubricUtils.xacDinhMuc(bd("0"), BANG_MUC)).isZero();
        assertThat(RubricUtils.xacDinhMuc(bd("3.99"), BANG_MUC)).isZero();
        assertThat(RubricUtils.xacDinhMuc(bd("4.0"), BANG_MUC)).isEqualTo(1);
        assertThat(RubricUtils.xacDinhMuc(bd("5.5"), BANG_MUC)).isEqualTo(2);
        assertThat(RubricUtils.xacDinhMuc(bd("7.0"), BANG_MUC)).isEqualTo(3);
        assertThat(RubricUtils.xacDinhMuc(bd("8.5"), BANG_MUC)).isEqualTo(4);
        assertThat(RubricUtils.xacDinhMuc(bd("10"), BANG_MUC)).isEqualTo(4);
        assertThatThrownBy(() -> RubricUtils.xacDinhMuc(bd("10.1"), BANG_MUC)).isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("12. Chỉ làm tròn ở bước cuối: HP = 7,1 chứ không phải 7,0")
    void lamTronChiOBuocCuoi() {
        // CLO1–6 = 7,04, CLO7 = 7,14 ⇒ HP = 0,9·7,04 + 0,1·7,14 = 7,05 → 7,1.
        // Làm tròn CLO trước (7,0 và 7,1) thì HP = 0,9·7,0 + 0,1·7,1 = 7,01 → 7,0 — sai.
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieuDeu(ma -> ma.equals("CLO7") ? "7.14" : "7.04")));

        assertBang(kq.diemClo().get("CLO1"), "7.0");
        assertBang(kq.diemClo().get("CLO7"), "7.1");
        assertBang(kq.diemHp(), "7.1");
    }

    // ------------------------------------------------------------------ ca bổ sung

    @Test
    @DisplayName("Lệch ĐVHD/GVHD quá 2 điểm ở cùng CLO, cùng chặng ⇒ cảnh báo, không chặn (Đ20 k3)")
    void canhBaoLechDiemTren2() {
        List<PhieuDiem> phieu = new ArrayList<>(phieuDeu(ma -> "8.0"));
        phieu.replaceAll(p -> p.chang() == 1 && p.nhom() == DVHD
                ? new PhieuDiem(1, DVHD, p.nguoiChamId(), false, diemTheoClo("5.5", "8.0", "8.0", "8.0", "8.0", "8.0")) : p);

        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieu));

        assertThat(kq.canhBao()).anyMatch(s -> s.startsWith("CLO1 Chặng 1") && s.contains("lệch"));
        assertThat(kq.canhBao()).noneMatch(s -> s.startsWith("CLO2 Chặng 1"));
        assertThat(kq.ketLuan()).isEqualTo(KetLuan.DAT);
    }

    @Test
    @DisplayName("Điểm ĐVHD lỡ gửi cho CLO7 bị bỏ qua (tỷ lệ ĐVHD = 0, CBR-09)")
    void diemDvhdChoClo7BiBoQua() {
        List<PhieuDiem> phieu = phieuViDu().stream()
                .map(p -> p.chang() == 2 && p.nhom() == DVHD
                        ? new PhieuDiem(2, DVHD, p.nguoiChamId(), false, them(p.diemTheoClo(), "CLO7", "0")) : p)
                .toList();

        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieu));

        assertThat(kq.diemChang().get("CLO7").get(2).tbDvhd()).isNull();
        assertBang(kq.diemCloDayDu().get("CLO7"), "7.5");
    }

    @Test
    @DisplayName("CLO chỉ được đánh giá ở một chặng ⇒ vẫn tính, kèm cảnh báo CBR-23")
    void cloChiMotChangCoCanhBao() {
        KetQuaTinhDiem kq = scoring.tinhDiem(dauVao(phieuViDu()));

        assertThat(kq.canhBao()).anyMatch(s -> s.startsWith("CLO7 chỉ được đánh giá ở Chặng 2"));
    }

    @Test
    @DisplayName("HPself dùng điểm giữa khoảng của mức tự đánh giá (UC12)")
    void hpSelfDungDiemGiuaKhoang() {
        // Giữa khoảng: Mức 0 = 2,00 · 1 = 4,75 · 2 = 6,25 · 3 = 7,75 · 4 = 9,25
        assertBang(RubricUtils.diemGiuaKhoang(BANG_MUC.get(0)), "2");
        assertBang(RubricUtils.diemGiuaKhoang(BANG_MUC.get(3)), "7.75");
        assertBang(RubricUtils.diemGiuaKhoang(BANG_MUC.get(4)), "9.25");

        // Tự đánh giá Mức 3 cho mọi CLO ⇒ HPself = 7,75 → 7,8
        Map<String, BigDecimal> tuDanhGia = new LinkedHashMap<>();
        MA_CLO.forEach(ma -> tuDanhGia.put(ma, RubricUtils.diemGiuaKhoang(BANG_MUC.get(3))));
        assertBang(RubricUtils.lamTron(scoring.tinhHpTuDiemClo(tuDanhGia, cauHinhClo())), "7.8");
    }

    // ------------------------------------------------------------------ dữ liệu

    /** Ví dụ chuẩn của skill tinh-diem-clo / docs/01 — tổ chặng 2: GV A (GVHD), GV B, cán bộ C. */
    private static List<PhieuDiem> phieuViDu() {
        return List.of(
                new PhieuDiem(1, DVHD, 10L, false, diemTheoClo("7.0", "6.5", "6.0", "8.0", "7.5", "7.0")),
                new PhieuDiem(1, GVHD, 20L, false, diemTheoClo("8.0", "7.0", "7.0", "9.0", "8.0", "6.0")),
                new PhieuDiem(2, GVHD, 20L, false, diemTheoClo("8", "7", "8", "9", "8", "7", "8")),
                new PhieuDiem(2, GVHD, 21L, false, diemTheoClo("9", "8", "7", "9", "7", "8", "7")),
                new PhieuDiem(2, DVHD, 10L, false, diemTheoClo("8", "7", "7", "9", "8", "8")));
    }

    /** Mọi người chấm cho cùng một điểm ở mỗi CLO ⇒ CLO_i = điểm đó. */
    private static List<PhieuDiem> phieuDeu(Function<String, String> diem) {
        Map<String, BigDecimal> c1 = new LinkedHashMap<>();
        Map<String, BigDecimal> c2 = new LinkedHashMap<>();
        for (String ma : MA_CLO) {
            if (!ma.equals("CLO7")) {
                c1.put(ma, bd(diem.apply(ma)));
            }
            c2.put(ma, bd(diem.apply(ma)));
        }
        Map<String, BigDecimal> c2Dvhd = new LinkedHashMap<>(c2);
        c2Dvhd.remove("CLO7");
        return List.of(new PhieuDiem(1, DVHD, 10L, false, c1), new PhieuDiem(1, GVHD, 20L, false, c1),
                new PhieuDiem(2, GVHD, 20L, false, c2), new PhieuDiem(2, GVHD, 21L, false, c2),
                new PhieuDiem(2, DVHD, 10L, false, c2Dvhd));
    }

    private static List<CauHinhChang> cauHinhChang() {
        return List.of(new CauHinhChang(1, "Chặng 1", bd("0.300")), new CauHinhChang(2, "Chặng 2", bd("0.700")));
    }

    private static List<CauHinhClo> cauHinhClo() {
        return List.of(
                clo("CLO1", "20", "30", "70", 1, 2),
                clo("CLO2", "25", "30", "70", 1, 2),
                clo("CLO3", "10", "30", "70", 1, 2),
                clo("CLO4", "10", "70", "30", 1, 2),
                clo("CLO5", "10", "40", "60", 1, 2),
                clo("CLO6", "15", "50", "50", 1, 2),
                clo("CLO7", "10", "0", "100", 2));
    }

    private static CauHinhClo clo(String ma, String alpha, String rD, String rG, Integer... chang) {
        return new CauHinhClo(ma, bd(alpha), bd(rD), bd(rG), Set.of(chang), BANG_MUC);
    }

    private static DauVaoTinhDiem dauVao(List<PhieuDiem> phieu) {
        return dauVao(phieu, ChuongTrinhDaoTao.CHUAN, null, true, List.of());
    }

    private static DauVaoTinhDiem dauVao(List<PhieuDiem> phieu, ChuongTrinhDaoTao ct, BigDecimal thuong,
                                         boolean duMinhChung, List<String> thieu) {
        return new DauVaoTinhDiem(cauHinhChang(), cauHinhClo(), BANG_MUC, phieu, ct, thuong, duMinhChung, thieu);
    }

    private static Map<String, BigDecimal> diemTheoClo(String... diem) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        for (int i = 0; i < diem.length; i++) {
            m.put(MA_CLO.get(i), bd(diem[i]));
        }
        return m;
    }

    private static Map<String, Integer> mucTheoClo(int... muc) {
        Map<String, Integer> m = new LinkedHashMap<>();
        for (int i = 0; i < muc.length; i++) {
            m.put(MA_CLO.get(i), muc[i]);
        }
        return m;
    }

    private static Map<String, BigDecimal> them(Map<String, BigDecimal> goc, String ma, String diem) {
        Map<String, BigDecimal> m = new LinkedHashMap<>(goc);
        m.put(ma, bd(diem));
        return m;
    }

    private static void assertBang(BigDecimal thucTe, String mongDoi) {
        assertThat(thucTe).as("mong đợi %s", mongDoi).isEqualByComparingTo(mongDoi);
    }

    private static BigDecimal bd(String s) {
        return new BigDecimal(s);
    }
}
