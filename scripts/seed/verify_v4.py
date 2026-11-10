"""Kiểm chứng V4 trên một CSDL THỬ (không chạy trên CSDL dev — script đổi trạng thái kết quả và chấm phiếu live).

1. docker exec qltt-mysql mysql -uroot -proot -e "CREATE DATABASE qltt_seedtest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
2. ./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081
       --spring.datasource.url=jdbc:mysql://localhost:3306/qltt_seedtest --spring.datasource.username=root
       --spring.datasource.password=root"
3. python -I scripts/seed/verify_v4.py [base_url] [ten_csdl]      (mặc định http://localhost:8081 qltt_seedtest)
4. Dừng app, DROP DATABASE qltt_seedtest. Muốn chạy lại thì tạo lại CSDL sạch.

Kiểm: RP-01…RP-06, TTTN-07, 08a/08b, tự nhận thức; đưa 10 kết quả đợt TTTN-2025-HK2 về DA_TINH rồi gọi #84 và so
từng cột với seed; các bước demo 4, 5, 6, 8, 10 của đợt TTTN-2026-HK1.
"""
import json, subprocess, sys, urllib.request, urllib.error

sys.stdout.reconfigure(encoding="utf-8")
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8081"
DB = sys.argv[2] if len(sys.argv) > 2 else "qltt_seedtest"
if DB == "qltt":
    raise SystemExit("Không chạy kiểm chứng trên CSDL dev 'qltt'")


def sql(q):
    r = subprocess.run(["docker", "exec", "qltt-mysql", "mysql", "-uroot", "-proot", "--default-character-set=utf8mb4",
                        "-N", "-B", DB, "-e", q], capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(r.stderr)
    return [l.split("\t") for l in r.stdout.strip().splitlines() if l]


def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw[:1] in (b"{", b"[") else raw)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def login(u):
    s, b = call("POST", "/api/auth/login", body={"tenDangNhap": u, "matKhau": "Qltt@2026"})
    assert s == 200, (u, s, b)
    return b["data"]["token"]


ok = True


def check(cond, msg):
    global ok
    print(("OK   " if cond else "FAIL ") + msg)
    ok &= bool(cond)


COLS = "diem_clo1,diem_clo2,diem_clo3,diem_clo4,diem_clo5,diem_clo6,diem_clo7,diem_hp,muc_dat,diem_thuong,nhom_kien_thuc,nhom_ky_nang,nhom_thai_do,ket_luan,IFNULL(ly_do_khong_dat,'')"
admin = login("giaovu")
dot1 = sql("select id from dot_thuc_tap where ma_dot='TTTN-2025-HK2'")[0][0]

# ---- 1. Thống kê và màn đọc trên dữ liệu đã công bố (trước khi động vào trạng thái)
for loai in ["RP-01", "RP-02", "RP-03", "RP-04", "RP-05", "RP-06"]:
    s, b = call("GET", f"/api/statistics/{loai}?termId={dot1}", admin)
    check(s == 200, f"{loai} {s} {str(b)[:300] if s != 200 else ''}")
    if s == 200:
        print("     ", json.dumps(b["data"], ensure_ascii=False)[:600])

hs = sql(f"select h.id, n.ten_dang_nhap from ho_so_thuc_tap h join sinh_vien s on s.id=h.sinh_vien_id "
         f"join nguoi_dung n on n.id=s.nguoi_dung_id where h.dot_id={dot1} order by h.id")
for hid, tdn in hs:
    s, b = call("GET", f"/api/results/{hid}", admin)
    check(s == 200 and all("CBR-23" in c for c in b["data"].get("canhBao")), f"TTTN-07 {tdn}: {s} canhBao={b.get('data', {}).get('canhBao')}")
    tk = login(tdn)
    s, b = call("GET", f"/api/results/{hid}", tk)
    check(s == 200, f"SV {tdn} xem kết quả: {s}")
    s, b = call("GET", f"/api/internship_records/{hid}/feedbacks", tk)
    check(s == 200 and len(b["data"]) == 2, f"SV {tdn} đọc 08a+08b: {s} {str(b)[:200] if s != 200 else len(b['data'])}")
    if s == 200:
        p08b = [p for p in b["data"] if p["loai"] == "TTTN_08B"][0]
        s2, b2 = call("GET", f"/api/feedbacks/{p08b['id']}/self_awareness", tk)
        check(s2 == 200 and str(b2["data"]["chiSo"]) != "None", f"   tự nhận thức {tdn}: {s2} {b2.get('data', {}).get('chiSo')} hpSelf={b2.get('data', {}).get('hpSelf')}")

# ---- 2. Tính lại bằng Java (#84) và so với giá trị seed
truoc = {r[0]: r[1:] for r in sql(f"select k.ho_so_id,{COLS} from ket_qua_hoc_phan k join ho_so_thuc_tap h on h.id=k.ho_so_id where h.dot_id={dot1}")}
sql(f"update ket_qua_hoc_phan k join ho_so_thuc_tap h on h.id=k.ho_so_id set k.trang_thai='DA_TINH', h.trang_thai='CHO_DANH_GIA' where h.dot_id={dot1}")
for hid, tdn in hs:
    s, b = call("POST", f"/api/results/{hid}/calculate", admin)
    check(s == 200, f"#84 {tdn}: {s} {'' if s == 200 else b}")
sau = {r[0]: r[1:] for r in sql(f"select k.ho_so_id,{COLS} from ket_qua_hoc_phan k join ho_so_thuc_tap h on h.id=k.ho_so_id where h.dot_id={dot1}")}
for hid, tdn in hs:
    check(truoc[hid] == sau[hid], f"khớp seed {tdn}: HP {sau[hid][7]} {sau[hid][13]}" + ("" if truoc[hid] == sau[hid] else f"\n  seed={truoc[hid]}\n  java={sau[hid]}"))

# ---- 3. Đợt đang chạy: các mốc demo
dot2 = sql("select id from dot_thuc_tap where ma_dot='TTTN-2026-HK1'")[0][0]
hs2 = dict((t, i) for i, t in sql(f"select h.id, n.ten_dang_nhap from ho_so_thuc_tap h join sinh_vien s on s.id=h.sinh_vien_id join nguoi_dung n on n.id=s.nguoi_dung_id where h.dot_id={dot2}"))

# Bước 8: GV lan chưa nộp ⇒ không xem được phiếu cán bộ của sv.binh
lan = login("gv.lan")
pid = sql(f"select p.id from phieu_danh_gia p join nguoi_dung n on n.id=p.nguoi_cham_id where p.ho_so_id={hs2['sv.binh']} and n.ten_dang_nhap='cb.quang'")[0][0]
s, b = call("GET", f"/api/assessments/{pid}", lan)
check(s == 403, f"Bước 8: gv.lan xem phiếu cb.quang khi chưa nộp ⇒ {s} {b.get('message')}")
pid_lan = sql(f"select p.id from phieu_danh_gia p join nguoi_dung n on n.id=p.nguoi_cham_id where p.ho_so_id={hs2['sv.binh']} and n.ten_dang_nhap='gv.lan'")[0][0]
s, b = call("PUT", f"/api/assessments/{pid_lan}/submit", lan)
check(s == 200, f"Bước 8: gv.lan nộp phiếu nháp ⇒ {s} {'' if s == 200 else b.get('message')}")
s, b = call("GET", f"/api/assessments/{pid}", lan)
check(s == 200, f"Bước 8: sau khi nộp gv.lan xem được phiếu cán bộ ⇒ {s}")

# Bước 5: phân công 2 SV cho gv.hoa (4/5) ⇒ QUOTA_EXCEEDED
gv_hoa = sql("select g.id from giang_vien g join nguoi_dung n on n.id=g.nguoi_dung_id where n.ten_dang_nhap='gv.hoa'")[0][0]
s, b = call("POST", "/api/assignments", admin, {"giangVienId": int(gv_hoa), "hoSoIds": [int(hs2["sv.giang"]), int(hs2["sv.mai"])]})
check(s in (400, 409, 422) and b.get("code") == "QUOTA_EXCEEDED", f"Bước 5: vượt hạn mức gv.hoa ⇒ {s} {b.get('code')} {b.get('message')}")

# Bước 6: gv.lan duyệt sv.ha ⇒ có khung kế hoạch
s, b = call("PUT", f"/api/internship_records/{hs2['sv.ha']}/lecturer_approval", lan, {"dongY": True})
check(s == 200, f"Bước 6: gv.lan duyệt sv.ha ⇒ {s} {'' if s == 200 else b}")
print("     khung:", sql(f"select (select count(*) from muc_ke_hoach m join ke_hoach_hoc_tap k on k.id=m.ke_hoach_id where k.ho_so_id={hs2['sv.ha']}), (select count(*) from tien_do_tuan where ho_so_id={hs2['sv.ha']})"))

# Bước 4: cb.duc xác nhận sv.dung
duc = login("cb.duc")
s, b = call("PUT", f"/api/internship_records/{hs2['sv.dung']}/host_confirmation", duc, {"dongY": True})
check(s == 200, f"Bước 4: cb.duc xác nhận sv.dung ⇒ {s} {'' if s == 200 else b}")

# Bước 7: sv.cuong bảng đối chiếu minh chứng
cuong = login("sv.cuong")
s, b = call("GET", f"/api/internship_records/{hs2['sv.cuong']}/evidences/checklist", cuong)
print("     bước 7 đối chiếu:", s, json.dumps(b.get("data", b), ensure_ascii=False)[:400])

# Bước 10–11: cb.son nộp chặng 2 sv.an ⇒ tự tính HP 7,7
son = login("cb.son")
s, b = call("GET", f"/api/assessments/form?recordId={hs2['sv.an']}&stage=2", son)
if s != 200:
    s, b = call("GET", f"/api/assessments/form?hoSoId={hs2['sv.an']}&chang=2", son)
check(s == 200 and "CLO7" not in [q["maClo"] for q in b["data"]["cauHois"]], f"Bước 10: biểu mẫu cán bộ không có CLO7 ⇒ {s}")
diem = dict(CLO1=8, CLO2=7, CLO3=7, CLO4=9, CLO5=8, CLO6=8)
mucd = lambda x: 0 if x < 4 else 1 if x < 5.5 else 2 if x < 7 else 3 if x < 8.5 else 4
s, b = call("POST", "/api/assessments", son, {"hoSoId": int(hs2["sv.an"]), "chang": 2, "nhanXetChung": "Hoàn thành tốt nhiệm vụ.",
                                             "diemClos": [{"maClo": c, "mucDat": mucd(v), "diem": v} for c, v in diem.items()]})
check(s in (200, 201), f"Bước 10: cb.son tạo phiếu ⇒ {s} {'' if s in (200, 201) else b}")
s, b = call("PUT", f"/api/assessments/{b['data']['id']}/submit", son)
check(s == 200, f"Bước 10: cb.son nộp ⇒ {s} {'' if s == 200 else b}")
print("     ket_qua sv.an:", sql(f"select {COLS}, trang_thai from ket_qua_hoc_phan where ho_so_id={hs2['sv.an']}"))

print("\nTỔNG:", "ĐẠT" if ok else "CÓ LỖI")
sys.exit(0 if ok else 1)
