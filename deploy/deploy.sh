#!/usr/bin/env bash
# Chạy TRÊN VPS (user deploy, thư mục ~/qltt) — job "deploy" của GitHub Actions gọi qua SSH:
#   printf '%s' "$GHCR_TOKEN" | ssh deploy@VPS "bash qltt/deploy.sh <image-tag> <ghcr-user>"
# Token GHCR (GITHUB_TOKEN của lần chạy CI, hết hạn khi job xong) đi qua stdin, không nằm trong lệnh.
# Quay về bản cũ bằng tay: cd ~/qltt && IMAGE_TAG=<sha cũ> docker compose up -d
set -euo pipefail
cd "$(dirname "$0")"

TAG="${1:?thiếu image tag}"
GHCR_USER="${2:?thiếu tên người dùng GHCR}"

docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

export IMAGE_TAG="$TAG"
docker compose pull --quiet
docker compose up -d --remove-orphans

# Backend 1 vCPU khởi động + Flyway mất khoảng 1 phút. Coi là sẵn sàng khi /api/auth/me (không token)
# trả 401 JSON qua Nginx — tức là cả Nginx, Spring Security lẫn kết nối CSDL đã chạy.
code=000
for i in $(seq 1 48); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/auth/me || true)
  if [ "$code" = "401" ]; then
    echo "Backend sẵn sàng sau khoảng $((i * 5)) giây"
    break
  fi
  sleep 5
done
if [ "$code" != "401" ]; then
  echo "Backend chưa sẵn sàng sau 4 phút (mã cuối: $code)"
  docker compose ps
  docker compose logs --tail=120 backend
  exit 1
fi
curl -fsS -o /dev/null http://localhost/ && echo "Frontend trả trang chủ OK"

echo "IMAGE_TAG=$TAG  $(date '+%d/%m/%Y %H:%M')" > .ban-dang-chay
docker image prune -f >/dev/null
docker compose ps
