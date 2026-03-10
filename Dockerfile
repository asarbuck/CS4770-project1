FROM eclipse-temurin:17
WORKDIR /app
COPY Hello.java /app/Hello.java
RUN javac Hello.java
CMD ["java", "Hello"]
