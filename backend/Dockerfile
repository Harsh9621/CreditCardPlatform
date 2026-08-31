# Use official OpenJDK image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build the project with Maven wrapper
RUN ./mvnw clean install -DskipTests

# Run the JAR file
CMD ["java", "-jar", "target/*.jar"]
