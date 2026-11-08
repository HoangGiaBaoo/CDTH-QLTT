# Thiết kế cơ sở dữ liệu — 28 bảng (MySQL 8, utf8mb4)

> Sinh tự động từ `docs/tai-lieu-goc/QLTT-ThietKe-API-CSDL.xlsx` (sheet *Cơ sở dữ liệu*). Sửa thiết kế thì sửa file Excel rồi sinh lại, **không sửa tay file này**.
> Tên bảng/cột giữ nguyên tiếng Việt không dấu như thiết kế; entity Java ánh xạ qua `@Table`/`@Column` (xem `.claude/rules/quy-tac-code.md`).


## NHÓM 1 — NGƯỜI DÙNG VÀ DANH MỤC


### 1. Bảng nguoi_dung (Người dùng)

Lưu tài khoản đăng nhập của mọi người dùng thuộc bốn vai trò: giáo vụ Khoa (ADMIN), giảng viên, cán bộ hướng dẫn tại ĐVHD và sinh viên.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ten_dang_nhap` | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập, duy nhất toàn hệ thống. |
| `mat_khau_hash` | VARCHAR(100) | NOT NULL | Mật khẩu đã băm bằng BCrypt. |
| `ho_ten` | VARCHAR(100) | NOT NULL | Họ và tên đầy đủ. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Địa chỉ email, duy nhất toàn hệ thống. |
| `dien_thoai` | VARCHAR(20) | NULL | Số điện thoại liên hệ. |
| `vai_tro` | ENUM('ADMIN','GIANG_VIEN','CAN_BO_DVHD','SINH_VIEN') | NOT NULL | Vai trò người dùng trong hệ thống. |
| `trang_thai` | ENUM('HOAT_DONG','VO_HIEU_HOA') | NOT NULL, DEFAULT 'HOAT_DONG' | Trạng thái tài khoản (hoạt động / vô hiệu hóa). Không xóa vật lý tài khoản đã phát sinh dữ liệu. |
| `so_lan_sai` | INT | NOT NULL, DEFAULT 0 | Số lần nhập sai mật khẩu liên tiếp. |
| `khoa_den` | DATETIME | NULL | Thời điểm hết khóa tạm do sai mật khẩu 5 lần (khóa 15 phút). |
| `ngay_tao` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo tài khoản. |

### 2. Bảng don_vi_huong_dan (Đơn vị hướng dẫn thực tập)

Danh mục đơn vị tiếp nhận và hướng dẫn thực tập (ĐVHD) kèm quy trình phê duyệt bốn trạng thái. Chỉ đơn vị Đã duyệt mới được sinh viên chọn.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ma_dvhd` | VARCHAR(30) | UNIQUE, NOT NULL | Mã đơn vị, duy nhất. |
| `ten` | VARCHAR(200) | NOT NULL | Tên đơn vị. |
| `dia_chi` | VARCHAR(300) | NOT NULL | Địa chỉ đơn vị. |
| `linh_vuc` | VARCHAR(200) | NOT NULL | Lĩnh vực hoạt động. |
| `nguoi_dai_dien` | VARCHAR(100) | NOT NULL | Người đại diện đơn vị. |
| `dien_thoai` | VARCHAR(20) | NULL | Điện thoại liên hệ. |
| `email` | VARCHAR(100) | NULL | Email liên hệ. |
| `trang_thai_phe_duyet` | ENUM('CHO_DUYET','DA_DUYET','TU_CHOI','DA_LOAI') | NOT NULL, DEFAULT 'CHO_DUYET' | Trạng thái phê duyệt: Chờ duyệt, Đã duyệt, Từ chối, Đã loại. Chỉ Đã duyệt mới hiển thị cho sinh viên (CBR-02). |
| `ly_do` | VARCHAR(500) | NULL | Lý do từ chối hoặc loại khỏi danh mục. |
| `ngay_phe_duyet` | DATE | NULL | Ngày đổi trạng thái phê duyệt gần nhất. |
| `nguoi_phe_duyet_id` | BIGINT | FOREIGN KEY (nguoi_dung), NULL | Khóa ngoại tới nguoi_dung: người thực hiện phê duyệt. |
| `da_xoa` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ xóa mềm (CBR-22). |

### 3. Bảng sinh_vien (Sinh viên)

Thông tin mở rộng của tài khoản vai trò SINH_VIEN, quan hệ 1-1 với nguoi_dung. Trường chương trình đào tạo quyết định ngưỡng đạt CLO.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `nguoi_dung_id` | BIGINT | FOREIGN KEY (nguoi_dung), UNIQUE, NOT NULL | Khóa ngoại 1-1 tới nguoi_dung. |
| `ma_sv` | VARCHAR(20) | UNIQUE, NOT NULL | Mã sinh viên, duy nhất. |
| `lop` | VARCHAR(30) | NULL | Lớp. |
| `khoa_hoc` | VARCHAR(20) | NULL | Khóa học. |
| `nganh` | VARCHAR(100) | NULL | Ngành đào tạo. |
| `khoa_vien` | VARCHAR(100) | NULL | Khoa/Viện quản lý. |
| `chuong_trinh_dao_tao` | ENUM('CHUAN','CLC_STEM') | NOT NULL, DEFAULT 'CHUAN' | Chương trình đào tạo; quyết định ngưỡng đạt CLO: Mức 1 với CHUAN, Mức 2 với CLC_STEM (CBR-19). |

### 4. Bảng giang_vien (Giảng viên)

Thông tin mở rộng của tài khoản vai trò GIANG_VIEN, quan hệ 1-1 với nguoi_dung, kèm hạn mức số sinh viên được phụ trách.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `nguoi_dung_id` | BIGINT | FOREIGN KEY (nguoi_dung), UNIQUE, NOT NULL | Khóa ngoại 1-1 tới nguoi_dung. |
| `ma_gv` | VARCHAR(20) | UNIQUE, NOT NULL | Mã giảng viên, duy nhất. |
| `bo_mon` | VARCHAR(100) | NULL | Bộ môn. |
| `khoa_vien` | VARCHAR(100) | NULL | Khoa/Viện. |
| `hoc_ham_hoc_vi` | VARCHAR(50) | NULL | Học hàm, học vị. |
| `so_sv_toi_da` | INT | NOT NULL, DEFAULT 8, CHECK (so_sv_toi_da BETWEEN 5 AND 10) | Hạn mức số sinh viên được phụ trách, từ 5 đến 10 (CBR-04). |

### 5. Bảng can_bo_dvhd (Cán bộ hướng dẫn tại ĐVHD)

Thông tin mở rộng của tài khoản vai trò CAN_BO_DVHD. Mỗi cán bộ thuộc đúng một ĐVHD, tối thiểu 3 năm kinh nghiệm, hướng dẫn không quá 5 sinh viên.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `nguoi_dung_id` | BIGINT | FOREIGN KEY (nguoi_dung), UNIQUE, NOT NULL | Khóa ngoại 1-1 tới nguoi_dung. |
| `don_vi_id` | BIGINT | FOREIGN KEY (don_vi_huong_dan), NOT NULL | Khóa ngoại tới don_vi_huong_dan: đơn vị công tác. |
| `chuc_vu` | VARCHAR(100) | NULL | Chức vụ tại đơn vị. |
| `so_nam_kinh_nghiem` | INT | NOT NULL, CHECK (so_nam_kinh_nghiem >= 3) | Số năm kinh nghiệm, tối thiểu 3 (CBR-05). |
| `so_sv_toi_da` | INT | NOT NULL, DEFAULT 5 | Hạn mức số sinh viên hướng dẫn, mặc định 5 (CBR-03). |

## NHÓM 2 — TỔ CHỨC ĐỢT VÀ CHUẨN ĐẦU RA


### 6. Bảng dot_thuc_tap (Đợt thực tập)

Một đợt TTTN theo học kỳ, năm học và Khoa/Viện. Khi tạo đợt, hệ thống sinh kèm chặng đánh giá, CLO, rubric và bộ câu hỏi riêng cho đợt.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ma_dot` | VARCHAR(30) | UNIQUE, NOT NULL | Mã đợt, duy nhất. |
| `ten` | VARCHAR(200) | NOT NULL | Tên đợt. |
| `hoc_ky` | VARCHAR(10) | NOT NULL | Học kỳ. |
| `nam_hoc` | VARCHAR(20) | NOT NULL | Năm học. |
| `khoa_vien` | VARCHAR(100) | NULL | Khoa/Viện tổ chức. |
| `ngay_bat_dau` | DATE | NOT NULL | Ngày bắt đầu thực tập. |
| `ngay_ket_thuc` | DATE | NOT NULL | Ngày kết thúc thực tập, phải sau ngày bắt đầu. |
| `so_tuan` | INT | NOT NULL, DEFAULT 8 | Số tuần thực tập, mặc định 8 (Điều 5 khoản 1). |
| `han_nop_bao_cao` | DATE | NULL | Hạn nộp báo cáo TTTN-06. |
| `trang_thai` | ENUM('KHOI_TAO','DANG_NHAN_DANG_KY','DANG_THUC_HIEN','DA_KET_THUC') | NOT NULL, DEFAULT 'KHOI_TAO' | Trạng thái đợt: Khởi tạo, Đang nhận đăng ký, Đang thực hiện, Đã kết thúc. |

*Ràng buộc mức bảng: CHECK (ngay_ket_thuc > ngay_bat_dau)*

### 7. Bảng chang_danh_gia (Chặng đánh giá)

Mỗi đợt có đúng hai chặng: chặng 1 tuần 4 trọng số 30%, chặng 2 tuần 8 trọng số 70% (Điều 11 khoản 4).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `dot_id` | BIGINT | FOREIGN KEY (dot_thuc_tap), NOT NULL | Khóa ngoại tới dot_thuc_tap. |
| `thu_tu` | TINYINT | NOT NULL, CHECK (thu_tu IN (1,2)) | Thứ tự chặng, chỉ nhận 1 hoặc 2 (CBR-06). |
| `ten` | VARCHAR(100) | NOT NULL | Tên chặng. |
| `tuan_thuc_hien` | INT | NOT NULL | Tuần thực hiện đánh giá (4 và 8). |
| `trong_so_w` | DECIMAL(4,3) | NOT NULL | Trọng số chặng: 0,300 và 0,700. |
| `ngay_mo` | DATE | NULL | Ngày mở chặng. |
| `ngay_dong` | DATE | NULL | Ngày đóng chặng. |
| `trang_thai` | ENUM('CHUA_MO','DANG_MO','DA_DONG','DA_TONG_HOP') | NOT NULL, DEFAULT 'CHUA_MO' | Trạng thái chặng: Chưa mở, Đang mở, Đã đóng, Đã tổng hợp. |

*Ràng buộc mức bảng: UNIQUE (dot_id, thu_tu)*

### 8. Bảng chuan_dau_ra (Chuẩn đầu ra học phần (CLO))

Bảy CLO của đợt kèm trọng số đóng góp vào điểm học phần và tỷ lệ đồng chấm giữa ĐVHD và GVHD (Điều 14 khoản 3).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `dot_id` | BIGINT | FOREIGN KEY (dot_thuc_tap), NOT NULL | Khóa ngoại tới dot_thuc_tap. |
| `ma_clo` | VARCHAR(10) | NOT NULL | Mã CLO (CLO1 đến CLO7). |
| `ten` | VARCHAR(200) | NOT NULL | Tên chuẩn đầu ra. |
| `mo_ta` | TEXT | NULL | Mô tả chuẩn đầu ra. |
| `trong_so_alpha` | DECIMAL(5,2) | NOT NULL | Trọng số đóng góp vào điểm học phần (%); tổng 7 CLO bằng 100 (CBR-07). |
| `ty_le_dvhd` | DECIMAL(5,2) | NOT NULL | Tỷ lệ chấm của nhóm ĐVHD (%). |
| `ty_le_gvhd` | DECIMAL(5,2) | NOT NULL | Tỷ lệ chấm của nhóm GVHD (%); cộng ty_le_dvhd bằng 100 (CBR-08). |

*Ràng buộc mức bảng: CHECK (ty_le_dvhd + ty_le_gvhd = 100); UNIQUE (dot_id, ma_clo)*

### 9. Bảng muc_rubric (Mức rubric)

Năm mức đánh giá (0 đến 4) của từng CLO với khoảng điểm cố định và mô tả hành vi quan sát được (Điều 12, Điều 13).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `chuan_dau_ra_id` | BIGINT | FOREIGN KEY (chuan_dau_ra), NOT NULL | Khóa ngoại tới chuan_dau_ra. |
| `muc` | TINYINT | NOT NULL, CHECK (muc BETWEEN 0 AND 4) | Mức đạt từ 0 đến 4. |
| `diem_min` | DECIMAL(4,2) | NOT NULL | Điểm thấp nhất của mức (thang 10). |
| `diem_max` | DECIMAL(4,2) | NOT NULL | Điểm cao nhất của mức (thang 10). |
| `mo_ta_hanh_vi` | TEXT | NULL | Mô tả hành vi quan sát được; Khoa được sửa, không được đổi khoảng điểm. |

*Ràng buộc mức bảng: UNIQUE (chuan_dau_ra_id, muc)*

### 10. Bảng cau_hoi_danh_gia (Câu hỏi đánh giá)

Bộ câu hỏi của từng chặng, mỗi câu ánh xạ tới một CLO theo ma trận Phụ lục II-B.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `chang_id` | BIGINT | FOREIGN KEY (chang_danh_gia), NOT NULL | Khóa ngoại tới chang_danh_gia. |
| `chuan_dau_ra_id` | BIGINT | FOREIGN KEY (chuan_dau_ra), NOT NULL | Khóa ngoại tới chuan_dau_ra: CLO mà câu hỏi đo lường. |
| `thu_tu` | INT | NOT NULL | Thứ tự câu hỏi trong chặng. |
| `noi_dung` | VARCHAR(500) | NOT NULL | Nội dung câu hỏi. |

### 11. Bảng loai_minh_chung_bat_buoc (Loại minh chứng bắt buộc)

Danh mục minh chứng bắt buộc theo từng hình thức thực tập (Điều 4), dùng để đối chiếu Đủ / Thiếu trước khi chốt điểm.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `hinh_thuc_thuc_tap` | ENUM('DOANH_NGHIEP','NGHIEN_CUU','KHOI_NGHIEP','CONG_DONG','NOI_BO','QUOC_TE') | NOT NULL | Hình thức thực tập áp dụng (6 hình thức, Điều 4). |
| `loai_minh_chung` | VARCHAR(100) | NOT NULL | Tên loại minh chứng. |
| `bat_buoc` | BOOLEAN | NOT NULL, DEFAULT TRUE | Minh chứng có bắt buộc hay không. |

*Ràng buộc mức bảng: UNIQUE (hinh_thuc_thuc_tap, loai_minh_chung)*

## NHÓM 3 — QUÁ TRÌNH THỰC TẬP


### 12. Bảng ho_so_thuc_tap (Hồ sơ thực tập)

Bảng trung tâm: mỗi sinh viên trong một đợt có đúng một hồ sơ. Lưu nội dung phiếu đăng ký TTTN-01 và trạng thái vòng đời hồ sơ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `sinh_vien_id` | BIGINT | FOREIGN KEY (sinh_vien), NOT NULL | Khóa ngoại tới sinh_vien. |
| `dot_id` | BIGINT | FOREIGN KEY (dot_thuc_tap), NOT NULL | Khóa ngoại tới dot_thuc_tap. |
| `hinh_thuc_thuc_tap` | ENUM('DOANH_NGHIEP','NGHIEN_CUU','KHOI_NGHIEP','CONG_DONG','NOI_BO','QUOC_TE') | NOT NULL | Hình thức thực tập (6 hình thức, Điều 4). |
| `don_vi_id` | BIGINT | FOREIGN KEY (don_vi_huong_dan), NULL | Khóa ngoại tới don_vi_huong_dan: nơi thực tập. |
| `can_bo_dvhd_id` | BIGINT | FOREIGN KEY (can_bo_dvhd), NULL | Khóa ngoại tới can_bo_dvhd: cán bộ hướng dẫn trực tiếp. |
| `bo_phan` | VARCHAR(200) | NULL | Bộ phận làm việc tại đơn vị. |
| `de_tai` | VARCHAR(300) | NULL | Đề tài thực tập. |
| `hinh_thuc_lam_viec` | ENUM('TRUC_TIEP','TRUC_TUYEN') | NULL, DEFAULT 'TRUC_TIEP' | Làm việc trực tiếp hoặc trực tuyến. |
| `so_tuan_tham_gia` | INT | NULL | Số tuần tham gia; thực tập quốc tế tối thiểu 6 tuần (BR-04.4). |
| `muc_tieu` | TEXT | NULL | Mục tiêu chính. |
| `san_pham_du_kien` | TEXT | NULL | Sản phẩm dự kiến. |
| `trang_thai` | ENUM('NHAP','CHO_DVHD','CHO_GVHD','DANG_THUC_TAP','CHO_DANH_GIA','HOAN_THANH','KHONG_HOAN_THANH','GIAN_DOAN','TU_CHOI') | NOT NULL, DEFAULT 'NHAP' | Trạng thái hồ sơ: NHAP, CHO_DVHD, CHO_GVHD, DANG_THUC_TAP, CHO_DANH_GIA, HOAN_THANH, KHONG_HOAN_THANH, GIAN_DOAN, TU_CHOI. |
| `ly_do_tu_choi` | VARCHAR(500) | NULL | Lý do từ chối, bắt buộc khi từ chối. |
| `ngay_gui` | DATETIME | NULL | Thời điểm gửi đăng ký. |

*Ràng buộc mức bảng: UNIQUE (sinh_vien_id, dot_id)*

### 13. Bảng phan_cong_gvhd (Phân công GVHD)

Phân công giảng viên hướng dẫn cho từng hồ sơ; mỗi hồ sơ đúng một GVHD.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), UNIQUE, NOT NULL | Khóa ngoại tới ho_so_thuc_tap, duy nhất: mỗi hồ sơ một GVHD (BR-05.1). |
| `giang_vien_id` | BIGINT | FOREIGN KEY (giang_vien), NOT NULL | Khóa ngoại tới giang_vien. |
| `ngay_phan_cong` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm phân công. |
| `nguoi_phan_cong` | BIGINT | NULL | Mã người dùng (giáo vụ) thực hiện phân công. |
| `ly_do_thay_doi` | VARCHAR(500) | NULL | Lý do khi đổi GVHD. |

### 14. Bảng ke_hoach_hoc_tap (Kế hoạch học tập)

Kế hoạch học tập cá nhân theo mẫu TTTN-02 của một hồ sơ, kèm hai xác nhận ĐVHD và GVHD.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), UNIQUE, NOT NULL | Khóa ngoại 1-1 tới ho_so_thuc_tap. |
| `ngay_nop` | DATETIME | NULL | Thời điểm gửi xác nhận. |
| `nop_muon` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ nộp muộn quá 5 ngày làm việc (BR-06.3). |
| `xac_nhan_dvhd` | DATETIME | NULL | Thời điểm cán bộ ĐVHD xác nhận. |
| `xac_nhan_gvhd` | DATETIME | NULL | Thời điểm GVHD xác nhận. |
| `trang_thai` | ENUM('NHAP','CHO_XAC_NHAN','DA_KHOA') | NOT NULL, DEFAULT 'NHAP' | Trạng thái: Nháp, Chờ xác nhận, Đã khóa. |

### 15. Bảng muc_ke_hoach (Dòng kế hoạch theo tuần)

Các dòng của kế hoạch học tập, mỗi tuần một dòng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ke_hoach_id` | BIGINT | FOREIGN KEY (ke_hoach_hoc_tap), NOT NULL | Khóa ngoại tới ke_hoach_hoc_tap. |
| `tuan` | INT | NOT NULL | Tuần thứ. |
| `muc_tieu` | TEXT | NULL | Mục tiêu học tập của tuần. |
| `ket_qua_mong_doi` | TEXT | NULL | Kết quả mong đợi. |
| `hinh_thuc_minh_chung` | VARCHAR(200) | NULL | Hình thức minh chứng. |

*Ràng buộc mức bảng: UNIQUE (ke_hoach_id, tuan)*

### 16. Bảng nhat_ky_thuc_tap (Nhật ký thực tập)

Nhật ký công việc hằng ngày của sinh viên; mỗi hồ sơ một bản ghi mỗi ngày.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `ngay` | DATE | NOT NULL | Ngày ghi nhật ký. |
| `noi_dung` | TEXT | NOT NULL | Nội dung công việc. |
| `so_gio` | DECIMAL(4,1) | NULL | Số giờ làm việc. |
| `ket_qua` | TEXT | NULL | Kết quả đạt được. |
| `ngay_tao` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo bản ghi. |

*Ràng buộc mức bảng: UNIQUE (ho_so_id, ngay)*

### 17. Bảng tien_do_tuan (Tiến độ tuần)

Bảng theo dõi tiến độ theo tuần mẫu TTTN-03, có xác nhận của cán bộ ĐVHD.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `tuan` | INT | NOT NULL | Tuần thứ. |
| `cong_viec_duoc_giao` | TEXT | NULL | Công việc được giao. |
| `ket_qua_thuc_hien` | TEXT | NULL | Kết quả thực hiện. |
| `phan_tram_hoan_thanh` | INT | NULL, CHECK (phan_tram_hoan_thanh BETWEEN 0 AND 100) | Mức độ hoàn thành 0 đến 100%. |
| `xac_nhan_dvhd_id` | BIGINT | NULL | Mã người dùng (cán bộ ĐVHD) đã xác nhận dòng tuần. |
| `ngay_xac_nhan` | DATETIME | NULL | Thời điểm xác nhận. |
| `yeu_cau_bo_sung` | VARCHAR(500) | NULL | Nội dung cán bộ ĐVHD yêu cầu bổ sung. |

*Ràng buộc mức bảng: UNIQUE (ho_so_id, tuan)*

### 18. Bảng minh_chung (Minh chứng)

Tệp minh chứng số hóa gắn với hồ sơ. Cơ sở dữ liệu chỉ lưu đường dẫn và thông tin tệp, tệp thật nằm ở kho lưu trữ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `loai_minh_chung` | VARCHAR(100) | NOT NULL | Loại minh chứng. |
| `tuan` | INT | NULL | Tuần liên quan (tùy chọn). |
| `ten_file` | VARCHAR(255) | NOT NULL | Tên tệp gốc. |
| `duong_dan` | VARCHAR(500) | NOT NULL | Đường dẫn tệp trong kho lưu trữ. |
| `kich_thuoc` | BIGINT | NULL | Dung lượng tệp (byte), tối đa 20 MB. |
| `nguoi_tai_len_id` | BIGINT | NULL | Mã người dùng đã tải lên. |
| `ngay_tai_len` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tải lên. |
| `da_khoa` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ khóa sau khi chốt điểm (BR-07.7). |

## NHÓM 4 — ĐÁNH GIÁ VÀ KẾT QUẢ


### 19. Bảng to_danh_gia (Tổ đánh giá)

Tổ đánh giá cuối kỳ do Khoa thành lập để chấm chặng 2 (Điều 10 khoản 3).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `dot_id` | BIGINT | FOREIGN KEY (dot_thuc_tap), NOT NULL | Khóa ngoại tới dot_thuc_tap. |
| `ngay_thanh_lap` | DATE | NOT NULL | Ngày thành lập tổ. |
| `thoi_gian_bao_cao` | DATETIME | NULL | Thời gian buổi báo cáo. |
| `dia_diem` | VARCHAR(200) | NULL | Địa điểm. |
| `hinh_thuc` | ENUM('TRUC_TIEP','TRUC_TUYEN') | NULL, DEFAULT 'TRUC_TIEP' | Trực tiếp hoặc trực tuyến. |
| `ghi_chu_phe_duyet` | VARCHAR(500) | NULL | Ghi chú phê duyệt của Trưởng Khoa khi đánh giá trực tuyến (BR-09.5). |
| `duong_dan_ghi_hinh` | VARCHAR(500) | NULL | Đường dẫn tệp ghi hình buổi đánh giá (BR-09.6). |

### 20. Bảng to_danh_gia_ho_so (Tổ đánh giá – hồ sơ)

Bảng trung gian nhiều-nhiều giữa Tổ đánh giá và hồ sơ thực tập (một tổ chấm nhiều sinh viên cùng buổi).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `to_danh_gia_id` | BIGINT | PRIMARY KEY (khóa ghép), FOREIGN KEY (to_danh_gia), NOT NULL | Khóa ngoại tới to_danh_gia. |
| `ho_so_id` | BIGINT | PRIMARY KEY (khóa ghép), FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |

### 21. Bảng thanh_vien_to_danh_gia (Thành viên Tổ đánh giá)

Thành viên của tổ kèm nhóm người chấm (GVHD hoặc ĐVHD), quyết định tỷ lệ áp dụng khi tính điểm.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `to_danh_gia_id` | BIGINT | FOREIGN KEY (to_danh_gia), NOT NULL | Khóa ngoại tới to_danh_gia. |
| `nguoi_dung_id` | BIGINT | FOREIGN KEY (nguoi_dung), NOT NULL | Khóa ngoại tới nguoi_dung: thành viên. |
| `nhom_nguoi_cham` | ENUM('GVHD','DVHD') | NOT NULL | Nhóm người chấm GVHD hoặc DVHD; quyết định áp tỷ lệ nào khi tính điểm (CBR-15). |
| `la_chu_tich` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ chủ tịch tổ. |
| `vang_mat` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ vắng mặt; phiếu bị loại khỏi phép tính trung bình. |

*Ràng buộc mức bảng: UNIQUE (to_danh_gia_id, nguoi_dung_id)*

### 22. Bảng phieu_danh_gia (Phiếu đánh giá)

Phiếu chấm TTTN-04 (chặng 1) hoặc TTTN-05 (chặng 2) của một người chấm cho một hồ sơ trong một chặng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `chang_id` | BIGINT | FOREIGN KEY (chang_danh_gia), NOT NULL | Khóa ngoại tới chang_danh_gia. |
| `nguoi_cham_id` | BIGINT | FOREIGN KEY (nguoi_dung), NOT NULL | Khóa ngoại tới nguoi_dung: người chấm. |
| `nhom_nguoi_cham` | ENUM('GVHD','DVHD') | NOT NULL | Nhóm người chấm GVHD hoặc DVHD. |
| `nhan_xet_chung` | TEXT | NULL | Nhận xét chung, bắt buộc khi nộp. |
| `trang_thai` | ENUM('NHAP','DA_NOP','MO_LAI') | NOT NULL, DEFAULT 'NHAP' | Trạng thái phiếu: Nháp, Đã nộp (khóa), Mở lại. |
| `ngay_nop` | DATETIME | NULL | Thời điểm nộp. |
| `ly_do_mo_lai` | VARCHAR(500) | NULL | Lý do giáo vụ mở lại phiếu (CBR-12). |

*Ràng buộc mức bảng: UNIQUE (ho_so_id, chang_id, nguoi_cham_id)*

### 23. Bảng diem_clo_chi_tiet (Điểm CLO chi tiết)

Điểm từng CLO trong một phiếu đánh giá: mức đạt theo rubric và điểm thang 10.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `phieu_id` | BIGINT | FOREIGN KEY (phieu_danh_gia), NOT NULL | Khóa ngoại tới phieu_danh_gia. |
| `chuan_dau_ra_id` | BIGINT | FOREIGN KEY (chuan_dau_ra), NOT NULL | Khóa ngoại tới chuan_dau_ra. |
| `muc_dat` | TINYINT | NOT NULL, CHECK (muc_dat BETWEEN 0 AND 4) | Mức đạt theo rubric (0 đến 4). |
| `diem` | DECIMAL(4,2) | NOT NULL, CHECK (diem BETWEEN 0 AND 10) | Điểm thang 10, phải nằm trong khoảng của mức đã chọn (CBR-10). |
| `nhan_xet` | VARCHAR(500) | NULL | Nhận xét riêng cho CLO (tùy chọn). |

*Ràng buộc mức bảng: UNIQUE (phieu_id, chuan_dau_ra_id)*

### 24. Bảng ket_qua_hoc_phan (Kết quả học phần)

Kết quả tính điểm của một hồ sơ (mẫu TTTN-07): điểm 7 CLO, điểm học phần, nhóm năng lực, kết luận. Lưu sẵn kết quả để tra cứu, không tính lại mỗi lần đọc.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), UNIQUE, NOT NULL | Khóa ngoại 1-1 tới ho_so_thuc_tap. |
| `diem_clo1` | DECIMAL(4,2) | NULL | Điểm CLO1 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo2` | DECIMAL(4,2) | NULL | Điểm CLO2 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo3` | DECIMAL(4,2) | NULL | Điểm CLO3 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo4` | DECIMAL(4,2) | NULL | Điểm CLO4 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo5` | DECIMAL(4,2) | NULL | Điểm CLO5 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo6` | DECIMAL(4,2) | NULL | Điểm CLO6 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_clo7` | DECIMAL(4,2) | NULL | Điểm CLO7 sau tổng hợp hai chặng (lưu làm tròn 0,1). |
| `diem_hp` | DECIMAL(4,2) | NULL | Điểm học phần sau cộng thưởng, trần 10, làm tròn 0,1. |
| `muc_dat` | TINYINT | NULL | Mức đạt của điểm học phần (0 đến 4). |
| `diem_thuong` | DECIMAL(3,2) | NULL, DEFAULT 0, CHECK (diem_thuong BETWEEN 0 AND 0.5) | Điểm thưởng tối đa 0,5 (CBR-21). |
| `nhom_kien_thuc` | DECIMAL(4,2) | NULL | Trung bình nhóm Kiến thức chuyên môn (CLO1, CLO2). |
| `nhom_ky_nang` | DECIMAL(4,2) | NULL | Trung bình nhóm Kỹ năng nghề nghiệp (CLO3, CLO5, CLO6). |
| `nhom_thai_do` | DECIMAL(4,2) | NULL | Trung bình nhóm Thái độ, đạo đức (CLO4, CLO7). |
| `ket_luan` | ENUM('DAT','KHONG_DAT') | NULL | Kết luận công nhận hoàn thành: Đạt / Không đạt. |
| `ly_do_khong_dat` | VARCHAR(500) | NULL | Danh sách điều kiện không thỏa khi Không đạt. |
| `phien_ban_trong_so` | VARCHAR(50) | NULL | Phiên bản bộ trọng số đã dùng khi tính (BR-10.5). |
| `nhan_xet_gvhd` | TEXT | NULL | Nhận xét của GVHD trên bảng TTTN-07. |
| `trang_thai` | ENUM('CHUA_TINH','DA_TINH','DA_XAC_NHAN','DA_CONG_BO') | NOT NULL, DEFAULT 'CHUA_TINH' | Trạng thái: Chưa tính, Đã tính, Đã xác nhận, Đã công bố. |
| `ngay_tinh` | DATETIME | NULL | Thời điểm tính điểm gần nhất. |

### 25. Bảng bao_cao_thuc_tap (Báo cáo thực tập)

Các phiên bản báo cáo TTTN-06 sinh viên đã nộp; nộp lại là thêm phiên bản mới, không ghi đè.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `phien_ban` | INT | NOT NULL, DEFAULT 1 | Số phiên bản; nộp lại tạo phiên bản mới (BR-11.5). |
| `ten_file` | VARCHAR(255) | NOT NULL | Tên tệp gốc. |
| `duong_dan` | VARCHAR(500) | NOT NULL | Đường dẫn tệp trong kho lưu trữ. |
| `ngay_nop` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm nộp. |
| `nop_muon` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ nộp sau hạn của đợt. |
| `xac_nhan_dvhd` | DATETIME | NULL | Thời điểm cán bộ ĐVHD xác nhận. |
| `xac_nhan_gvhd` | DATETIME | NULL | Thời điểm GVHD xác nhận. |

*Ràng buộc mức bảng: UNIQUE (ho_so_id, phien_ban)*

### 26. Bảng phan_hoi (Phiếu phản hồi)

Phiếu nhận xét của ĐVHD (TTTN-08a) và phiếu phản hồi, tự đánh giá của sinh viên (TTTN-08b).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `ho_so_id` | BIGINT | FOREIGN KEY (ho_so_thuc_tap), NOT NULL | Khóa ngoại tới ho_so_thuc_tap. |
| `loai` | ENUM('TTTN_08A','TTTN_08B') | NOT NULL | Loại phiếu: TTTN_08A (ĐVHD) hoặc TTTN_08B (sinh viên). |
| `nguoi_gui_id` | BIGINT | FOREIGN KEY (nguoi_dung), NOT NULL | Khóa ngoại tới nguoi_dung: người gửi. |
| `du_lieu_tieu_chi` | JSON | NULL | Nội dung tiêu chí và câu trả lời dạng JSON (mẫu có thể đổi theo năm). |
| `hp_self` | DECIMAL(4,2) | NULL | Điểm học phần tự tính của sinh viên (BR-12.3). |
| `chi_so_tu_nhan_thuc` | DECIMAL(4,2) | NULL | Độ lệch trung bình giữa mức tự đánh giá và mức chính thức (BR-12.4). |
| `y_kien_mo` | TEXT | NULL | Ý kiến bổ sung. |
| `ngay_gui` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm gửi. |

*Ràng buộc mức bảng: UNIQUE (ho_so_id, loai)*

## NHÓM 5 — HỆ THỐNG


### 27. Bảng nhat_ky_he_thong (Nhật ký hệ thống)

Lưu vết mọi thao tác ảnh hưởng tới điểm và dữ liệu quan trọng, chỉ đọc (Điều 14 khoản 4 điểm c).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `thoi_diem` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm thực hiện. |
| `nguoi_thuc_hien` | BIGINT | NULL | Mã người dùng thực hiện. |
| `vai_tro` | VARCHAR(30) | NULL | Vai trò tại thời điểm thực hiện. |
| `hanh_vi` | VARCHAR(100) | NOT NULL | Hành vi (ví dụ: MO_LAI_PHIEU, TINH_DIEM, DOI_GVHD). |
| `doi_tuong` | VARCHAR(100) | NULL | Tên đối tượng tác động. |
| `doi_tuong_id` | BIGINT | NULL | ID đối tượng tác động. |
| `gia_tri_truoc` | TEXT | NULL | Giá trị trước thay đổi. |
| `gia_tri_sau` | TEXT | NULL | Giá trị sau thay đổi. |

### 28. Bảng thong_bao (Thông báo)

Thông báo trong ứng dụng gửi tới từng người dùng theo sự kiện nghiệp vụ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính, định danh duy nhất của bản ghi. |
| `nguoi_nhan_id` | BIGINT | FOREIGN KEY (nguoi_dung), NOT NULL | Khóa ngoại tới nguoi_dung: người nhận. |
| `ma_su_kien` | VARCHAR(10) | NOT NULL | Mã sự kiện NT-01 đến NT-15. |
| `noi_dung` | VARCHAR(500) | NOT NULL | Nội dung thông báo. |
| `duong_dan` | VARCHAR(300) | NULL | Đường dẫn tới màn hình liên quan. |
| `da_doc` | BOOLEAN | NOT NULL, DEFAULT FALSE | Cờ đã đọc. |
| `ngay_tao` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo. |
