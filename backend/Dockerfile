# Use Eclipse Temurin JDK 21 (LTS, stable for Spring Boot 3.x)
FROM eclipse-temurin:21-jdk

# Set working directory inside container
WORKDIR /app

# Copy project files
COPY . .

# Build the project using Maven Wrapper
RUN ./mvnw clean install -DskipTests

# Expose default Spring Boot port
EXPOSE 8080

# Run the JAR file
CMD ["java", "-jar", "target/cardwise-0.0.1-SNAPSHOT.jar"]
