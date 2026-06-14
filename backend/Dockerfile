FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw -q dependency:go-offline
RUN ./mvnw -q package -DskipTests
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/engineering-excellence-portal-0.1.0.jar"]
