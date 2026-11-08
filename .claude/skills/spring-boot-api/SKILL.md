---
name: spring-boot-api
description: Mẫu code backend RESTful cho QLTT trên Spring Boot 4 / Java 21 — cấu hình pom và application.yml, Flyway + MySQL 8, ApiResponse và 15 mã lỗi với GlobalExceptionHandler, Spring Security JWT stateless + @PreAuthorize bốn vai trò + CurrentUser, entity JPA ánh xạ bảng tiếng Việt, repository, service có kiểm quyền sở hữu và giao dịch, controller, upload tệp, scheduler mở chặng, xuất Excel/Word bằng Apache POI. Nạp skill này khi tạo hoặc sửa entity, repository, service, controller, DTO, cấu hình bảo mật, migration, hoặc khi ứng dụng không khởi động.
---

# Spring Boot API cho QLTT

## 0. Lưu ý Spring Boot 4 (repo đang dùng 4.1.1) — ví dụ trên mạng phần lớn còn là Boot 3

| Chủ đề | Boot 4 | Đừng chép từ Boot 3 |
|---|---|---|
| Starter web | `spring-boot-starter-webmvc` | `spring-boot-starter-web` (tên cũ, bị khai tử dần) |
| Flyway | `spring-boot-starter-flyway` **+** `org.flywaydb:flyway-mysql` | chỉ thêm `flyway-core` thì auto-config không chạy |
| JSON | Jackson **3**: `tools.jackson.databind.json.JsonMapper`; annotation vẫn `com.fasterxml.jackson.annotation.*` | `com.fasterxml.jackson.databind.ObjectMapper` (Jackson 2 — Boot 4 không tự cấu hình nữa) |
| OpenAPI | `org.springdoc:springdoc-openapi-starter-webmvc-ui` **3.x** | springdoc 2.x (chỉ cho Boot 3) |
| Test | starter test theo module (`spring-boot-starter-webmvc-test`…), `@MockitoBean` | `@MockBean` (đã bỏ) |
| Security | Spring Security 7, chỉ lambda DSL, `requestMatchers(...)` | `antMatchers`, `.and()` |

Trước khi thêm dependency, kiểm bản mới nhất tương thích Boot 4 trên Maven Central. Lombok, MySQL driver,
Hibernate do Boot quản lý phiên bản — **không ghi `<version>`** cho chúng.

## 1. `pom.xml` — dependency cần có

```xml
spring-boot-starter-webmvc · spring-boot-starter-data-jpa · spring-boot-starter-security
spring-boot-starter-validation · spring-boot-starter-flyway · org.flywaydb:flyway-mysql
com.mysql:mysql-connector-j (runtime) · org.projectlombok:lombok (optional)
org.springdoc:springdoc-openapi-starter-webmvc-ui (3.x)
io.jsonwebtoken:jjwt-api + jjwt-impl + jjwt-jackson (0.12.x, impl/jackson scope runtime)
org.apache.poi:poi-ooxml (tuần 5, xuất Excel/Word)
spring-boot-starter-test · spring-security-test (test)
```

Lombok trên JDK ≥ 21: giữ `annotationProcessorPaths` cho lombok trong `maven-compiler-plugin`, xóa là getter im lặng biến mất.

## 2. `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/qltt?useUnicode=true&characterEncoding=UTF-8&connectionTimeZone=Asia/Ho_Chi_Minh&forceConnectionTimeZoneToSession=true
    username: ${DB_USER:qltt}
    password: ${DB_PASSWORD:qltt}
  jpa:
    hibernate.ddl-auto: validate      # schema do Flyway quan ly
    open-in-view: false
    properties.hibernate.jdbc.time_zone: Asia/Ho_Chi_Minh
  flyway.enabled: true
  servlet.multipart: { max-file-size: 20MB, max-request-size: 21MB }
app:
  jwt: { secret: ${JWT_SECRET:doi-chuoi-nay-dai-it-nhat-32-ky-tu-cho-hs256}, expiration-hours: 8 }
  storage.dir: ${STORAGE_DIR:./uploads}
  cors.allowed-origin: http://localhost:5173
springdoc.swagger-ui.enabled: false   # bat trong application-dev.yml
```

## 3. `common/` — response và lỗi chuẩn

```java
public record ApiResponse<T>(boolean success, String code, String message, T data, List<LoiTruong> errors) {
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "OK", null, data, null); }
    public static <T> ApiResponse<T> ok(T data, String message) { return new ApiResponse<>(true, "OK", message, data, null); }
    public static ApiResponse<Void> loi(ErrorCode c, String msg, List<LoiTruong> errors) { return new ApiResponse<>(false, c.name(), msg, null, errors); }
}
public record LoiTruong(String truong, String thongDiep) {}
public record PageResponse<T>(List<T> items, int page, int size, long total) {}   // mac dinh size = 15

@Getter @RequiredArgsConstructor
public enum ErrorCode {
    VALIDATION_ERROR(400), BUSINESS_RULE_VIOLATION(400), UNAUTHORIZED(401), ACCESS_DENIED(403),
    RESOURCE_NOT_FOUND(404), DUPLICATE_RESOURCE(409), RESOURCE_IN_USE(409), RESOURCE_LOCKED(409),
    QUOTA_EXCEEDED(409), THIEU_PHIEU_DVHD(409), THIEU_PHIEU_GVHD(409), CLO_CHUA_DUOC_DANH_GIA(409),
    FILE_TOO_LARGE(413), UNSUPPORTED_FILE_TYPE(415), INTERNAL_ERROR(500);
    private final int httpStatus;
}

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode code;
    public BusinessException(ErrorCode code, String message) { super(message); this.code = code; }
}
```

`GlobalExceptionHandler` (`@RestControllerAdvice`) ánh xạ:
`BusinessException` → mã của nó · `MethodArgumentNotValidException` / `ConstraintViolationException` → `VALIDATION_ERROR` + danh sách `LoiTruong` ·
`AccessDeniedException` (gồm `AuthorizationDeniedException` từ `@PreAuthorize`) → `ACCESS_DENIED` ·
`MaxUploadSizeExceededException` → `FILE_TOO_LARGE` · `DataIntegrityViolationException` → `DUPLICATE_RESOURCE` (lỗi UNIQUE lọt qua kiểm trước) ·
`Exception` → `INTERNAL_ERROR` + `log.error` (không trả stacktrace ra ngoài).
401/403 xảy ra **trong filter** không đi qua advice → cấu hình `AuthenticationEntryPoint` và `AccessDeniedHandler` ghi cùng JSON.

## 4. Bảo mật JWT

```java
public record CurrentUser(Long nguoiDungId, VaiTro vaiTro, Long sinhVienId, Long giangVienId, Long canBoDvhdId) {}

@Configuration @EnableMethodSecurity @RequiredArgsConstructor
public class SecurityConfig {
    @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http.csrf(c -> c.disable())                       // API stateless dung JWT, khong cookie
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()   // chi bat o dev
                .anyRequest().authenticated())
            .exceptionHandling(e -> e.authenticationEntryPoint(entryPoint).accessDeniedHandler(deniedHandler))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

`JwtAuthFilter` (`OncePerRequestFilter`): đọc `Authorization: Bearer` → `JwtService.parse` → nạp `NguoiDung`,
**từ chối nếu `VO_HIEU_HOA`** → dựng `CurrentUser` (kèm id hồ sơ mở rộng) → `UsernamePasswordAuthenticationToken(currentUser, null, List.of(new SimpleGrantedAuthority("ROLE_" + vaiTro)))`.
`SecurityUtils.currentUser()` lấy principal ra. Đăng nhập: sai ⇒ `so_lan_sai++`, đến 5 ⇒ `khoa_den = now + 15'`; đúng ⇒ reset.

Controller: `@PreAuthorize("hasRole('ADMIN')")`, `@PreAuthorize("hasAnyRole('GIANG_VIEN','CAN_BO_DVHD')")`.

## 5. Entity — ánh xạ đúng tên bảng thiết kế

```java
@Entity @Table(name = "ho_so_thuc_tap",
    uniqueConstraints = @UniqueConstraint(columnNames = {"sinh_vien_id", "dot_id"}))   // CBR-01
@Getter @Setter @NoArgsConstructor
public class HoSoThucTap {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "sinh_vien_id") private SinhVien sinhVien;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "dot_id") private DotThucTap dot;
    @Enumerated(EnumType.STRING) @Column(name = "hinh_thuc_thuc_tap", nullable = false) private HinhThucThucTap hinhThucThucTap;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "can_bo_dvhd_id") private CanBoDvhd canBoDvhd;
    @Enumerated(EnumType.STRING) @Column(name = "trang_thai", nullable = false) private TrangThaiHoSo trangThai = TrangThaiHoSo.NHAP;
    @Column(name = "ly_do_tu_choi", length = 500) private String lyDoTuChoi;
    @Column(name = "ngay_gui") private LocalDateTime ngayGui;
    // ...
}
```

- `@ManyToOne(fetch = LAZY)` mọi nơi; tránh `@OneToMany` hai chiều trừ khi thật cần (ví dụ `PhieuDanhGia → List<DiemCloChiTiet>` cascade).
- Không `@Data` trên entity (equals/hashCode + lazy = lỗi khó tìm); dùng `@Getter @Setter`.
- Điểm: `@Column(precision = 4, scale = 2) private BigDecimal diem;`
- Cột ENUM của MySQL: `ddl-auto=validate` có thể kêu lệch kiểu — thêm `@JdbcTypeCode(SqlTypes.ENUM)` hoặc `columnDefinition` khớp schema.
- Bảng khóa ghép `to_danh_gia_ho_so`: `@EmbeddedId` hoặc `@ManyToMany @JoinTable` từ `ToDanhGia`.

## 6. Service — khuôn chuẩn cho một thao tác ghi

```java
@Service @RequiredArgsConstructor
public class HoSoThucTapService {
    @Transactional
    public HoSoResponse guiDangKy(Long hoSoId) {
        CurrentUser u = SecurityUtils.currentUser();
        HoSoThucTap hs = layVaKiemQuyen(hoSoId, u);                         // 1. quyen + ton tai
        if (hs.getTrangThai() != TrangThaiHoSo.NHAP)                        // 2. trang thai
            throw new BusinessException(ErrorCode.RESOURCE_LOCKED, "Hồ sơ đã gửi, không gửi lại được");
        if (hs.getHinhThucThucTap() == HinhThucThucTap.QUOC_TE && hs.getSoTuanThamGia() < 6)   // 3. quy tac
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                "Thực tập quốc tế phải từ 6 tuần trở lên (Điều 4 khoản 6)");
        long dangHuongDan = hoSoRepo.demHoSoHieuLucCuaCanBo(hs.getCanBoDvhd().getId(), hs.getDot().getId());
        if (dangHuongDan >= hs.getCanBoDvhd().getSoSvToiDa())               // han muc doc tu DB, khong viet cung 5
            throw new BusinessException(ErrorCode.QUOTA_EXCEEDED,
                "Cán bộ đã nhận đủ sinh viên, vui lòng chọn cán bộ khác (Điều 7 khoản 2 điểm c)");
        hs.setTrangThai(TrangThaiHoSo.CHO_DVHD);
        hs.setNgayGui(LocalDateTime.now());
        thongBaoService.gui("NT-01", List.of(hs.getCanBoDvhd().getNguoiDung().getId()), "...", "/records/" + hs.getId());
        return HoSoMapper.toResponse(hs);
    }
}
```

Thứ tự kiểm theo đặc tả: **quyền → tồn tại → trạng thái → dữ liệu**. Đếm hạn mức bằng truy vấn `count`, không cột đếm.
Thao tác hàng loạt (UC05): kiểm **toàn bộ lô trước**, chỉ ghi khi tất cả hợp lệ; ném lỗi giữa chừng thì `@Transactional` rollback.

## 7. Controller — mỏng

```java
@RestController @RequestMapping("/api/internship_records") @RequiredArgsConstructor
public class HoSoThucTapController {
    @PutMapping("/{recordId}/submit") @PreAuthorize("hasRole('SINH_VIEN')")
    public ApiResponse<HoSoResponse> submit(@PathVariable Long recordId) {
        return ApiResponse.ok(hoSoService.guiDangKy(recordId), "Đã gửi đăng ký");
    }
}
```

URL đúng từng ký tự như `docs/02-api.md` (snake_case: `/host_organizations`, `/change_password`).
JSON request/response là `record` trong `dto/<module>/` có `@NotNull`, `@Size`, `@DecimalMin`… và `@Valid` ở controller.

## 8. Upload / tải tệp (B)

`FileStorageService.luu(MultipartFile f, Long hoSoId, Set<String> duoiChoPhep)`: kiểm rỗng → kích thước ≤ 20 MB
→ đuôi (chữ thường) trong danh sách + content-type khớp → lưu `storageDir/{hoSoId}/{UUID}.{duoi}` → trả đường dẫn
tương đối. Tải về: `ResponseEntity<Resource>` với `Content-Disposition: attachment; filename*=UTF-8''...` (tên tiếng Việt).

## 9. Scheduler mở chặng (A)

```java
@Scheduled(cron = "0 5 0 * * *", zone = "Asia/Ho_Chi_Minh")    // 00:05 moi ngay
public void moChangDenHan() { ... }   // chang 1: ngay_mo <= hom nay && CHUA_MO -> DANG_MO + NT-10
```
Thêm `@EnableScheduling`. Hàm phải **idempotent** (chạy 2 lần không mở 2 lần). Endpoint #32 gọi cùng logic để mở tay khi demo.

## 10. Migration

`src/main/resources/db/migration/V{n}__mo_ta.sql`. Đã merge thì **không sửa**, chỉ thêm file mới.
Seed BCrypt: sinh hash một lần bằng `new BCryptPasswordEncoder().encode("Abc@12345")`, dán chuỗi vào SQL, ghi chú mật khẩu gốc.

## 11. Lỗi khởi động hay gặp

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| `Schema-validation: wrong column type` | Kiểu entity ≠ schema (ENUM, DECIMAL precision, TINYINT↔Integer) |
| `Schema-validation: missing table` | Flyway không chạy: thiếu `spring-boot-starter-flyway` hoặc `flyway-mysql` |
| Getter không tồn tại khi biên dịch | Lombok mất `annotationProcessorPaths` |
| `LazyInitializationException` | Map DTO ngoài giao dịch (`open-in-view: false`) — map trong service hoặc dùng `JOIN FETCH` |
| 403 mọi request dù token đúng | Authority thiếu tiền tố `ROLE_` khi dùng `hasRole` |
| Tiếng Việt thành `???` | DB/bảng không `utf8mb4` hoặc thiếu tham số URL |
