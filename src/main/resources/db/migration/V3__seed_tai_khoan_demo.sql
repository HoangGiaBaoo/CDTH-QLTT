-- =====================================================================
-- Tài khoản demo. MẬT KHẨU GỐC CỦA MỌI TÀI KHOẢN DEMO: Qltt@2026
-- (chuỗi dưới đây là BCrypt của mật khẩu đó — không lưu mật khẩu rõ trong CSDL).
-- Tài khoản cán bộ ĐVHD nằm ở V4 cùng đơn vị hướng dẫn.
-- =====================================================================

SET @mk = '$2a$10$lGdY1UoR0PMVotCrB08j5u4rS1Z32sNElCj2ilPfx41UsQcMwxE0W';

INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES
    ('giaovu', @mk, 'Nguyễn Thị Giáo Vụ', 'giaovu@huce.edu.vn', '02438691234', 'ADMIN');

-- Giảng viên: cần ≥ 2 GV trong một Tổ đánh giá (Đ10 k3a) nên seed 4 người.
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES
    ('gv.tung',  @mk, 'Phạm Hữu Tùng',     'tungph@huce.edu.vn',  '0912000001', 'GIANG_VIEN'),
    ('gv.lan',   @mk, 'Trần Thị Lan',      'lantt@huce.edu.vn',   '0912000002', 'GIANG_VIEN'),
    ('gv.minh',  @mk, 'Lê Quang Minh',     'minhlq@huce.edu.vn',  '0912000003', 'GIANG_VIEN'),
    ('gv.hoa',   @mk, 'Đỗ Thu Hoà',        'hoadt@huce.edu.vn',   '0912000004', 'GIANG_VIEN');

INSERT INTO giang_vien (nguoi_dung_id, ma_gv, bo_mon, khoa_vien, hoc_ham_hoc_vi, so_sv_toi_da)
SELECT id, x.ma_gv, x.bo_mon, 'Khoa Công nghệ thông tin', x.hhhv, x.han_muc
FROM nguoi_dung n
JOIN (
    SELECT 'gv.tung' AS tdn, 'GV001' AS ma_gv, 'Công nghệ phần mềm' AS bo_mon, 'ThS.' AS hhhv, 8 AS han_muc
    UNION ALL SELECT 'gv.lan',  'GV002', 'Hệ thống thông tin', 'TS.',  8
    UNION ALL SELECT 'gv.minh', 'GV003', 'Khoa học máy tính',  'TS.',  6
    UNION ALL SELECT 'gv.hoa',  'GV004', 'Mạng máy tính',      'ThS.', 5
) x ON x.tdn = n.ten_dang_nhap;

-- Sinh viên: trộn CHUAN và CLC_STEM để demo ngưỡng đạt khác nhau (Đ15 k3b).
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, ho_ten, email, dien_thoai, vai_tro) VALUES
    ('sv.an',    @mk, 'Nguyễn Văn An',     '2251220001@st.huce.edu.vn', '0987000001', 'SINH_VIEN'),
    ('sv.binh',  @mk, 'Trần Thị Bình',     '2251220002@st.huce.edu.vn', '0987000002', 'SINH_VIEN'),
    ('sv.cuong', @mk, 'Lê Mạnh Cường',     '2251220003@st.huce.edu.vn', '0987000003', 'SINH_VIEN'),
    ('sv.dung',  @mk, 'Phạm Thị Dung',     '2251220004@st.huce.edu.vn', '0987000004', 'SINH_VIEN'),
    ('sv.giang', @mk, 'Hoàng Văn Giang',   '2251220005@st.huce.edu.vn', '0987000005', 'SINH_VIEN'),
    ('sv.ha',    @mk, 'Vũ Thu Hà',         '2251220006@st.huce.edu.vn', '0987000006', 'SINH_VIEN'),
    ('sv.khanh', @mk, 'Bùi Quốc Khánh',    '2251220007@st.huce.edu.vn', '0987000007', 'SINH_VIEN'),
    ('sv.linh',  @mk, 'Đặng Mỹ Linh',      '2251220008@st.huce.edu.vn', '0987000008', 'SINH_VIEN');

INSERT INTO sinh_vien (nguoi_dung_id, ma_sv, lop, khoa_hoc, nganh, khoa_vien, chuong_trinh_dao_tao)
SELECT n.id, x.ma_sv, x.lop, 'K67', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin', x.ctdt
FROM nguoi_dung n
JOIN (
    SELECT 'sv.an' AS tdn, '2251220001' AS ma_sv, '67CNTT1' AS lop, 'CHUAN' AS ctdt
    UNION ALL SELECT 'sv.binh',  '2251220002', '67CNTT1', 'CHUAN'
    UNION ALL SELECT 'sv.cuong', '2251220003', '67CNTT2', 'CHUAN'
    UNION ALL SELECT 'sv.dung',  '2251220004', '67CNTT2', 'CLC_STEM'
    UNION ALL SELECT 'sv.giang', '2251220005', '67CNTT1', 'CHUAN'
    UNION ALL SELECT 'sv.ha',    '2251220006', '67CLC',   'CLC_STEM'
    UNION ALL SELECT 'sv.khanh', '2251220007', '67CNTT2', 'CHUAN'
    UNION ALL SELECT 'sv.linh',  '2251220008', '67CLC',   'CLC_STEM'
) x ON x.tdn = n.ten_dang_nhap;
