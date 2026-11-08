package org.example.cdthqltt.service.export;

import org.apache.poi.xwpf.usermodel.*;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.result.BangTongHopResponse;
import org.example.cdthqltt.dto.result.MucXepLoai;
import org.example.cdthqltt.dto.result.ThongTinChungResponse;
import org.example.cdthqltt.entity.enums.KetLuan;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTcPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.TreeSet;

/**
 * Sinh tệp Word theo bố cục mẫu TTTN-07 (kèm Quy định QĐ 207): I thông tin chung · II bảng điểm 9 cột theo CLO ·
 * III điểm học phần và xếp loại · IV nhóm năng lực · V nhận xét GVHD · VI xác nhận và lưu trữ.
 * Chỉ trình bày dữ liệu đã tính sẵn trong {@link BangTongHopResponse}, không tính lại điểm.
 */
@Component
public class XuatBangTongHopWord {

    private static final String PHONG_CHU = "Times New Roman";
    private static final int CO_CHU = 12;
    private static final int CO_CHU_BANG = 10;
    private static final DateTimeFormatter NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String CHUA_CO = "……………";

    public byte[] xuat(BangTongHopResponse b) {
        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            tieuDe(doc);
            thongTinChung(doc, b.thongTin());
            bangDiemClo(doc, b);
            diemHocPhan(doc, b);
            nhomNangLuc(doc, b);
            muc(doc, "V. Nhận xét của giảng viên hướng dẫn");
            doan(doc, b.nhanXetGvhd() == null ? CHUA_CO : b.nhanXetGvhd(), false, false, ParagraphAlignment.BOTH);
            xacNhanLuuTru(doc, b);
            doc.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không tạo được tệp Word mẫu TTTN-07");
        }
    }

    private void tieuDe(XWPFDocument doc) {
        doan(doc, "Mẫu TTTN-07", true, false, ParagraphAlignment.RIGHT);
        doan(doc, "(Ban hành kèm theo Quy định tổ chức và Đánh giá Thực tập tốt nghiệp Trường Đại học Xây dựng Hà Nội)",
                false, true, ParagraphAlignment.CENTER);
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingBefore(240);
        p.setSpacingAfter(240);
        chu(p, "BẢNG TỔNG HỢP ĐIỂM CHUẨN ĐẦU RA (CLO) VÀ ĐIỂM HỌC PHẦN", true, false, 14);
    }

    private void thongTinChung(XWPFDocument doc, ThongTinChungResponse t) {
        muc(doc, "I. Thông tin chung");
        dong(doc, "Họ và tên sinh viên: ", t.hoTen());
        dong(doc, "Mã số sinh viên: ", t.maSv());
        dong(doc, "Ngành/Chuyên ngành: ", t.nganh());
        dong(doc, "Khoa/Viện: ", t.khoaVien());
        dong(doc, "Giảng viên hướng dẫn: ", t.giangVienHuongDan());
        dong(doc, "ĐVHD: ", t.donViHuongDan());
        dong(doc, "Cán bộ hướng dẫn tại ĐVHD: ", t.canBoHuongDan());
        dong(doc, "Thời gian thực tập: ", "Từ ngày " + ngay(t.tuNgay()) + " đến ngày " + ngay(t.denNgay()));
    }

    /** Mục II — hai dòng tiêu đề: gộp ngang "Điểm Chặng k" trên 3 cột, gộp dọc các cột còn lại. */
    private void bangDiemClo(XWPFDocument doc, BangTongHopResponse b) {
        muc(doc, "II. Bảng điểm chi tiết theo từng CLO");
        List<Integer> chang = haiChang(b);
        List<BangTongHopResponse.DongClo> cacClo = b.cacClo();
        XWPFTable bang = doc.createTable(2 + cacClo.size(), 11);
        bang.setWidth("100%");

        XWPFTableRow tren = bang.getRow(0);
        String[] tieuDeTren = {"CLO", "Mô tả năng lực đầu ra", "Điểm Chặng " + chang.get(0), "", "",
                "Điểm Chặng " + chang.get(1), "", "", "Điểm chuẩn đầu ra (CLOᵢ)\n(7)", "Trọng số (αᵢ)\n(8)",
                "Điểm quy đổi (CLOᵢ×αᵢ)\n(9)"};
        for (int i = 0; i < tieuDeTren.length; i++) {
            o(tren.getCell(i), tieuDeTren[i], true);
        }
        String[] tieuDeDuoi = {"", "", "ĐVHD\n(1)", "GVHD\n(2)", "TB chặng " + chang.get(0) + "\n(3)",
                "ĐVHD\n(4)", "GVHD\n(5)", "TB chặng " + chang.get(1) + "\n(6)", "", "", ""};
        XWPFTableRow duoi = bang.getRow(1);
        for (int i = 0; i < tieuDeDuoi.length; i++) {
            o(duoi.getCell(i), tieuDeDuoi[i], true);
        }
        for (int i : new int[]{0, 1, 8, 9, 10}) {
            gopDoc(tren.getCell(i), STMerge.RESTART);
            gopDoc(duoi.getCell(i), null);
        }
        // Gộp ngang: xóa ô thừa từ phải sang trái để chỉ số các ô phía trước không đổi.
        gopNgang(tren, 5, 3);
        gopNgang(tren, 2, 3);

        for (int r = 0; r < cacClo.size(); r++) {
            BangTongHopResponse.DongClo d = cacClo.get(r);
            XWPFTableRow row = bang.getRow(r + 2);
            o(row.getCell(0), d.maClo(), true);
            oTrai(row.getCell(1), d.ten());
            for (int k = 0; k < 2; k++) {
                BangTongHopResponse.DiemChangHienThi dc = d.theoChang().get(chang.get(k));
                int cot = 2 + 3 * k;
                o(row.getCell(cot), dc == null ? "—" : so2(dc.dvhd()), false);
                o(row.getCell(cot + 1), dc == null ? "—" : so2(dc.gvhd()), false);
                o(row.getCell(cot + 2), dc == null ? "—" : so2(dc.tb()), false);
            }
            o(row.getCell(8), so1(d.diemClo()), true);
            o(row.getCell(9), phanTram(d.alpha()), false);
            o(row.getCell(10), so2(d.diemQuyDoi()), false);
        }

        ghiChu(doc, "Ghi chú:");
        ghiChu(doc, "- (1), (2): Điểm chặng 1 tổng hợp từ Phiếu đánh giá tổng kết giữa kỳ của ĐVHD và GVHD (Mẫu TTTN-04).");
        ghiChu(doc, "- (3), (6): Điểm trung bình chặng theo Điều 13 khoản 3; trọng số giữa điểm GVHD và ĐVHD của từng CLO theo Điều 14 khoản 3.");
        ghiChu(doc, "- (4), (5): Điểm chặng 2 tổng hợp từ Phiếu đánh giá tổng kết cuối kỳ của các thành viên Tổ đánh giá (Mẫu TTTN-05), lấy trung bình trong từng nhóm người chấm.");
        ghiChu(doc, "- (7): Điểm chuẩn đầu ra CLOᵢ theo Điều 14 khoản 1; CLO chỉ được đánh giá ở một chặng thì trọng số chặng được chuẩn hóa. \"—\": chặng không đánh giá CLO đó.");
    }

    private void diemHocPhan(XWPFDocument doc, BangTongHopResponse b) {
        muc(doc, "III. Tổng hợp điểm học phần");
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        chu(p, "Điểm học phần (HP) = ", false, false, CO_CHU);
        chu(p, b.diemHp() == null ? CHUA_CO : so1(b.diemHp()), true, false, CO_CHU);
        if (b.diemThuong() != null && b.diemThuong().signum() > 0) {
            chu(p, " (đã cộng điểm thưởng " + so1(b.diemThuong()) + ")", false, true, CO_CHU);
        }

        XWPFParagraph xepLoai = doc.createParagraph();
        chu(xepLoai, "Xếp loại:  ", true, false, CO_CHU);
        List<MucXepLoai> thang = b.thangMuc();
        for (int i = 0; i < thang.size(); i++) {
            MucXepLoai m = thang.get(i);
            boolean chon = b.mucHp() != null && b.mucHp() == m.muc();
            String khoang = i == 0 ? "<" + so1(m.den())
                    : i == thang.size() - 1 ? "từ " + so1(m.tu())
                    : so1(m.tu()) + " – dưới " + so1(m.den());
            chu(xepLoai, (chon ? "☒" : "☐") + " Mức " + m.muc() + " (" + khoang + ")   ", chon, false, CO_CHU);
        }
        ghiChu(doc, "Ghi chú: Điểm học phần (HP) tính theo Điều 14 khoản 2, làm tròn 0,1 ở bước cuối; mức xếp loại theo Điều 13 khoản 2.");

        if (b.ketLuan() != null) {
            XWPFParagraph kl = doc.createParagraph();
            chu(kl, "Kết luận công nhận hoàn thành (Điều 15 khoản 3): ", false, false, CO_CHU);
            chu(kl, b.ketLuan() == KetLuan.DAT ? "ĐẠT" : "KHÔNG ĐẠT", true, false, CO_CHU);
            b.lyDoKhongDat().forEach(lyDo -> doan(doc, "   " + lyDo, false, true, ParagraphAlignment.LEFT));
        }
    }

    private void nhomNangLuc(XWPFDocument doc, BangTongHopResponse b) {
        muc(doc, "IV. Đánh giá tổng hợp theo nhóm năng lực");
        List<BangTongHopResponse.NhomNangLuc> nhom = b.nhomNangLuc();
        XWPFTable bang = doc.createTable(1 + nhom.size(), 5);
        bang.setWidth("100%");
        String[] tieuDe = {"Nhóm năng lực", "Các CLO liên quan", "Điểm trung bình nhóm", "Mức đạt (0–4)", "Nhận xét"};
        for (int i = 0; i < tieuDe.length; i++) {
            o(bang.getRow(0).getCell(i), tieuDe[i], true);
        }
        for (int r = 0; r < nhom.size(); r++) {
            BangTongHopResponse.NhomNangLuc n = nhom.get(r);
            XWPFTableRow row = bang.getRow(r + 1);
            oTrai(row.getCell(0), n.ten());
            o(row.getCell(1), String.join(", ", n.cacClo()), false);
            o(row.getCell(2), so1(n.diem()), true);
            o(row.getCell(3), n.muc() == null ? "" : "Mức " + n.muc(), false);
            o(row.getCell(4), "", false);
        }
    }

    private void xacNhanLuuTru(XWPFDocument doc, BangTongHopResponse b) {
        muc(doc, "VI. Xác nhận và lưu trữ");
        dong(doc, "Loại hồ sơ: ", "Bảng tổng hợp điểm CLO và điểm học phần (Mẫu TTTN-07)");
        dong(doc, "Ngày nộp lưu chiểu: ", CHUA_CO);
        dong(doc, "Ngày nhập liệu: ", b.ngayTinh() == null ? CHUA_CO : ngay(b.ngayTinh().toLocalDate()));
        dong(doc, "Địa chỉ file lưu: ", "Hệ thống QLTT — hồ sơ thực tập mã " + b.thongTin().hoSoId()
                + (b.phienBanTrongSo() == null ? "" : ", bộ trọng số " + b.phienBanTrongSo()));
        doan(doc, "Ngày … tháng … năm 20…", false, true, ParagraphAlignment.RIGHT);

        XWPFTable ky = doc.createTable(1, 3);
        ky.setWidth("100%");
        ky.removeBorders();
        String gvhd = b.thongTin().giangVienHuongDan() == null ? "" : b.thongTin().giangVienHuongDan();
        oKy(ky.getRow(0).getCell(0), "Người lập bảng (GVHD)", "(Ký tên, ghi rõ họ tên)", gvhd);
        oKy(ky.getRow(0).getCell(1), "Xác nhận của Trưởng nhóm chuyên môn", "(Ký tên, đóng dấu)", "");
        oKy(ky.getRow(0).getCell(2), "Xác nhận của Khoa/Viện", "(Ký tên, đóng dấu)", "");
    }

    // ------------------------------------------------------------------

    /** Hai chặng của mẫu (CBR-06: mỗi đợt đúng 2 chặng); lấy theo thứ tự chặng có trong dữ liệu. */
    private static List<Integer> haiChang(BangTongHopResponse b) {
        TreeSet<Integer> ds = new TreeSet<>();
        b.cacClo().forEach(d -> ds.addAll(d.theoChang().keySet()));
        if (ds.size() >= 2) {
            return List.of(ds.first(), ds.higher(ds.first()));
        }
        return List.of(1, 2);
    }

    private void muc(XWPFDocument doc, String ten) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(200);
        chu(p, ten, true, false, CO_CHU);
    }

    private void dong(XWPFDocument doc, String nhan, String giaTri) {
        XWPFParagraph p = doc.createParagraph();
        chu(p, nhan, false, false, CO_CHU);
        chu(p, giaTri == null || giaTri.isBlank() ? CHUA_CO : giaTri, true, false, CO_CHU);
    }

    private void doan(XWPFDocument doc, String text, boolean dam, boolean nghieng, ParagraphAlignment canLe) {
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(canLe);
        chu(p, text, dam, nghieng, CO_CHU);
    }

    private void ghiChu(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingAfter(0);
        chu(p, text, false, true, CO_CHU_BANG);
    }

    /** Ô bảng căn giữa; "\n" trong text tách thành nhiều dòng trong cùng ô. */
    private void o(XWPFTableCell cell, String text, boolean dam) {
        viet(cell, text, dam, ParagraphAlignment.CENTER);
    }

    private void oTrai(XWPFTableCell cell, String text) {
        viet(cell, text, false, ParagraphAlignment.LEFT);
    }

    private void viet(XWPFTableCell cell, String text, boolean dam, ParagraphAlignment canLe) {
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
        XWPFParagraph p = cell.getParagraphs().get(0);
        p.setAlignment(canLe);
        p.setSpacingAfter(0);
        String[] dongs = (text == null ? "" : text).split("\n", -1);
        for (int i = 0; i < dongs.length; i++) {
            XWPFRun run = chu(p, dongs[i], dam, false, CO_CHU_BANG);
            if (i < dongs.length - 1) {
                run.addBreak();
            }
        }
    }

    private void oKy(XWPFTableCell cell, String chucDanh, String huongDan, String hoTen) {
        XWPFParagraph p = cell.getParagraphs().get(0);
        p.setAlignment(ParagraphAlignment.CENTER);
        chu(p, chucDanh, true, false, CO_CHU);
        XWPFParagraph p2 = cell.addParagraph();
        p2.setAlignment(ParagraphAlignment.CENTER);
        chu(p2, huongDan, false, true, CO_CHU_BANG);
        for (int i = 0; i < 3; i++) {
            cell.addParagraph();
        }
        XWPFParagraph p3 = cell.addParagraph();
        p3.setAlignment(ParagraphAlignment.CENTER);
        chu(p3, hoTen, true, false, CO_CHU);
    }

    private static XWPFRun chu(XWPFParagraph p, String text, boolean dam, boolean nghieng, int co) {
        XWPFRun run = p.createRun();
        run.setFontFamily(PHONG_CHU);
        run.setFontSize(co);
        run.setBold(dam);
        run.setItalic(nghieng);
        run.setText(text);
        return run;
    }

    /** {@code kieu} null = ô tiếp nối của vùng gộp dọc. */
    private static void gopDoc(XWPFTableCell cell, STMerge.Enum kieu) {
        CTTcPr pr = cell.getCTTc().isSetTcPr() ? cell.getCTTc().getTcPr() : cell.getCTTc().addNewTcPr();
        var vMerge = pr.addNewVMerge();
        if (kieu != null) {
            vMerge.setVal(kieu);
        }
    }

    private static void gopNgang(XWPFTableRow row, int tuCot, int soCot) {
        XWPFTableCell dau = row.getCell(tuCot);
        CTTcPr pr = dau.getCTTc().isSetTcPr() ? dau.getCTTc().getTcPr() : dau.getCTTc().addNewTcPr();
        pr.addNewGridSpan().setVal(BigInteger.valueOf(soCot));
        for (int i = soCot - 1; i >= 1; i--) {
            row.removeCell(tuCot + i);
        }
    }

    private static String ngay(LocalDate d) {
        return d == null ? CHUA_CO : d.format(NGAY);
    }

    /** Điểm kiểu Việt Nam một chữ số thập phân: 8,2 · 10,0. */
    private static String so1(BigDecimal x) {
        return x == null ? "" : x.setScale(1, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }

    /** Cột trung gian giữ 2 chữ số: 7,70 · 8,35. */
    private static String so2(BigDecimal x) {
        return x == null ? "—" : x.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }

    private static String phanTram(BigDecimal alpha) {
        return alpha == null ? "" : alpha.stripTrailingZeros().toPlainString().replace('.', ',') + "%";
    }
}
