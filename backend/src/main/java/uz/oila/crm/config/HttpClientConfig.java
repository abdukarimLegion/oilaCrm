package uz.oila.crm.config;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Валyuta kurslari proxy va fiktsional AI chaqiruvlari uchun HTTP client.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient restClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(8));
        factory.setReadTimeout(Duration.ofSeconds(15));
        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }
}
