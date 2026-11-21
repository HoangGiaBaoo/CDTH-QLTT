# Triển khai và CI/CD

Ứng dụng chạy thật tại **http://221.121.0.89** (VPS WiServices, Ubuntu 24.04, 1 vCPU / 2 GB / 20 GB, hết hạn
14/12/2026). Mọi lần push lên `main` (trừ commit chỉ đổi tài liệu) tự kiểm thử rồi tự triển khai.

## Luồng CI/CD — `.github/workflows/ci-cd.yml`

```
push main ─┬─ backend-test    ./mvnw test trên MySQL 8 thật (CdthQlttApplicationTests nạp Flyway V1–V5)
           └─ frontend-build  npm ci + tsc + vite build
                    │ cả hai xanh
                    ▼
              images          build 2 image, đẩy lên GHCR, gắn tag latest + mã commit
                    │
                    ▼
              deploy          SSH vào VPS (user deploy) → chép docker-compose + deploy.sh
                              → docker compose pull && up -d → chờ /api/auth/me trả 401 (đã sẵn sàng)
```

Pull request chỉ chạy hai job đầu (CI), không triển khai. Test đỏ ⇒ không build, không triển khai, VPS giữ bản cũ.
Không build trên VPS: Maven + npm cần hơn 1 GB RAM, VPS chỉ kéo image về chạy.

## Trên VPS — `~/qltt` của user `deploy`

| Container | Image | Ghi chú |
|---|---|---|
| `frontend` | `ghcr.io/hoanggiabaoo/cdth-qltt-frontend` | Nginx cổng 80: trả bản build React, chuyển `/api/` sang backend (cùng địa chỉ ⇒ không CORS), giới hạn tải lên 21 MB và trả `FILE_TOO_LARGE` dạng JSON |
| `backend` | `ghcr.io/hoanggiabaoo/cdth-qltt-backend` | Profile `prod` (tắt Swagger), `-Xmx448m`, tệp tải lên ở volume `uploads` |
| `mysql` | `mysql:8.0` | Buffer pool 128 MB, **không mở cổng 3306 ra ngoài**, dữ liệu ở volume `mysql-data` |

Tổng RAM khoảng 0,7 GB, cộng thêm 2 GB swap.

| File | Nguồn |
|---|---|
| `docker-compose.yml`, `deploy.sh` | CI chép từ `deploy/` mỗi lần triển khai — sửa trong repo, không sửa trên VPS |
| `.env` | Mật khẩu MySQL, `JWT_SECRET` — sinh ngẫu nhiên ngay trên VPS, **không có trong repo hay GitHub** |
| `.ban-dang-chay` | Mã commit đang chạy và thời điểm triển khai |

Bí mật trên GitHub chỉ có `VPS_SSH_KEY`, khóa riêng của user `deploy`. Token kéo image là `GITHUB_TOKEN` của
lần chạy, đi qua stdin và hết hạn khi job xong. Khóa host của VPS ghi sẵn trong `deploy/known_hosts`.

Bảo mật VPS: chỉ đăng nhập bằng SSH key, `root` và mật khẩu bị chặn; UFW chỉ mở 22, 80 (8080 là bài tập môn khác);
tường lửa của WiServices (tab Networking) phải mở cổng 80.

## Thao tác thường gặp

```bash
ssh deploy@221.121.0.89          # từ máy đã có khóa
cd ~/qltt
docker compose ps                # trạng thái
docker compose logs -f backend   # xem log
cat .ban-dang-chay               # đang chạy commit nào
IMAGE_TAG=<mã commit cũ> docker compose up -d   # quay về bản cũ
```

Chạy lại triển khai mà không cần commit: GitHub › Actions › CI/CD › *Run workflow*.

**Làm sạch dữ liệu demo** (xóa CSDL + tệp tải lên, Flyway nạp lại V1–V5 khi backend khởi động):
`docker compose down -v && docker compose up -d`. Không đảo ngược được.

## Điều cần nhớ khi code tiếp

- **Không sửa migration đã có (V1–V5…).** CSDL trên VPS sống lâu dài; sửa file cũ ⇒ Flyway báo sai checksum ⇒ backend
  trên VPS không khởi động. Đổi schema/seed luôn bằng `V5__…`, `V6__…`.
- Push lên `main` là lên VPS sau khoảng 5–8 phút, backend gián đoạn khoảng 30–60 giây. Đang demo thì đừng push.
- Thao tác trên http://221.121.0.89 làm thay đổi dữ liệu demo trên VPS (khác CSDL dev trên máy).
- Lệnh phát triển trên máy không đổi: `docker compose up -d`, `mvnw spring-boot:run`, `npm run dev`.
