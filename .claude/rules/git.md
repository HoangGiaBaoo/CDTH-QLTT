# Quy tắc Git — luôn áp dụng (nhóm 2 người)

Lịch sử commit là minh chứng **mỗi người tự làm phần của mình** — hội đồng và GVHD có thể mở GitHub xem.

## Nhánh

- `main`: luôn biên dịch được, luôn chạy được. **Không commit thẳng** (trừ commit khởi tạo đầu tiên).
- Mỗi việc một nhánh từ `main` mới nhất: `feat/<uc>-<mo-ta-ngan>`, `fix/<mo-ta-ngan>`, `docs/<...>`.
  Ví dụ `feat/uc08-nop-phieu`, `feat/uc04-gui-dang-ky`, `fix/khoa-tai-khoan`.
- Nhánh sống **tối đa 2–3 ngày**. Việc lớn thì chia nhiều PR nhỏ.
- Trước khi mở PR: `git pull --rebase origin main`, chạy `.\mvnw.cmd compile` (đụng `service/scoring/` thì chạy cả `test`).

## Pull request

- Người kia review, **không tự merge PR của mình**. Review trong 24 giờ.
- Người review chạy `/soat-code` (và `/soat-nghiep-vu` với PR nghiệp vụ) trước khi duyệt.
- Mô tả PR: UC + endpoint đã làm, cách thử (vai trò nào, gọi gì), ảnh màn hình nếu có giao diện, còn nợ gì.
- Merge kiểu **squash** để `main` mỗi PR một commit sạch.

## Commit — Conventional Commits, tiếng Anh

```
<type>(<scope>): <subject> (<ma>)
```

Subject: tiếng Anh, mệnh lệnh (`add`, `fix`, `block`), chữ thường, không chấm cuối, ≤ 72 ký tự.
Mã UC / CBR / số endpoint trong ngoặc cuối để `git log --oneline` đối chiếu thẳng với tài liệu.

| Type | Khi nào |
|---|---|
| `feat` | Chức năng mới | 
| `fix` | Sửa lỗi |
| `refactor` | Đổi cấu trúc, hành vi không đổi |
| `test` | Thêm / sửa test |
| `docs` | Chỉ `docs/` hoặc comment |
| `build` | `pom.xml`, `application*.yml`, `docker-compose.yml`, `package.json` |
| `chore` | `.gitignore`, `.claude/`, dọn dẹp |

Scope (trùng module): `auth` `user` `host-org` `term` `record` `assignment` `study-plan` `logbook`
`progress` `evidence` `assessment` `panel` `scoring` `result` `report` `feedback` `stats` `audit`
`notification` `db` `ui`.

```
feat(auth): lock account for 15 minutes after 5 failed logins (#1)
feat(term): clone 7 CLOs, 35 rubric levels and 13 questions into new term (UC03)
feat(assignment): roll back whole batch when lecturer quota is exceeded (UC05, CBR-04)
feat(assessment): hide the other grader's scores until both have submitted (UC08)
fix(scoring): normalize stage weights for CLOs assessed in one stage only (CBR-18)
test(scoring): cover absent panel member emptying the host group
build(db): add V5 migration for evidence type codes
```

Thân commit chỉ viết khi **lý do không nhìn ra từ diff** — trả lời "vì sao", bằng tiếng Anh.

commit không thêm co-author claude gì cả, không để phần commit liên quan tới chữ claude

## Không commit

`target/`, `frontend/node_modules/`, `frontend/dist/`, `uploads/`, `.env`, mật khẩu MySQL / JWT secret thật,
file Office tạm `~$*.docx`. Tài liệu gốc (`.docx`, `.pdf`, `.xlsx`) nên chuyển vào `docs/tai-lieu-goc/` rồi commit một lần.

## Claude và git

Claude **chỉ commit / push khi được yêu cầu**. Push luôn hỏi lại.

## Tag mốc

Cuối mỗi tuần đạt mốc thì tag trên `main` (`t1-nen-tang` … `t6-ban-demo`, xem `docs/04-ke-hoach.md`).
Bản demo tag xong **không đụng vào nữa**.
