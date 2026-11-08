-- =====================================================================
-- Cấu hình chấm điểm mẫu theo Quy định QĐ 207/QĐ-ĐHXDHN.
-- Đây là nơi DUY NHẤT chứa các con số cấu hình (α, tỷ lệ đồng chấm, w chặng, khoảng rubric).
-- Tạo đợt mới = nhân bản từ đợt mẫu 'MAU-QD207' (docs/01-nghiep-vu.md mục 10.6); đợt mẫu ẩn khỏi danh sách.
-- =====================================================================

INSERT INTO dot_thuc_tap (ma_dot, ten, hoc_ky, nam_hoc, khoa_vien, ngay_bat_dau, ngay_ket_thuc, so_tuan, han_nop_bao_cao, trang_thai)
VALUES ('MAU-QD207', 'Cấu hình mẫu theo QĐ 207 (không dùng để đăng ký)', 'MAU', 'MAU', NULL,
        '2026-01-05', '2026-03-01', 8, '2026-03-06', 'KHOI_TAO');
SET @dot = LAST_INSERT_ID();

-- Đ13 k3: chặng 1 tuần 4 trọng số 0,3; chặng 2 cuối kỳ trọng số 0,7.
INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, trang_thai) VALUES
    (@dot, 1, 'Chặng 1 — Đánh giá giữa kỳ (TTTN-04)', 4, 0.300, 'CHUA_MO'),
    (@dot, 2, 'Chặng 2 — Đánh giá cuối kỳ (TTTN-05)', 8, 0.700, 'CHUA_MO');
SET @chang1 = (SELECT id FROM chang_danh_gia WHERE dot_id = @dot AND thu_tu = 1);
SET @chang2 = (SELECT id FROM chang_danh_gia WHERE dot_id = @dot AND thu_tu = 2);

-- Đ13 k1–k2: α (%) và tỷ lệ đồng chấm ĐVHD/GVHD (%) của 7 CLO; Σα = 100 (CBR-07), ĐVHD + GVHD = 100 (CBR-08).
INSERT INTO chuan_dau_ra (dot_id, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd) VALUES
    (@dot, 'CLO1', 'Áp dụng kiến thức chuyên môn',
     'Vận dụng kiến thức chuyên ngành đã học vào nhiệm vụ thực tế tại đơn vị.', 20.00, 30.00, 70.00),
    (@dot, 'CLO2', 'Phân tích và giải quyết vấn đề',
     'Nhận diện, phân tích vấn đề kỹ thuật/nghiệp vụ và đề xuất giải pháp khả thi.', 25.00, 30.00, 70.00),
    (@dot, 'CLO3', 'Giao tiếp và trình bày',
     'Viết báo cáo, trình bày, phản hồi rõ ràng bằng văn bản và lời nói.', 10.00, 30.00, 70.00),
    (@dot, 'CLO4', 'Đạo đức nghề nghiệp và an toàn lao động',
     'Tuân thủ nội quy, quy định an toàn, thể hiện đạo đức và trách nhiệm nghề nghiệp.', 10.00, 70.00, 30.00),
    (@dot, 'CLO5', 'Làm việc nhóm và phối hợp',
     'Phối hợp với đồng nghiệp, hoàn thành phần việc trong nhóm.', 10.00, 40.00, 60.00),
    (@dot, 'CLO6', 'Sử dụng công cụ kỹ thuật, phần mềm',
     'Sử dụng thành thạo công cụ, thiết bị, phần mềm chuyên ngành.', 15.00, 50.00, 50.00),
    (@dot, 'CLO7', 'Đánh giá tự thân, phát triển nghề nghiệp',
     'Tự đánh giá năng lực, xác định định hướng phát triển nghề nghiệp (chỉ GVHD đánh giá ở chặng 2).', 10.00, 0.00, 100.00);

-- Đ13 k2: rubric 5 mức, khoảng cố định [min; max), Mức 4 đóng tại 10. Khoa chỉ được sửa mô tả hành vi (Đ12 k3h).
INSERT INTO muc_rubric (chuan_dau_ra_id, muc, diem_min, diem_max, mo_ta_hanh_vi)
SELECT c.id, m.muc, m.diem_min, m.diem_max, CONCAT(m.nhan, ' — ', c.ten, ': ', m.mo_ta)
FROM chuan_dau_ra c
CROSS JOIN (
    SELECT 0 AS muc, 0.00 AS diem_min, 4.00 AS diem_max, 'Mức 0 (Chưa đạt)' AS nhan,
           'chưa thể hiện được năng lực, cần hướng dẫn sát mới thực hiện được.' AS mo_ta
    UNION ALL SELECT 1, 4.00, 5.50, 'Mức 1 (Đạt tối thiểu)',
           'thể hiện năng lực ở mức cơ bản, còn nhiều sai sót, cần hỗ trợ thường xuyên.'
    UNION ALL SELECT 2, 5.50, 7.00, 'Mức 2 (Đạt)',
           'thực hiện được phần lớn yêu cầu, còn sai sót nhỏ, cần hỗ trợ khi gặp tình huống mới.'
    UNION ALL SELECT 3, 7.00, 8.50, 'Mức 3 (Khá)',
           'thực hiện đầy đủ yêu cầu, chủ động, ít cần hỗ trợ.'
    UNION ALL SELECT 4, 8.50, 10.00, 'Mức 4 (Giỏi)',
           'thực hiện xuất sắc, chủ động sáng tạo, có thể hướng dẫn người khác.'
) m
WHERE c.dot_id = @dot;

-- TTTN-04 (chặng 1): 6 câu, đúng thứ tự in trên mẫu; không có CLO7.
INSERT INTO cau_hoi_danh_gia (chang_id, chuan_dau_ra_id, thu_tu, noi_dung)
SELECT @chang1, c.id, q.thu_tu, q.noi_dung
FROM (
    SELECT 1 AS thu_tu, 'CLO1' AS ma_clo, 'Áp dụng kiến thức vào nhiệm vụ được giao?' AS noi_dung
    UNION ALL SELECT 2, 'CLO4', 'Tuân thủ quy định, an toàn, đạo đức nghề nghiệp?'
    UNION ALL SELECT 3, 'CLO5', 'Phối hợp nhóm, giao tiếp trong công việc?'
    UNION ALL SELECT 4, 'CLO2', 'Phân tích vấn đề, đề xuất giải pháp?'
    UNION ALL SELECT 5, 'CLO6', 'Sử dụng công cụ, phần mềm kỹ thuật?'
    UNION ALL SELECT 6, 'CLO3', 'Viết báo cáo tiến độ, phản hồi?'
) q
JOIN chuan_dau_ra c ON c.dot_id = @dot AND c.ma_clo = q.ma_clo;

-- TTTN-05 (chặng 2): 7 dòng CLO1…CLO7.
INSERT INTO cau_hoi_danh_gia (chang_id, chuan_dau_ra_id, thu_tu, noi_dung)
SELECT @chang2, c.id, CAST(SUBSTRING(c.ma_clo, 4) AS UNSIGNED), CONCAT(c.ma_clo, ' — ', c.ten)
FROM chuan_dau_ra c
WHERE c.dot_id = @dot;

-- Đ4: minh chứng bắt buộc theo hình thức thực tập. loai_minh_chung là MÃ cố định;
-- các mã PHIEU_DANG_KY, NHAT_KY, KE_HOACH_HOC_TAP, BAO_CAO_THUC_TAP, PHAN_HOI_08A, PHAN_HOI_08B, NHAN_XET_GVHD
-- do hệ thống tự đối chiếu từ dữ liệu sẵn có; các mã còn lại sinh viên tải tệp lên.
INSERT INTO loai_minh_chung_bat_buoc (hinh_thuc_thuc_tap, loai_minh_chung, bat_buoc) VALUES
    ('DOANH_NGHIEP', 'PHIEU_DANG_KY', TRUE),
    ('DOANH_NGHIEP', 'NHAT_KY', TRUE),
    ('DOANH_NGHIEP', 'KE_HOACH_HOC_TAP', TRUE),
    ('DOANH_NGHIEP', 'BAO_CAO_THUC_TAP', TRUE),
    ('DOANH_NGHIEP', 'PHAN_HOI_08A', TRUE),
    ('DOANH_NGHIEP', 'PHAN_HOI_08B', TRUE),
    ('NGHIEN_CUU', 'DE_CUONG_NGHIEN_CUU', TRUE),
    ('NGHIEN_CUU', 'NHAT_KY', TRUE),
    ('NGHIEN_CUU', 'SAN_PHAM_NGHIEN_CUU', TRUE),
    ('NGHIEN_CUU', 'NHAN_XET_GVHD', TRUE),
    ('KHOI_NGHIEP', 'KE_HOACH_KINH_DOANH', TRUE),
    ('KHOI_NGHIEP', 'NHAT_KY', TRUE),
    ('KHOI_NGHIEP', 'BAO_CAO_KET_QUA', TRUE),
    ('KHOI_NGHIEP', 'XAC_NHAN_CO_VAN', TRUE),
    ('CONG_DONG', 'KE_HOACH_HOAT_DONG', TRUE),
    ('CONG_DONG', 'NHAT_KY', TRUE),
    ('CONG_DONG', 'ANH_VIDEO_HOAT_DONG', TRUE),
    ('CONG_DONG', 'THU_CAM_ON', TRUE),
    ('CONG_DONG', 'NHAN_XET_GVHD', TRUE),
    ('NOI_BO', 'QUYET_DINH_TIEP_NHAN', TRUE),
    ('NOI_BO', 'BAO_CAO_CONG_VIEC', TRUE),
    ('NOI_BO', 'XAC_NHAN_DVHD', TRUE),
    ('NOI_BO', 'NHAN_XET_GVHD', TRUE),
    ('QUOC_TE', 'HOP_DONG_TRAO_DOI', TRUE),
    ('QUOC_TE', 'GIAY_CHUNG_NHAN_HOAN_THANH', TRUE),
    ('QUOC_TE', 'BAO_CAO_SONG_NGU', TRUE),
    ('QUOC_TE', 'NHAN_XET_GVHD', TRUE);
