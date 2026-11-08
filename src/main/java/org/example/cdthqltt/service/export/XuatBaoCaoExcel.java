package org.example.cdthqltt.service.export;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.example.cdthqltt.dto.stats.BaoCaoThongKeResponse;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/** #99 — ghi một báo cáo thống kê RP-0x ra tệp .xlsx: tiêu đề, bảng chính, phần tổng hợp, ghi chú. */
@Component
public class XuatBaoCaoExcel {

    private static final DateTimeFormatter NGAY_GIO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int RONG_TOI_THIEU = 8;
    private static final int RONG_TOI_DA = 60;

    public byte[] xuat(BaoCaoThongKeResponse b) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet(b.maBaoCao());
            KieuO k = new KieuO(wb);
            int soCot = Math.max(b.cot().size(), 2);
            int[] doRong = new int[soCot];

            int r = 0;
            Cell tieuDe = sh.createRow(r).createCell(0);
            tieuDe.setCellValue(b.maBaoCao() + " — " + b.tenBaoCao().toUpperCase());
            tieuDe.setCellStyle(k.tieuDe);
            sh.addMergedRegion(new CellRangeAddress(r, r, 0, soCot - 1));
            r++;
            sh.createRow(r++).createCell(0).setCellValue("Đợt thực tập: " + b.maDot() + " — " + b.tenDot());
            sh.createRow(r++).createCell(0).setCellValue("Thời điểm lập: " + b.thoiDiemLap().format(NGAY_GIO));
            r++;

            Row hang = sh.createRow(r++);
            for (int c = 0; c < b.cot().size(); c++) {
                ghi(hang.createCell(c), b.cot().get(c), k.dauBang);
                doRong[c] = Math.max(doRong[c], b.cot().get(c).length());
            }
            sh.createFreezePane(0, r);
            if (b.dong().isEmpty()) {
                Cell o = sh.createRow(r).createCell(0);
                o.setCellValue("Không có dữ liệu");
                o.setCellStyle(k.nghieng);
                r++;
            }
            for (List<Object> dong : b.dong()) {
                Row row = sh.createRow(r++);
                for (int c = 0; c < dong.size(); c++) {
                    Object v = dong.get(c);
                    ghi(row.createCell(c), v, v instanceof BigDecimal ? k.soThapPhan : v instanceof Number ? k.soNguyen : k.chu);
                    if (c < soCot) {
                        doRong[c] = Math.max(doRong[c], doDai(v));
                    }
                }
            }

            r++;
            Cell th = sh.createRow(r++).createCell(0);
            th.setCellValue("TỔNG HỢP");
            th.setCellStyle(k.dam);
            for (Map.Entry<String, Object> e : b.tongHop().entrySet()) {
                // Nhãn tổng hợp nằm ở cột A, giá trị ở cột B: cột A phải đủ rộng để nhãn không bị che.
                doRong[0] = Math.max(doRong[0], e.getKey().length());
                if (e.getValue() instanceof Collection<?> ds) {
                    Row row = sh.createRow(r++);
                    ghi(row.createCell(0), e.getKey() + " (" + ds.size() + ")", k.dam);
                    for (Object muc : ds) {
                        sh.createRow(r++).createCell(1).setCellValue("• " + muc);
                    }
                    continue;
                }
                Row row = sh.createRow(r++);
                ghi(row.createCell(0), e.getKey(), k.dam);
                Object v = e.getValue();
                ghi(row.createCell(1), v == null ? "Chưa có dữ liệu" : v,
                        v instanceof BigDecimal ? k.soThapPhanTrai : v instanceof Number ? k.soNguyenTrai : null);
            }

            r++;
            Cell gc = sh.createRow(r++).createCell(0);
            gc.setCellValue("Ghi chú");
            gc.setCellStyle(k.nghieng);
            for (String s : b.ghiChu()) {
                sh.createRow(r++).createCell(0).setCellValue("- " + s);
            }

            // Đặt độ rộng thủ công thay vì autoSizeColumn (cần AWT/font hệ thống, dễ lỗi trên máy chủ không giao diện).
            for (int c = 0; c < soCot; c++) {
                int rong = Math.min(RONG_TOI_DA, Math.max(RONG_TOI_THIEU, doRong[c] + 2));
                sh.setColumnWidth(c, rong * 256);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không tạo được tệp Excel " + b.maBaoCao());
        }
    }

    private static void ghi(Cell o, Object v, CellStyle kieu) {
        switch (v) {
            case null -> o.setBlank();
            // Ô Excel chỉ lưu số thực; điểm đã được tính và làm tròn bằng BigDecimal ở service, đây chỉ là hiển thị.
            case BigDecimal bd -> o.setCellValue(bd.doubleValue());
            case Number n -> o.setCellValue(n.longValue());
            default -> o.setCellValue(v.toString());
        }
        if (kieu != null) {
            o.setCellStyle(kieu);
        }
    }

    private static int doDai(Object v) {
        if (v == null) {
            return 0;
        }
        return v instanceof BigDecimal bd ? bd.toPlainString().length() : v.toString().length();
    }

    /** Các kiểu ô dùng chung — tạo một lần mỗi tệp (Excel giới hạn số kiểu ô trong một workbook). */
    private static final class KieuO {
        final CellStyle tieuDe;
        final CellStyle dauBang;
        final CellStyle chu;
        final CellStyle soNguyen;
        final CellStyle soThapPhan;
        final CellStyle soNguyenTrai;
        final CellStyle soThapPhanTrai;
        final CellStyle dam;
        final CellStyle nghieng;

        KieuO(Workbook wb) {
            DataFormat df = wb.createDataFormat();
            Font fTieuDe = wb.createFont();
            fTieuDe.setBold(true);
            fTieuDe.setFontHeightInPoints((short) 14);
            Font fDam = wb.createFont();
            fDam.setBold(true);
            Font fNghieng = wb.createFont();
            fNghieng.setItalic(true);

            tieuDe = wb.createCellStyle();
            tieuDe.setFont(fTieuDe);
            tieuDe.setAlignment(HorizontalAlignment.CENTER);

            dauBang = vien(wb);
            dauBang.setFont(fDam);
            dauBang.setAlignment(HorizontalAlignment.CENTER);
            dauBang.setVerticalAlignment(VerticalAlignment.CENTER);
            dauBang.setWrapText(true);
            dauBang.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            dauBang.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            chu = vien(wb);
            chu.setVerticalAlignment(VerticalAlignment.TOP);

            soNguyen = vien(wb);
            soNguyen.setDataFormat(df.getFormat("0"));

            soThapPhan = vien(wb);
            soThapPhan.setDataFormat(df.getFormat("0.0#"));

            soNguyenTrai = wb.createCellStyle();
            soNguyenTrai.setDataFormat(df.getFormat("0"));
            soNguyenTrai.setAlignment(HorizontalAlignment.LEFT);

            soThapPhanTrai = wb.createCellStyle();
            soThapPhanTrai.setDataFormat(df.getFormat("0.0#"));
            soThapPhanTrai.setAlignment(HorizontalAlignment.LEFT);

            dam = wb.createCellStyle();
            dam.setFont(fDam);

            nghieng = wb.createCellStyle();
            nghieng.setFont(fNghieng);
        }

        private static CellStyle vien(Workbook wb) {
            CellStyle s = wb.createCellStyle();
            s.setBorderTop(BorderStyle.THIN);
            s.setBorderBottom(BorderStyle.THIN);
            s.setBorderLeft(BorderStyle.THIN);
            s.setBorderRight(BorderStyle.THIN);
            return s;
        }
    }
}
