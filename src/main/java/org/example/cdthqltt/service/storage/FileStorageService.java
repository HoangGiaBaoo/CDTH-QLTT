package org.example.cdthqltt.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.example.cdthqltt.common.BusinessException;
import org.example.cdthqltt.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Lưu và tải tệp minh chứng / báo cáo (CBR-24).
 * Tệp lưu dưới tên UUID trong thư mục theo hồ sơ; không bao giờ ghép đường dẫn từ tên tệp người dùng gửi.
 */
@Slf4j
@Service
public class FileStorageService {

    /** CBR-24: giới hạn 20 MB mỗi tệp (multipart cũng chặn sớm ở cùng ngưỡng). */
    public static final long KICH_THUOC_TOI_DA = 20L * 1024 * 1024;

    public static final Set<String> DUOI_BAO_CAO = Set.of("pdf", "docx");
    /** #66 (CBR-24): pdf, doc, docx, xls, xlsx, jpg, png, mp4. */
    public static final Set<String> DUOI_MINH_CHUNG = Set.of("pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "mp4");

    private static final Map<String, Set<String>> CONTENT_TYPE_HOP_LE = Map.of(
            "pdf", Set.of("application/pdf"),
            "docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            "doc", Set.of("application/msword"),
            "xls", Set.of("application/vnd.ms-excel"),
            "xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            "jpg", Set.of("image/jpeg"),
            "jpeg", Set.of("image/jpeg"),
            "png", Set.of("image/png"),
            "mp4", Set.of("video/mp4"));

    private final Path thuMucGoc;

    public FileStorageService(@Value("${app.storage.dir:./uploads}") String thuMuc) {
        this.thuMucGoc = Path.of(thuMuc).toAbsolutePath().normalize();
    }

    public record TepDaLuu(String tenFile, String duongDan, long kichThuoc) {
    }

    public TepDaLuu luu(MultipartFile tep, Long hoSoId, Set<String> duoiChoPhep) {
        if (tep == null || tep.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Chưa chọn tệp hoặc tệp rỗng");
        }
        if (tep.getSize() > KICH_THUOC_TOI_DA) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE, "Tệp vượt quá 20 MB (CBR-24)");
        }
        String tenGoc = tenAnToan(tep.getOriginalFilename());
        String duoi = layDuoi(tenGoc);
        if (!duoiChoPhep.contains(duoi)) {
            throw new BusinessException(ErrorCode.UNSUPPORTED_FILE_TYPE,
                    "Định dạng tệp không được hỗ trợ, chỉ nhận: " + String.join(", ", duoiChoPhep.stream().sorted().toList()));
        }
        String contentType = tep.getContentType() == null ? "" : tep.getContentType().toLowerCase(Locale.ROOT);
        if (!CONTENT_TYPE_HOP_LE.getOrDefault(duoi, Set.of()).contains(contentType)) {
            throw new BusinessException(ErrorCode.UNSUPPORTED_FILE_TYPE,
                    "Nội dung tệp không khớp với đuôi ." + duoi);
        }

        String duongDanTuongDoi = hoSoId + "/" + UUID.randomUUID() + "." + duoi;
        Path dich = thuMucGoc.resolve(duongDanTuongDoi).normalize();
        try (InputStream in = tep.getInputStream()) {
            Files.createDirectories(dich.getParent());
            Files.copy(in, dich, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Không lưu được tệp {}", dich, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không lưu được tệp, vui lòng thử lại");
        }
        return new TepDaLuu(tenGoc, duongDanTuongDoi, tep.getSize());
    }

    /** Trả tệp kèm header tải về; tên tiếng Việt mã hóa theo RFC 5987. Chỉ gọi sau khi đã kiểm quyền. */
    public ResponseEntity<Resource> taiVe(String duongDanTuongDoi, String tenFile) {
        Path tep = thuMucGoc.resolve(duongDanTuongDoi).normalize();
        if (!tep.startsWith(thuMucGoc) || !Files.isRegularFile(tep)) {
            throw BusinessException.khongTimThay("tệp");
        }
        try {
            Resource resource = new UrlResource(tep.toUri());
            String contentType = Files.probeContentType(tep);
            return ResponseEntity.ok()
                    .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                            .filename(tenFile, StandardCharsets.UTF_8).build().toString())
                    .body(resource);
        } catch (MalformedURLException e) {
            throw BusinessException.khongTimThay("tệp");
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không đọc được tệp");
        }
    }

    public void xoa(String duongDanTuongDoi) {
        Path tep = thuMucGoc.resolve(duongDanTuongDoi).normalize();
        if (!tep.startsWith(thuMucGoc)) {
            return;
        }
        try {
            Files.deleteIfExists(tep);
        } catch (IOException e) {
            log.warn("Không xóa được tệp {}", tep, e);
        }
    }

    private static String tenAnToan(String tenGoc) {
        if (tenGoc == null || tenGoc.isBlank()) {
            return "tep";
        }
        // Bỏ phần thư mục nếu trình duyệt gửi kèm (IE gửi cả C:\...), chỉ giữ tên để lưu vào cột ten_file.
        String ten = tenGoc.replace('\\', '/');
        ten = ten.substring(ten.lastIndexOf('/') + 1);
        return ten.length() > 255 ? ten.substring(ten.length() - 255) : ten;
    }

    private static String layDuoi(String ten) {
        int i = ten.lastIndexOf('.');
        return i < 0 ? "" : ten.substring(i + 1).toLowerCase(Locale.ROOT);
    }
}
