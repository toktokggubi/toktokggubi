FROM gradle:8.4.0-jdk17 AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew || true
RUN ./gradlew bootJar -x test || gradle bootJar -x test


# 2. 실행용 Stage
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl --fail http://localhost:8080/actuator/health || exit 1