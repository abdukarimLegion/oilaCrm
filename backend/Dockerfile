# -------- Build (Gradle) --------
FROM gradle:8.14.2-jdk21 AS build
WORKDIR /home/gradle/project

COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle gradle
COPY src src
RUN gradle bootJar --no-daemon

# -------- Runtime (JRE 21) --------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /home/gradle/project/build/libs/app.jar app.jar

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health >/dev/null 2>&1 || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
