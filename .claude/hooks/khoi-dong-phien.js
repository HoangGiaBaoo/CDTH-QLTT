#!/usr/bin/env node
/*
 * Hook SessionStart — chay khi mo phien Claude Code moi (startup / clear).
 * Nap lai boi canh de an + tien do hien tai, de khong phai nhac tay moi lan.
 */

const fs = require('fs');
const path = require('path');

const thuMucDuAn = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cacPhan = [];

cacPhan.push(
  'BOI CANH: He thong Quan ly Thuc tap tot nghiep (QLTT) — Truong DH Xay dung Ha Noi, theo Quy dinh QD 207/QD-DHXDHN. ' +
  'Nhom 29, hoc phan Chuyen de Tong hop, GVHD Pham Huu Tung. Hai nguoi: A = Hoang Gia Bao (nen tang, UC01, UC03, UC08-UC10, UC13), ' +
  'B = Tran Duc Van (UC02, UC04-UC07, UC11, UC12, khung frontend). Spring Boot 4.1.1 + Java 21 + MySQL 8 + Flyway, REST + JWT; frontend React/TS/Vite o frontend/.'
);

cacPhan.push(
  'LUAT VANG: ' +
  '(1) diem/trong so/ty le dung BigDecimal, lam tron 0,1 HALF_UP chi o buoc cuoi; ' +
  '(2) khong viet cung 0,3/0,7, alpha, ty le dong cham, khoang rubric, han muc — doc tu DB cua dot; ' +
  '(3) CLO7 chi o chang 2 => chuan hoa trong so chang; trung binh trong tung nhom nguoi cham truoc khi ap ty le; ' +
  '(4) phan quyen 2 lop: @PreAuthorize vai tro + kiem so huu du lieu o service; hai ben dong cham khong thay diem nhau truoc khi cung nop; ' +
  '(5) thao tac nhieu bang trong @Transactional; xoa mem du lieu da phat sinh diem; ghi nhat_ky_he_thong moi thay doi anh huong diem; ' +
  '(6) ten bang/entity/enum tieng Viet khong dau dung thiet ke, URL dung docs/02-api.md, comment tieng Viet, commit tieng Anh; ' +
  '(7) chi sua file thuoc phan minh (docs/04-ke-hoach.md muc 2); khong cat UC08, UC09, UC10.'
);

cacPhan.push(
  'TAI LIEU: docs/01-nghiep-vu.md (CBR, ma loi, trang thai, cau hinh CLO, diem can xac nhan) · docs/02-api.md (102 endpoint) · ' +
  'docs/03-csdl.md (28 bang) · docs/04-ke-hoach.md (phan cong + lich 6 tuan 09/11-20/12/2026). ' +
  'Lenh: /ke-hoach /soat-code /soat-nghiep-vu /soat-tinh-diem /kiem-tra /tien-do /giai-thich /van-dap /hoc.'
);

const duongDanTienDo = path.join(thuMucDuAn, 'docs', 'TIEN-DO.md');
if (fs.existsSync(duongDanTienDo)) {
  try {
    // TIEN-DO.md phai giu ngan; neu bi cat mat muc "Viec tiep theo" thi don file, dung tang so nay.
    const GIOI_HAN_KY_TU = 4000;
    const noiDung = fs.readFileSync(duongDanTienDo, 'utf8');
    const rutGon = noiDung.length > GIOI_HAN_KY_TU
      ? noiDung.slice(0, GIOI_HAN_KY_TU) + '\n...(cat bot, doc them o docs/TIEN-DO.md)'
      : noiDung;
    cacPhan.push('TIEN DO HIEN TAI (docs/TIEN-DO.md):\n' + rutGon);
  } catch (loi) {
    // khong doc duoc thi bo qua, khong lam gian doan phien
  }
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: cacPhan.join('\n\n')
  }
}));
process.exit(0);
