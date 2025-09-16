FROM gradle:8.4.0-jdk17 AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew || true
RUN ./gradlew bootJar -x test || gradle bootJar -x test


# 2. 실행용 Stage
FROM eclipse-temurin:17-jdk
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/* \

COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -sfm 3 http://localhost:8080/actuator/health | grep -q '\"status\":\"UP\"' || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]