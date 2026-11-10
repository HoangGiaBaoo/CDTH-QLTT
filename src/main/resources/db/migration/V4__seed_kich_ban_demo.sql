-- =====================================================================
-- V4 — Kịch bản demo (docs/TIEN-DO.md › Seed V4). MẬT KHẨU MỌI TÀI KHOẢN: Qltt@2026 (chuỗi BCrypt @mk như V3).
-- Tên đơn vị, cán bộ, sinh viên đều HƯ CẤU.
--
-- Đợt TTTN-2025-HK2 (đã kết thúc, đã công bố): 10 SV K66 phủ đủ các ca công nhận Đ15 k3 — số liệu cho
--   thống kê RP-01…RP-06 và bảng TTTN-07. Điểm ket_qua_hoc_phan được tính sẵn bằng đúng công thức của
--   ScoringService và đã kiểm lại bằng POST /api/results/{id}/calculate (#84).
-- Đợt TTTN-2026-HK1 (đang thực hiện): mỗi mốc của kịch bản demo có sẵn một hồ sơ để nhảy qua khi bước live lỗi.
--
-- Tệp minh chứng / báo cáo trỏ tới đường dẫn không có thật trong uploads/ — tải về trả 404 "Không tìm thấy tệp".
-- Đổi dữ liệu điểm thì phải kiểm lại: nạp trên CSDL sạch, đưa kết quả về DA_TINH, gọi #84 và so với giá trị seed.
-- =====================================================================

SET @mk = '$2a$10$lGdY1UoR0PMVotCrB08j5u4rS1Z32sNElCj2ilPfx41UsQcMwxE0W';
SET @giaovu = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'giaovu');
SET @nd_gv_tung = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'gv.tung');
SET @gv_tung = (SELECT id FROM giang_vien WHERE nguoi_dung_id = @nd_gv_tung);
SET @nd_gv_lan = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'gv.lan');
SET @gv_lan = (SELECT id FROM giang_vien WHERE nguoi_dung_id = @nd_gv_lan);
SET @nd_gv_minh = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'gv.minh');
SET @gv_minh = (SELECT id FROM giang_vien WHERE nguoi_dung_id = @nd_gv_minh);
SET @nd_gv_hoa = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'gv.hoa');
SET @gv_hoa = (SELECT id FROM giang_vien WHERE nguoi_dung_id = @nd_gv_hoa);

-- ---------------------------------------------------------------------
-- ĐƠN VỊ HƯỚNG DẪN VÀ CÁN BỘ
-- ---------------------------------------------------------------------
-- Đ7 k1: 3 đơn vị đã duyệt; Bình Minh đang chờ duyệt — tài khoản cán bộ VO_HIEU_HOA đến khi duyệt (docs/01 mục 10.12).
INSERT INTO don_vi_huong_dan (ma_dvhd, ten, dia_chi, linh_vuc, nguoi_dai_dien, dien_thoai, email, trang_thai_phe_duyet, ngay_phe_duyet, nguoi_phe_duyet_id) VALUES ('DVHD-SAOMAI', 'Công ty TNHH Phần mềm Sao Mai', 'Số 18 ngõ 54 phố Trần Quốc Vượng, Cầu Giấy, Hà Nội', 'Phát triển phần mềm doanh nghiệp', 'Ngô Văn Hưng', '02437001001', 'lienhe@saomai.test', 'DA_DUYET', '2026-01-20', @giaovu);
SET @dv_saomai = LAST_INSERT_ID();
INSERT INTO don_vi_huong_dan (ma_dvhd, ten, dia_chi, linh_vuc, nguoi_dai_dien, dien_thoai, email, trang_thai_phe_duyet, ngay_phe_duyet, nguoi_phe_duyet_id) VALUES ('DVHD-HONGHA', 'Công ty Cổ phần Giải pháp số Hồng Hà', 'Tầng 7 tòa nhà B2, đường Giải Phóng, Hai Bà Trưng, Hà Nội', 'Chuyển đổi số, hệ thống thông tin quản lý', 'Đinh Thị Hằng', '02437002002', 'tuyendung@hongha.test', 'DA_DUYET', '2026-01-20', @giaovu);
SET @dv_hongha = LAST_INSERT_ID();
INSERT INTO don_vi_huong_dan (ma_dvhd, ten, dia_chi, linh_vuc, nguoi_dai_dien, dien_thoai, email, trang_thai_phe_duyet, ngay_phe_duyet, nguoi_phe_duyet_id) VALUES ('DVHD-THANGLONG', 'Viện Công nghệ Xây dựng số Thăng Long', 'Số 3 phố Hoa Lư, Hai Bà Trưng, Hà Nội', 'Nghiên cứu BIM và mô phỏng công trình', 'PGS.TS Tạ Văn Khải', '02437003003', 'vien@thanglong.test', 'DA_DUYET', '2026-01-20', @giaovu);
SET @dv_thanglong = LAST_INSERT_ID();
INSERT INTO don_vi_huong_dan (ma_dvhd, ten, dia_chi, linh_vuc, nguoi_dai_dien, dien_thoai, email, trang_thai_phe_duyet, ngay_phe_duyet, nguoi_phe_duyet_id) VALUES ('DVHD-BINHMINH', 'Công ty TNHH Kỹ thuật Bình Minh', 'Khu đô thị Văn Phú, Hà Đông, Hà Nội', 'Tự động hóa và IoT', 'Lưu Quang Thắng', '02437004004', 'info@binhminh.test', 'CHO_DUYET', NULL, NULL);
SET @dv_binhminh = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.son', @mk, 'Ngô Thanh Sơn', 'son.nt@saomai.test', '0903000001', 'CAN_BO_DVHD', 'HOAT_DONG');
SET @nd_cb_son = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_son, @dv_saomai, 'Trưởng nhóm phát triển', 8, 5);
SET @cb_son = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.trang', @mk, 'Lý Thu Trang', 'trang.lt@saomai.test', '0903000002', 'CAN_BO_DVHD', 'HOAT_DONG');
SET @nd_cb_trang = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_trang, @dv_saomai, 'Kỹ sư kiểm thử chính', 5, 5);
SET @cb_trang = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.quang', @mk, 'Đinh Văn Quang', 'quang.dv@hongha.test', '0903000003', 'CAN_BO_DVHD', 'HOAT_DONG');
SET @nd_cb_quang = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_quang, @dv_hongha, 'Quản lý dự án', 10, 5);
SET @cb_quang = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.yen', @mk, 'Phan Hải Yến', 'yen.ph@hongha.test', '0903000004', 'CAN_BO_DVHD', 'HOAT_DONG');
SET @nd_cb_yen = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_yen, @dv_hongha, 'Chuyên viên phân tích nghiệp vụ', 4, 1);
SET @cb_yen = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.duc', @mk, 'Tạ Minh Đức', 'duc.tm@thanglong.test', '0903000005', 'CAN_BO_DVHD', 'HOAT_DONG');
SET @nd_cb_duc = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_duc, @dv_thanglong, 'Nghiên cứu viên chính', 12, 3);
SET @cb_duc = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro, trang_thai) VALUES ('cb.phuong', @mk, 'Lưu Thị Phương', 'phuong.lt@binhminh.test', '0903000006', 'CAN_BO_DVHD', 'VO_HIEU_HOA');
SET @nd_cb_phuong = LAST_INSERT_ID();
INSERT INTO can_bo_dvhd (nguoi_dung_id, don_vi_id, chuc_vu, so_nam_kinh_nghiem, so_sv_toi_da) VALUES (@nd_cb_phuong, @dv_binhminh, 'Trưởng phòng kỹ thuật', 6, 5);
SET @cb_phuong = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- SINH VIÊN MỚI
-- ---------------------------------------------------------------------
-- 10 SV K66 cho đợt đã kết thúc; 5 SV K67 bổ sung cho đợt đang chạy (cùng 8 SV của V3).
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.nam', @mk, 'Nguyễn Hoài Nam', '2151220101@st.huce.edu.vn', '0988000001', 'SINH_VIEN');
SET @nd_sv_nam = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_nam, '2151220101', '66CNTT1', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_nam = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.oanh', @mk, 'Trần Kim Oanh', '2151220102@st.huce.edu.vn', '0988000002', 'SINH_VIEN');
SET @nd_sv_oanh = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_oanh, '2151220102', '66CNTT1', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_oanh = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.phong', @mk, 'Lê Thanh Phong', '2151220103@st.huce.edu.vn', '0988000003', 'SINH_VIEN');
SET @nd_sv_phong = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_phong, '2151220103', '66CNTT2', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_phong = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.quyen', @mk, 'Phạm Lệ Quyên', '2151220104@st.huce.edu.vn', '0988000004', 'SINH_VIEN');
SET @nd_sv_quyen = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_quyen, '2151220104', '66CLC', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CLC_STEM');
SET @sv_quyen = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.tai', @mk, 'Hoàng Đức Tài', '2151220105@st.huce.edu.vn', '0988000005', 'SINH_VIEN');
SET @nd_sv_tai = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_tai, '2151220105', '66CNTT2', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_tai = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.uyen', @mk, 'Vũ Tú Uyên', '2151220106@st.huce.edu.vn', '0988000006', 'SINH_VIEN');
SET @nd_sv_uyen = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_uyen, '2151220106', '66CLC', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CLC_STEM');
SET @sv_uyen = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.vinh', @mk, 'Đặng Quang Vinh', '2151220107@st.huce.edu.vn', '0988000007', 'SINH_VIEN');
SET @nd_sv_vinh = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_vinh, '2151220107', '66CNTT1', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_vinh = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.xuan', @mk, 'Bùi Thanh Xuân', '2151220108@st.huce.edu.vn', '0988000008', 'SINH_VIEN');
SET @nd_sv_xuan = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_xuan, '2151220108', '66CNTT2', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_xuan = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.thao', @mk, 'Ngô Phương Thảo', '2151220109@st.huce.edu.vn', '0988000009', 'SINH_VIEN');
SET @nd_sv_thao = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_thao, '2151220109', '66CNTT1', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_thao = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.toan', @mk, 'Đỗ Văn Toàn', '2151220110@st.huce.edu.vn', '0988000010', 'SINH_VIEN');
SET @nd_sv_toan = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_toan, '2151220110', '66CNTT2', 'K66', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_toan = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.mai', @mk, 'Lương Thị Mai', '2251220009@st.huce.edu.vn', '0988000011', 'SINH_VIEN');
SET @nd_sv_mai = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_mai, '2251220009', '67CNTT1', 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_mai = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.nga', @mk, 'Hà Thúy Nga', '2251220010@st.huce.edu.vn', '0988000012', 'SINH_VIEN');
SET @nd_sv_nga = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_nga, '2251220010', '67CNTT2', 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_nga = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.phat', @mk, 'Trịnh Gia Phát', '2251220011@st.huce.edu.vn', '0988000013', 'SINH_VIEN');
SET @nd_sv_phat = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_phat, '2251220011', '67CNTT1', 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_phat = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.quan', @mk, 'Mai Đức Quân', '2251220012@st.huce.edu.vn', '0988000014', 'SINH_VIEN');
SET @nd_sv_quan = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_quan, '2251220012', '67CNTT2', 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CHUAN');
SET @sv_quan = LAST_INSERT_ID();
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES ('sv.thu', @mk, 'Lại Minh Thư', '2251220013@st.huce.edu.vn', '0988000015', 'SINH_VIEN');
SET @nd_sv_thu = LAST_INSERT_ID();
INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao) VALUES (@nd_sv_thu, '2251220013', '67CLC', 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', 'CLC_STEM');
SET @sv_thu = LAST_INSERT_ID();
SET @nd_sv_an = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.an');
SET @sv_an = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_an);
SET @nd_sv_binh = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.binh');
SET @sv_binh = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_binh);
SET @nd_sv_cuong = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.cuong');
SET @sv_cuong = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_cuong);
SET @nd_sv_dung = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.dung');
SET @sv_dung = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_dung);
SET @nd_sv_giang = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.giang');
SET @sv_giang = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_giang);
SET @nd_sv_ha = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'sv.ha');
SET @sv_ha = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = @nd_sv_ha);

-- ---------------------------------------------------------------------
-- ĐỢT TTTN-2025-HK2 — ĐÃ KẾT THÚC, KẾT QUẢ ĐÃ CÔNG BỐ
-- ---------------------------------------------------------------------
INSERT INTO dot_thuc_tap (ma_dot, ten, hoc_ky, nam_hoc, khoa_vien, ngay_bat_dau, ngay_ket_thuc, so_tuan, han_nop_bao_cao, trang_thai) VALUES ('TTTN-2025-HK2', 'Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026', 'HK2', '2025-2026', 'Khoa Công nghệ thông tin', '2026-03-02', '2026-04-26', 8, '2026-05-01', 'DA_KET_THUC');
SET @dot_k1 = LAST_INSERT_ID();
SET @mau = (SELECT id FROM dot_thuc_tap WHERE ma_dot = 'MAU-QD207');
-- UC03 bước 4: chặng 1 mở đầu tuần 4 (bắt đầu + 21 ngày), chặng 2 mở ngày liền sau ngày kết thúc.
INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, ngay_mo, ngay_dong, trang_thai)
SELECT @dot_k1, thu_tu, ten, 4, trong_so_w, '2026-03-23', '2026-03-31', 'DA_DONG'
FROM chang_danh_gia WHERE dot_id = @mau AND thu_tu = 1;
SET @k1_c1 = LAST_INSERT_ID();
INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, ngay_mo, ngay_dong, trang_thai)
SELECT @dot_k1, thu_tu, ten, 8, trong_so_w, '2026-04-27', '2026-05-08', 'DA_DONG'
FROM chang_danh_gia WHERE dot_id = @mau AND thu_tu = 2;
SET @k1_c2 = LAST_INSERT_ID();
INSERT INTO chuan_dau_ra (dot_id, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd)
SELECT @dot_k1, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd FROM chuan_dau_ra WHERE dot_id = @mau ORDER BY id;
INSERT INTO muc_rubric (chuan_dau_ra_id, muc, diem_min, diem_max, mo_ta_hanh_vi)
SELECT moi.id, m.muc, m.diem_min, m.diem_max, m.mo_ta_hanh_vi
FROM muc_rubric m
JOIN chuan_dau_ra goc ON goc.id = m.chuan_dau_ra_id AND goc.dot_id = @mau
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_k1 AND moi.ma_clo = goc.ma_clo
ORDER BY m.id;
INSERT INTO cau_hoi_danh_gia (chang_id, chuan_dau_ra_id, thu_tu, noi_dung)
SELECT CASE c.thu_tu WHEN 1 THEN @k1_c1 ELSE @k1_c2 END, moi.id, q.thu_tu, q.noi_dung
FROM cau_hoi_danh_gia q
JOIN chang_danh_gia c ON c.id = q.chang_id AND c.dot_id = @mau
JOIN chuan_dau_ra goc ON goc.id = q.chuan_dau_ra_id
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_k1 AND moi.ma_clo = goc.ma_clo
ORDER BY q.id;
SET @k1_clo1 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO1');
SET @k1_clo2 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO2');
SET @k1_clo3 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO3');
SET @k1_clo4 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO4');
SET @k1_clo5 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO5');
SET @k1_clo6 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO6');
SET @k1_clo7 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k1 AND ma_clo = 'CLO7');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — HỒ SƠ, KẾ HOẠCH, TIẾN ĐỘ, NHẬT KÝ, BÁO CÁO
-- ---------------------------------------------------------------------
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_nam, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-10 09:10:00');
SET @hs_s1 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s1, @gv_tung, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s1, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s1 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s1, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s1, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s1, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-03-07 17:00:00'),
    (@hs_s1, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-03-14 17:00:00'),
    (@hs_s1, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-03-21 17:00:00'),
    (@hs_s1, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-03-28 17:00:00'),
    (@hs_s1, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-04-04 17:00:00'),
    (@hs_s1, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-04-11 17:00:00'),
    (@hs_s1, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_son, '2026-04-18 17:00:00'),
    (@hs_s1, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_son, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s1, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s1, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s1, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s1, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s1, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s1, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s1, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s1, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s1, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s1, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s1, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s1, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s1, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s1, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s1, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s1, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s1, 1, 'BaoCao_TTTN06_2151220101.pdf', CONCAT(@hs_s1, '/seed-bao-cao-2151220101.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_oanh, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-11 09:11:00');
SET @hs_s2 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s2, @gv_tung, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s2, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s2 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s2, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s2, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s2, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-03-07 17:00:00'),
    (@hs_s2, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-03-14 17:00:00'),
    (@hs_s2, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-03-21 17:00:00'),
    (@hs_s2, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-03-28 17:00:00'),
    (@hs_s2, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-04-04 17:00:00'),
    (@hs_s2, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-04-11 17:00:00'),
    (@hs_s2, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_son, '2026-04-18 17:00:00'),
    (@hs_s2, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_son, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s2, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s2, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s2, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s2, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s2, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s2, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s2, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s2, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s2, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s2, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s2, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s2, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s2, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s2, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s2, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s2, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s2, 1, 'BaoCao_TTTN06_2151220102.pdf', CONCAT(@hs_s2, '/seed-bao-cao-2151220102.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_phong, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'KHONG_HOAN_THANH', '2026-02-12 09:12:00');
SET @hs_s3 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s3, @gv_tung, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s3, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s3 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s3, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s3, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s3, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-03-07 17:00:00'),
    (@hs_s3, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-03-14 17:00:00'),
    (@hs_s3, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-03-21 17:00:00'),
    (@hs_s3, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-03-28 17:00:00'),
    (@hs_s3, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-04-04 17:00:00'),
    (@hs_s3, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-04-11 17:00:00'),
    (@hs_s3, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_son, '2026-04-18 17:00:00'),
    (@hs_s3, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_son, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s3, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s3, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s3, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s3, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s3, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s3, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s3, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s3, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s3, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s3, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s3, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s3, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s3, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s3, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s3, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s3, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s3, 1, 'BaoCao_TTTN06_2151220103.pdf', CONCAT(@hs_s3, '/seed-bao-cao-2151220103.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_quyen, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'KHONG_HOAN_THANH', '2026-02-13 09:13:00');
SET @hs_s4 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s4, @gv_tung, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s4, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s4 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s4, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s4, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s4, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-03-07 17:00:00'),
    (@hs_s4, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-03-14 17:00:00'),
    (@hs_s4, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-03-21 17:00:00'),
    (@hs_s4, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-03-28 17:00:00'),
    (@hs_s4, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-04-04 17:00:00'),
    (@hs_s4, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-04-11 17:00:00'),
    (@hs_s4, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_son, '2026-04-18 17:00:00'),
    (@hs_s4, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_son, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s4, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s4, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s4, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s4, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s4, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s4, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s4, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s4, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s4, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s4, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s4, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s4, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s4, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s4, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s4, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s4, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s4, 1, 'BaoCao_TTTN06_2151220104.pdf', CONCAT(@hs_s4, '/seed-bao-cao-2151220104.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_tai, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_trang, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-14 09:14:00');
SET @hs_s5 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s5, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s5, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s5 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s5, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s5, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s5, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_trang, '2026-03-07 17:00:00'),
    (@hs_s5, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_trang, '2026-03-14 17:00:00'),
    (@hs_s5, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_trang, '2026-03-21 17:00:00'),
    (@hs_s5, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_trang, '2026-03-28 17:00:00'),
    (@hs_s5, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_trang, '2026-04-04 17:00:00'),
    (@hs_s5, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_trang, '2026-04-11 17:00:00'),
    (@hs_s5, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_trang, '2026-04-18 17:00:00'),
    (@hs_s5, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_trang, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s5, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s5, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s5, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s5, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s5, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s5, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s5, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s5, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s5, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s5, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s5, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s5, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s5, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s5, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s5, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s5, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s5, 1, 'BaoCao_TTTN06_2151220105.pdf', CONCAT(@hs_s5, '/seed-bao-cao-2151220105.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_uyen, @dot_k1, 'DOANH_NGHIEP', @dv_saomai, @cb_trang, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-10 09:15:00');
SET @hs_s6 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s6, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s6, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s6 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s6, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s6, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s6, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_trang, '2026-03-07 17:00:00'),
    (@hs_s6, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_trang, '2026-03-14 17:00:00'),
    (@hs_s6, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_trang, '2026-03-21 17:00:00'),
    (@hs_s6, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_trang, '2026-03-28 17:00:00'),
    (@hs_s6, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_trang, '2026-04-04 17:00:00'),
    (@hs_s6, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_trang, '2026-04-11 17:00:00'),
    (@hs_s6, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_trang, '2026-04-18 17:00:00'),
    (@hs_s6, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_trang, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s6, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s6, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s6, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s6, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s6, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s6, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s6, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s6, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s6, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s6, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s6, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s6, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s6, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s6, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s6, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s6, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s6, 1, 'BaoCao_TTTN06_2151220106.pdf', CONCAT(@hs_s6, '/seed-bao-cao-2151220106.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_vinh, @dot_k1, 'NGHIEN_CUU', @dv_thanglong, @cb_duc, 'Phòng nghiên cứu mô phỏng', 'Nghiên cứu ứng dụng mô hình BIM trong quản lý tiến độ thi công', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'KHONG_HOAN_THANH', '2026-02-11 09:16:00');
SET @hs_s7 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s7, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s7, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s7 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s7, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s7, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s7, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_duc, '2026-03-07 17:00:00'),
    (@hs_s7, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_duc, '2026-03-14 17:00:00'),
    (@hs_s7, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_duc, '2026-03-21 17:00:00'),
    (@hs_s7, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_duc, '2026-03-28 17:00:00'),
    (@hs_s7, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_duc, '2026-04-04 17:00:00'),
    (@hs_s7, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_duc, '2026-04-11 17:00:00'),
    (@hs_s7, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_duc, '2026-04-18 17:00:00'),
    (@hs_s7, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_duc, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s7, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s7, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s7, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s7, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s7, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s7, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s7, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s7, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s7, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s7, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s7, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s7, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s7, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s7, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s7, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s7, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
-- Đ4: nghiên cứu cần Đề cương + Sản phẩm (tải lên); chỉ có Đề cương ⇒ thiếu minh chứng (d).
INSERT INTO minh_chung (ho_so_id, loai_minh_chung, tuan, ten_file, duong_dan, kich_thuoc, nguoi_tai_len_id, ngay_tai_len, da_khoa) VALUES (@hs_s7, 'DE_CUONG_NGHIEN_CUU', 1, 'DeCuong_NghienCuu_BIM.pdf', CONCAT(@hs_s7, '/seed-de-cuong.pdf'), 482133, @nd_sv_vinh, '2026-03-05 21:00:00', TRUE);
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s7, 1, 'BaoCao_TTTN06_2151220107.pdf', CONCAT(@hs_s7, '/seed-bao-cao-2151220107.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_xuan, @dot_k1, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-12 09:17:00');
SET @hs_s8 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s8, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s8, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s8 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s8, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s8, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s8, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-03-07 17:00:00'),
    (@hs_s8, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-03-14 17:00:00'),
    (@hs_s8, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-03-21 17:00:00'),
    (@hs_s8, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-03-28 17:00:00'),
    (@hs_s8, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-04-04 17:00:00'),
    (@hs_s8, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-04-11 17:00:00'),
    (@hs_s8, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_quang, '2026-04-18 17:00:00'),
    (@hs_s8, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_quang, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s8, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s8, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s8, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s8, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s8, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s8, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s8, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s8, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s8, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s8, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s8, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s8, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s8, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s8, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s8, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s8, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s8, 1, 'BaoCao_TTTN06_2151220108.pdf', CONCAT(@hs_s8, '/seed-bao-cao-2151220108.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_thao, @dot_k1, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'HOAN_THANH', '2026-02-13 09:18:00');
SET @hs_s9 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s9, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s9, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s9 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s9, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s9, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s9, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-03-07 17:00:00'),
    (@hs_s9, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-03-14 17:00:00'),
    (@hs_s9, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-03-21 17:00:00'),
    (@hs_s9, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-03-28 17:00:00'),
    (@hs_s9, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-04-04 17:00:00'),
    (@hs_s9, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-04-11 17:00:00'),
    (@hs_s9, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_quang, '2026-04-18 17:00:00'),
    (@hs_s9, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_quang, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s9, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s9, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s9, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s9, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s9, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s9, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s9, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s9, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s9, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s9, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s9, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s9, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s9, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s9, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s9, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s9, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s9, 1, 'BaoCao_TTTN06_2151220109.pdf', CONCAT(@hs_s9, '/seed-bao-cao-2151220109.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_toan, @dot_k1, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'KHONG_HOAN_THANH', '2026-02-14 09:19:00');
SET @hs_s10 = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_s10, @gv_lan, '2026-02-24 10:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_s10, '2026-03-05 20:00:00', FALSE, '2026-03-06 09:00:00', '2026-03-06 15:00:00', 'DA_KHOA');
SET @kh_s10 = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_s10, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_s10, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_s10, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-03-07 17:00:00'),
    (@hs_s10, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-03-14 17:00:00'),
    (@hs_s10, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-03-21 17:00:00'),
    (@hs_s10, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-03-28 17:00:00'),
    (@hs_s10, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-04-04 17:00:00'),
    (@hs_s10, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-04-11 17:00:00'),
    (@hs_s10, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_quang, '2026-04-18 17:00:00'),
    (@hs_s10, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_quang, '2026-04-25 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_s10, '2026-03-02', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-02 18:00:00'),
    (@hs_s10, '2026-03-04', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-04 18:00:00'),
    (@hs_s10, '2026-03-09', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-09 18:00:00'),
    (@hs_s10, '2026-03-11', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-11 18:00:00'),
    (@hs_s10, '2026-03-16', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-16 18:00:00'),
    (@hs_s10, '2026-03-18', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-18 18:00:00'),
    (@hs_s10, '2026-03-23', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-23 18:00:00'),
    (@hs_s10, '2026-03-25', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-25 18:00:00'),
    (@hs_s10, '2026-03-30', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-03-30 18:00:00'),
    (@hs_s10, '2026-04-01', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-01 18:00:00'),
    (@hs_s10, '2026-04-06', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-06 18:00:00'),
    (@hs_s10, '2026-04-08', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-08 18:00:00'),
    (@hs_s10, '2026-04-13', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-13 18:00:00'),
    (@hs_s10, '2026-04-15', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-15 18:00:00'),
    (@hs_s10, '2026-04-20', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-20 18:00:00'),
    (@hs_s10, '2026-04-22', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-04-22 18:00:00');
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_s10, 1, 'BaoCao_TTTN06_2151220110.pdf', CONCAT(@hs_s10, '/seed-bao-cao-2151220110.pdf'), '2026-04-28 22:00:00', FALSE, '2026-04-29 10:00:00', '2026-04-30 14:00:00');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — PHIẾU CHẶNG 1 (GVHD + CÁN BỘ, UC08)
-- ---------------------------------------------------------------------
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s1, @k1_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 10:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 2, 6.5, NULL),
    (@phieu, @k1_clo3, 2, 6.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 10:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":2,"diem":6.5},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s1, @k1_c1, @nd_gv_tung, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 10:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 4, 9.0, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 2, 6.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 10:30:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":2,"diem":6.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s2, @k1_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 11:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.5, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 11:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.5},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s2, @k1_c1, @nd_gv_tung, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 11:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 8.5, NULL),
    (@phieu, @k1_clo2, 4, 8.5, NULL),
    (@phieu, @k1_clo3, 3, 8.0, NULL),
    (@phieu, @k1_clo4, 4, 9.0, NULL),
    (@phieu, @k1_clo5, 4, 8.5, NULL),
    (@phieu, @k1_clo6, 4, 8.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 11:30:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":8.5},"CLO2":{"muc":4,"diem":8.5},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":4,"diem":8.5},"CLO6":{"muc":4,"diem":8.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s3, @k1_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 12:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 2, 6.5, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 2, 6.0, NULL),
    (@phieu, @k1_clo4, 3, 7.0, NULL),
    (@phieu, @k1_clo5, 2, 6.5, NULL),
    (@phieu, @k1_clo6, 2, 6.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 12:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":6.5},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":7.0},"CLO5":{"muc":2,"diem":6.5},"CLO6":{"muc":2,"diem":6.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s3, @k1_c1, @nd_gv_tung, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 12:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 12:30:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s4, @k1_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 13:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 13:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s4, @k1_c1, @nd_gv_tung, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 13:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 13:30:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s5, @k1_c1, @nd_cb_trang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 14:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 14:00:00', @nd_cb_trang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s5, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 14:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 14:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s6, @k1_c1, @nd_cb_trang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 15:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 8.5, NULL),
    (@phieu, @k1_clo2, 3, 8.0, NULL),
    (@phieu, @k1_clo3, 3, 8.0, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 4, 8.5, NULL),
    (@phieu, @k1_clo6, 4, 8.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 15:00:00', @nd_cb_trang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":8.5},"CLO2":{"muc":3,"diem":8.0},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":4,"diem":8.5},"CLO6":{"muc":4,"diem":8.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s6, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 15:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 9.5, NULL),
    (@phieu, @k1_clo2, 4, 9.0, NULL),
    (@phieu, @k1_clo3, 4, 9.0, NULL),
    (@phieu, @k1_clo4, 4, 9.5, NULL),
    (@phieu, @k1_clo5, 4, 9.5, NULL),
    (@phieu, @k1_clo6, 4, 9.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 15:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.5},"CLO2":{"muc":4,"diem":9.0},"CLO3":{"muc":4,"diem":9.0},"CLO4":{"muc":4,"diem":9.5},"CLO5":{"muc":4,"diem":9.5},"CLO6":{"muc":4,"diem":9.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c1, @nd_cb_duc, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 16:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 2, 6.5, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 16:00:00', @nd_cb_duc, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":2,"diem":6.5},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 16:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 7.5, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 16:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.5},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c1, @nd_cb_quang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 17:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 2, 6.5, NULL),
    (@phieu, @k1_clo2, 2, 6.0, NULL),
    (@phieu, @k1_clo3, 2, 6.0, NULL),
    (@phieu, @k1_clo4, 3, 7.0, NULL),
    (@phieu, @k1_clo5, 2, 6.5, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 17:00:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":6.5},"CLO2":{"muc":2,"diem":6.0},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":7.0},"CLO5":{"muc":2,"diem":6.5},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 17:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 17:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c1, @nd_cb_quang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 10:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 1, 4.5, NULL),
    (@phieu, @k1_clo2, 1, 4.5, NULL),
    (@phieu, @k1_clo3, 1, 4.0, NULL),
    (@phieu, @k1_clo4, 1, 4.5, NULL),
    (@phieu, @k1_clo5, 1, 4.0, NULL),
    (@phieu, @k1_clo6, 1, 4.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 10:00:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":1,"diem":4.5},"CLO2":{"muc":1,"diem":4.5},"CLO3":{"muc":1,"diem":4.0},"CLO4":{"muc":1,"diem":4.5},"CLO5":{"muc":1,"diem":4.0},"CLO6":{"muc":1,"diem":4.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 10:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 2, 5.5, NULL),
    (@phieu, @k1_clo2, 2, 5.5, NULL),
    (@phieu, @k1_clo3, 1, 5.0, NULL),
    (@phieu, @k1_clo4, 2, 5.5, NULL),
    (@phieu, @k1_clo5, 1, 5.0, NULL),
    (@phieu, @k1_clo6, 1, 5.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 10:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":5.5},"CLO2":{"muc":2,"diem":5.5},"CLO3":{"muc":1,"diem":5.0},"CLO4":{"muc":2,"diem":5.5},"CLO5":{"muc":1,"diem":5.0},"CLO6":{"muc":1,"diem":5.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c1, @nd_cb_quang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-03-25 11:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 2.5, NULL),
    (@phieu, @k1_clo2, 0, 2.5, NULL),
    (@phieu, @k1_clo3, 0, 3.5, NULL),
    (@phieu, @k1_clo4, 1, 4.0, NULL),
    (@phieu, @k1_clo5, 0, 3.5, NULL),
    (@phieu, @k1_clo6, 0, 3.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-25 11:00:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":2.5},"CLO2":{"muc":0,"diem":2.5},"CLO3":{"muc":0,"diem":3.5},"CLO4":{"muc":1,"diem":4.0},"CLO5":{"muc":0,"diem":3.5},"CLO6":{"muc":0,"diem":3.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-03-26 11:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 3.5, NULL),
    (@phieu, @k1_clo2, 0, 3.5, NULL),
    (@phieu, @k1_clo3, 1, 4.5, NULL),
    (@phieu, @k1_clo4, 1, 5.0, NULL),
    (@phieu, @k1_clo5, 1, 4.5, NULL),
    (@phieu, @k1_clo6, 1, 4.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-03-26 11:30:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":3.5},"CLO2":{"muc":0,"diem":3.5},"CLO3":{"muc":1,"diem":4.5},"CLO4":{"muc":1,"diem":5.0},"CLO5":{"muc":1,"diem":4.5},"CLO6":{"muc":1,"diem":4.0}}');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — TỔ ĐÁNH GIÁ CUỐI KỲ (UC09)
-- ---------------------------------------------------------------------
INSERT INTO to_danh_gia (dot_id, ngay_thanh_lap, thoi_gian_bao_cao, dia_diem, hinh_thuc) VALUES (@dot_k1, '2026-04-27', '2026-05-05 08:00:00', 'Phòng 302 nhà A1', 'TRUC_TIEP');
SET @to1 = LAST_INSERT_ID();
INSERT INTO thanh_vien_to_danh_gia (to_danh_gia_id, nguoi_dung_id, nhom_nguoi_cham, la_chu_tich, vang_mat) VALUES
    (@to1, @nd_gv_tung, 'GVHD', TRUE, FALSE),
    (@to1, @nd_gv_minh, 'GVHD', FALSE, FALSE),
    (@to1, @nd_cb_son, 'DVHD', FALSE, FALSE);
INSERT INTO to_danh_gia_ho_so (to_danh_gia_id, ho_so_id) VALUES
    (@to1, @hs_s1),
    (@to1, @hs_s2),
    (@to1, @hs_s3),
    (@to1, @hs_s4);
INSERT INTO to_danh_gia (dot_id, ngay_thanh_lap, thoi_gian_bao_cao, dia_diem, hinh_thuc) VALUES (@dot_k1, '2026-04-27', '2026-05-06 08:00:00', 'Phòng 304 nhà A1', 'TRUC_TIEP');
SET @to2 = LAST_INSERT_ID();
INSERT INTO thanh_vien_to_danh_gia (to_danh_gia_id, nguoi_dung_id, nhom_nguoi_cham, la_chu_tich, vang_mat) VALUES
    (@to2, @nd_gv_lan, 'GVHD', TRUE, FALSE),
    (@to2, @nd_gv_minh, 'GVHD', FALSE, FALSE),
    (@to2, @nd_cb_trang, 'DVHD', FALSE, FALSE);
INSERT INTO to_danh_gia_ho_so (to_danh_gia_id, ho_so_id) VALUES
    (@to2, @hs_s5),
    (@to2, @hs_s6);
INSERT INTO to_danh_gia (dot_id, ngay_thanh_lap, thoi_gian_bao_cao, dia_diem, hinh_thuc) VALUES (@dot_k1, '2026-04-27', '2026-05-07 08:00:00', 'Phòng 306 nhà A1', 'TRUC_TIEP');
SET @to3 = LAST_INSERT_ID();
INSERT INTO thanh_vien_to_danh_gia (to_danh_gia_id, nguoi_dung_id, nhom_nguoi_cham, la_chu_tich, vang_mat) VALUES
    (@to3, @nd_gv_lan, 'GVHD', TRUE, FALSE),
    (@to3, @nd_gv_minh, 'GVHD', FALSE, FALSE),
    (@to3, @nd_gv_hoa, 'GVHD', FALSE, TRUE),
    (@to3, @nd_gv_tung, 'GVHD', FALSE, FALSE),
    (@to3, @nd_cb_quang, 'DVHD', FALSE, FALSE),
    (@to3, @nd_cb_duc, 'DVHD', FALSE, FALSE);
INSERT INTO to_danh_gia_ho_so (to_danh_gia_id, ho_so_id) VALUES
    (@to3, @hs_s7),
    (@to3, @hs_s8),
    (@to3, @hs_s9),
    (@to3, @hs_s10);
SET @tv_vang = (SELECT id FROM thanh_vien_to_danh_gia WHERE to_danh_gia_id = @to3 AND nguoi_dung_id = @nd_gv_hoa);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 07:45:00', @giaovu, 'ADMIN', 'DOI_VANG_MAT_THANH_VIEN', 'thanh_vien_to_danh_gia', @tv_vang, '{"vangMat":false}', '{"vangMat":true,"lyDo":"Đi công tác đột xuất, được Trưởng Khoa đồng ý","thayThe":"gv.tung"}');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — PHIẾU CHẶNG 2 (THÀNH VIÊN TỔ, UC09)
-- ---------------------------------------------------------------------
-- Phiếu của gv.hoa cho S8 nộp trước khi được đánh dấu vắng mặt ⇒ bị loại khỏi trung bình (Đ10 k3).
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s1, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 9:10:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8, NULL),
    (@phieu, @k1_clo2, 3, 7, NULL),
    (@phieu, @k1_clo3, 3, 8, NULL),
    (@phieu, @k1_clo4, 4, 9, NULL),
    (@phieu, @k1_clo5, 3, 8, NULL),
    (@phieu, @k1_clo6, 3, 7, NULL),
    (@phieu, @k1_clo7, 3, 8, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 9:10:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":7.0},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s1, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 10:10:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 9, NULL),
    (@phieu, @k1_clo2, 3, 8, NULL),
    (@phieu, @k1_clo3, 3, 7, NULL),
    (@phieu, @k1_clo4, 4, 9, NULL),
    (@phieu, @k1_clo5, 3, 7, NULL),
    (@phieu, @k1_clo6, 3, 8, NULL),
    (@phieu, @k1_clo7, 3, 7, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 10:10:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.0},"CLO2":{"muc":3,"diem":8.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s1, @k1_c2, @nd_cb_son, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 11:10:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8, NULL),
    (@phieu, @k1_clo2, 3, 7, NULL),
    (@phieu, @k1_clo3, 3, 7, NULL),
    (@phieu, @k1_clo4, 4, 9, NULL),
    (@phieu, @k1_clo5, 3, 8, NULL),
    (@phieu, @k1_clo6, 3, 8, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 11:10:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s2, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 9:11:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 9.0, NULL),
    (@phieu, @k1_clo2, 4, 9.0, NULL),
    (@phieu, @k1_clo3, 4, 8.5, NULL),
    (@phieu, @k1_clo4, 4, 9.5, NULL),
    (@phieu, @k1_clo5, 4, 9.0, NULL),
    (@phieu, @k1_clo6, 4, 8.5, NULL),
    (@phieu, @k1_clo7, 4, 8.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 9:11:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.0},"CLO2":{"muc":4,"diem":9.0},"CLO3":{"muc":4,"diem":8.5},"CLO4":{"muc":4,"diem":9.5},"CLO5":{"muc":4,"diem":9.0},"CLO6":{"muc":4,"diem":8.5},"CLO7":{"muc":4,"diem":8.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s2, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 10:11:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 8.5, NULL),
    (@phieu, @k1_clo2, 4, 8.5, NULL),
    (@phieu, @k1_clo3, 3, 8.0, NULL),
    (@phieu, @k1_clo4, 4, 9.0, NULL),
    (@phieu, @k1_clo5, 4, 8.5, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL),
    (@phieu, @k1_clo7, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 10:11:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":8.5},"CLO2":{"muc":4,"diem":8.5},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":4,"diem":8.5},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s2, @k1_c2, @nd_cb_son, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 11:11:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 8.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 11:11:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":8.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s3, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 9:12:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL),
    (@phieu, @k1_clo7, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 9:12:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5},"CLO7":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s3, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 10:12:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL),
    (@phieu, @k1_clo7, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 10:12:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0},"CLO7":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s3, @k1_c2, @nd_cb_son, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 11:12:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 2, 6.5, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 2, 6.0, NULL),
    (@phieu, @k1_clo4, 3, 7.0, NULL),
    (@phieu, @k1_clo5, 2, 6.5, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 11:12:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":6.5},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":7.0},"CLO5":{"muc":2,"diem":6.5},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s4, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 9:13:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 8.0, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL),
    (@phieu, @k1_clo7, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 9:13:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s4, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 10:13:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL),
    (@phieu, @k1_clo7, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 10:13:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5},"CLO7":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s4, @k1_c2, @nd_cb_son, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-05 11:13:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-05 11:13:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s5, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 9:14:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 8.0, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL),
    (@phieu, @k1_clo7, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 9:14:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s5, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 10:14:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL),
    (@phieu, @k1_clo7, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 10:14:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5},"CLO7":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s5, @k1_c2, @nd_cb_trang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 11:14:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 11:14:00', @nd_cb_trang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s6, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 9:15:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 10, NULL),
    (@phieu, @k1_clo2, 4, 9.5, NULL),
    (@phieu, @k1_clo3, 4, 9.5, NULL),
    (@phieu, @k1_clo4, 4, 10, NULL),
    (@phieu, @k1_clo5, 4, 9.5, NULL),
    (@phieu, @k1_clo6, 4, 9.5, NULL),
    (@phieu, @k1_clo7, 4, 9.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 9:15:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":10.0},"CLO2":{"muc":4,"diem":9.5},"CLO3":{"muc":4,"diem":9.5},"CLO4":{"muc":4,"diem":10.0},"CLO5":{"muc":4,"diem":9.5},"CLO6":{"muc":4,"diem":9.5},"CLO7":{"muc":4,"diem":9.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s6, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 10:15:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 9.5, NULL),
    (@phieu, @k1_clo2, 4, 9.0, NULL),
    (@phieu, @k1_clo3, 4, 9.0, NULL),
    (@phieu, @k1_clo4, 4, 9.5, NULL),
    (@phieu, @k1_clo5, 4, 9.0, NULL),
    (@phieu, @k1_clo6, 4, 9.0, NULL),
    (@phieu, @k1_clo7, 4, 9.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 10:15:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.5},"CLO2":{"muc":4,"diem":9.0},"CLO3":{"muc":4,"diem":9.0},"CLO4":{"muc":4,"diem":9.5},"CLO5":{"muc":4,"diem":9.0},"CLO6":{"muc":4,"diem":9.0},"CLO7":{"muc":4,"diem":9.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s6, @k1_c2, @nd_cb_trang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-06 11:15:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 9.0, NULL),
    (@phieu, @k1_clo2, 4, 8.5, NULL),
    (@phieu, @k1_clo3, 4, 8.5, NULL),
    (@phieu, @k1_clo4, 4, 9.0, NULL),
    (@phieu, @k1_clo5, 4, 8.5, NULL),
    (@phieu, @k1_clo6, 4, 8.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 11:15:00', @nd_cb_trang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.0},"CLO2":{"muc":4,"diem":8.5},"CLO3":{"muc":4,"diem":8.5},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":4,"diem":8.5},"CLO6":{"muc":4,"diem":8.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 9:16:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 4, 8.5, NULL),
    (@phieu, @k1_clo2, 3, 8.0, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 9.0, NULL),
    (@phieu, @k1_clo5, 3, 8.0, NULL),
    (@phieu, @k1_clo6, 4, 8.5, NULL),
    (@phieu, @k1_clo7, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 9:16:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":8.5},"CLO2":{"muc":3,"diem":8.0},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":4,"diem":8.5},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 10:16:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 7.5, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL),
    (@phieu, @k1_clo7, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 10:16:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.5},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 11:16:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL),
    (@phieu, @k1_clo7, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 11:16:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.5},"CLO7":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c2, @nd_cb_quang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 12:16:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 12:16:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s7, @k1_c2, @nd_cb_duc, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 13:16:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 7.5, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 8.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 13:16:00', @nd_cb_duc, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.5},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 9:17:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 8.0, NULL),
    (@phieu, @k1_clo2, 3, 7.5, NULL),
    (@phieu, @k1_clo3, 3, 7.5, NULL),
    (@phieu, @k1_clo4, 4, 8.5, NULL),
    (@phieu, @k1_clo5, 3, 7.5, NULL),
    (@phieu, @k1_clo6, 3, 7.5, NULL),
    (@phieu, @k1_clo7, 3, 7.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 9:17:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.5},"CLO3":{"muc":3,"diem":7.5},"CLO4":{"muc":4,"diem":8.5},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.5},"CLO7":{"muc":3,"diem":7.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 10:17:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL),
    (@phieu, @k1_clo7, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 10:17:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0},"CLO7":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 11:17:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 2, 6.5, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 2, 6.5, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL),
    (@phieu, @k1_clo7, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 11:17:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":2,"diem":6.5},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":2,"diem":6.5},"CLO6":{"muc":2,"diem":6.5},"CLO7":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_cb_quang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 12:17:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.0, NULL),
    (@phieu, @k1_clo2, 2, 6.5, NULL),
    (@phieu, @k1_clo3, 2, 6.5, NULL),
    (@phieu, @k1_clo4, 3, 7.5, NULL),
    (@phieu, @k1_clo5, 2, 6.5, NULL),
    (@phieu, @k1_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 12:17:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":2,"diem":6.5},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":2,"diem":6.5},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_cb_duc, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 13:17:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 3, 7.5, NULL),
    (@phieu, @k1_clo2, 3, 7.0, NULL),
    (@phieu, @k1_clo3, 3, 7.0, NULL),
    (@phieu, @k1_clo4, 3, 8.0, NULL),
    (@phieu, @k1_clo5, 3, 7.0, NULL),
    (@phieu, @k1_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 13:17:00', @nd_cb_duc, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s8, @k1_c2, @nd_gv_hoa, 'GVHD', 'Chấm trước buổi báo cáo theo hồ sơ.', 'DA_NOP', '2026-05-06 16:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 2, NULL),
    (@phieu, @k1_clo2, 0, 2, NULL),
    (@phieu, @k1_clo3, 0, 2, NULL),
    (@phieu, @k1_clo4, 0, 2, NULL),
    (@phieu, @k1_clo5, 0, 2, NULL),
    (@phieu, @k1_clo6, 0, 2, NULL),
    (@phieu, @k1_clo7, 0, 2, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-06 16:00:00', @nd_gv_hoa, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":2.0},"CLO2":{"muc":0,"diem":2.0},"CLO3":{"muc":0,"diem":2.0},"CLO4":{"muc":0,"diem":2.0},"CLO5":{"muc":0,"diem":2.0},"CLO6":{"muc":0,"diem":2.0},"CLO7":{"muc":0,"diem":2.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 9:18:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 2, 5.5, NULL),
    (@phieu, @k1_clo2, 2, 5.5, NULL),
    (@phieu, @k1_clo3, 1, 5.0, NULL),
    (@phieu, @k1_clo4, 2, 5.5, NULL),
    (@phieu, @k1_clo5, 1, 5.0, NULL),
    (@phieu, @k1_clo6, 1, 5.0, NULL),
    (@phieu, @k1_clo7, 1, 5.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 9:18:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":5.5},"CLO2":{"muc":2,"diem":5.5},"CLO3":{"muc":1,"diem":5.0},"CLO4":{"muc":2,"diem":5.5},"CLO5":{"muc":1,"diem":5.0},"CLO6":{"muc":1,"diem":5.0},"CLO7":{"muc":1,"diem":5.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 10:18:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 1, 5.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 1, 4.5, NULL),
    (@phieu, @k1_clo4, 1, 5.0, NULL),
    (@phieu, @k1_clo5, 1, 4.5, NULL),
    (@phieu, @k1_clo6, 1, 4.5, NULL),
    (@phieu, @k1_clo7, 1, 4.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 10:18:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":1,"diem":5.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":1,"diem":4.5},"CLO4":{"muc":1,"diem":5.0},"CLO5":{"muc":1,"diem":4.5},"CLO6":{"muc":1,"diem":4.5},"CLO7":{"muc":1,"diem":4.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 11:18:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 1, 4.5, NULL),
    (@phieu, @k1_clo2, 1, 4.5, NULL),
    (@phieu, @k1_clo3, 1, 4.0, NULL),
    (@phieu, @k1_clo4, 1, 4.5, NULL),
    (@phieu, @k1_clo5, 1, 4.0, NULL),
    (@phieu, @k1_clo6, 1, 4.0, NULL),
    (@phieu, @k1_clo7, 1, 4.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 11:18:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":1,"diem":4.5},"CLO2":{"muc":1,"diem":4.5},"CLO3":{"muc":1,"diem":4.0},"CLO4":{"muc":1,"diem":4.5},"CLO5":{"muc":1,"diem":4.0},"CLO6":{"muc":1,"diem":4.0},"CLO7":{"muc":1,"diem":4.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c2, @nd_cb_quang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 12:18:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 1, 4.5, NULL),
    (@phieu, @k1_clo2, 1, 4.5, NULL),
    (@phieu, @k1_clo3, 1, 4.0, NULL),
    (@phieu, @k1_clo4, 1, 4.5, NULL),
    (@phieu, @k1_clo5, 1, 4.0, NULL),
    (@phieu, @k1_clo6, 1, 4.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 12:18:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":1,"diem":4.5},"CLO2":{"muc":1,"diem":4.5},"CLO3":{"muc":1,"diem":4.0},"CLO4":{"muc":1,"diem":4.5},"CLO5":{"muc":1,"diem":4.0},"CLO6":{"muc":1,"diem":4.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s9, @k1_c2, @nd_cb_duc, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 13:18:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 1, 5.0, NULL),
    (@phieu, @k1_clo2, 1, 5.0, NULL),
    (@phieu, @k1_clo3, 1, 4.5, NULL),
    (@phieu, @k1_clo4, 1, 5.0, NULL),
    (@phieu, @k1_clo5, 1, 4.5, NULL),
    (@phieu, @k1_clo6, 1, 4.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 13:18:00', @nd_cb_duc, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":1,"diem":5.0},"CLO2":{"muc":1,"diem":5.0},"CLO3":{"muc":1,"diem":4.5},"CLO4":{"muc":1,"diem":5.0},"CLO5":{"muc":1,"diem":4.5},"CLO6":{"muc":1,"diem":4.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c2, @nd_gv_lan, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 9:19:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 3.5, NULL),
    (@phieu, @k1_clo2, 0, 3.5, NULL),
    (@phieu, @k1_clo3, 1, 4.5, NULL),
    (@phieu, @k1_clo4, 1, 5.0, NULL),
    (@phieu, @k1_clo5, 1, 4.5, NULL),
    (@phieu, @k1_clo6, 1, 4.0, NULL),
    (@phieu, @k1_clo7, 1, 4.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 9:19:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":3.5},"CLO2":{"muc":0,"diem":3.5},"CLO3":{"muc":1,"diem":4.5},"CLO4":{"muc":1,"diem":5.0},"CLO5":{"muc":1,"diem":4.5},"CLO6":{"muc":1,"diem":4.0},"CLO7":{"muc":1,"diem":4.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c2, @nd_gv_minh, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 10:19:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 3.0, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 1, 4.0, NULL),
    (@phieu, @k1_clo4, 1, 4.5, NULL),
    (@phieu, @k1_clo5, 1, 4.0, NULL),
    (@phieu, @k1_clo6, 0, 3.5, NULL),
    (@phieu, @k1_clo7, 0, 3.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 10:19:00', @nd_gv_minh, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":3.0},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":1,"diem":4.0},"CLO4":{"muc":1,"diem":4.5},"CLO5":{"muc":1,"diem":4.0},"CLO6":{"muc":0,"diem":3.5},"CLO7":{"muc":0,"diem":3.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c2, @nd_gv_tung, 'GVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 11:19:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 2.5, NULL),
    (@phieu, @k1_clo2, 0, 2.5, NULL),
    (@phieu, @k1_clo3, 0, 3.5, NULL),
    (@phieu, @k1_clo4, 1, 4.0, NULL),
    (@phieu, @k1_clo5, 0, 3.5, NULL),
    (@phieu, @k1_clo6, 0, 3.0, NULL),
    (@phieu, @k1_clo7, 0, 3.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 11:19:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":2.5},"CLO2":{"muc":0,"diem":2.5},"CLO3":{"muc":0,"diem":3.5},"CLO4":{"muc":1,"diem":4.0},"CLO5":{"muc":0,"diem":3.5},"CLO6":{"muc":0,"diem":3.0},"CLO7":{"muc":0,"diem":3.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c2, @nd_cb_quang, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 12:19:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 2.5, NULL),
    (@phieu, @k1_clo2, 0, 2.5, NULL),
    (@phieu, @k1_clo3, 0, 3.5, NULL),
    (@phieu, @k1_clo4, 1, 4.0, NULL),
    (@phieu, @k1_clo5, 0, 3.5, NULL),
    (@phieu, @k1_clo6, 0, 3.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 12:19:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":2.5},"CLO2":{"muc":0,"diem":2.5},"CLO3":{"muc":0,"diem":3.5},"CLO4":{"muc":1,"diem":4.0},"CLO5":{"muc":0,"diem":3.5},"CLO6":{"muc":0,"diem":3.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_s10, @k1_c2, @nd_cb_duc, 'DVHD', 'Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.', 'DA_NOP', '2026-05-07 13:19:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k1_clo1, 0, 3.0, NULL),
    (@phieu, @k1_clo2, 0, 3.0, NULL),
    (@phieu, @k1_clo3, 1, 4.0, NULL),
    (@phieu, @k1_clo4, 1, 4.5, NULL),
    (@phieu, @k1_clo5, 1, 4.0, NULL),
    (@phieu, @k1_clo6, 0, 3.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-07 13:19:00', @nd_cb_duc, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":0,"diem":3.0},"CLO2":{"muc":0,"diem":3.0},"CLO3":{"muc":1,"diem":4.0},"CLO4":{"muc":1,"diem":4.5},"CLO5":{"muc":1,"diem":4.0},"CLO6":{"muc":0,"diem":3.5}}');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — PHẢN HỒI 08a / 08b (UC12)
-- ---------------------------------------------------------------------
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s1, 'TTTN_08A', @nd_cb_son, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":4,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":4,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":4,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":4,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s1, 'TTTN_08B', @nd_sv_nam, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":5,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":4,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":5,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":4,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.9, 0.00, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s2, 'TTTN_08A', @nd_cb_son, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":3,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":3,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":3,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":3,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s2, 'TTTN_08B', @nd_sv_oanh, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":4,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":3,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":4,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":3,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO2","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 8.6, 0.29, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s3, 'TTTN_08A', @nd_cb_son, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":3,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":0,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":3,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":3,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":3,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":2,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s3, 'TTTN_08B', @nd_sv_phong, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":5,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":4,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":5,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":4,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":2,"diemQuyDoi":6.25,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.2, 0.57, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s4, 'TTTN_08A', @nd_cb_son, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":4,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":2,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":4,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":4,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s4, 'TTTN_08B', @nd_sv_quyen, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":4,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":3,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":4,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":3,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.8, 0.29, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s5, 'TTTN_08A', @nd_cb_trang, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":3,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":1,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":3,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":3,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":3,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":3,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s5, 'TTTN_08B', @nd_sv_tai, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":5,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":4,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":5,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":4,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.4, 0.14, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s6, 'TTTN_08A', @nd_cb_trang, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":4,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":4,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":4,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":4,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s6, 'TTTN_08B', @nd_sv_uyen, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":4,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":3,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":4,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":3,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO3","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO4","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":4,"diemQuyDoi":9.25,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 8.3, 0.57, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s7, 'TTTN_08A', @nd_cb_duc, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":4,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":4,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":4,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":4,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s7, 'TTTN_08B', @nd_sv_vinh, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":5,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":4,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":5,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":4,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO3","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.8, 0.00, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s8, 'TTTN_08A', @nd_cb_quang, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":3,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":2,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":3,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":3,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":3,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":2,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s8, 'TTTN_08B', @nd_sv_xuan, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":4,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":3,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":4,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":3,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO2","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO3","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO6","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO7","muc":3,"diemQuyDoi":7.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 7.6, 0.29, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s9, 'TTTN_08A', @nd_cb_quang, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":1,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":1,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":1,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":1,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":1,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":1,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s9, 'TTTN_08B', @nd_sv_thao, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":5,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":4,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":5,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":4,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO2","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO3","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO4","muc":3,"diemQuyDoi":7.75,"minhChung":null},{"maClo":"CLO5","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO6","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO7","muc":2,"diemQuyDoi":6.25,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 6.4, 1.14, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_s10, 'TTTN_08A', @nd_cb_quang, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":1,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":1,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":2,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":2,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":2,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":1,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-05-02 10:00:00');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, hp_self, chi_so_tu_nhan_thuc, y_kien_mo, ngay_gui) VALUES (@hs_s10, 'TTTN_08B', @nd_sv_toan, '{"chatLuong":[{"stt":1,"noiDung":"Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo","mucHaiLong":4,"ghiChu":null},{"stt":2,"noiDung":"Mức độ hỗ trợ từ giảng viên hướng dẫn","mucHaiLong":4,"ghiChu":null},{"stt":3,"noiDung":"Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD","mucHaiLong":3,"ghiChu":null},{"stt":4,"noiDung":"Điều kiện làm việc và an toàn tại nơi thực tập","mucHaiLong":4,"ghiChu":null},{"stt":5,"noiDung":"Cơ hội học hỏi và phát triển nghề nghiệp","mucHaiLong":4,"ghiChu":null},{"stt":6,"noiDung":"Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)","mucHaiLong":3,"ghiChu":null}],"yKienKhac":null,"tuDanhGia":[{"maClo":"CLO1","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO2","muc":1,"diemQuyDoi":4.75,"minhChung":null},{"maClo":"CLO3","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO4","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO5","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO6","muc":2,"diemQuyDoi":6.25,"minhChung":null},{"maClo":"CLO7","muc":1,"diemQuyDoi":4.75,"minhChung":null}],"tuLuan":{"kyNangHocDuoc":"Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.","khoKhan":"Chưa quen công cụ của đơn vị trong hai tuần đầu.","keHoachCaiThien":"Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.","deXuat":"Có buổi định hướng chung trước khi sinh viên đến đơn vị."},"camKet":true}', 5.7, 1.29, 'Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.', '2026-05-03 20:00:00');

-- ---------------------------------------------------------------------
-- TTTN-2025-HK2 — KẾT QUẢ HỌC PHẦN (UC10) — TÍNH SẴN, ĐÃ KIỂM BẰNG #84
-- ---------------------------------------------------------------------
-- sv.nam: HP 7.7 Mức 3 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s1, 8.2, 7.2, 7.2, 8.8, 7.7, 7.4, 7.5, 7.7, 3, 0, 7.7, 7.4, 8.1, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s1, NULL, '{"diemHp":7.7,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s1, '{"trangThai":"DA_TINH"}', '{"diemHp":7.7,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s1, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":7.7,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_nam, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s1), TRUE, '2026-05-15 08:00:00');
-- sv.oanh: HP 8.6 Mức 4 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s2, 8.4, 8.4, 7.9, 8.6, 8.3, 7.9, 8.3, 8.6, 4, 0.3, 8.4, 8.1, 8.4, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s2, NULL, '{"diemHp":8.6,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s2, '{"trangThai":"DA_TINH"}', '{"diemHp":8.6,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s2, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":8.6,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_oanh, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s2), TRUE, '2026-05-15 08:00:00');
-- sv.phong: HP 5.9 Mức 2 — KHONG_DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s3, 7.1, 3.0, 6.6, 7.2, 7.0, 6.8, 6.8, 5.9, 2, 0, 5.0, 6.8, 7.0, 'KHONG_DAT', '(b) CLO2 đạt Mức 0 — dưới Mức 1 yêu cầu của chương trình Chuẩn (Điều 15 khoản 3 điểm b)', 'TTTN-2025-HK2@goc', 'Sinh viên chưa đáp ứng đủ điều kiện công nhận hoàn thành theo Điều 15 khoản 3; cần đăng ký thực tập lại.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s3, NULL, '{"diemHp":5.9,"ketLuan":"KHONG_DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s3, '{"trangThai":"DA_TINH"}', '{"diemHp":5.9,"ketLuan":"KHONG_DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s3, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":5.9,"ketLuan":"KHONG_DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_phong, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s3), TRUE, '2026-05-15 08:00:00');
-- sv.quyen: HP 6.9 Mức 2 — KHONG_DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s4, 7.6, 5.0, 7.4, 7.7, 7.5, 7.3, 7.8, 6.9, 2, 0, 6.3, 7.4, 7.7, 'KHONG_DAT', '(b) CLO2 đạt Mức 1 — dưới Mức 2 yêu cầu của chương trình CLC/STEM (Điều 15 khoản 3 điểm b)', 'TTTN-2025-HK2@goc', 'Sinh viên chưa đáp ứng đủ điều kiện công nhận hoàn thành theo Điều 15 khoản 3; cần đăng ký thực tập lại.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s4, NULL, '{"diemHp":6.9,"ketLuan":"KHONG_DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s4, '{"trangThai":"DA_TINH"}', '{"diemHp":6.9,"ketLuan":"KHONG_DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s4, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":6.9,"ketLuan":"KHONG_DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_quyen, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s4), TRUE, '2026-05-15 08:00:00');
-- sv.tai: HP 6.9 Mức 2 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s5, 7.6, 5.0, 7.4, 7.7, 7.5, 7.3, 7.8, 6.9, 2, 0, 6.3, 7.4, 7.7, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s5, NULL, '{"diemHp":6.9,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s5, '{"trangThai":"DA_TINH"}', '{"diemHp":6.9,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s5, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":6.9,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_tai, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s5), TRUE, '2026-05-15 08:00:00');
-- sv.uyen: HP 9.1 Mức 4 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s6, 9.4, 8.9, 8.9, 9.1, 9.0, 8.9, 9.3, 9.1, 4, 0, 9.2, 8.9, 9.2, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s6, NULL, '{"diemHp":9.1,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s6, '{"trangThai":"DA_TINH"}', '{"diemHp":9.1,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s6, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":9.1,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_uyen, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s6), TRUE, '2026-05-15 08:00:00');
-- sv.vinh: HP 7.6 Mức 3 — KHONG_DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s7, 7.9, 7.4, 7.0, 8.2, 7.5, 7.8, 7.5, 7.6, 3, 0, 7.6, 7.4, 7.8, 'KHONG_DAT', '(d) Thiếu minh chứng bắt buộc: Sản phẩm nghiên cứu (Điều 15 khoản 3 điểm d)', 'TTTN-2025-HK2@goc', 'Sinh viên chưa đáp ứng đủ điều kiện công nhận hoàn thành theo Điều 15 khoản 3; cần đăng ký thực tập lại.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s7, NULL, '{"diemHp":7.6,"ketLuan":"KHONG_DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s7, '{"trangThai":"DA_TINH"}', '{"diemHp":7.6,"ketLuan":"KHONG_DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s7, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":7.6,"ketLuan":"KHONG_DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_vinh, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s7), TRUE, '2026-05-15 08:00:00');
-- sv.xuan: HP 7.1 Mức 3 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s8, 7.4, 6.9, 6.9, 7.7, 7.0, 6.9, 7.0, 7.1, 3, 0, 7.1, 6.9, 7.3, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s8, NULL, '{"diemHp":7.1,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s8, '{"trangThai":"DA_TINH"}', '{"diemHp":7.1,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s8, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":7.1,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_xuan, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s8), TRUE, '2026-05-15 08:00:00');
-- sv.thao: HP 4.7 Mức 1 — DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s9, 5.0, 5.0, 4.5, 4.8, 4.5, 4.4, 4.5, 4.7, 1, 0, 5.0, 4.5, 4.7, 'DAT', NULL, 'TTTN-2025-HK2@goc', 'Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s9, NULL, '{"diemHp":4.7,"ketLuan":"DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s9, '{"trangThai":"DA_TINH"}', '{"diemHp":4.7,"ketLuan":"DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s9, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":4.7,"ketLuan":"DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_thao, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s9), TRUE, '2026-05-15 08:00:00');
-- sv.toan: HP 3.4 Mức 0 — KHONG_DAT
INSERT INTO ket_qua_hoc_phan (ho_so_id, diem_clo1, diem_clo2, diem_clo3, diem_clo4, diem_clo5, diem_clo6, diem_clo7, diem_hp, muc_dat, diem_thuong, nhom_kien_thuc, nhom_ky_nang, nhom_thai_do, ket_luan, ly_do_khong_dat, phien_ban_trong_so, nhan_xet_gvhd, trang_thai, ngay_tinh) VALUES (@hs_s10, 3.0, 3.0, 4.0, 4.3, 4.0, 3.4, 3.5, 3.4, 0, 0, 3.0, 3.8, 3.9, 'KHONG_DAT', '(b) CLO1 đạt Mức 0, CLO2 đạt Mức 0 — dưới Mức 1 yêu cầu của chương trình Chuẩn (Điều 15 khoản 3 điểm b)
(c) Điểm học phần 3,4 (Mức 0) dưới Mức 1 (Điều 15 khoản 3 điểm c)', 'TTTN-2025-HK2@goc', 'Sinh viên chưa đáp ứng đủ điều kiện công nhận hoàn thành theo Điều 15 khoản 3; cần đăng ký thực tập lại.', 'DA_CONG_BO', '2026-05-11 09:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 09:00:00', @giaovu, 'ADMIN', 'TINH_DIEM', 'ho_so_thuc_tap', @hs_s10, NULL, '{"diemHp":3.4,"ketLuan":"KHONG_DAT","trangThai":"DA_TINH","nguon":"GIAO_VU_TINH_LAI"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-12 10:00:00', @giaovu, 'ADMIN', 'XAC_NHAN_KET_QUA', 'ho_so_thuc_tap', @hs_s10, '{"trangThai":"DA_TINH"}', '{"diemHp":3.4,"ketLuan":"KHONG_DAT","trangThai":"DA_XAC_NHAN"}');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-15 08:00:00', @giaovu, 'ADMIN', 'CONG_BO_KET_QUA', 'ho_so_thuc_tap', @hs_s10, '{"trangThai":"DA_XAC_NHAN"}', '{"diemHp":3.4,"ketLuan":"KHONG_DAT","trangThai":"DA_CONG_BO"}');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_sv_toan, 'NT-14', 'Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. Gửi phiếu phản hồi TTTN-08b để xem kết quả.', CONCAT('/results/', @hs_s10), TRUE, '2026-05-15 08:00:00');
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-05-11 08:55:00', @nd_gv_tung, 'GIANG_VIEN', 'DE_XUAT_DIEM_THUONG', 'ho_so_thuc_tap', @hs_s2, '{"diemThuong":0}', '{"diemThuong":0.3}');

-- ---------------------------------------------------------------------
-- ĐỢT TTTN-2026-HK1 — ĐANG THỰC HIỆN (đã qua ngày kết thúc, hai chặng đang mở)
-- ---------------------------------------------------------------------
INSERT INTO dot_thuc_tap (ma_dot, ten, hoc_ky, nam_hoc, khoa_vien, ngay_bat_dau, ngay_ket_thuc, so_tuan, han_nop_bao_cao, trang_thai) VALUES ('TTTN-2026-HK1', 'Thực tập tốt nghiệp học kỳ 1 năm học 2026–2027', 'HK1', '2026-2027', 'Khoa Công nghệ thông tin', '2026-09-07', '2026-11-01', 8, '2026-11-06', 'DANG_THUC_HIEN');
SET @dot_k2 = LAST_INSERT_ID();
SET @mau = (SELECT id FROM dot_thuc_tap WHERE ma_dot = 'MAU-QD207');
-- UC03 bước 4: chặng 1 mở đầu tuần 4 (bắt đầu + 21 ngày), chặng 2 mở ngày liền sau ngày kết thúc.
INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, ngay_mo, ngay_dong, trang_thai)
SELECT @dot_k2, thu_tu, ten, 4, trong_so_w, '2026-09-28', NULL, 'DANG_MO'
FROM chang_danh_gia WHERE dot_id = @mau AND thu_tu = 1;
SET @k2_c1 = LAST_INSERT_ID();
INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, ngay_mo, ngay_dong, trang_thai)
SELECT @dot_k2, thu_tu, ten, 8, trong_so_w, '2026-11-02', NULL, 'DANG_MO'
FROM chang_danh_gia WHERE dot_id = @mau AND thu_tu = 2;
SET @k2_c2 = LAST_INSERT_ID();
INSERT INTO chuan_dau_ra (dot_id, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd)
SELECT @dot_k2, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd FROM chuan_dau_ra WHERE dot_id = @mau ORDER BY id;
INSERT INTO muc_rubric (chuan_dau_ra_id, muc, diem_min, diem_max, mo_ta_hanh_vi)
SELECT moi.id, m.muc, m.diem_min, m.diem_max, m.mo_ta_hanh_vi
FROM muc_rubric m
JOIN chuan_dau_ra goc ON goc.id = m.chuan_dau_ra_id AND goc.dot_id = @mau
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_k2 AND moi.ma_clo = goc.ma_clo
ORDER BY m.id;
INSERT INTO cau_hoi_danh_gia (chang_id, chuan_dau_ra_id, thu_tu, noi_dung)
SELECT CASE c.thu_tu WHEN 1 THEN @k2_c1 ELSE @k2_c2 END, moi.id, q.thu_tu, q.noi_dung
FROM cau_hoi_danh_gia q
JOIN chang_danh_gia c ON c.id = q.chang_id AND c.dot_id = @mau
JOIN chuan_dau_ra goc ON goc.id = q.chuan_dau_ra_id
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_k2 AND moi.ma_clo = goc.ma_clo
ORDER BY q.id;
SET @k2_clo1 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO1');
SET @k2_clo2 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO2');
SET @k2_clo3 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO3');
SET @k2_clo4 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO4');
SET @k2_clo5 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO5');
SET @k2_clo6 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO6');
SET @k2_clo7 = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_k2 AND ma_clo = 'CLO7');

-- ---------------------------------------------------------------------
-- TTTN-2026-HK1 — HỒ SƠ
-- ---------------------------------------------------------------------
-- Bước 4: sv.dung chờ cán bộ cb.duc xác nhận · Bước 5: sv.giang + sv.mai chưa có GVHD, gv.hoa đã 4/5 ⇒ phân công
-- cả hai cho gv.hoa bị hủy cả lô (CBR-04) · Bước 6: sv.ha đã phân công gv.lan, chờ duyệt.
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_an, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'CHO_DANH_GIA', '2026-08-17 10:00:00');
SET @hs_an = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_an, @gv_tung, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_an, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_an = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_an, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_an, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_an, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-09-12 17:00:00'),
    (@hs_an, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-09-19 17:00:00'),
    (@hs_an, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-09-26 17:00:00'),
    (@hs_an, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-10-03 17:00:00'),
    (@hs_an, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-10-10 17:00:00'),
    (@hs_an, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-10-17 17:00:00'),
    (@hs_an, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_son, '2026-10-24 17:00:00'),
    (@hs_an, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 100, @nd_cb_son, '2026-10-31 17:00:00');
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_an, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_an, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_an, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_an, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_an, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_an, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_an, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_an, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_binh, @dot_k2, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-18 10:01:00');
SET @hs_binh = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_binh, @gv_lan, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_binh, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_binh = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_binh, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_binh, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_binh, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-09-12 17:00:00'),
    (@hs_binh, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-09-19 17:00:00'),
    (@hs_binh, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-09-26 17:00:00'),
    (@hs_binh, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-10-03 17:00:00'),
    (@hs_binh, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-10-10 17:00:00'),
    (@hs_binh, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-10-17 17:00:00'),
    (@hs_binh, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 80, NULL, NULL),
    (@hs_binh, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', NULL, NULL, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_binh, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_binh, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_binh, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_binh, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_binh, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_binh, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_binh, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_binh, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_cuong, @dot_k2, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-19 10:02:00');
SET @hs_cuong = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_cuong, @gv_minh, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_cuong, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_cuong = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_cuong, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_cuong, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
-- sv.cuong: tuần 8 đã điền, cán bộ chưa xác nhận — demo bước 7 (#61–#63).
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_cuong, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-09-12 17:00:00'),
    (@hs_cuong, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-09-19 17:00:00'),
    (@hs_cuong, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-09-26 17:00:00'),
    (@hs_cuong, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-10-03 17:00:00'),
    (@hs_cuong, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-10-10 17:00:00'),
    (@hs_cuong, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-10-17 17:00:00'),
    (@hs_cuong, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 100, @nd_cb_quang, '2026-10-24 17:00:00'),
    (@hs_cuong, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Đã hoàn thành: bàn giao sản phẩm, viết báo cáo thực tập tttn-06', 90, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_cuong, '2026-09-07', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-07 18:00:00'),
    (@hs_cuong, '2026-09-09', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-09 18:00:00'),
    (@hs_cuong, '2026-09-11', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-11 18:00:00'),
    (@hs_cuong, '2026-09-14', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-14 18:00:00'),
    (@hs_cuong, '2026-09-16', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-16 18:00:00'),
    (@hs_cuong, '2026-09-18', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-18 18:00:00'),
    (@hs_cuong, '2026-09-21', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-21 18:00:00'),
    (@hs_cuong, '2026-09-23', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-23 18:00:00'),
    (@hs_cuong, '2026-09-25', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-25 18:00:00'),
    (@hs_cuong, '2026-09-28', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-28 18:00:00'),
    (@hs_cuong, '2026-09-30', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-30 18:00:00'),
    (@hs_cuong, '2026-10-02', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-02 18:00:00'),
    (@hs_cuong, '2026-10-05', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-05 18:00:00'),
    (@hs_cuong, '2026-10-07', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-07 18:00:00'),
    (@hs_cuong, '2026-10-09', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-09 18:00:00'),
    (@hs_cuong, '2026-10-12', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-12 18:00:00'),
    (@hs_cuong, '2026-10-14', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-14 18:00:00'),
    (@hs_cuong, '2026-10-16', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-16 18:00:00'),
    (@hs_cuong, '2026-10-19', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-19 18:00:00'),
    (@hs_cuong, '2026-10-21', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-21 18:00:00'),
    (@hs_cuong, '2026-10-23', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-23 18:00:00'),
    (@hs_cuong, '2026-10-26', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-26 18:00:00'),
    (@hs_cuong, '2026-10-28', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-28 18:00:00'),
    (@hs_cuong, '2026-10-30', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-30 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_dung, @dot_k2, 'DOANH_NGHIEP', @dv_thanglong, @cb_duc, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'CHO_DVHD', '2026-08-20 10:03:00');
SET @hs_dung = LAST_INSERT_ID();
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_giang, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_trang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'CHO_GVHD', '2026-08-21 10:04:00');
SET @hs_giang = LAST_INSERT_ID();
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_mai, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_trang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'CHO_GVHD', '2026-08-22 10:05:00');
SET @hs_mai = LAST_INSERT_ID();
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_ha, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_trang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'CHO_GVHD', '2026-08-17 10:06:00');
SET @hs_ha = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_ha, @gv_lan, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_nga, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-18 10:07:00');
SET @hs_nga = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_nga, @gv_hoa, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_nga, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_nga = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_nga, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_nga, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_nga, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-09-12 17:00:00'),
    (@hs_nga, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-09-19 17:00:00'),
    (@hs_nga, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-09-26 17:00:00'),
    (@hs_nga, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-10-03 17:00:00'),
    (@hs_nga, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-10-10 17:00:00'),
    (@hs_nga, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-10-17 17:00:00'),
    (@hs_nga, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 80, NULL, NULL),
    (@hs_nga, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', NULL, NULL, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_nga, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_nga, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_nga, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_nga, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_nga, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_nga, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_nga, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_nga, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_phat, @dot_k2, 'DOANH_NGHIEP', @dv_saomai, @cb_son, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-19 10:08:00');
SET @hs_phat = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_phat, @gv_hoa, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_phat, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_phat = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_phat, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_phat, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_phat, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_son, '2026-09-12 17:00:00'),
    (@hs_phat, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_son, '2026-09-19 17:00:00'),
    (@hs_phat, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_son, '2026-09-26 17:00:00'),
    (@hs_phat, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_son, '2026-10-03 17:00:00'),
    (@hs_phat, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_son, '2026-10-10 17:00:00'),
    (@hs_phat, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_son, '2026-10-17 17:00:00'),
    (@hs_phat, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 80, NULL, NULL),
    (@hs_phat, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', NULL, NULL, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_phat, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_phat, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_phat, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_phat, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_phat, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_phat, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_phat, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_phat, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_quan, @dot_k2, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-20 10:09:00');
SET @hs_quan = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_quan, @gv_hoa, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_quan, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_quan = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_quan, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_quan, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_quan, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-09-12 17:00:00'),
    (@hs_quan, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-09-19 17:00:00'),
    (@hs_quan, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-09-26 17:00:00'),
    (@hs_quan, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-10-03 17:00:00'),
    (@hs_quan, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-10-10 17:00:00'),
    (@hs_quan, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-10-17 17:00:00'),
    (@hs_quan, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 80, NULL, NULL),
    (@hs_quan, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', NULL, NULL, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_quan, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_quan, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_quan, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_quan, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_quan, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_quan, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_quan, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_quan, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
INSERT INTO ho_so_thuc_tap (sinh_vien_id, dot_id, hinh_thuc_thuc_tap, don_vi_id, can_bo_dvhd_id, bo_phan, de_tai, hinh_thuc_lam_viec, so_tuan_tham_gia, muc_tieu, san_pham_du_kien, trang_thai, ngay_gui) VALUES (@sv_thu, @dot_k2, 'DOANH_NGHIEP', @dv_hongha, @cb_quang, 'Phòng phát triển phần mềm', 'Phát triển ứng dụng web quản lý hồ sơ khách hàng', 'TRUC_TIEP', 8, 'Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị', 'Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật', 'DANG_THUC_TAP', '2026-08-21 10:10:00');
SET @hs_thu = LAST_INSERT_ID();
INSERT INTO phan_cong_gvhd (ho_so_id, giang_vien_id, ngay_phan_cong, nguoi_phan_cong) VALUES (@hs_thu, @gv_hoa, '2026-08-31 09:00:00', @giaovu);
INSERT INTO ke_hoach_hoc_tap (ho_so_id, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd, trang_thai) VALUES (@hs_thu, '2026-09-10 21:00:00', FALSE, '2026-09-11 09:00:00', '2026-09-11 16:00:00', 'DA_KHOA');
SET @kh_thu = LAST_INSERT_ID();
INSERT INTO muc_ke_hoach (ke_hoach_id, tuan, muc_tieu, ket_qua_mong_doi, hinh_thuc_minh_chung) VALUES
    (@kh_thu, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Hoàn thành nhiệm vụ tuần 1 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Hoàn thành nhiệm vụ tuần 2 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Hoàn thành nhiệm vụ tuần 3 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Hoàn thành nhiệm vụ tuần 4 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Hoàn thành nhiệm vụ tuần 5 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Hoàn thành nhiệm vụ tuần 6 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Hoàn thành nhiệm vụ tuần 7 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 'Hoàn thành nhiệm vụ tuần 8 đúng hạn', 'Nhật ký thực tập, sản phẩm tuần'),
    (@kh_thu, 9, 'Tổng kết, hoàn thiện báo cáo TTTN-06', 'Báo cáo được ĐVHD và GVHD xác nhận', 'Báo cáo TTTN-06');
INSERT INTO tien_do_tuan (ho_so_id, tuan, cong_viec_duoc_giao, ket_qua_thuc_hien, phan_tram_hoan_thanh, xac_nhan_dvhd_id, ngay_xac_nhan) VALUES
    (@hs_thu, 1, 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 'Đã hoàn thành: tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 100, @nd_cb_quang, '2026-09-12 17:00:00'),
    (@hs_thu, 2, 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 'Đã hoàn thành: phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 100, @nd_cb_quang, '2026-09-19 17:00:00'),
    (@hs_thu, 3, 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 'Đã hoàn thành: thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 100, @nd_cb_quang, '2026-09-26 17:00:00'),
    (@hs_thu, 4, 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 'Đã hoàn thành: lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 100, @nd_cb_quang, '2026-10-03 17:00:00'),
    (@hs_thu, 5, 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 'Đã hoàn thành: lập trình chức năng thứ hai, viết kiểm thử đơn vị', 100, @nd_cb_quang, '2026-10-10 17:00:00'),
    (@hs_thu, 6, 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 'Đã hoàn thành: tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 100, @nd_cb_quang, '2026-10-17 17:00:00'),
    (@hs_thu, 7, 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 'Đã hoàn thành: kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 80, NULL, NULL),
    (@hs_thu, 8, 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', NULL, NULL, NULL, NULL);
INSERT INTO nhat_ky_thuc_tap (ho_so_id, ngay, noi_dung, so_gio, ket_qua, ngay_tao) VALUES
    (@hs_thu, '2026-09-08', 'Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-08 18:00:00'),
    (@hs_thu, '2026-09-15', 'Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-15 18:00:00'),
    (@hs_thu, '2026-09-22', 'Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-22 18:00:00'),
    (@hs_thu, '2026-09-29', 'Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-09-29 18:00:00'),
    (@hs_thu, '2026-10-06', 'Lập trình chức năng thứ hai, viết kiểm thử đơn vị', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-06 18:00:00'),
    (@hs_thu, '2026-10-13', 'Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-13 18:00:00'),
    (@hs_thu, '2026-10-20', 'Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-20 18:00:00'),
    (@hs_thu, '2026-10-27', 'Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06', 8.0, 'Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ', '2026-10-27 18:00:00');
-- sv.an: báo cáo TTTN-06 đủ hai xác nhận ⇒ Chờ đánh giá (Đ10 k2).
INSERT INTO bao_cao_thuc_tap (ho_so_id, phien_ban, ten_file, duong_dan, ngay_nop, nop_muon, xac_nhan_dvhd, xac_nhan_gvhd) VALUES (@hs_an, 1, 'BaoCao_TTTN06_2251220001.pdf', CONCAT(@hs_an, '/seed-bao-cao-2251220001.pdf'), '2026-11-03 21:00:00', FALSE, '2026-11-04 09:30:00', '2026-11-05 14:00:00');

-- ---------------------------------------------------------------------
-- TTTN-2026-HK1 — PHIẾU CHẶNG 1
-- ---------------------------------------------------------------------
-- sv.an: ví dụ tính tay, hai bên đã nộp. sv.binh: cán bộ đã nộp, GV mới lưu nháp ⇒ GV gọi #71 phiếu cán bộ bị ACCESS_DENIED
-- (BR-08.7) đến khi tự nộp. sv.nga đủ hai phiếu, sv.phat thiếu GV, sv.quan GV nháp, sv.thu chưa ai chấm (RP-03).
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_an, @k2_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-10-01 15:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 7.0, NULL),
    (@phieu, @k2_clo2, 2, 6.5, NULL),
    (@phieu, @k2_clo3, 2, 6.0, NULL),
    (@phieu, @k2_clo4, 3, 8.0, NULL),
    (@phieu, @k2_clo5, 3, 7.5, NULL),
    (@phieu, @k2_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-01 15:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":2,"diem":6.5},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_an, @k2_c1, @nd_gv_tung, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-10-01 15:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 8.0, NULL),
    (@phieu, @k2_clo2, 3, 7.0, NULL),
    (@phieu, @k2_clo3, 3, 7.0, NULL),
    (@phieu, @k2_clo4, 4, 9.0, NULL),
    (@phieu, @k2_clo5, 3, 8.0, NULL),
    (@phieu, @k2_clo6, 2, 6.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-01 15:00:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":2,"diem":6.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_binh, @k2_c1, @nd_cb_quang, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-10-02 10:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 7.5, NULL),
    (@phieu, @k2_clo2, 3, 7.0, NULL),
    (@phieu, @k2_clo3, 3, 7.0, NULL),
    (@phieu, @k2_clo4, 3, 8.0, NULL),
    (@phieu, @k2_clo5, 3, 7.5, NULL),
    (@phieu, @k2_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-02 10:00:00', @nd_cb_quang, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_binh, @k2_c1, @nd_gv_lan, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'NHAP', NULL);
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 8.0, NULL),
    (@phieu, @k2_clo2, 3, 7.5, NULL),
    (@phieu, @k2_clo3, 3, 7.0, NULL),
    (@phieu, @k2_clo4, 3, 8.0, NULL),
    (@phieu, @k2_clo5, 3, 7.5, NULL),
    (@phieu, @k2_clo6, 3, 7.5, NULL);
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_nga, @k2_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-10-02 11:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 7.0, NULL),
    (@phieu, @k2_clo2, 3, 7.0, NULL),
    (@phieu, @k2_clo3, 2, 6.5, NULL),
    (@phieu, @k2_clo4, 3, 8.0, NULL),
    (@phieu, @k2_clo5, 3, 7.0, NULL),
    (@phieu, @k2_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-02 11:00:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":2,"diem":6.5},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_nga, @k2_c1, @nd_gv_hoa, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'DA_NOP', '2026-10-03 09:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 7.5, NULL),
    (@phieu, @k2_clo2, 3, 7.0, NULL),
    (@phieu, @k2_clo3, 3, 7.0, NULL),
    (@phieu, @k2_clo4, 3, 8.0, NULL),
    (@phieu, @k2_clo5, 3, 7.5, NULL),
    (@phieu, @k2_clo6, 3, 7.0, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-03 09:00:00', @nd_gv_hoa, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":7.5},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":3,"diem":8.0},"CLO5":{"muc":3,"diem":7.5},"CLO6":{"muc":3,"diem":7.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_phat, @k2_c1, @nd_cb_son, 'DVHD', 'Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ.', 'DA_NOP', '2026-10-02 11:30:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 2, 6.5, NULL),
    (@phieu, @k2_clo2, 2, 6.0, NULL),
    (@phieu, @k2_clo3, 2, 6.0, NULL),
    (@phieu, @k2_clo4, 3, 7.5, NULL),
    (@phieu, @k2_clo5, 3, 7.0, NULL),
    (@phieu, @k2_clo6, 2, 6.5, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-10-02 11:30:00', @nd_cb_son, 'CAN_BO_DVHD', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":2,"diem":6.5},"CLO2":{"muc":2,"diem":6.0},"CLO3":{"muc":2,"diem":6.0},"CLO4":{"muc":3,"diem":7.5},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":2,"diem":6.5}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_quan, @k2_c1, @nd_gv_hoa, 'GVHD', 'Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn.', 'NHAP', NULL);
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 7.0, NULL),
    (@phieu, @k2_clo2, 2, 6.5, NULL),
    (@phieu, @k2_clo3, 2, 6.5, NULL),
    (@phieu, @k2_clo4, 3, 7.5, NULL),
    (@phieu, @k2_clo5, 3, 7.0, NULL),
    (@phieu, @k2_clo6, 2, 6.5, NULL);

-- ---------------------------------------------------------------------
-- TTTN-2026-HK1 — TỔ ĐÁNH GIÁ CỦA sv.an VÀ PHIẾU CHẶNG 2
-- ---------------------------------------------------------------------
-- Bước 10–11: hai GV đã nộp; cb.son nộp live (ô CLO7 bị khóa) CLO1–6 = 8, 7, 7, 9, 8, 8 ⇒ hệ thống tự tính HP 7,7.
-- sv.an CHƯA gửi 08b: tính lần đầu ra Không đạt (d) thiếu 08b; SV gửi 08b ⇒ TTTN-07 cảnh báo dữ liệu đổi ⇒ giáo vụ
-- Tính lại ⇒ Đạt (docs/01 mục 10.14). Muốn đi thẳng tới Đạt thì cho SV gửi 08b trước khi cán bộ nộp phiếu.
INSERT INTO to_danh_gia (dot_id, ngay_thanh_lap, thoi_gian_bao_cao, dia_diem, hinh_thuc) VALUES (@dot_k2, '2026-11-05', '2026-11-12 08:00:00', 'Phòng 304 nhà A1', 'TRUC_TIEP');
SET @to_an = LAST_INSERT_ID();
INSERT INTO thanh_vien_to_danh_gia (to_danh_gia_id, nguoi_dung_id, nhom_nguoi_cham, la_chu_tich, vang_mat) VALUES
    (@to_an, @nd_gv_tung, 'GVHD', TRUE, FALSE),
    (@to_an, @nd_gv_lan, 'GVHD', FALSE, FALSE),
    (@to_an, @nd_cb_son, 'DVHD', FALSE, FALSE);
INSERT INTO to_danh_gia_ho_so (to_danh_gia_id, ho_so_id) VALUES
    (@to_an, @hs_an);
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_an, @k2_c2, @nd_gv_tung, 'GVHD', 'Báo cáo đầy đủ, sản phẩm chạy ổn định; cần bổ sung phần đánh giá rủi ro.', 'DA_NOP', '2026-11-12 10:00:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 3, 8, NULL),
    (@phieu, @k2_clo2, 3, 7, NULL),
    (@phieu, @k2_clo3, 3, 8, NULL),
    (@phieu, @k2_clo4, 4, 9, NULL),
    (@phieu, @k2_clo5, 3, 8, NULL),
    (@phieu, @k2_clo6, 3, 7, NULL),
    (@phieu, @k2_clo7, 3, 8, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-11-12 10:00:00', @nd_gv_tung, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":3,"diem":8.0},"CLO2":{"muc":3,"diem":7.0},"CLO3":{"muc":3,"diem":8.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":8.0},"CLO6":{"muc":3,"diem":7.0},"CLO7":{"muc":3,"diem":8.0}}');
INSERT INTO phieu_danh_gia (ho_so_id, chang_id, nguoi_cham_id, nhom_nguoi_cham, nhan_xet_chung, trang_thai, ngay_nop) VALUES (@hs_an, @k2_c2, @nd_gv_lan, 'GVHD', 'Trình bày tự tin, trả lời tốt câu hỏi về thiết kế cơ sở dữ liệu.', 'DA_NOP', '2026-11-12 10:20:00');
SET @phieu = LAST_INSERT_ID();
INSERT INTO diem_clo_chi_tiet (phieu_id, chuan_dau_ra_id, muc_dat, diem, nhan_xet) VALUES
    (@phieu, @k2_clo1, 4, 9, NULL),
    (@phieu, @k2_clo2, 3, 8, NULL),
    (@phieu, @k2_clo3, 3, 7, NULL),
    (@phieu, @k2_clo4, 4, 9, NULL),
    (@phieu, @k2_clo5, 3, 7, NULL),
    (@phieu, @k2_clo6, 3, 8, NULL),
    (@phieu, @k2_clo7, 3, 7, NULL);
INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, gia_tri_truoc, gia_tri_sau) VALUES ('2026-11-12 10:20:00', @nd_gv_lan, 'GIANG_VIEN', 'NOP_PHIEU', 'phieu_danh_gia', @phieu, NULL, '{"CLO1":{"muc":4,"diem":9.0},"CLO2":{"muc":3,"diem":8.0},"CLO3":{"muc":3,"diem":7.0},"CLO4":{"muc":4,"diem":9.0},"CLO5":{"muc":3,"diem":7.0},"CLO6":{"muc":3,"diem":8.0},"CLO7":{"muc":3,"diem":7.0}}');
INSERT INTO phan_hoi (ho_so_id, loai, nguoi_gui_id, du_lieu_tieu_chi, y_kien_mo, ngay_gui) VALUES (@hs_an, 'TTTN_08A', @nd_cb_son, '{"tieuChi":[{"stt":1,"noiDung":"Kiến thức chuyên môn và khả năng vận dụng thực tế","muc":3,"nhanXet":null},{"stt":2,"noiDung":"Kỹ năng phân tích và giải quyết vấn đề kỹ thuật","muc":3,"nhanXet":null},{"stt":3,"noiDung":"Kỹ năng giao tiếp và làm việc nhóm","muc":3,"nhanXet":null},{"stt":4,"noiDung":"Tinh thần trách nhiệm, tác phong và ý thức kỷ luật","muc":4,"nhanXet":null},{"stt":5,"noiDung":"Tuân thủ quy định an toàn lao động","muc":4,"nhanXet":null},{"stt":6,"noiDung":"Sáng tạo, chủ động, đề xuất cải tiến","muc":3,"nhanXet":null}]}', 'Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.', '2026-11-06 09:00:00');

-- ---------------------------------------------------------------------
-- TTTN-2026-HK1 — THÔNG BÁO CHỜ XỬ LÝ
-- ---------------------------------------------------------------------
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@nd_cb_duc, 'NT-01', 'Sinh viên Phạm Thị Dung gửi đăng ký thực tập, chờ bạn xác nhận tiếp nhận', CONCAT('/records/', @hs_dung), FALSE, '2026-08-20 10:03:00');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@giaovu, 'NT-03', 'Hồ sơ của Hoàng Văn Giang đã được ĐVHD xác nhận, cần phân công GVHD', '/assignments', TRUE, '2026-08-25 09:00:00');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@giaovu, 'NT-03', 'Hồ sơ của Lương Thị Mai đã được ĐVHD xác nhận, cần phân công GVHD', '/assignments', FALSE, '2026-08-25 09:00:00');
INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES (@giaovu, 'NT-03', 'Hồ sơ của Vũ Thu Hà đã được ĐVHD xác nhận, cần phân công GVHD', '/assignments', TRUE, '2026-08-25 09:00:00');
