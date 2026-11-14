# Image backend QLTT — dùng cho triển khai (CI build rồi đẩy lên GHCR, VPS chỉ kéo về chạy).
# Phát triển trên máy vẫn dùng `mvnw spring-boot:run` như cũ.

# ---- Bước build: biên dịch jar (test đã chạy ở job CI riêng nên bỏ qua ở đây) ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY .mvn .mvn
COPY mvnw pom.xml ./
# Tải dependency trước để lớp cache này giữ được khi chỉ đổi mã nguồn.
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package && cp target/*.jar /src/app.jar

# ---- Bước chạy: chỉ JRE + jar ----
FROM eclipse-temurin:21-jre
LABEL org.opencontainers.image.source="https://github.com/HoangGiaBaoo/CDTH-QLTT"
WORKDIR /app
# Không chạy bằng root; thư mục tệp tải lên gắn volume ở docker-compose.
RUN useradd --system --uid 10001 --no-create-home qltt && mkdir -p /app/uploads && chown qltt /app/uploads
COPY --from=build /src/app.jar /app/app.jar
USER qltt
ENV SPRING_PROFILES_ACTIVE=prod \
    STORAGE_DIR=/app/uploads \
    TZ=Asia/Ho_Chi_Minh
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
