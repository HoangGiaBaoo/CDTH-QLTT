# -*- coding: utf-8 -*-
"""Sinh V4__seed_kich_ban_demo.sql cho QLTT.

Bộ tính điểm ở đây là bản sao Python (Decimal) của ScoringService chỉ để điền sẵn ket_qua_hoc_phan;
kết quả được kiểm lại bằng chính API Java (POST /api/results/{id}/calculate) trên CSDL thử — xem verify_v4.py.

Cách dùng (Git Bash, từ thư mục gốc repo):
    python -I scripts/seed/gen_v4.py src/main/resources/db/migration/V4__seed_kich_ban_demo.sql
Script tự assert kết luận mong muốn của từng ca (S1…S10); sai thì dừng, không ghi tệp.
Lưu ý: V4 đã merge thì KHÔNG sinh đè — đổi dữ liệu bằng migration mới (quy tắc Flyway).
"""
import json
import sys
from decimal import Decimal as D, ROUND_HALF_UP, getcontext

getcontext().prec = 16  # tương đương MathContext.DECIMAL64

OUT = sys.argv[1]
sys.stdout.reconfigure(encoding="utf-8")

# ---------------------------------------------------------------- cấu hình (bản sao V2, chỉ để tính sẵn)
CLO = ["CLO1", "CLO2", "CLO3", "CLO4", "CLO5", "CLO6", "CLO7"]
ALPHA = dict(zip(CLO, map(D, ["20", "25", "10", "10", "10", "15", "10"])))
TL_DV = dict(zip(CLO, map(D, ["30", "30", "30", "70", "40", "50", "0"])))
TL_GV = dict(zip(CLO, map(D, ["70", "70", "70", "30", "60", "50", "100"])))
W = {1: D("0.3"), 2: D("0.7")}
CHANG_CO = {c: ({1, 2} if c != "CLO7" else {2}) for c in CLO}
MUC = [(0, D("0"), D("4")), (1, D("4"), D("5.5")), (2, D("5.5"), D("7")), (3, D("7"), D("8.5")), (4, D("8.5"), D("10"))]
NGUONG = {"CHUAN": 1, "CLC_STEM": 2}
TEN_CT = {"CHUAN": "chương trình Chuẩn", "CLC_STEM": "chương trình CLC/STEM"}


def r1(x):
    return x.quantize(D("0.1"), rounding=ROUND_HALF_UP)


def r2(x):
    return x.quantize(D("0.01"), rounding=ROUND_HALF_UP)


def muc(x):
    for m, lo, hi in MUC:
        if x >= lo and (x <= hi if m == 4 else x < hi):
            return m
    raise ValueError(x)


def vn(x):
    s = format(x.normalize(), "f")
    if "." not in s:
        s += ".0"
    return s.replace(".", ",")


def tb(ds):
    return sum(ds, D(0)) / D(len(ds))


def tinh_diem(phieu, ctdt, thuong, thieu_mc):
    """phieu: list (chang, nhom, diem{clo: D}). Phiếu người vắng đã bị loại trước."""
    clo_full = {}
    for c in CLO:
        tu = D(0)
        mau = D(0)
        for k in sorted(CHANG_CO[c]):
            ps = [p for p in phieu if p[0] == k]
            tong = D(0)
            for nhom, tl in (("DVHD", TL_DV[c]), ("GVHD", TL_GV[c])):
                if tl == 0:
                    continue
                ds = [p[2][c] for p in ps if p[1] == nhom and c in p[2]]
                assert ds, (c, k, nhom)
                tong += tl * tb(ds)
            s = tong / D(100)
            tu += W[k] * s
            mau += W[k]
        clo_full[c] = tu / mau
    hp_raw = sum((ALPHA[c] * clo_full[c] for c in CLO), D(0)) / D(100)
    hp = r1(min(hp_raw + thuong, D(10)))
    diem = {c: r1(clo_full[c]) for c in CLO}
    m = {c: muc(diem[c]) for c in CLO}
    ly = []
    ng = NGUONG[ctdt]
    truot = [f"{c} đạt Mức {m[c]}" for c in ("CLO1", "CLO2") if m[c] < ng]
    if truot:
        ly.append(f"(b) {', '.join(truot)} — dưới Mức {ng} yêu cầu của {TEN_CT[ctdt]} (Điều 15 khoản 3 điểm b)")
    mhp = muc(hp)
    if mhp < 1:
        ly.append(f"(c) Điểm học phần {vn(hp)} (Mức {mhp}) dưới Mức 1 (Điều 15 khoản 3 điểm c)")
    if thieu_mc:
        ly.append(f"(d) Thiếu minh chứng bắt buộc: {', '.join(thieu_mc)} (Điều 15 khoản 3 điểm d)")
    nhom = lambda cs: r1(tb([clo_full[c] for c in cs]))
    return dict(full=clo_full, hp_raw=hp_raw, diem=diem, muc=m, hp=hp, muc_hp=mhp,
                ket_luan="DAT" if not ly else "KHONG_DAT", ly_do="\n".join(ly) if ly else None,
                kt=nhom(["CLO1", "CLO2"]), kn=nhom(["CLO3", "CLO5", "CLO6"]), td=nhom(["CLO4", "CLO7"]))


# ---------------------------------------------------------------- sinh SQL
out = []


class Raw(str):
    pass


def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, Raw):
        return str(v)
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, D)):
        return str(v)
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"


def ins(table, row, var=None):
    cols = ", ".join(row.keys())
    vals = ", ".join(lit(v) for v in row.values())
    out.append(f"INSERT INTO {table} ({cols}) VALUES ({vals});")
    if var:
        out.append(f"SET @{var} = LAST_INSERT_ID();")


def ins_many(table, cols, rows):
    out.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES")
    out.append(",\n".join("    (" + ", ".join(lit(v) for v in r) + ")" for r in rows) + ";")


def sec(t):
    out.append("")
    out.append("-- " + "-" * 69)
    out.append("-- " + t)
    out.append("-- " + "-" * 69)


def note(t):
    out.append("-- " + t)


def nd(tdn):
    return Raw(f"@nd_{tdn.replace('.', '_')}")


def jdump(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":"))


out.append("""-- =====================================================================
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
SET @giaovu = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'giaovu');""")

for t in ["gv.tung", "gv.lan", "gv.minh", "gv.hoa"]:
    out.append(f"SET {nd(t)} = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = '{t}');")
    out.append(f"SET @gv_{t[3:]} = (SELECT id FROM giang_vien WHERE nguoi_dung_id = {nd(t)});")

# ---------------------------------------------------------------- ĐVHD + cán bộ
sec("ĐƠN VỊ HƯỚNG DẪN VÀ CÁN BỘ")
note("Đ7 k1: 3 đơn vị đã duyệt; Bình Minh đang chờ duyệt — tài khoản cán bộ VO_HIEU_HOA đến khi duyệt (docs/01 mục 10.12).")
DVHD = [
    ("saomai", "DVHD-SAOMAI", "Công ty TNHH Phần mềm Sao Mai", "Số 18 ngõ 54 phố Trần Quốc Vượng, Cầu Giấy, Hà Nội",
     "Phát triển phần mềm doanh nghiệp", "Ngô Văn Hưng", "02437001001", "lienhe@saomai.test", "DA_DUYET"),
    ("hongha", "DVHD-HONGHA", "Công ty Cổ phần Giải pháp số Hồng Hà", "Tầng 7 tòa nhà B2, đường Giải Phóng, Hai Bà Trưng, Hà Nội",
     "Chuyển đổi số, hệ thống thông tin quản lý", "Đinh Thị Hằng", "02437002002", "tuyendung@hongha.test", "DA_DUYET"),
    ("thanglong", "DVHD-THANGLONG", "Viện Công nghệ Xây dựng số Thăng Long", "Số 3 phố Hoa Lư, Hai Bà Trưng, Hà Nội",
     "Nghiên cứu BIM và mô phỏng công trình", "PGS.TS Tạ Văn Khải", "02437003003", "vien@thanglong.test", "DA_DUYET"),
    ("binhminh", "DVHD-BINHMINH", "Công ty TNHH Kỹ thuật Bình Minh", "Khu đô thị Văn Phú, Hà Đông, Hà Nội",
     "Tự động hóa và IoT", "Lưu Quang Thắng", "02437004004", "info@binhminh.test", "CHO_DUYET"),
]
for key, ma, ten, dc, lv, dd, dt, em, tt in DVHD:
    ins("don_vi_huong_dan", dict(ma_dvhd=ma, ten=ten, dia_chi=dc, linh_vuc=lv, nguoi_dai_dien=dd, dien_thoai=dt, email=em,
                                 trang_thai_phe_duyet=tt, ngay_phe_duyet="2026-01-20" if tt == "DA_DUYET" else None,
                                 nguoi_phe_duyet_id=Raw("@giaovu") if tt == "DA_DUYET" else None), var=f"dv_{key}")

# (tdn, họ tên, email, đơn vị, chức vụ, kinh nghiệm, hạn mức, trạng thái)
CAN_BO = [
    ("cb.son", "Ngô Thanh Sơn", "son.nt@saomai.test", "saomai", "Trưởng nhóm phát triển", 8, 5, "HOAT_DONG"),
    ("cb.trang", "Lý Thu Trang", "trang.lt@saomai.test", "saomai", "Kỹ sư kiểm thử chính", 5, 5, "HOAT_DONG"),
    ("cb.quang", "Đinh Văn Quang", "quang.dv@hongha.test", "hongha", "Quản lý dự án", 10, 5, "HOAT_DONG"),
    # Hạn mức 1 (cán bộ kiêm nhiệm) để demo QUOTA_EXCEEDED trong đợt tạo live: SV thứ hai chọn cán bộ này bị chặn (CBR-03).
    ("cb.yen", "Phan Hải Yến", "yen.ph@hongha.test", "hongha", "Chuyên viên phân tích nghiệp vụ", 4, 1, "HOAT_DONG"),
    ("cb.duc", "Tạ Minh Đức", "duc.tm@thanglong.test", "thanglong", "Nghiên cứu viên chính", 12, 3, "HOAT_DONG"),
    ("cb.phuong", "Lưu Thị Phương", "phuong.lt@binhminh.test", "binhminh", "Trưởng phòng kỹ thuật", 6, 5, "VO_HIEU_HOA"),
]
for i, (tdn, ten, em, dv, cv, kn, hm, tt) in enumerate(CAN_BO):
    ins("nguoi_dung", dict(ten_dang_nhap=tdn, mat_khau_hash=Raw("@mk"), ho_ten=ten, email=em, dien_thoai=f"090300{i + 1:04d}",
                           vai_tro="CAN_BO_DVHD", trang_thai=tt), var=f"nd_{tdn.replace('.', '_')}")
    ins("can_bo_dvhd", dict(nguoi_dung_id=nd(tdn), don_vi_id=Raw(f"@dv_{dv}"), chuc_vu=cv, so_nam_kinh_nghiem=kn,
                            so_sv_toi_da=hm), var=f"cb_{tdn[3:]}")

TEN_ND = {"gv.tung": "Phạm Hữu Tùng", "gv.lan": "Trần Thị Lan", "gv.minh": "Lê Quang Minh", "gv.hoa": "Đỗ Thu Hoà"}
TEN_ND.update({c[0]: c[1] for c in CAN_BO})

# ---------------------------------------------------------------- sinh viên mới
sec("SINH VIÊN MỚI")
note("10 SV K66 cho đợt đã kết thúc; 5 SV K67 bổ sung cho đợt đang chạy (cùng 8 SV của V3).")
SV_MOI = [
    # tdn, họ tên, mã, lớp, khóa, ctdt
    ("sv.nam", "Nguyễn Hoài Nam", "2151220101", "66CNTT1", "K66", "CHUAN"),
    ("sv.oanh", "Trần Kim Oanh", "2151220102", "66CNTT1", "K66", "CHUAN"),
    ("sv.phong", "Lê Thanh Phong", "2151220103", "66CNTT2", "K66", "CHUAN"),
    ("sv.quyen", "Phạm Lệ Quyên", "2151220104", "66CLC", "K66", "CLC_STEM"),
    ("sv.tai", "Hoàng Đức Tài", "2151220105", "66CNTT2", "K66", "CHUAN"),
    ("sv.uyen", "Vũ Tú Uyên", "2151220106", "66CLC", "K66", "CLC_STEM"),
    ("sv.vinh", "Đặng Quang Vinh", "2151220107", "66CNTT1", "K66", "CHUAN"),
    ("sv.xuan", "Bùi Thanh Xuân", "2151220108", "66CNTT2", "K66", "CHUAN"),
    ("sv.thao", "Ngô Phương Thảo", "2151220109", "66CNTT1", "K66", "CHUAN"),
    ("sv.toan", "Đỗ Văn Toàn", "2151220110", "66CNTT2", "K66", "CHUAN"),
    ("sv.mai", "Lương Thị Mai", "2251220009", "67CNTT1", "K67", "CHUAN"),
    ("sv.nga", "Hà Thúy Nga", "2251220010", "67CNTT2", "K67", "CHUAN"),
    ("sv.phat", "Trịnh Gia Phát", "2251220011", "67CNTT1", "K67", "CHUAN"),
    ("sv.quan", "Mai Đức Quân", "2251220012", "67CNTT2", "K67", "CHUAN"),
    ("sv.thu", "Lại Minh Thư", "2251220013", "67CLC", "K67", "CLC_STEM"),
]
for i, (tdn, ten, ma, lop, kh, ct) in enumerate(SV_MOI):
    ins("nguoi_dung", dict(ten_dang_nhap=tdn, mat_khau_hash=Raw("@mk"), ho_ten=ten, email=f"{ma}@st.huce.edu.vn",
                           dien_thoai=f"098800{i + 1:04d}", vai_tro="SINH_VIEN"), var=f"nd_{tdn.replace('.', '_')}")
    ins("sinh_vien", dict(nguoi_dung_id=nd(tdn), ma_sv=ma, lop=lop, khoa_hoc=kh, nganh="Công nghệ thông tin",
                          khoa_vien="Khoa Công nghệ thông tin", chuong_trinh_dao_tao=ct), var=f"sv_{tdn[3:]}")
    TEN_ND[tdn] = ten
CTDT = {s[0]: s[5] for s in SV_MOI}
V3_SV = {"sv.an": "CHUAN", "sv.binh": "CHUAN", "sv.cuong": "CHUAN", "sv.dung": "CLC_STEM", "sv.giang": "CHUAN",
         "sv.ha": "CLC_STEM", "sv.khanh": "CHUAN", "sv.linh": "CLC_STEM"}
TEN_V3 = {"sv.an": "Nguyễn Văn An", "sv.binh": "Trần Thị Bình", "sv.cuong": "Lê Mạnh Cường", "sv.dung": "Phạm Thị Dung",
          "sv.giang": "Hoàng Văn Giang", "sv.ha": "Vũ Thu Hà"}
CTDT.update(V3_SV)
TEN_ND.update(TEN_V3)
for t in ["sv.an", "sv.binh", "sv.cuong", "sv.dung", "sv.giang", "sv.ha"]:
    out.append(f"SET {nd(t)} = (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = '{t}');")
    out.append(f"SET @sv_{t[3:]} = (SELECT id FROM sinh_vien WHERE nguoi_dung_id = {nd(t)});")


# ---------------------------------------------------------------- đợt + cấu hình nhân bản
def tao_dot(key, ma, ten, hk, nh, bd, kt, so_tuan, han, tt, c1, c2):
    """c1/c2 = (ngay_mo, ngay_dong, trang_thai). Nhân bản cấu hình từ MAU-QD207 như DotThucTapService.taoDot (#28)."""
    ins("dot_thuc_tap", dict(ma_dot=ma, ten=ten, hoc_ky=hk, nam_hoc=nh, khoa_vien="Khoa Công nghệ thông tin",
                             ngay_bat_dau=bd, ngay_ket_thuc=kt, so_tuan=so_tuan, han_nop_bao_cao=han, trang_thai=tt),
        var=f"dot_{key}")
    out.append("SET @mau = (SELECT id FROM dot_thuc_tap WHERE ma_dot = 'MAU-QD207');")
    note("UC03 bước 4: chặng 1 mở đầu tuần 4 (bắt đầu + 21 ngày), chặng 2 mở ngày liền sau ngày kết thúc.")
    for thu_tu, (mo, dong, ttc) in ((1, c1), (2, c2)):
        tuan = 4 if thu_tu == 1 else so_tuan
        out.append(f"INSERT INTO chang_danh_gia (dot_id, thu_tu, ten, tuan_thuc_hien, trong_so_w, ngay_mo, ngay_dong, trang_thai)\n"
                   f"SELECT @dot_{key}, thu_tu, ten, {tuan}, trong_so_w, {lit(mo)}, {lit(dong)}, {lit(ttc)}\n"
                   f"FROM chang_danh_gia WHERE dot_id = @mau AND thu_tu = {thu_tu};")
        out.append(f"SET @{key}_c{thu_tu} = LAST_INSERT_ID();")
    out.append(f"""INSERT INTO chuan_dau_ra (dot_id, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd)
SELECT @dot_{key}, ma_clo, ten, mo_ta, trong_so_alpha, ty_le_dvhd, ty_le_gvhd FROM chuan_dau_ra WHERE dot_id = @mau ORDER BY id;
INSERT INTO muc_rubric (chuan_dau_ra_id, muc, diem_min, diem_max, mo_ta_hanh_vi)
SELECT moi.id, m.muc, m.diem_min, m.diem_max, m.mo_ta_hanh_vi
FROM muc_rubric m
JOIN chuan_dau_ra goc ON goc.id = m.chuan_dau_ra_id AND goc.dot_id = @mau
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_{key} AND moi.ma_clo = goc.ma_clo
ORDER BY m.id;
INSERT INTO cau_hoi_danh_gia (chang_id, chuan_dau_ra_id, thu_tu, noi_dung)
SELECT CASE c.thu_tu WHEN 1 THEN @{key}_c1 ELSE @{key}_c2 END, moi.id, q.thu_tu, q.noi_dung
FROM cau_hoi_danh_gia q
JOIN chang_danh_gia c ON c.id = q.chang_id AND c.dot_id = @mau
JOIN chuan_dau_ra goc ON goc.id = q.chuan_dau_ra_id
JOIN chuan_dau_ra moi ON moi.dot_id = @dot_{key} AND moi.ma_clo = goc.ma_clo
ORDER BY q.id;""")
    for c in CLO:
        out.append(f"SET @{key}_{c.lower()} = (SELECT id FROM chuan_dau_ra WHERE dot_id = @dot_{key} AND ma_clo = '{c}');")


# ---------------------------------------------------------------- dữ liệu dùng chung cho hồ sơ
TIEU_CHI_08A = ["Kiến thức chuyên môn và khả năng vận dụng thực tế", "Kỹ năng phân tích và giải quyết vấn đề kỹ thuật",
                "Kỹ năng giao tiếp và làm việc nhóm", "Tinh thần trách nhiệm, tác phong và ý thức kỷ luật",
                "Tuân thủ quy định an toàn lao động", "Sáng tạo, chủ động, đề xuất cải tiến"]
CHAT_LUONG_08B = ["Sự phù hợp giữa nội dung thực tập và chuyên ngành đào tạo", "Mức độ hỗ trợ từ giảng viên hướng dẫn",
                  "Mức độ hỗ trợ và hướng dẫn từ người hướng dẫn tại ĐVHD", "Điều kiện làm việc và an toàn tại nơi thực tập",
                  "Cơ hội học hỏi và phát triển nghề nghiệp", "Tính hiệu quả của quy trình đánh giá CLO (4 tuần/lần)"]
GIUA = {0: D("2.00"), 1: D("4.75"), 2: D("6.25"), 3: D("7.75"), 4: D("9.25")}
CONG_VIEC = ["Tìm hiểu quy trình, nội quy và hệ thống hiện có của đơn vị",
             "Phân tích yêu cầu nghiệp vụ được giao, lập tài liệu đặc tả",
             "Thiết kế cơ sở dữ liệu và giao diện cho chức năng được giao",
             "Lập trình chức năng thứ nhất theo hướng dẫn của cán bộ",
             "Lập trình chức năng thứ hai, viết kiểm thử đơn vị",
             "Tích hợp, sửa lỗi theo phản hồi của nhóm phát triển",
             "Kiểm thử hệ thống, viết tài liệu hướng dẫn sử dụng",
             "Bàn giao sản phẩm, viết báo cáo thực tập TTTN-06"]
KE_HOACH_TONG_KET = ("Tổng kết, hoàn thiện báo cáo TTTN-06", "Báo cáo được ĐVHD và GVHD xác nhận", "Báo cáo TTTN-06")


def add_days(d, n):
    import datetime
    x = datetime.date.fromisoformat(d) + datetime.timedelta(days=n)
    return x.isoformat()


def ho_so(key, sv, dot, ht, dv, cb, de_tai, so_tuan, tt, ngay_gui, bo_phan="Phòng phát triển phần mềm"):
    ins("ho_so_thuc_tap", dict(sinh_vien_id=Raw(f"@sv_{sv[3:]}"), dot_id=Raw(f"@dot_{dot}"), hinh_thuc_thuc_tap=ht,
                               don_vi_id=Raw(f"@dv_{dv}"), can_bo_dvhd_id=Raw(f"@cb_{cb[3:]}"), bo_phan=bo_phan,
                               de_tai=de_tai, hinh_thuc_lam_viec="TRUC_TIEP", so_tuan_tham_gia=so_tuan,
                               muc_tieu="Vận dụng kiến thức chuyên ngành vào bài toán thực tế của đơn vị",
                               san_pham_du_kien="Mô-đun phần mềm chạy được kèm tài liệu kỹ thuật",
                               trang_thai=tt, ngay_gui=ngay_gui), var=f"hs_{key}")


def phan_cong(key, gv, ngay):
    ins("phan_cong_gvhd", dict(ho_so_id=Raw(f"@hs_{key}"), giang_vien_id=Raw(f"@gv_{gv[3:]}"), ngay_phan_cong=ngay,
                               nguoi_phan_cong=Raw("@giaovu")))


def ke_hoach(key, bd, so_tuan, nop, xn_dv, xn_gv):
    ins("ke_hoach_hoc_tap", dict(ho_so_id=Raw(f"@hs_{key}"), ngay_nop=nop, nop_muon=False, xac_nhan_dvhd=xn_dv,
                                 xac_nhan_gvhd=xn_gv, trang_thai="DA_KHOA"), var=f"kh_{key}")
    rows = []
    for t in range(1, so_tuan + 1):
        rows.append((Raw(f"@kh_{key}"), t, CONG_VIEC[(t - 1) % len(CONG_VIEC)],
                     "Hoàn thành nhiệm vụ tuần " + str(t) + " đúng hạn", "Nhật ký thực tập, sản phẩm tuần"))
    rows.append((Raw(f"@kh_{key}"), so_tuan + 1) + KE_HOACH_TONG_KET)
    ins_many("muc_ke_hoach", ["ke_hoach_id", "tuan", "muc_tieu", "ket_qua_mong_doi", "hinh_thuc_minh_chung"], rows)


def tien_do(key, bd, so_tuan, cb, xac_nhan_den, dien_den, pt_cuoi=100):
    """Tuần 1..dien_den có kết quả; 1..xac_nhan_den có xác nhận cán bộ (xac_nhan_dvhd_id = id người dùng)."""
    rows = []
    for t in range(1, so_tuan + 1):
        dien = t <= dien_den
        xn = t <= xac_nhan_den
        cuoi_tuan = add_days(bd, 7 * t - 2) + " 17:00:00"
        rows.append((Raw(f"@hs_{key}"), t, CONG_VIEC[(t - 1) % len(CONG_VIEC)],
                     ("Đã hoàn thành: " + CONG_VIEC[(t - 1) % len(CONG_VIEC)].lower()) if dien else None,
                     (100 if t < dien_den else pt_cuoi) if dien else None,
                     nd(cb) if xn else None, cuoi_tuan if xn else None))
    ins_many("tien_do_tuan", ["ho_so_id", "tuan", "cong_viec_duoc_giao", "ket_qua_thuc_hien", "phan_tram_hoan_thanh",
                              "xac_nhan_dvhd_id", "ngay_xac_nhan"], rows)


def nhat_ky(key, ngays):
    rows = []
    for i, ng in enumerate(ngays):
        rows.append((Raw(f"@hs_{key}"), ng, CONG_VIEC[min(i * 8 // max(len(ngays), 1), 7)],
                     D("8.0"), "Hoàn thành phần việc trong ngày, ghi chú vướng mắc để hỏi cán bộ", ng + " 18:00:00"))
    ins_many("nhat_ky_thuc_tap", ["ho_so_id", "ngay", "noi_dung", "so_gio", "ket_qua", "ngay_tao"], rows)


def bao_cao(key, ma_sv, nop, xn_dv, xn_gv):
    ins("bao_cao_thuc_tap", dict(ho_so_id=Raw(f"@hs_{key}"), phien_ban=1, ten_file=f"BaoCao_TTTN06_{ma_sv}.pdf",
                                 duong_dan=Raw(f"CONCAT(@hs_{key}, '/seed-bao-cao-{ma_sv}.pdf')"), ngay_nop=nop,
                                 nop_muon=False, xac_nhan_dvhd=xn_dv, xac_nhan_gvhd=xn_gv))


NHAT_KY_HT = []  # (thoi_diem, nguoi, vai_tro, hanh_vi, doi_tuong, doi_tuong_id(Raw), truoc, sau)


def phieu(key, chang_var, nguoi, nhom, diem, tt, ngay_nop, nhan_xet):
    """diem: {clo: D}; ĐVHD không có CLO7 (CBR-09)."""
    ins("phieu_danh_gia", dict(ho_so_id=Raw(f"@hs_{key}"), chang_id=Raw(chang_var), nguoi_cham_id=nd(nguoi),
                               nhom_nguoi_cham=nhom, nhan_xet_chung=nhan_xet, trang_thai=tt,
                               ngay_nop=ngay_nop if tt == "DA_NOP" else None), var="phieu")
    dot = chang_var.split("_")[0][1:]
    rows = [(Raw("@phieu"), Raw(f"@{dot}_{c.lower()}"), muc(v), v, None) for c, v in diem.items()]
    ins_many("diem_clo_chi_tiet", ["phieu_id", "chuan_dau_ra_id", "muc_dat", "diem", "nhan_xet"], rows)
    if tt == "DA_NOP":
        anh = {c: {"muc": muc(v), "diem": float(v)} for c, v in sorted(diem.items())}
        vai = "GIANG_VIEN" if nguoi.startswith("gv.") else "CAN_BO_DVHD"
        out.append("INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, "
                   f"gia_tri_truoc, gia_tri_sau) VALUES ({lit(ngay_nop)}, {nd(nguoi)}, '{vai}', 'NOP_PHIEU', "
                   f"'phieu_danh_gia', @phieu, NULL, {lit(jdump(anh))});")


def phieu_08a(key, cb, ngay, muc_tc):
    tc = [{"stt": i + 1, "noiDung": TIEU_CHI_08A[i], "muc": m, "nhanXet": None} for i, m in enumerate(muc_tc)]
    ins("phan_hoi", dict(ho_so_id=Raw(f"@hs_{key}"), loai="TTTN_08A", nguoi_gui_id=nd(cb),
                         du_lieu_tieu_chi=jdump({"tieuChi": tc}),
                         y_kien_mo="Nhà trường nên tăng thời lượng thực hành công cụ quản lý mã nguồn trước kỳ thực tập.",
                         ngay_gui=ngay))


def phieu_08b(key, sv, ngay, hai_long, tu_muc, chi_so):
    td = [{"maClo": c, "muc": m, "diemQuyDoi": float(GIUA[m]), "minhChung": None} for c, m in zip(CLO, tu_muc)]
    hp_self = r1(sum((ALPHA[c] * GIUA[m] for c, m in zip(CLO, tu_muc)), D(0)) / D(100))
    b = {"chatLuong": [{"stt": i + 1, "noiDung": CHAT_LUONG_08B[i], "mucHaiLong": m, "ghiChu": None}
                       for i, m in enumerate(hai_long)],
         "yKienKhac": None, "tuDanhGia": td,
         "tuLuan": {"kyNangHocDuoc": "Quy trình phát triển phần mềm theo nhóm và kỹ năng phân tích yêu cầu.",
                    "khoKhan": "Chưa quen công cụ của đơn vị trong hai tuần đầu.",
                    "keHoachCaiThien": "Tự học thêm về kiểm thử tự động và tiếng Anh chuyên ngành.",
                    "deXuat": "Có buổi định hướng chung trước khi sinh viên đến đơn vị."},
         "camKet": True}
    ins("phan_hoi", dict(ho_so_id=Raw(f"@hs_{key}"), loai="TTTN_08B", nguoi_gui_id=nd(sv), du_lieu_tieu_chi=jdump(b),
                         hp_self=hp_self, chi_so_tu_nhan_thuc=chi_so,
                         y_kien_mo="Mong khoa duy trì đánh giá CLO theo chặng vì giúp em biết mình yếu ở đâu.", ngay_gui=ngay))
    return hp_self


def thong_bao(nguoi, ma, nd_, dd, da_doc, ngay):
    out.append("INSERT INTO thong_bao (nguoi_nhan_id, ma_su_kien, noi_dung, duong_dan, da_doc, ngay_tao) VALUES "
               f"({nguoi}, '{ma}', {lit(nd_)}, {dd}, {lit(da_doc)}, '{ngay}');")


def nk_ht(thoi_diem, nguoi, vai, hanh_vi, doi_tuong, dt_id, truoc, sau):
    out.append("INSERT INTO nhat_ky_he_thong (thoi_diem, nguoi_thuc_hien, vai_tro, hanh_vi, doi_tuong, doi_tuong_id, "
               f"gia_tri_truoc, gia_tri_sau) VALUES ('{thoi_diem}', {nguoi}, '{vai}', '{hanh_vi}', '{doi_tuong}', {dt_id}, "
               f"{lit(truoc)}, {lit(sau)});")


def vec(*xs, n=7):
    vs = [D(str(x)) for x in xs]
    assert len(vs) == n
    return dict(zip(CLO[:n], vs))


def lech(v, d, khong_doi=()):
    """Cộng độ lệch d (bước 0,5) cho mọi CLO trừ các CLO cố định; chặn trong 0–10."""
    return {c: (x if c in khong_doi else max(D(0), min(D(10), x + D(str(d))))) for c, x in v.items()}


def bo_clo7(v):
    return {c: x for c, x in v.items() if c != "CLO7"}


# =====================================================================
# ĐỢT 1 — TTTN-2025-HK2 (đã kết thúc, đã công bố)
# =====================================================================
sec("ĐỢT TTTN-2025-HK2 — ĐÃ KẾT THÚC, KẾT QUẢ ĐÃ CÔNG BỐ")
BD1, KT1 = "2026-03-02", "2026-04-26"
tao_dot("k1", "TTTN-2025-HK2", "Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026", "HK2", "2025-2026", BD1, KT1, 8,
        "2026-05-01", "DA_KET_THUC", ("2026-03-23", "2026-03-31", "DA_DONG"), ("2026-04-27", "2026-05-08", "DA_DONG"))

# Ca thử: key, sv, gvhd, cán bộ, hình thức, đơn vị, mô tả ca
NX_GV = "Sinh viên chủ động, nắm được yêu cầu nghiệp vụ; cần trình bày báo cáo mạch lạc hơn."
NX_CB = "Sinh viên chấp hành tốt nội quy, hoàn thành nhiệm vụ được giao đúng tiến độ."
CA = [
    # S1: ví dụ tính tay chuẩn (skill tinh-diem-clo, ScoringServiceTest #1): HP 7,7 Đạt
    dict(key="s1", sv="sv.nam", gv="gv.tung", cb="cb.son", dv="saomai", ht="DOANH_NGHIEP", to=1, thuong="0",
         c1_dv=vec(7.0, 6.5, 6.0, 8.0, 7.5, 7.0, n=6), c1_gv=vec(8.0, 7.0, 7.0, 9.0, 8.0, 6.0, n=6),
         c2={"gv.tung": vec(8, 7, 8, 9, 8, 7, 8), "gv.minh": vec(9, 8, 7, 9, 7, 8, 7), "cb.son": vec(8, 7, 7, 9, 8, 8, n=6)},
         ky_vong=dict(hp="7.7", ket_luan="DAT"), tu_muc=[3, 3, 3, 4, 3, 3, 3]),
    # S2: HP 8,3 (Mức 3) + thưởng 0,3 ⇒ 8,6 Mức 4 (Đ18 k4)
    dict(key="s2", sv="sv.oanh", gv="gv.tung", cb="cb.son", dv="saomai", ht="DOANH_NGHIEP", to=1, thuong="0.3",
         base1=vec(8.0, 8.0, 7.5, 8.5, 8.0, 8.0, 0), base2=vec(8.5, 8.5, 8.0, 9.0, 8.5, 8.0, 8.0),
         ky_vong=dict(hp_raw_muc=3, muc_hp=4, ket_luan="DAT"), tu_muc=[4, 4, 3, 4, 3, 3, 3]),
    # S3: CLO2 Mức 0 ⇒ Không đạt (b) dù HP ≥ 4
    dict(key="s3", sv="sv.phong", gv="gv.tung", cb="cb.son", dv="saomai", ht="DOANH_NGHIEP", to=1, thuong="0",
         base1=vec(7.0, 3.0, 6.5, 7.5, 7.0, 6.5, 0), base2=vec(7.0, 3.0, 6.5, 7.5, 7.0, 7.0, 6.5), fixed=("CLO2",),
         ky_vong=dict(ket_luan="KHONG_DAT", muc_clo2=0, hp_min="4"), tu_muc=[3, 2, 3, 3, 3, 3, 2]),
    # S4: CLC/STEM, CLO2 = 5,0 (Mức 1) ⇒ Không đạt (b) — đối chứng với S5 (Đ15 k3b)
    dict(key="s4", sv="sv.quyen", gv="gv.tung", cb="cb.son", dv="saomai", ht="DOANH_NGHIEP", to=1, thuong="0",
         base1=vec(7.5, 5.0, 7.0, 8.0, 7.5, 7.0, 0), base2=vec(7.5, 5.0, 7.5, 8.0, 7.5, 7.5, 7.5), fixed=("CLO2",),
         ky_vong=dict(ket_luan="KHONG_DAT", clo2="5.0"), tu_muc=[3, 3, 3, 3, 3, 3, 3]),
    # S5: chương trình Chuẩn, cùng CLO2 = 5,0 ⇒ Đạt
    dict(key="s5", sv="sv.tai", gv="gv.lan", cb="cb.trang", dv="saomai", ht="DOANH_NGHIEP", to=2, thuong="0",
         base1=vec(7.5, 5.0, 7.0, 8.0, 7.5, 7.0, 0), base2=vec(7.5, 5.0, 7.5, 8.0, 7.5, 7.5, 7.5), fixed=("CLO2",),
         ky_vong=dict(ket_luan="DAT", clo2="5.0"), tu_muc=[3, 2, 3, 3, 3, 3, 3]),
    # S6: CLC/STEM, HP Mức 4
    dict(key="s6", sv="sv.uyen", gv="gv.lan", cb="cb.trang", dv="saomai", ht="DOANH_NGHIEP", to=2, thuong="0",
         base1=vec(9.0, 8.5, 8.5, 9.0, 9.0, 9.0, 0), base2=vec(9.5, 9.0, 9.0, 9.5, 9.0, 9.0, 9.0),
         ky_vong=dict(ket_luan="DAT", muc_hp=4), tu_muc=[3, 3, 4, 4, 3, 4, 3]),
    # S7: Nghiên cứu, thiếu "Sản phẩm nghiên cứu" ⇒ Không đạt (d) dù điểm tốt (Đ15 k3d)
    dict(key="s7", sv="sv.vinh", gv="gv.lan", cb="cb.duc", dv="thanglong", ht="NGHIEN_CUU", to=3, thuong="0",
         base1=vec(7.5, 7.0, 7.0, 8.0, 7.5, 7.5, 0), base2=vec(8.0, 7.5, 7.0, 8.5, 7.5, 8.0, 7.5),
         thieu_mc=["Sản phẩm nghiên cứu"], ky_vong=dict(ket_luan="KHONG_DAT"), tu_muc=[3, 3, 3, 3, 3, 3, 3]),
    # S8: Tổ có gv.hoa vắng mặt (phiếu 2,0 đã lỡ nộp) — bị loại khỏi trung bình; Đạt
    dict(key="s8", sv="sv.xuan", gv="gv.lan", cb="cb.quang", dv="hongha", ht="DOANH_NGHIEP", to=3, thuong="0",
         base1=vec(7.0, 6.5, 6.5, 7.5, 7.0, 7.0, 0), base2=vec(7.5, 7.0, 7.0, 8.0, 7.0, 7.0, 7.0),
         vang={"gv.hoa": vec(2, 2, 2, 2, 2, 2, 2)}, ky_vong=dict(ket_luan="DAT"), tu_muc=[3, 3, 2, 3, 3, 3, 3]),
    # S9: HP Mức 1, CLO1/CLO2 vừa Mức 1 ⇒ vừa đủ Đạt
    dict(key="s9", sv="sv.thao", gv="gv.lan", cb="cb.quang", dv="hongha", ht="DOANH_NGHIEP", to=3, thuong="0",
         base1=vec(5.0, 5.0, 4.5, 5.0, 4.5, 4.5, 0), base2=vec(5.0, 5.0, 4.5, 5.0, 4.5, 4.5, 4.5),
         ky_vong=dict(ket_luan="DAT", muc_hp=1), tu_muc=[2, 2, 2, 3, 2, 2, 2]),
    # S10: HP < 4, CLO1/CLO2 Mức 0 ⇒ Không đạt (b) + (c)
    dict(key="s10", sv="sv.toan", gv="gv.lan", cb="cb.quang", dv="hongha", ht="DOANH_NGHIEP", to=3, thuong="0",
         base1=vec(3.0, 3.0, 4.0, 4.5, 4.0, 3.5, 0), base2=vec(3.0, 3.0, 4.0, 4.5, 4.0, 3.5, 3.5),
         ky_vong=dict(ket_luan="KHONG_DAT", muc_hp=0), tu_muc=[2, 1, 2, 2, 2, 2, 1]),
]
TO = {1: dict(chu_tich="gv.tung", gv=["gv.tung", "gv.minh"], dv=["cb.son"]),
      2: dict(chu_tich="gv.lan", gv=["gv.lan", "gv.minh"], dv=["cb.trang"]),
      # gv.hoa vắng mặt buổi báo cáo, gv.tung được bổ sung thay thế (UC09, #81) ⇒ 5 người có mặt.
      3: dict(chu_tich="gv.lan", gv=["gv.lan", "gv.minh", "gv.hoa", "gv.tung"], dv=["cb.quang", "cb.duc"], vang=["gv.hoa"])}
LECH_GV = [D("0.5"), D("0"), D("-0.5"), D("0")]
LECH_DV = [D("-0.5"), D("0")]

MA_SV = {s[0]: s[2] for s in SV_MOI}
for ca in CA:
    to = TO[ca["to"]]
    fixed = ca.get("fixed", ())
    if "c2" not in ca:
        ca["c1_dv"] = bo_clo7(lech(ca["base1"], "-0.5", fixed))
        ca["c1_gv"] = bo_clo7(lech(ca["base1"], "0.5", fixed))
        c2 = {}
        co_mat_gv = [g for g in to["gv"] if g not in to.get("vang", [])]
        for i, g in enumerate(co_mat_gv):
            c2[g] = lech(ca["base2"], LECH_GV[i % 4], fixed)
        for i, c in enumerate(to["dv"]):
            c2[c] = bo_clo7(lech(ca["base2"], LECH_DV[i % 2], fixed))
        ca["c2"] = c2
    phieu_tinh = [(1, "DVHD", ca["c1_dv"]), (1, "GVHD", ca["c1_gv"])]
    for ng, v in ca["c2"].items():
        phieu_tinh.append((2, "GVHD" if ng.startswith("gv.") else "DVHD", v))
    ca["kq"] = kq = tinh_diem(phieu_tinh, CTDT[ca["sv"]], D(ca["thuong"]), ca.get("thieu_mc", []))
    kq0 = tinh_diem(phieu_tinh, CTDT[ca["sv"]], D(0), ca.get("thieu_mc", []))
    kv = ca["ky_vong"]
    tom = f"{ca['key']}: CLO {[str(kq['diem'][c]) for c in CLO]} HP {kq['hp']} (M{kq['muc_hp']}) {kq['ket_luan']} {kq['ly_do']!r}"
    print(tom)
    assert kq["ket_luan"] == kv["ket_luan"], tom
    if "hp" in kv:
        assert kq["hp"] == D(kv["hp"]), tom
    if "muc_hp" in kv:
        assert kq["muc_hp"] == kv["muc_hp"], tom
    if "hp_raw_muc" in kv:
        assert kq0["muc_hp"] == kv["hp_raw_muc"], tom
    if "muc_clo2" in kv:
        assert kq["muc"]["CLO2"] == kv["muc_clo2"], tom
    if "clo2" in kv:
        assert kq["diem"]["CLO2"] == D(kv["clo2"]), tom
    if "hp_min" in kv:
        assert kq["hp"] >= D(kv["hp_min"]), tom
    # Đ20 k3: không để cặp nào lệch > 2 (dữ liệu "sạch"; cảnh báo lệch demo bằng dữ liệu live)
    for k in (1, 2):
        for c in CLO:
            dv = [v[c] for (kk, n, v) in phieu_tinh if kk == k and n == "DVHD" and c in v]
            gv = [v[c] for (kk, n, v) in phieu_tinh if kk == k and n == "GVHD" and c in v]
            if dv and gv:
                assert abs(tb(dv) - tb(gv)) <= 2, (ca["key"], k, c)

sec("TTTN-2025-HK2 — HỒ SƠ, KẾ HOẠCH, TIẾN ĐỘ, NHẬT KÝ, BÁO CÁO")
DE_TAI = {"DOANH_NGHIEP": "Xây dựng mô-đun quản lý công việc cho hệ thống nội bộ",
          "NGHIEN_CUU": "Nghiên cứu ứng dụng mô hình BIM trong quản lý tiến độ thi công"}
for i, ca in enumerate(CA):
    k = ca["key"]
    ho_so(k, ca["sv"], "k1", ca["ht"], ca["dv"], ca["cb"], DE_TAI[ca["ht"]], 8,
          "HOAN_THANH" if ca["kq"]["ket_luan"] == "DAT" else "KHONG_HOAN_THANH", f"2026-02-{10 + i % 5:02d} 09:{10 + i:02d}:00",
          bo_phan="Phòng nghiên cứu mô phỏng" if ca["ht"] == "NGHIEN_CUU" else "Phòng phát triển phần mềm")
    phan_cong(k, ca["gv"], "2026-02-24 10:00:00")
    ke_hoach(k, BD1, 8, "2026-03-05 20:00:00", "2026-03-06 09:00:00", "2026-03-06 15:00:00")
    tien_do(k, BD1, 8, ca["cb"], 8, 8)
    nhat_ky(k, [add_days(BD1, 7 * t + d) for t in range(8) for d in (0, 2)])
    if ca["ht"] == "NGHIEN_CUU":
        note("Đ4: nghiên cứu cần Đề cương + Sản phẩm (tải lên); chỉ có Đề cương ⇒ thiếu minh chứng (d).")
        ins("minh_chung", dict(ho_so_id=Raw(f"@hs_{k}"), loai_minh_chung="DE_CUONG_NGHIEN_CUU", tuan=1,
                               ten_file="DeCuong_NghienCuu_BIM.pdf", duong_dan=Raw(f"CONCAT(@hs_{k}, '/seed-de-cuong.pdf')"),
                               kich_thuoc=482133, nguoi_tai_len_id=nd(ca["sv"]), ngay_tai_len="2026-03-05 21:00:00",
                               da_khoa=True))
    bao_cao(k, MA_SV[ca["sv"]], "2026-04-28 22:00:00", "2026-04-29 10:00:00", "2026-04-30 14:00:00")

sec("TTTN-2025-HK2 — PHIẾU CHẶNG 1 (GVHD + CÁN BỘ, UC08)")
for i, ca in enumerate(CA):
    k = ca["key"]
    phieu(k, "@k1_c1", ca["cb"], "DVHD", ca["c1_dv"], "DA_NOP", f"2026-03-25 1{i % 8}:00:00", NX_CB)
    phieu(k, "@k1_c1", ca["gv"], "GVHD", ca["c1_gv"], "DA_NOP", f"2026-03-26 1{i % 8}:30:00", NX_GV)

sec("TTTN-2025-HK2 — TỔ ĐÁNH GIÁ CUỐI KỲ (UC09)")
for so, to in TO.items():
    ins("to_danh_gia", dict(dot_id=Raw("@dot_k1"), ngay_thanh_lap="2026-04-27", thoi_gian_bao_cao=f"2026-05-0{4 + so} 08:00:00",
                            dia_diem=f"Phòng {300 + so * 2} nhà A1", hinh_thuc="TRUC_TIEP"), var=f"to{so}")
    rows = [(Raw(f"@to{so}"), nd(g), "GVHD", g == to["chu_tich"], g in to.get("vang", [])) for g in to["gv"]]
    rows += [(Raw(f"@to{so}"), nd(c), "DVHD", False, False) for c in to["dv"]]
    ins_many("thanh_vien_to_danh_gia", ["to_danh_gia_id", "nguoi_dung_id", "nhom_nguoi_cham", "la_chu_tich", "vang_mat"], rows)
    ins_many("to_danh_gia_ho_so", ["to_danh_gia_id", "ho_so_id"], [(Raw(f"@to{so}"), Raw(f"@hs_{ca['key']}")) for ca in CA
                                                                   if ca["to"] == so])
out.append("SET @tv_vang = (SELECT id FROM thanh_vien_to_danh_gia WHERE to_danh_gia_id = @to3 AND nguoi_dung_id = @nd_gv_hoa);")
nk_ht("2026-05-07 07:45:00", "@giaovu", "ADMIN", "DOI_VANG_MAT_THANH_VIEN", "thanh_vien_to_danh_gia", "@tv_vang",
      '{"vangMat":false}', '{"vangMat":true,"lyDo":"Đi công tác đột xuất, được Trưởng Khoa đồng ý","thayThe":' + "\"gv.tung\"}")

sec("TTTN-2025-HK2 — PHIẾU CHẶNG 2 (THÀNH VIÊN TỔ, UC09)")
note("Phiếu của gv.hoa cho S8 nộp trước khi được đánh dấu vắng mặt ⇒ bị loại khỏi trung bình (Đ10 k3).")
for i, ca in enumerate(CA):
    k = ca["key"]
    for j, (ng, v) in enumerate(ca["c2"].items()):
        phieu(k, "@k1_c2", ng, "GVHD" if ng.startswith("gv.") else "DVHD", v, "DA_NOP",
              f"2026-05-0{4 + ca['to']} {9 + j}:{10 + i:02d}:00", "Bảo vệ tốt, trả lời đúng trọng tâm câu hỏi của Tổ.")
    for ng, v in ca.get("vang", {}).items():
        phieu(k, "@k1_c2", ng, "GVHD", v, "DA_NOP", "2026-05-06 16:00:00", "Chấm trước buổi báo cáo theo hồ sơ.")

sec("TTTN-2025-HK2 — PHẢN HỒI 08a / 08b (UC12)")
for i, ca in enumerate(CA):
    k = ca["key"]
    m08a = [min(4, max(0, ca["kq"]["muc"][c] + (1 if i % 3 == 0 else 0))) for c in ("CLO1", "CLO2", "CLO5", "CLO4", "CLO4", "CLO6")]
    phieu_08a(k, ca["cb"], "2026-05-02 10:00:00", m08a)
    chi_so = r2(D(sum(abs(t - ca["kq"]["muc"][c]) for t, c in zip(ca["tu_muc"], CLO))) / D(7))
    hai_long = [5, 4, 4, 4, 5, 4] if i % 2 == 0 else [4, 4, 3, 4, 4, 3]
    ca["hp_self"] = phieu_08b(k, ca["sv"], "2026-05-03 20:00:00", hai_long, ca["tu_muc"], chi_so)

sec("TTTN-2025-HK2 — KẾT QUẢ HỌC PHẦN (UC10) — TÍNH SẴN, ĐÃ KIỂM BẰNG #84")
NHAN_XET_KQ = {"DAT": "Sinh viên hoàn thành đầy đủ nhiệm vụ thực tập, đáp ứng các chuẩn đầu ra của học phần.",
               "KHONG_DAT": "Sinh viên chưa đáp ứng đủ điều kiện công nhận hoàn thành theo Điều 15 khoản 3; cần đăng ký thực tập lại."}
for ca in CA:
    k, kq = ca["key"], ca["kq"]
    row = {f"diem_clo{i + 1}": kq["diem"][c] for i, c in enumerate(CLO)}
    row.update(ho_so_id=Raw(f"@hs_{k}"), diem_hp=kq["hp"], muc_dat=kq["muc_hp"], diem_thuong=D(ca["thuong"]),
               nhom_kien_thuc=kq["kt"], nhom_ky_nang=kq["kn"], nhom_thai_do=kq["td"], ket_luan=kq["ket_luan"],
               ly_do_khong_dat=kq["ly_do"], phien_ban_trong_so="TTTN-2025-HK2@goc",
               nhan_xet_gvhd=NHAN_XET_KQ[kq["ket_luan"]], trang_thai="DA_CONG_BO", ngay_tinh="2026-05-11 09:00:00")
    row = {"ho_so_id": row.pop("ho_so_id"), **row}
    note(f"{ca['sv']}: HP {kq['hp']} Mức {kq['muc_hp']} — {kq['ket_luan']}")
    ins("ket_qua_hoc_phan", row)
    anh = {"diemHp": float(kq["hp"]), "ketLuan": kq["ket_luan"]}
    nk_ht("2026-05-11 09:00:00", "@giaovu", "ADMIN", "TINH_DIEM", "ho_so_thuc_tap", f"@hs_{k}", None,
          jdump({**anh, "trangThai": "DA_TINH", "nguon": "GIAO_VU_TINH_LAI"}))
    nk_ht("2026-05-12 10:00:00", "@giaovu", "ADMIN", "XAC_NHAN_KET_QUA", "ho_so_thuc_tap", f"@hs_{k}",
          '{"trangThai":"DA_TINH"}', jdump({**anh, "trangThai": "DA_XAC_NHAN"}))
    nk_ht("2026-05-15 08:00:00", "@giaovu", "ADMIN", "CONG_BO_KET_QUA", "ho_so_thuc_tap", f"@hs_{k}",
          '{"trangThai":"DA_XAC_NHAN"}', jdump({**anh, "trangThai": "DA_CONG_BO"}))
    thong_bao(nd(ca["sv"]), "NT-14", "Kết quả học phần đợt Thực tập tốt nghiệp học kỳ 2 năm học 2025–2026 đã được công bố. "
              "Gửi phiếu phản hồi TTTN-08b để xem kết quả.", f"CONCAT('/results/', @hs_{k})", True, "2026-05-15 08:00:00")
nk_ht("2026-05-11 08:55:00", "@nd_gv_tung", "GIANG_VIEN", "DE_XUAT_DIEM_THUONG", "ho_so_thuc_tap", "@hs_s2",
      '{"diemThuong":0}', '{"diemThuong":0.3}')

# =====================================================================
# ĐỢT 2 — TTTN-2026-HK1 (đang thực hiện) — mỗi mốc demo một hồ sơ
# =====================================================================
sec("ĐỢT TTTN-2026-HK1 — ĐANG THỰC HIỆN (đã qua ngày kết thúc, hai chặng đang mở)")
BD2, KT2 = "2026-09-07", "2026-11-01"
tao_dot("k2", "TTTN-2026-HK1", "Thực tập tốt nghiệp học kỳ 1 năm học 2026–2027", "HK1", "2026-2027", BD2, KT2, 8,
        "2026-11-06", "DANG_THUC_HIEN", ("2026-09-28", None, "DANG_MO"), ("2026-11-02", None, "DANG_MO"))

DT2 = "Phát triển ứng dụng web quản lý hồ sơ khách hàng"
DEMO = [
    # key, sv, gvhd (None = chưa phân công), cán bộ, đơn vị, trạng thái, mô tả
    ("an", "sv.an", "gv.tung", "cb.son", "saomai", "CHO_DANH_GIA"),
    ("binh", "sv.binh", "gv.lan", "cb.quang", "hongha", "DANG_THUC_TAP"),
    ("cuong", "sv.cuong", "gv.minh", "cb.quang", "hongha", "DANG_THUC_TAP"),
    ("dung", "sv.dung", None, "cb.duc", "thanglong", "CHO_DVHD"),
    ("giang", "sv.giang", None, "cb.trang", "saomai", "CHO_GVHD"),
    ("mai", "sv.mai", None, "cb.trang", "saomai", "CHO_GVHD"),
    ("ha", "sv.ha", "gv.lan", "cb.trang", "saomai", "CHO_GVHD"),
    ("nga", "sv.nga", "gv.hoa", "cb.son", "saomai", "DANG_THUC_TAP"),
    ("phat", "sv.phat", "gv.hoa", "cb.son", "saomai", "DANG_THUC_TAP"),
    ("quan", "sv.quan", "gv.hoa", "cb.quang", "hongha", "DANG_THUC_TAP"),
    ("thu", "sv.thu", "gv.hoa", "cb.quang", "hongha", "DANG_THUC_TAP"),
]
MA_SV.update({"sv.an": "2251220001", "sv.binh": "2251220002", "sv.cuong": "2251220003"})
sec("TTTN-2026-HK1 — HỒ SƠ")
note("Bước 4: sv.dung chờ cán bộ cb.duc xác nhận · Bước 5: sv.giang + sv.mai chưa có GVHD, gv.hoa đã 4/5 ⇒ phân công")
note("cả hai cho gv.hoa bị hủy cả lô (CBR-04) · Bước 6: sv.ha đã phân công gv.lan, chờ duyệt.")
for i, (k, sv, gv, cb, dv, tt) in enumerate(DEMO):
    ho_so(k, sv, "k2", "DOANH_NGHIEP", dv, cb, DT2, 8, tt, f"2026-08-{17 + i % 6:02d} 10:{i:02d}:00")
    if gv:
        phan_cong(k, gv, "2026-08-31 09:00:00")
    if tt in ("DANG_THUC_TAP", "CHO_DANH_GIA"):
        ke_hoach(k, BD2, 8, "2026-09-10 21:00:00", "2026-09-11 09:00:00", "2026-09-11 16:00:00")
        if k == "an":
            tien_do(k, BD2, 8, cb, 8, 8)
        elif k == "cuong":
            note("sv.cuong: tuần 8 đã điền, cán bộ chưa xác nhận — demo bước 7 (#61–#63).")
            tien_do(k, BD2, 8, cb, 7, 8, pt_cuoi=90)
        else:
            tien_do(k, BD2, 8, cb, 6, 7, pt_cuoi=80)
        nhat_ky(k, [add_days(BD2, 7 * t + d) for t in range(8) for d in ((0, 2, 4) if k == "cuong" else (1,))])

note("sv.an: báo cáo TTTN-06 đủ hai xác nhận ⇒ Chờ đánh giá (Đ10 k2).")
bao_cao("an", MA_SV["sv.an"], "2026-11-03 21:00:00", "2026-11-04 09:30:00", "2026-11-05 14:00:00")

sec("TTTN-2026-HK1 — PHIẾU CHẶNG 1")
note("sv.an: ví dụ tính tay, hai bên đã nộp. sv.binh: cán bộ đã nộp, GV mới lưu nháp ⇒ GV gọi #71 phiếu cán bộ bị ACCESS_DENIED")
note("(BR-08.7) đến khi tự nộp. sv.nga đủ hai phiếu, sv.phat thiếu GV, sv.quan GV nháp, sv.thu chưa ai chấm (RP-03).")
P_AN1 = [("cb.son", "DVHD", vec(7.0, 6.5, 6.0, 8.0, 7.5, 7.0, n=6)), ("gv.tung", "GVHD", vec(8.0, 7.0, 7.0, 9.0, 8.0, 6.0, n=6))]
for ng, nhom, v in P_AN1:
    phieu("an", "@k2_c1", ng, nhom, v, "DA_NOP", "2026-10-01 15:00:00", NX_CB if nhom == "DVHD" else NX_GV)
phieu("binh", "@k2_c1", "cb.quang", "DVHD", vec(7.5, 7.0, 7.0, 8.0, 7.5, 7.0, n=6), "DA_NOP", "2026-10-02 10:00:00", NX_CB)
phieu("binh", "@k2_c1", "gv.lan", "GVHD", vec(8.0, 7.5, 7.0, 8.0, 7.5, 7.5, n=6), "NHAP", None, NX_GV)
phieu("nga", "@k2_c1", "cb.son", "DVHD", vec(7.0, 7.0, 6.5, 8.0, 7.0, 7.0, n=6), "DA_NOP", "2026-10-02 11:00:00", NX_CB)
phieu("nga", "@k2_c1", "gv.hoa", "GVHD", vec(7.5, 7.0, 7.0, 8.0, 7.5, 7.0, n=6), "DA_NOP", "2026-10-03 09:00:00", NX_GV)
phieu("phat", "@k2_c1", "cb.son", "DVHD", vec(6.5, 6.0, 6.0, 7.5, 7.0, 6.5, n=6), "DA_NOP", "2026-10-02 11:30:00", NX_CB)
phieu("quan", "@k2_c1", "gv.hoa", "GVHD", vec(7.0, 6.5, 6.5, 7.5, 7.0, 6.5, n=6), "NHAP", None, NX_GV)

sec("TTTN-2026-HK1 — TỔ ĐÁNH GIÁ CỦA sv.an VÀ PHIẾU CHẶNG 2")
note("Bước 10–11: hai GV đã nộp; cb.son nộp live (ô CLO7 bị khóa) CLO1–6 = 8, 7, 7, 9, 8, 8 ⇒ hệ thống tự tính HP 7,7.")
note("sv.an CHƯA gửi 08b: tính lần đầu ra Không đạt (d) thiếu 08b; SV gửi 08b ⇒ TTTN-07 cảnh báo dữ liệu đổi ⇒ giáo vụ")
note("Tính lại ⇒ Đạt (docs/01 mục 10.14). Muốn đi thẳng tới Đạt thì cho SV gửi 08b trước khi cán bộ nộp phiếu.")
ins("to_danh_gia", dict(dot_id=Raw("@dot_k2"), ngay_thanh_lap="2026-11-05", thoi_gian_bao_cao="2026-11-12 08:00:00",
                        dia_diem="Phòng 304 nhà A1", hinh_thuc="TRUC_TIEP"), var="to_an")
ins_many("thanh_vien_to_danh_gia", ["to_danh_gia_id", "nguoi_dung_id", "nhom_nguoi_cham", "la_chu_tich", "vang_mat"],
         [(Raw("@to_an"), nd("gv.tung"), "GVHD", True, False), (Raw("@to_an"), nd("gv.lan"), "GVHD", False, False),
          (Raw("@to_an"), nd("cb.son"), "DVHD", False, False)])
ins_many("to_danh_gia_ho_so", ["to_danh_gia_id", "ho_so_id"], [(Raw("@to_an"), Raw("@hs_an"))])
phieu("an", "@k2_c2", "gv.tung", "GVHD", vec(8, 7, 8, 9, 8, 7, 8), "DA_NOP", "2026-11-12 10:00:00",
      "Báo cáo đầy đủ, sản phẩm chạy ổn định; cần bổ sung phần đánh giá rủi ro.")
phieu("an", "@k2_c2", "gv.lan", "GVHD", vec(9, 8, 7, 9, 7, 8, 7), "DA_NOP", "2026-11-12 10:20:00",
      "Trình bày tự tin, trả lời tốt câu hỏi về thiết kế cơ sở dữ liệu.")
phieu_08a("an", "cb.son", "2026-11-06 09:00:00", [3, 3, 3, 4, 4, 3])

sec("TTTN-2026-HK1 — THÔNG BÁO CHỜ XỬ LÝ")
thong_bao(nd("cb.duc"), "NT-01", "Sinh viên Phạm Thị Dung gửi đăng ký thực tập, chờ bạn xác nhận tiếp nhận",
          "CONCAT('/records/', @hs_dung)", False, "2026-08-20 10:03:00")
for k, sv in (("giang", "Hoàng Văn Giang"), ("mai", "Lương Thị Mai"), ("ha", "Vũ Thu Hà")):
    thong_bao("@giaovu", "NT-03", f"Hồ sơ của {sv} đã được ĐVHD xác nhận, cần phân công GVHD", "'/assignments'", k != "mai",
              "2026-08-25 09:00:00")

with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(out) + "\n")

print("---")
for ca in CA:
    print(ca["sv"], "hp_self", ca["hp_self"])
print("Đã ghi", OUT, len(out), "dòng")
