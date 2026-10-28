package Java.Backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableAsync // Enables background asynchronous processing (@Async)
public class AppConfig {

    @Bean
    public WebClient webClient() {
        // Base URL points to where your teammate's Python FastAPI microservice runs
        return WebClient.builder()
                .baseUrl("http://localhost:5000")
                .build();
    }
}