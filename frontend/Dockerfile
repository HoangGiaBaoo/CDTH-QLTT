# Image frontend QLTT: build Vite rồi phục vụ bằng Nginx; Nginx chuyển /api sang container backend
# nên trình duyệt chỉ gọi một địa chỉ (không phát sinh CORS). Phát triển vẫn dùng `npm run dev`.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Gọi API cùng địa chỉ với trang (đường dẫn tương đối), xem nginx.conf.
ENV VITE_API_URL=/api
RUN npm run build

FROM nginx:1.27-alpine
LABEL org.opencontainers.image.source="https://github.com/HoangGiaBaoo/CDTH-QLTT"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
