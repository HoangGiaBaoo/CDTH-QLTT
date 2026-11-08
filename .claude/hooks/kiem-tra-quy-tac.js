#!/usr/bin/env node
/*
 * PostToolUse hook — chay sau moi lan Write/Edit.
 *
 * Pham vi: chi bat nhung thu lam SAI KET QUA hoac pha rang buoc cung cua QLTT
 * (diem sai do double, cau hinh cham diem viet cung, lo mat khau, SQL noi chuoi...).
 * KHONG soi phong cach: Lombok, Stream, do dai ham, format khong phai viec cua hook nay.
 *
 * Moi quy tac phai du chinh xac de bao la gan nhu chac chan co van de.
 * Hook hay bao nham se bi lo di, va luc do no khong bat duoc gi nua.
 *
 * Exit code:
 *   0 = khong co gi
 *   2 = co phat hien, in ra stderr de Claude doc va tu sua
 */

const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch (err) {
    process.exit(0);
  }

  const rawPath = (payload.tool_input && payload.tool_input.file_path) || '';
  if (!rawPath || !fs.existsSync(rawPath)) process.exit(0);

  let content;
  try {
    content = fs.readFileSync(rawPath, 'utf8');
  } catch (err) {
    process.exit(0);
  }

  const path = rawPath.split('\\').join('/');
  const violations = [];
  const warnings = [];

  if (path.endsWith('.java')) {
    checkJava(path, content, violations, warnings);
  } else if (/application[^/]*\.(properties|ya?ml)$/.test(path)) {
    checkAppConfig(content, warnings);
  } else if (/\/db\/migration\/V\d+__.*\.sql$/.test(path)) {
    checkMigration(content, warnings);
  } else if (/\/frontend\/src\/.*\.(tsx?|jsx?)$/.test(path)) {
    checkFrontend(path, content, warnings);
  }

  if (violations.length === 0 && warnings.length === 0) process.exit(0);

  const out = ['[Quy tac QLTT] ' + path];
  violations.forEach((v) => out.push('  VI PHAM: ' + v));
  warnings.forEach((w) => out.push('  KIEM LAI: ' + w));
  out.push('  (Xem .claude/rules/quy-tac-code.md, .claude/rules/bao-mat.md, skill tinh-diem-clo)');
  console.error(out.join('\n'));
  process.exit(2);
});

/* ------------------------------------------------------------------ */

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

/** Bo ca comment lan chuoi, de quy tac khong ban trung chu trong comment / thong diep loi. */
function stripCommentsAndStrings(src) {
  return stripComments(src)
    .replace(/"""[\s\S]*?"""/g, '""')
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
}

function checkJava(path, content, violations, warnings) {
  const isTest = path.includes('/src/test/');
  const isScoring = path.includes('/service/scoring/');
  const isEntity = path.includes('/entity/');
  const noComment = stripComments(content);
  const code = stripCommentsAndStrings(content);

  // 1. Diem / trong so / ty le phai la BigDecimal (CSDL la DECIMAL, lam tron 0,1 theo Đ14 k4a).
  if (isScoring && !isTest) {
    const line = lineOf(code, /(^|[^.\w])(double|float|Double|Float)\b/);
    if (line > 0) {
      violations.push('dong ' + line + ': service/scoring dung double/float. Diem, trong so, ty le phai la BigDecimal.');
    }
  }
  if (isEntity || isScoring || /Dto|Request|Response|dto\//.test(path)) {
    const m = code.match(/\b(double|float|Double|Float)\s+(diem|trongSo|tyLe|hp|chiSo|nhom)\w*/);
    if (m) {
      violations.push('"' + m[0] + '" — truong diem/trong so/ty le phai la BigDecimal, khong dung double/float.');
    }
  }

  // 2. BigDecimal dung sai cach — nguyen nhan kinh dien lam lech 0,1 diem.
  const bdDouble = lineOf(code, /new\s+BigDecimal\(\s*-?\d+\.\d+\s*\)/);
  if (bdDouble > 0) {
    violations.push('dong ' + bdDouble + ': new BigDecimal(<so thuc>) mang sai so nhi phan. Dung new BigDecimal("0.3") hoac doc tu DB.');
  }
  const scaleNoMode = lineOf(code, /\.setScale\(\s*\d+\s*\)/);
  if (scaleNoMode > 0) {
    violations.push('dong ' + scaleNoMode + ': setScale khong kem RoundingMode. Dung setScale(1, RoundingMode.HALF_UP).');
  }
  if (/BigDecimal/.test(code)) {
    // divide(x) mot doi so: nem ArithmeticException khi chia ra so vo han (vd chia 3 nguoi cham).
    const divLine = lineOf(code, /\.divide\(\s*[\w.()]+\s*\)/);
    if (divLine > 0) {
      warnings.push('dong ' + divLine + ': BigDecimal.divide mot doi so se nem ArithmeticException khi ket qua vo han. Them MathContext.DECIMAL64 hoac (scale, RoundingMode).');
    }
  }

  // 3. Khong viet cung cau hinh cham diem trong code nghiep vu (Đ26: Quy dinh cap nhat 2 nam/lan).
  if (isScoring && !isTest) {
    const hard = noComment.match(/BigDecimal(?:\.valueOf)?\(\s*"?(0\.3|0\.7|0\.30|0\.70|0\.300|0\.700)"?\s*\)/);
    if (hard) {
      warnings.push('"' + hard[0] + '" trong service/scoring — trong so chang phai doc tu chang_danh_gia.trong_so_w, khong viet cung.');
    }
  }

  // 4. Mat khau phai bam BCrypt truoc khi luu.
  const pwLines = content.split('\n');
  for (let i = 0; i < pwLines.length; i++) {
    const l = pwLines[i];
    if (/(setMatKhauHash|\.matKhauHash)\s*\(/.test(l) && !/encode|Hash\(\s*\)|getMatKhauHash/.test(l)) {
      warnings.push('dong ' + (i + 1) + ': gan matKhauHash ma khong thay passwordEncoder.encode(...) tren cung dong — dam bao mat khau da bam BCrypt.');
      break;
    }
  }

  // 5. SQL / JPQL noi chuoi -> SQL injection.
  const concatLine = lineOf(noComment, /(createQuery|createNativeQuery|@Query\s*\()\s*\(?\s*"[^"]*"\s*\+/);
  if (concatLine > 0) {
    violations.push('dong ' + concatLine + ': JPQL/SQL noi chuoi. Dung tham so :ten hoac method query.');
  }

  // 6. Xoa vat ly du lieu da phat sinh diem (CBR-22). Chi canh bao cac bang chac chan phai xoa mem.
  if (!isTest) {
    const del = code.match(/\b(nguoiDung|donVi\w*|hoSo\w*|phieu\w*|ketQua\w*|diemClo\w*|minhChung\w*|baoCao\w*)Repo\w*\.(delete|deleteById|deleteAll)\s*\(/);
    if (del) {
      warnings.push('"' + del[0] + '" — du lieu da phat sinh danh gia chi duoc xoa mem (CBR-22). Neu chac chan duoc xoa (vd minh chung chua chot diem) thi bo qua.');
    }
  }

  // 7. Controller phai kiem vai tro tung endpoint (tru dang nhap).
  if (path.includes('/controller/') && !isTest && /@RestController/.test(code)) {
    const hasMapping = /@(Get|Post|Put|Delete|Patch)Mapping/.test(code);
    const isAuth = /XacThuc|Auth/.test(path);
    if (hasMapping && !isAuth && !/@PreAuthorize/.test(code)) {
      warnings.push('controller khong co @PreAuthorize nao. Moi endpoint can kiem vai tro theo cot Quyen trong docs/02-api.md.');
    }
  }

  // 8. Boot 4 dung Jackson 3; ObjectMapper Jackson 2 khong con duoc Boot tu cau hinh.
  if (!isTest && /import\s+com\.fasterxml\.jackson\.databind\./.test(code)) {
    warnings.push('import com.fasterxml.jackson.databind.* (Jackson 2). Spring Boot 4 dung Jackson 3: tools.jackson.databind.*. Annotation com.fasterxml.jackson.annotation.* van dung binh thuong.');
  }

  // 9. System.out trong code ung dung.
  if (!isTest && !/static\s+void\s+main\s*\(/.test(code) && /System\.out\.print/.test(code)) {
    warnings.push('System.out.print trong code ung dung. Dung Lombok @Slf4j.');
  }
}

function checkAppConfig(content, warnings) {
  if (/ddl-auto\s*[:=]\s*(update|create|create-drop)\b/.test(content)) {
    warnings.push('ddl-auto la update/create — schema do Flyway quan ly, dung "validate".');
  }
  if (/jdbc:mysql:/.test(content) && !/(connectionTimeZone|serverTimezone)=/.test(content)) {
    warnings.push('URL MySQL thieu connectionTimeZone=Asia/Ho_Chi_Minh — han nop, ngay mo chang se lech gio.');
  }
  // Mat khau / secret that khong nen commit. Cho phep ${BIEN:mac_dinh_dev}.
  const secret = content.match(/^\s*(password|secret)\s*[:=]\s*(?!\$\{)(\S{1,})\s*$/im);
  if (secret && !/^(qltt|root|123456|password|secret|changeme)$/i.test(secret[2])) {
    warnings.push('"' + secret[1] + '" dang ghi gia tri truc tiep. Dung ${BIEN_MOI_TRUONG:gia_tri_dev} va khong commit gia tri that.');
  }
}

function checkMigration(content, warnings) {
  if (/CREATE\s+TABLE/i.test(content) && !/utf8mb4/i.test(content)) {
    warnings.push('migration tao bang nhung khong khai bao utf8mb4 — tieng Viet co the thanh "???".');
  }
  if (/\bFLOAT\b|\bDOUBLE\b/i.test(content)) {
    warnings.push('migration dung FLOAT/DOUBLE. Diem, trong so, ty le phai la DECIMAL nhu docs/03-csdl.md.');
  }
  if (/INSERT\s+INTO\s+`?nguoi_dung`?/i.test(content) && !/\$2[aby]\$\d\d\$/.test(content)) {
    warnings.push('seed nguoi_dung khong thay chuoi BCrypt ($2a$10$...). Khong luu mat khau van ban thuan.');
  }
}

function checkFrontend(path, content, warnings) {
  if (path.includes('/src/api/client')) return;
  const code = stripComments(content);
  if (/axios\.(get|post|put|delete|patch)\s*\(\s*[`'"]https?:/.test(code) || /fetch\(\s*[`'"]https?:\/\/localhost/.test(code)) {
    warnings.push('goi API bang URL tuyet doi. Di qua src/api/client.ts de gan token va xu ly loi chung.');
  }
}

/* ------------------------------------------------------------------ */

function lineOf(code, pattern) {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return 0;
}
