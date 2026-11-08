package org.example.cdthqltt.service.scoring;

import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.entity.enums.KetLuan;
import org.example.cdthqltt.entity.enums.NhomNguoiCham;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Bộ máy tính điểm CLO và điểm học phần (Điều 13–15 Quy định). Java thuần: không repository, không DB —
 * KetQuaService nạp cấu hình đợt + phiếu đã nộp + kết quả đối chiếu minh chứng rồi gọi {@link #tinhDiem}.
 * Mọi phép trung gian dùng {@link MathContext#DECIMAL64}; chỉ làm tròn 0,1 ở bước cuối (CBR-18).
 */
@Component
public class ScoringService {

    private static final BigDecimal TRAM = new BigDecimal("100");
    /** Trần thang điểm 10 sau khi cộng thưởng (Đ18 k4). */
    private static final BigDecimal DIEM_TOI_DA = BigDecimal.TEN;
    /** Đ20 k3: hai bên lệch quá 2,0 điểm ở cùng CLO, cùng chặng ⇒ cảnh báo cho giáo vụ, không chặn. */
    private static final BigDecimal NGUONG_LECH = new BigDecimal("2.0");
    /** Đ15 k3b: chỉ CLO1, CLO2 là điều kiện công nhận; CLO khác dưới ngưỡng vẫn có thể Đạt. */
    private static final List<String> CLO_DIEU_KIEN = List.of("CLO1", "CLO2");
    /** Đ15 k3c: điểm học phần tối thiểu Mức 1, không phân biệt chương trình. */
    private static final int MUC_HP_TOI_THIEU = 1;
    /** Ba nhóm năng lực trên mẫu TTTN-07. */
    private static final List<String> NHOM_KIEN_THUC = List.of("CLO1", "CLO2");
    private static final List<String> NHOM_KY_NANG = List.of("CLO3", "CLO5", "CLO6");
    private static final List<String> NHOM_THAI_DO = List.of("CLO4", "CLO7");

    /** Tính toàn bộ kết quả của một hồ sơ. Thiếu phiếu một bên hoặc CLO không được đánh giá ⇒ BusinessException. */
    public KetQuaTinhDiem tinhDiem(DauVaoTinhDiem dauVao) {
        List<CauHinhChang> cacChang = dauVao.chang().stream()
                .sorted(Comparator.comparingInt(CauHinhChang::thuTu)).toList();
        // Phiếu của thành viên vắng mặt không vào phép tính (Đ10 k3).
        List<PhieuDiem> phieuHopLe = dauVao.phieu().stream().filter(p -> !p.vangMat()).toList();
        List<String> canhBao = new ArrayList<>();

        Map<String, Map<Integer, DiemChang>> diemChang = new LinkedHashMap<>();
        Map<String, BigDecimal> cloDayDu = new LinkedHashMap<>();
        for (CauHinhClo clo : dauVao.clo()) {
            List<CauHinhChang> changCoClo = cacChang.stream()
                    .filter(c -> clo.changCoDanhGia().contains(c.thuTu())).toList();
            if (changCoClo.isEmpty()) {
                throw new BusinessException(ErrorCode.CLO_CHUA_DUOC_DANH_GIA,
                        clo.maClo() + " không được đánh giá ở chặng nào; cần bổ sung câu hỏi đánh giá (Điều 11 khoản 2 điểm c)");
            }
            if (changCoClo.size() < cacChang.size()) {
                canhBao.add(clo.maClo() + " chỉ được đánh giá ở " + changCoClo.stream().map(CauHinhChang::ten)
                        .collect(Collectors.joining(", ")) + "; trọng số chặng đã được chuẩn hóa (CBR-23)");
            }
            Map<Integer, DiemChang> theoChang = new LinkedHashMap<>();
            for (CauHinhChang chang : changCoClo) {
                List<PhieuDiem> phieuChang = phieuHopLe.stream().filter(p -> p.chang() == chang.thuTu()).toList();
                DiemChang d = hopNhatNhomNguoiCham(clo, chang, phieuChang);
                theoChang.put(chang.thuTu(), d);
                if (d.tbDvhd() != null && d.tbGvhd() != null
                        && d.tbDvhd().subtract(d.tbGvhd()).abs().compareTo(NGUONG_LECH) > 0) {
                    canhBao.add(clo.maClo() + " " + chang.ten() + ": điểm ĐVHD (" + RubricUtils.hienThi(RubricUtils.lamTron(d.tbDvhd()))
                            + ") và GVHD (" + RubricUtils.hienThi(RubricUtils.lamTron(d.tbGvhd())) + ") lệch quá 2 điểm (Điều 20 khoản 3)");
                }
            }
            diemChang.put(clo.maClo(), theoChang);
            cloDayDu.put(clo.maClo(), chuanHoaTrongSoChang(theoChang, changCoClo));
        }

        // Đ14 k2: HP tính từ CLO chưa làm tròn; cộng thưởng, chặn trần rồi mới làm tròn (docs/01 mục 10.2).
        BigDecimal diemHp = RubricUtils.lamTron(tinhDiemHocPhan(cloDayDu, dauVao.clo(), dauVao.diemThuong()));
        int mucHp = RubricUtils.xacDinhMuc(diemHp, dauVao.bangMucHp());

        Map<String, BigDecimal> diemClo = new LinkedHashMap<>();
        Map<String, Integer> mucClo = new LinkedHashMap<>();
        for (CauHinhClo clo : dauVao.clo()) {
            BigDecimal lamTron = RubricUtils.lamTron(cloDayDu.get(clo.maClo()));
            diemClo.put(clo.maClo(), lamTron);
            // docs/01 mục 10.1: quy đổi mức trên điểm đã làm tròn — điểm SV và hội đồng nhìn thấy.
            mucClo.put(clo.maClo(), RubricUtils.xacDinhMuc(lamTron, clo.bangMuc()));
        }

        boolean duHaiChang = cacChang.stream().allMatch(c -> phieuHopLe.stream().anyMatch(p -> p.chang() == c.thuTu()));
        List<String> lyDo = xetCongNhanHoanThanh(duHaiChang, mucClo, diemHp, mucHp, dauVao);
        BigDecimal[] nhom = tongHopNhomNangLuc(cloDayDu);

        return new KetQuaTinhDiem(diemChang, cloDayDu, diemClo, diemHp, mucHp, mucClo,
                lyDo.isEmpty() ? KetLuan.DAT : KetLuan.KHONG_DAT, lyDo, nhom[0], nhom[1], nhom[2], canhBao);
    }

    /**
     * Bước 1–2 (CBR-15, Đ10 k3c): trung bình trong từng nhóm người chấm trước, rồi mới áp tỷ lệ đồng chấm.
     * Nhóm có tỷ lệ = 0 (ĐVHD ở CLO7) bị bỏ qua kể cả khi có ai lỡ gửi điểm (CBR-09).
     */
    public DiemChang hopNhatNhomNguoiCham(CauHinhClo clo, CauHinhChang chang, List<PhieuDiem> phieuChang) {
        BigDecimal tbDvhd = trungBinhNhom(clo, chang, phieuChang, NhomNguoiCham.DVHD, clo.tyLeDvhd());
        BigDecimal tbGvhd = trungBinhNhom(clo, chang, phieuChang, NhomNguoiCham.GVHD, clo.tyLeGvhd());
        BigDecimal tong = BigDecimal.ZERO;
        if (tbDvhd != null) {
            tong = tong.add(clo.tyLeDvhd().multiply(tbDvhd, MathContext.DECIMAL64));
        }
        if (tbGvhd != null) {
            tong = tong.add(clo.tyLeGvhd().multiply(tbGvhd, MathContext.DECIMAL64));
        }
        return new DiemChang(tbDvhd, tbGvhd, tong.divide(TRAM, MathContext.DECIMAL64));
    }

    /**
     * Bước 3 (Đ14 k1): CLO_i = Σ w_k·S_ik / Σ w_k trên các chặng có đánh giá CLO i. Mẫu số là tổng trọng số
     * của chính các chặng đó — CLO7 chỉ có chặng 2 thì CLO7 = S_72, không phải 0,7·S_72.
     */
    public BigDecimal chuanHoaTrongSoChang(Map<Integer, DiemChang> theoChang, List<CauHinhChang> changCoClo) {
        BigDecimal tuSo = BigDecimal.ZERO;
        BigDecimal mauSo = BigDecimal.ZERO;
        for (CauHinhChang c : changCoClo) {
            tuSo = tuSo.add(c.trongSo().multiply(theoChang.get(c.thuTu()).diemChang(), MathContext.DECIMAL64));
            mauSo = mauSo.add(c.trongSo());
        }
        return tuSo.divide(mauSo, MathContext.DECIMAL64);
    }

    /** Bước 4 (Đ14 k2, Đ18 k4): Σ α_i·CLO_i / 100 + thưởng, chặn trần 10. Chưa làm tròn. */
    public BigDecimal tinhDiemHocPhan(Map<String, BigDecimal> diemClo, List<CauHinhClo> clo, BigDecimal diemThuong) {
        BigDecimal hp = tinhHpTuDiemClo(diemClo, clo);
        if (diemThuong != null) {
            hp = hp.add(diemThuong);
        }
        return hp.min(DIEM_TOI_DA);
    }

    /** Σ α_i·CLO_i / 100 — dùng lại cho HPself (UC12) với điểm giữa khoảng của mức tự đánh giá. */
    public BigDecimal tinhHpTuDiemClo(Map<String, BigDecimal> diemClo, List<CauHinhClo> clo) {
        BigDecimal tong = BigDecimal.ZERO;
        for (CauHinhClo c : clo) {
            BigDecimal d = diemClo.get(c.maClo());
            if (d == null) {
                throw new BusinessException(ErrorCode.CLO_CHUA_DUOC_DANH_GIA, "Chưa có điểm " + c.maClo());
            }
            tong = tong.add(c.alpha().multiply(d, MathContext.DECIMAL64));
        }
        return tong.divide(TRAM, MathContext.DECIMAL64);
    }

    /**
     * Bước 6 (Đ15 k3): Đạt khi đủ cả bốn điều kiện. Trả về danh sách lý do không đạt — rỗng nghĩa là Đạt;
     * liệt kê mọi điều kiện trượt chứ không dừng ở điều kiện đầu tiên.
     */
    public List<String> xetCongNhanHoanThanh(boolean duHaiChang, Map<String, Integer> mucClo, BigDecimal diemHp,
                                             int mucHp, DauVaoTinhDiem dauVao) {
        List<String> lyDo = new ArrayList<>();
        if (!duHaiChang) {
            lyDo.add("(a) Chưa có đủ kết quả đánh giá của cả hai chặng (Điều 15 khoản 3 điểm a)");
        }
        int nguong = dauVao.chuongTrinh().getMucToiThieuCloDieuKien();
        List<String> cloTruot = CLO_DIEU_KIEN.stream()
                .filter(ma -> mucClo.containsKey(ma) && mucClo.get(ma) < nguong)
                .map(ma -> ma + " đạt Mức " + mucClo.get(ma))
                .toList();
        if (!cloTruot.isEmpty()) {
            lyDo.add("(b) " + String.join(", ", cloTruot) + " — dưới Mức " + nguong + " yêu cầu của "
                    + dauVao.chuongTrinh().getTenHienThi() + " (Điều 15 khoản 3 điểm b)");
        }
        if (mucHp < MUC_HP_TOI_THIEU) {
            lyDo.add("(c) Điểm học phần " + RubricUtils.hienThi(diemHp) + " (Mức " + mucHp + ") dưới Mức "
                    + MUC_HP_TOI_THIEU + " (Điều 15 khoản 3 điểm c)");
        }
        if (!dauVao.duMinhChung()) {
            List<String> thieu = dauVao.loaiMinhChungThieu() == null ? List.of() : dauVao.loaiMinhChungThieu();
            lyDo.add("(d) Thiếu minh chứng bắt buộc" + (thieu.isEmpty() ? "" : ": " + String.join(", ", thieu))
                    + " (Điều 15 khoản 3 điểm d)");
        }
        return lyDo;
    }

    /** TTTN-07: trung bình cộng các CLO trong nhóm (docs/01 mục 10.3), tính trên CLO chưa làm tròn rồi làm tròn 0,1. */
    public BigDecimal[] tongHopNhomNangLuc(Map<String, BigDecimal> cloDayDu) {
        return new BigDecimal[]{trungBinhCloNhom(cloDayDu, NHOM_KIEN_THUC),
                trungBinhCloNhom(cloDayDu, NHOM_KY_NANG), trungBinhCloNhom(cloDayDu, NHOM_THAI_DO)};
    }

    // ------------------------------------------------------------------

    private BigDecimal trungBinhNhom(CauHinhClo clo, CauHinhChang chang, List<PhieuDiem> phieuChang,
                                     NhomNguoiCham nhom, BigDecimal tyLe) {
        if (tyLe == null || tyLe.signum() == 0) {
            return null;
        }
        List<BigDecimal> diem = phieuChang.stream()
                .filter(p -> p.nhom() == nhom)
                .map(p -> p.diemTheoClo().get(clo.maClo()))
                .filter(Objects::nonNull)
                .toList();
        if (diem.isEmpty()) {
            // CBR-17 (Đ13 k3): không chốt điểm khi một chặng thiếu phiếu một bên.
            boolean dvhd = nhom == NhomNguoiCham.DVHD;
            throw new BusinessException(dvhd ? ErrorCode.THIEU_PHIEU_DVHD : ErrorCode.THIEU_PHIEU_GVHD,
                    chang.ten() + " chưa có phiếu đã nộp của " + (dvhd ? "ĐVHD" : "giảng viên")
                            + " cho " + clo.maClo() + " (Điều 13 khoản 3)");
        }
        return trungBinh(diem);
    }

    private static BigDecimal trungBinhCloNhom(Map<String, BigDecimal> cloDayDu, List<String> maClo) {
        List<BigDecimal> diem = maClo.stream().map(cloDayDu::get).filter(Objects::nonNull).toList();
        return diem.isEmpty() ? null : RubricUtils.lamTron(trungBinh(diem));
    }

    private static BigDecimal trungBinh(List<BigDecimal> ds) {
        BigDecimal tong = ds.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal soLuong = BigDecimal.valueOf(ds.size());
        return tong.divide(soLuong, MathContext.DECIMAL64);
    }
}
