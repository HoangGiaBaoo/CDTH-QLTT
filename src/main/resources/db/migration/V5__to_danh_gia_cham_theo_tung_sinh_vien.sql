-- =====================================================================
-- V5 — Tổ đánh giá chấm theo từng sinh viên (docs/01 mục 10.5, mẫu TTTN-05: 3 bản mỗi SV gồm GVHD, ủy viên
-- đánh giá, cán bộ hướng dẫn). Người chấm chặng 2 của một SV = mọi giảng viên trong tổ + cán bộ đã hướng dẫn
-- chính SV đó; số người chấm mỗi SV phải lẻ.
--
-- Sửa dữ liệu MẪU của V4 cho khớp luật mới. Tổ 3 đợt TTTN-2025-HK2 được sinh theo luật cũ: 3 giảng viên có mặt
-- (gv.lan, gv.minh, gv.tung thay gv.hoa) + 2 cán bộ (cb.quang, cb.duc) chấm chéo cả 4 SV ⇒ mỗi SV 5 phiếu, gồm
-- phiếu của cán bộ đơn vị khác. Luật mới: mỗi SV 4 người (chẵn) và phiếu chéo không được tính.
-- Sửa thành: bỏ gv.minh khỏi tổ 3 (còn gv.lan + gv.tung thay gv.hoa) ⇒ mỗi SV 3 người chấm; bỏ 4 phiếu của
-- gv.minh và 4 phiếu chéo của cán bộ. Đây là phiếu do seed sinh, chưa từng có người dùng nhập, nên xóa hẳn thay vì
-- để lại phiếu mồ côi (cán bộ không còn quyền mở hồ sơ SV đơn vị khác).
-- Kết quả 4 SV tính lại bằng đúng công thức của scripts/seed/gen_v4.py (đã khớp ScoringService): kết luận
-- không đổi, HP sv.vinh 7,6 → 7,7, sv.xuan 7,1 → 7,0; sv.thao, sv.toan giữ HP, đổi vài CLO.
-- =====================================================================

SET @dot_k1 = (SELECT id FROM dot_thuc_tap WHERE ma_dot = 'TTTN-2025-HK2');
SET @k1_c2 = (SELECT id FROM chang_danh_gia WHERE dot_id = @dot_k1 AND thu_tu = 2);

CREATE TEMPORARY TABLE v5_ho_so (ten_dang_nhap VARCHAR(50) PRIMARY KEY, ho_so_id BIGINT);
INSERT INTO v5_ho_so (ten_dang_nhap, ho_so_id)
SELECT n.ten_dang_nhap, h.id
FROM ho_so_thuc_tap h
JOIN sinh_vien s ON s.id = h.sinh_vien_id
JOIN nguoi_dung n ON n.id = s.nguoi_dung_id
WHERE h.dot_id = @dot_k1 AND n.ten_dang_nhap IN ('sv.vinh', 'sv.xuan', 'sv.thao', 'sv.toan');

SET @hs_vinh = (SELECT ho_so_id FROM v5_ho_so WHERE ten_dang_nhap = 'sv.vinh');
SET @hs_xuan = (SELECT ho_so_id FROM v5_ho_so WHERE ten_dang_nhap = 'sv.xuan');
SET @hs_thao = (SELECT ho_so_id FROM v5_ho_so WHERE ten_dang_nhap = 'sv.thao');
SET @hs_toan = (SELECT ho_so_id FROM v5_ho_so WHERE ten_dang_nhap = 'sv.toan');
SET @nd_minh = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'gv.minh');
SET @nd_quang = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'cb.quang');
SET @nd_duc = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'cb.duc');
SET @to3 = (SELECT to_danh_gia_id FROM to_danh_gia_ho_so WHERE ho_so_id = @hs_vinh);

-- ---------------------------------------------------------------------
-- Phiếu chặng 2 không còn là người chấm của SV
-- ---------------------------------------------------------------------
CREATE TEMPORARY TABLE v5_phieu_bo (id BIGINT PRIMARY KEY);
INSERT INTO v5_phieu_bo (id)
SELECT p.id
FROM phieu_danh_gia p
WHERE p.chang_id = @k1_c2
  AND ((p.nguoi_cham_id = @nd_minh AND p.ho_so_id IN (@hs_vinh, @hs_xuan, @hs_thao, @hs_toan))
    OR (p.nguoi_cham_id = @nd_quang AND p.ho_so_id = @hs_vinh)
    OR (p.nguoi_cham_id = @nd_duc AND p.ho_so_id IN (@hs_xuan, @hs_thao, @hs_toan)));

DELETE FROM nhat_ky_he_thong
WHERE hanh_vi = 'NOP_PHIEU' AND doi_tuong = 'phieu_danh_gia' AND doi_tuong_id IN (SELECT id FROM v5_phieu_bo);
DELETE FROM diem_clo_chi_tiet WHERE phieu_id IN (SELECT id FROM v5_phieu_bo);
DELETE FROM phieu_danh_gia WHERE id IN (SELECT id FROM v5_phieu_bo);

DELETE FROM thanh_vien_to_danh_gia WHERE to_danh_gia_id = @to3 AND nguoi_dung_id = @nd_minh;

-- ---------------------------------------------------------------------
-- Kết quả học phần tính lại (mỗi SV: gv.lan + gv.tung + cán bộ của mình; phiếu gv.hoa của sv.xuan vẫn bị loại)
-- ---------------------------------------------------------------------
UPDATE ket_qua_hoc_phan SET diem_clo1 = 7.9, diem_clo2 = 7.4, diem_clo3 = 7.1, diem_clo4 = 8.3, diem_clo5 = 7.5,
    diem_clo6 = 7.9, diem_clo7 = 7.5, diem_hp = 7.7, muc_dat = 3, nhom_kien_thuc = 7.7, nhom_ky_nang = 7.5,
    nhom_thai_do = 7.9
WHERE ho_so_id = @hs_vinh;
UPDATE ket_qua_hoc_phan SET diem_clo1 = 7.3, diem_clo2 = 6.8, diem_clo3 = 6.8, diem_clo4 = 7.5, diem_clo5 = 6.9,
    diem_clo6 = 6.8, diem_clo7 = 7.0, diem_hp = 7.0, muc_dat = 3, nhom_kien_thuc = 7.1, nhom_ky_nang = 6.8,
    nhom_thai_do = 7.3
WHERE ho_so_id = @hs_xuan;
UPDATE ket_qua_hoc_phan SET diem_clo1 = 5.0, diem_clo2 = 5.0, diem_clo3 = 4.5, diem_clo4 = 4.7, diem_clo5 = 4.4,
    diem_clo6 = 4.3, diem_clo7 = 4.5, diem_hp = 4.7, muc_dat = 1, nhom_kien_thuc = 5.0, nhom_ky_nang = 4.4,
    nhom_thai_do = 4.6
WHERE ho_so_id = @hs_thao;
UPDATE ket_qua_hoc_phan SET diem_clo1 = 3.0, diem_clo2 = 3.0, diem_clo3 = 4.0, diem_clo4 = 4.2, diem_clo5 = 3.9,
    diem_clo6 = 3.3, diem_clo7 = 3.5, diem_hp = 3.4, muc_dat = 0, nhom_kien_thuc = 3.0, nhom_ky_nang = 3.7,
    nhom_thai_do = 3.8
WHERE ho_so_id = @hs_toan;

-- Chỉ số tự nhận thức (08b) so với mức chính thức mới: sv.xuan CLO5 7,0 → 6,9 và sv.toan CLO5 4,0 → 3,9 tụt một mức.
UPDATE phan_hoi SET chi_so_tu_nhan_thuc = 0.43 WHERE ho_so_id = @hs_xuan AND loai = 'TTTN_08B';
UPDATE phan_hoi SET chi_so_tu_nhan_thuc = 1.43 WHERE ho_so_id = @hs_toan AND loai = 'TTTN_08B';

-- Nhật ký tính / xác nhận / công bố ghi HP theo kết quả mới.
UPDATE nhat_ky_he_thong SET gia_tri_sau = JSON_SET(gia_tri_sau, '$.diemHp', 7.7)
WHERE doi_tuong = 'ho_so_thuc_tap' AND doi_tuong_id = @hs_vinh
  AND hanh_vi IN ('TINH_DIEM', 'XAC_NHAN_KET_QUA', 'CONG_BO_KET_QUA');
UPDATE nhat_ky_he_thong SET gia_tri_sau = JSON_SET(gia_tri_sau, '$.diemHp', 7.0)
WHERE doi_tuong = 'ho_so_thuc_tap' AND doi_tuong_id = @hs_xuan
  AND hanh_vi IN ('TINH_DIEM', 'XAC_NHAN_KET_QUA', 'CONG_BO_KET_QUA');

DROP TEMPORARY TABLE v5_phieu_bo;
DROP TEMPORARY TABLE v5_ho_so;
