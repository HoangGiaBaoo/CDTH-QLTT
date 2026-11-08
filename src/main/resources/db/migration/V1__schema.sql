-- =====================================================================
-- QLTT v2 — 28 bảng, MySQL 8, utf8mb4.
-- Bám đúng docs/03-csdl.md (sinh từ QLTT-ThietKe-API-CSDL.xlsx).
-- Migration đã merge thì KHÔNG sửa; đổi schema bằng file V{n}__ mới.
-- =====================================================================

-- ---------------------------------------------------------------------
-- NHÓM 1 — NGƯỜI DÙNG VÀ DANH MỤC
-- ---------------------------------------------------------------------

CREATE TABLE nguoi_dung (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    ten_dang_nhap  VARCHAR(50)  NOT NULL,
    mat_khau_hash  VARCHAR(100) NOT NULL,
    ho_ten         VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL,
    dien_thoai     VARCHAR(20)  NULL,
    vai_tro        ENUM('ADMIN','GIANG_VIEN','CAN_BO_DVHD','SINH_VIEN') NOT NULL,
    trang_thai     ENUM('HOAT_DONG','VO_HIEU_HOA') NOT NULL DEFAULT 'HOAT_DONG',
    so_lan_sai     INT          NOT NULL DEFAULT 0,
    khoa_den       DATETIME     NULL,
    ngay_tao       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_nguoi_dung_ten_dang_nhap UNIQUE (ten_dang_nhap),
    CONSTRAINT uk_nguoi_dung_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE don_vi_huong_dan (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    ma_dvhd               VARCHAR(30)  NOT NULL,
    ten                   VARCHAR(200) NOT NULL,
    dia_chi               VARCHAR(300) NOT NULL,
    linh_vuc              VARCHAR(200) NOT NULL,
    nguoi_dai_dien        VARCHAR(100) NOT NULL,
    dien_thoai            VARCHAR(20)  NULL,
    email                 VARCHAR(100) NULL,
    trang_thai_phe_duyet  ENUM('CHO_DUYET','DA_DUYET','TU_CHOI','DA_LOAI') NOT NULL DEFAULT 'CHO_DUYET',
    ly_do                 VARCHAR(500) NULL,
    ngay_phe_duyet        DATE         NULL,
    nguoi_phe_duyet_id    BIGINT       NULL,
    da_xoa                BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT uk_don_vi_ma UNIQUE (ma_dvhd),
    CONSTRAINT fk_don_vi_nguoi_phe_duyet FOREIGN KEY (nguoi_phe_duyet_id) REFERENCES nguoi_dung (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE sinh_vien (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    nguoi_dung_id         BIGINT       NOT NULL,
    ma_sv                 VARCHAR(20)  NOT NULL,
    lop                   VARCHAR(30)  NULL,
    khoa_hoc              VARCHAR(20)  NULL,
    nganh                 VARCHAR(100) NULL,
    khoa_vien             VARCHAR(100) NULL,
    chuong_trinh_dao_tao  ENUM('CHUAN','CLC_STEM') NOT NULL DEFAULT 'CHUAN',
    PRIMARY KEY (id),
    CONSTRAINT uk_sinh_vien_nguoi_dung UNIQUE (nguoi_dung_id),
    CONSTRAINT uk_sinh_vien_ma UNIQUE (ma_sv),
    CONSTRAINT fk_sinh_vien_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE giang_vien (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    nguoi_dung_id   BIGINT       NOT NULL,
    ma_gv           VARCHAR(20)  NOT NULL,
    bo_mon          VARCHAR(100) NULL,
    khoa_vien       VARCHAR(100) NULL,
    hoc_ham_hoc_vi  VARCHAR(50)  NULL,
    so_sv_toi_da    INT          NOT NULL DEFAULT 8,
    PRIMARY KEY (id),
    CONSTRAINT uk_giang_vien_nguoi_dung UNIQUE (nguoi_dung_id),
    CONSTRAINT uk_giang_vien_ma UNIQUE (ma_gv),
    CONSTRAINT fk_giang_vien_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id),
    CONSTRAINT ck_giang_vien_han_muc CHECK (so_sv_toi_da BETWEEN 5 AND 10)          -- CBR-04
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE can_bo_dvhd (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    nguoi_dung_id       BIGINT       NOT NULL,
    don_vi_id           BIGINT       NOT NULL,
    chuc_vu             VARCHAR(100) NULL,
    so_nam_kinh_nghiem  INT          NOT NULL,
    so_sv_toi_da        INT          NOT NULL DEFAULT 5,
    PRIMARY KEY (id),
    CONSTRAINT uk_can_bo_nguoi_dung UNIQUE (nguoi_dung_id),
    CONSTRAINT fk_can_bo_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id),
    CONSTRAINT fk_can_bo_don_vi FOREIGN KEY (don_vi_id) REFERENCES don_vi_huong_dan (id),
    CONSTRAINT ck_can_bo_kinh_nghiem CHECK (so_nam_kinh_nghiem >= 3)                -- CBR-05
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- NHÓM 2 — TỔ CHỨC ĐỢT VÀ CHUẨN ĐẦU RA
-- ---------------------------------------------------------------------

CREATE TABLE dot_thuc_tap (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    ma_dot           VARCHAR(30)  NOT NULL,
    ten              VARCHAR(200) NOT NULL,
    hoc_ky           VARCHAR(10)  NOT NULL,
    nam_hoc          VARCHAR(20)  NOT NULL,
    khoa_vien        VARCHAR(100) NULL,
    ngay_bat_dau     DATE         NOT NULL,
    ngay_ket_thuc    DATE         NOT NULL,
    so_tuan          INT          NOT NULL DEFAULT 8,
    han_nop_bao_cao  DATE         NULL,
    trang_thai       ENUM('KHOI_TAO','DANG_NHAN_DANG_KY','DANG_THUC_HIEN','DA_KET_THUC') NOT NULL DEFAULT 'KHOI_TAO',
    PRIMARY KEY (id),
    CONSTRAINT uk_dot_ma UNIQUE (ma_dot),
    CONSTRAINT ck_dot_ngay CHECK (ngay_ket_thuc > ngay_bat_dau)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE chang_danh_gia (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    dot_id          BIGINT        NOT NULL,
    thu_tu          TINYINT       NOT NULL,
    ten             VARCHAR(100)  NOT NULL,
    tuan_thuc_hien  INT           NOT NULL,
    trong_so_w      DECIMAL(4, 3) NOT NULL,
    ngay_mo         DATE          NULL,
    ngay_dong       DATE          NULL,
    trang_thai      ENUM('CHUA_MO','DANG_MO','DA_DONG','DA_TONG_HOP') NOT NULL DEFAULT 'CHUA_MO',
    PRIMARY KEY (id),
    CONSTRAINT uk_chang_dot_thu_tu UNIQUE (dot_id, thu_tu),
    CONSTRAINT fk_chang_dot FOREIGN KEY (dot_id) REFERENCES dot_thuc_tap (id),
    CONSTRAINT ck_chang_thu_tu CHECK (thu_tu IN (1, 2))                             -- CBR-06
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE chuan_dau_ra (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    dot_id          BIGINT        NOT NULL,
    ma_clo          VARCHAR(10)   NOT NULL,
    ten             VARCHAR(200)  NOT NULL,
    mo_ta           TEXT          NULL,
    trong_so_alpha  DECIMAL(5, 2) NOT NULL,
    ty_le_dvhd      DECIMAL(5, 2) NOT NULL,
    ty_le_gvhd      DECIMAL(5, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_clo_dot_ma UNIQUE (dot_id, ma_clo),
    CONSTRAINT fk_clo_dot FOREIGN KEY (dot_id) REFERENCES dot_thuc_tap (id),
    CONSTRAINT ck_clo_ty_le CHECK (ty_le_dvhd + ty_le_gvhd = 100)                   -- CBR-08
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE muc_rubric (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    chuan_dau_ra_id  BIGINT        NOT NULL,
    muc              TINYINT       NOT NULL,
    diem_min         DECIMAL(4, 2) NOT NULL,
    diem_max         DECIMAL(4, 2) NOT NULL,
    mo_ta_hanh_vi    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_muc_rubric UNIQUE (chuan_dau_ra_id, muc),
    CONSTRAINT fk_muc_rubric_clo FOREIGN KEY (chuan_dau_ra_id) REFERENCES chuan_dau_ra (id),
    CONSTRAINT ck_muc_rubric_muc CHECK (muc BETWEEN 0 AND 4)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE cau_hoi_danh_gia (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    chang_id         BIGINT       NOT NULL,
    chuan_dau_ra_id  BIGINT       NOT NULL,
    thu_tu           INT          NOT NULL,
    noi_dung         VARCHAR(500) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cau_hoi_chang FOREIGN KEY (chang_id) REFERENCES chang_danh_gia (id),
    CONSTRAINT fk_cau_hoi_clo FOREIGN KEY (chuan_dau_ra_id) REFERENCES chuan_dau_ra (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE loai_minh_chung_bat_buoc (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    hinh_thuc_thuc_tap  ENUM('DOANH_NGHIEP','NGHIEN_CUU','KHOI_NGHIEP','CONG_DONG','NOI_BO','QUOC_TE') NOT NULL,
    loai_minh_chung     VARCHAR(100) NOT NULL,
    bat_buoc            BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_loai_minh_chung UNIQUE (hinh_thuc_thuc_tap, loai_minh_chung)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- NHÓM 3 — QUÁ TRÌNH THỰC TẬP
-- ---------------------------------------------------------------------

CREATE TABLE ho_so_thuc_tap (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    sinh_vien_id        BIGINT       NOT NULL,
    dot_id              BIGINT       NOT NULL,
    hinh_thuc_thuc_tap  ENUM('DOANH_NGHIEP','NGHIEN_CUU','KHOI_NGHIEP','CONG_DONG','NOI_BO','QUOC_TE') NOT NULL,
    don_vi_id           BIGINT       NULL,
    can_bo_dvhd_id      BIGINT       NULL,
    bo_phan             VARCHAR(200) NULL,
    de_tai              VARCHAR(300) NULL,
    hinh_thuc_lam_viec  ENUM('TRUC_TIEP','TRUC_TUYEN') NULL DEFAULT 'TRUC_TIEP',
    so_tuan_tham_gia    INT          NULL,
    muc_tieu            TEXT         NULL,
    san_pham_du_kien    TEXT         NULL,
    trang_thai          ENUM('NHAP','CHO_DVHD','CHO_GVHD','DANG_THUC_TAP','CHO_DANH_GIA','HOAN_THANH',
                             'KHONG_HOAN_THANH','GIAN_DOAN','TU_CHOI') NOT NULL DEFAULT 'NHAP',
    ly_do_tu_choi       VARCHAR(500) NULL,
    ngay_gui            DATETIME     NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_ho_so_sinh_vien_dot UNIQUE (sinh_vien_id, dot_id),                -- CBR-01
    CONSTRAINT fk_ho_so_sinh_vien FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien (id),
    CONSTRAINT fk_ho_so_dot FOREIGN KEY (dot_id) REFERENCES dot_thuc_tap (id),
    CONSTRAINT fk_ho_so_don_vi FOREIGN KEY (don_vi_id) REFERENCES don_vi_huong_dan (id),
    CONSTRAINT fk_ho_so_can_bo FOREIGN KEY (can_bo_dvhd_id) REFERENCES can_bo_dvhd (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE phan_cong_gvhd (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    ho_so_id         BIGINT       NOT NULL,
    giang_vien_id    BIGINT       NOT NULL,
    ngay_phan_cong   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nguoi_phan_cong  BIGINT       NULL,
    ly_do_thay_doi   VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_phan_cong_ho_so UNIQUE (ho_so_id),                                -- BR-05.1
    CONSTRAINT fk_phan_cong_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id),
    CONSTRAINT fk_phan_cong_giang_vien FOREIGN KEY (giang_vien_id) REFERENCES giang_vien (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ke_hoach_hoc_tap (
    id             BIGINT   NOT NULL AUTO_INCREMENT,
    ho_so_id       BIGINT   NOT NULL,
    ngay_nop       DATETIME NULL,
    nop_muon       BOOLEAN  NOT NULL DEFAULT FALSE,
    xac_nhan_dvhd  DATETIME NULL,
    xac_nhan_gvhd  DATETIME NULL,
    trang_thai     ENUM('NHAP','CHO_XAC_NHAN','DA_KHOA') NOT NULL DEFAULT 'NHAP',
    PRIMARY KEY (id),
    CONSTRAINT uk_ke_hoach_ho_so UNIQUE (ho_so_id),
    CONSTRAINT fk_ke_hoach_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE muc_ke_hoach (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    ke_hoach_id           BIGINT       NOT NULL,
    tuan                  INT          NOT NULL,
    muc_tieu              TEXT         NULL,
    ket_qua_mong_doi      TEXT         NULL,
    hinh_thuc_minh_chung  VARCHAR(200) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_muc_ke_hoach UNIQUE (ke_hoach_id, tuan),
    CONSTRAINT fk_muc_ke_hoach FOREIGN KEY (ke_hoach_id) REFERENCES ke_hoach_hoc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE nhat_ky_thuc_tap (
    id        BIGINT        NOT NULL AUTO_INCREMENT,
    ho_so_id  BIGINT        NOT NULL,
    ngay      DATE          NOT NULL,
    noi_dung  TEXT          NOT NULL,
    so_gio    DECIMAL(4, 1) NULL,
    ket_qua   TEXT          NULL,
    ngay_tao  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_nhat_ky_ngay UNIQUE (ho_so_id, ngay),                             -- BR-07.1
    CONSTRAINT fk_nhat_ky_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tien_do_tuan (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    ho_so_id              BIGINT       NOT NULL,
    tuan                  INT          NOT NULL,
    cong_viec_duoc_giao   TEXT         NULL,
    ket_qua_thuc_hien     TEXT         NULL,
    phan_tram_hoan_thanh  INT          NULL,
    xac_nhan_dvhd_id      BIGINT       NULL,
    ngay_xac_nhan         DATETIME     NULL,
    yeu_cau_bo_sung       VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_tien_do_tuan UNIQUE (ho_so_id, tuan),
    CONSTRAINT fk_tien_do_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id),
    CONSTRAINT ck_tien_do_phan_tram CHECK (phan_tram_hoan_thanh BETWEEN 0 AND 100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE minh_chung (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    ho_so_id          BIGINT       NOT NULL,
    loai_minh_chung   VARCHAR(100) NOT NULL,
    tuan              INT          NULL,
    ten_file          VARCHAR(255) NOT NULL,
    duong_dan         VARCHAR(500) NOT NULL,
    kich_thuoc        BIGINT       NULL,
    nguoi_tai_len_id  BIGINT       NULL,
    ngay_tai_len      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    da_khoa           BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT fk_minh_chung_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- NHÓM 4 — ĐÁNH GIÁ VÀ KẾT QUẢ
-- ---------------------------------------------------------------------

CREATE TABLE to_danh_gia (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    dot_id              BIGINT       NOT NULL,
    ngay_thanh_lap      DATE         NOT NULL,
    thoi_gian_bao_cao   DATETIME     NULL,
    dia_diem            VARCHAR(200) NULL,
    hinh_thuc           ENUM('TRUC_TIEP','TRUC_TUYEN') NULL DEFAULT 'TRUC_TIEP',
    ghi_chu_phe_duyet   VARCHAR(500) NULL,
    duong_dan_ghi_hinh  VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_to_danh_gia_dot FOREIGN KEY (dot_id) REFERENCES dot_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE to_danh_gia_ho_so (
    to_danh_gia_id  BIGINT NOT NULL,
    ho_so_id        BIGINT NOT NULL,
    PRIMARY KEY (to_danh_gia_id, ho_so_id),
    CONSTRAINT fk_to_ho_so_to FOREIGN KEY (to_danh_gia_id) REFERENCES to_danh_gia (id),
    CONSTRAINT fk_to_ho_so_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE thanh_vien_to_danh_gia (
    id               BIGINT  NOT NULL AUTO_INCREMENT,
    to_danh_gia_id   BIGINT  NOT NULL,
    nguoi_dung_id    BIGINT  NOT NULL,
    nhom_nguoi_cham  ENUM('GVHD','DVHD') NOT NULL,
    la_chu_tich      BOOLEAN NOT NULL DEFAULT FALSE,
    vang_mat         BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT uk_thanh_vien_to UNIQUE (to_danh_gia_id, nguoi_dung_id),
    CONSTRAINT fk_thanh_vien_to FOREIGN KEY (to_danh_gia_id) REFERENCES to_danh_gia (id),
    CONSTRAINT fk_thanh_vien_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE phieu_danh_gia (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    ho_so_id         BIGINT       NOT NULL,
    chang_id         BIGINT       NOT NULL,
    nguoi_cham_id    BIGINT       NOT NULL,
    nhom_nguoi_cham  ENUM('GVHD','DVHD') NOT NULL,
    nhan_xet_chung   TEXT         NULL,
    trang_thai       ENUM('NHAP','DA_NOP','MO_LAI') NOT NULL DEFAULT 'NHAP',
    ngay_nop         DATETIME     NULL,
    ly_do_mo_lai     VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_phieu UNIQUE (ho_so_id, chang_id, nguoi_cham_id),                 -- CBR-11
    CONSTRAINT fk_phieu_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id),
    CONSTRAINT fk_phieu_chang FOREIGN KEY (chang_id) REFERENCES chang_danh_gia (id),
    CONSTRAINT fk_phieu_nguoi_cham FOREIGN KEY (nguoi_cham_id) REFERENCES nguoi_dung (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE diem_clo_chi_tiet (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    phieu_id         BIGINT        NOT NULL,
    chuan_dau_ra_id  BIGINT        NOT NULL,
    muc_dat          TINYINT       NOT NULL,
    diem             DECIMAL(4, 2) NOT NULL,
    nhan_xet         VARCHAR(500)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_diem_clo UNIQUE (phieu_id, chuan_dau_ra_id),
    CONSTRAINT fk_diem_clo_phieu FOREIGN KEY (phieu_id) REFERENCES phieu_danh_gia (id),
    CONSTRAINT fk_diem_clo_clo FOREIGN KEY (chuan_dau_ra_id) REFERENCES chuan_dau_ra (id),
    CONSTRAINT ck_diem_clo_muc CHECK (muc_dat BETWEEN 0 AND 4),
    CONSTRAINT ck_diem_clo_diem CHECK (diem BETWEEN 0 AND 10)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ket_qua_hoc_phan (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    ho_so_id            BIGINT        NOT NULL,
    diem_clo1           DECIMAL(4, 2) NULL,
    diem_clo2           DECIMAL(4, 2) NULL,
    diem_clo3           DECIMAL(4, 2) NULL,
    diem_clo4           DECIMAL(4, 2) NULL,
    diem_clo5           DECIMAL(4, 2) NULL,
    diem_clo6           DECIMAL(4, 2) NULL,
    diem_clo7           DECIMAL(4, 2) NULL,
    diem_hp             DECIMAL(4, 2) NULL,
    muc_dat             TINYINT       NULL,
    diem_thuong         DECIMAL(3, 2) NULL DEFAULT 0,
    nhom_kien_thuc      DECIMAL(4, 2) NULL,
    nhom_ky_nang        DECIMAL(4, 2) NULL,
    nhom_thai_do        DECIMAL(4, 2) NULL,
    ket_luan            ENUM('DAT','KHONG_DAT') NULL,
    ly_do_khong_dat     VARCHAR(500)  NULL,
    phien_ban_trong_so  VARCHAR(50)   NULL,
    nhan_xet_gvhd       TEXT          NULL,
    trang_thai          ENUM('CHUA_TINH','DA_TINH','DA_XAC_NHAN','DA_CONG_BO') NOT NULL DEFAULT 'CHUA_TINH',
    ngay_tinh           DATETIME      NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_ket_qua_ho_so UNIQUE (ho_so_id),
    CONSTRAINT fk_ket_qua_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id),
    CONSTRAINT ck_ket_qua_thuong CHECK (diem_thuong BETWEEN 0 AND 0.5)              -- CBR-21
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE bao_cao_thuc_tap (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    ho_so_id       BIGINT       NOT NULL,
    phien_ban      INT          NOT NULL DEFAULT 1,
    ten_file       VARCHAR(255) NOT NULL,
    duong_dan      VARCHAR(500) NOT NULL,
    ngay_nop       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nop_muon       BOOLEAN      NOT NULL DEFAULT FALSE,
    xac_nhan_dvhd  DATETIME     NULL,
    xac_nhan_gvhd  DATETIME     NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_bao_cao_phien_ban UNIQUE (ho_so_id, phien_ban),                   -- BR-11.5
    CONSTRAINT fk_bao_cao_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE phan_hoi (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    ho_so_id             BIGINT        NOT NULL,
    loai                 ENUM('TTTN_08A','TTTN_08B') NOT NULL,
    nguoi_gui_id         BIGINT        NOT NULL,
    du_lieu_tieu_chi     JSON          NULL,
    hp_self              DECIMAL(4, 2) NULL,
    chi_so_tu_nhan_thuc  DECIMAL(4, 2) NULL,
    y_kien_mo            TEXT          NULL,
    ngay_gui             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_phan_hoi UNIQUE (ho_so_id, loai),
    CONSTRAINT fk_phan_hoi_ho_so FOREIGN KEY (ho_so_id) REFERENCES ho_so_thuc_tap (id),
    CONSTRAINT fk_phan_hoi_nguoi_gui FOREIGN KEY (nguoi_gui_id) REFERENCES nguoi_dung (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- NHÓM 5 — HỆ THỐNG
-- ---------------------------------------------------------------------

CREATE TABLE nhat_ky_he_thong (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    thoi_diem        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nguoi_thuc_hien  BIGINT       NULL,
    vai_tro          VARCHAR(30)  NULL,
    hanh_vi          VARCHAR(100) NOT NULL,
    doi_tuong        VARCHAR(100) NULL,
    doi_tuong_id     BIGINT       NULL,
    gia_tri_truoc    TEXT         NULL,
    gia_tri_sau      TEXT         NULL,
    PRIMARY KEY (id),
    INDEX idx_nhat_ky_doi_tuong (doi_tuong, doi_tuong_id),
    INDEX idx_nhat_ky_thoi_diem (thoi_diem)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE thong_bao (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    nguoi_nhan_id  BIGINT       NOT NULL,
    ma_su_kien     VARCHAR(10)  NOT NULL,
    noi_dung       VARCHAR(500) NOT NULL,
    duong_dan      VARCHAR(300) NULL,
    da_doc         BOOLEAN      NOT NULL DEFAULT FALSE,
    ngay_tao       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_thong_bao_nguoi_nhan FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoi_dung (id),
    INDEX idx_thong_bao_nguoi_nhan (nguoi_nhan_id, da_doc)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
