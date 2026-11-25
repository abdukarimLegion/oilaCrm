package uz.oila.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OilaCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(OilaCrmApplication.class, args);
    }
}
