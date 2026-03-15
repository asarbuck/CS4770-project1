import java.util.Random;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Instant;

public class Sensor {

    private static final double MIN_VOLTAGE = 0.0;
    private static final double MAX_VOLTAGE = 5.0;
    private static final int INTERVAL_MS  = 500;
    private static final String SAMPLER_URL = "http://localhost:3000/sample";

    private final Random random = new Random();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendToSampler(double voltage) {
        try {
            String json = String.format(
            "{\"sensorId\": \"s1\", \"value\": %.3f, \"timestamp\": \"%s\"}",
                voltage,
                Instant.now().toString()
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SAMPLER_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

             HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            System.out.printf("Sent: %.3f V → Sampler: %s%n", voltage, response.body());
        } catch (Exception e) {
            System.out.println("Failed to reach Sampler: " + e.getMessage());
        }
    }

    public double readVoltage() {
        return MIN_VOLTAGE + (MAX_VOLTAGE - MIN_VOLTAGE) * random.nextDouble();
    }

    public void run() {
        System.out.println("Sensor started. Reading voltage every " + INTERVAL_MS + "ms...\n");

        for(int i = 0; i < 100; i++) {//needs a while loop but there is no implementation to stop it currently
            double voltage = readVoltage();
            sendToSampler(voltage);
            
            try {
                Thread.sleep(INTERVAL_MS);
            } catch (InterruptedException e) {
                System.out.println("Sensor interrupted. Shutting down.");
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    public static void main(String[] args) {
        new Sensor().run();
    }
}
