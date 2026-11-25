package uz.oila.crm.schedule;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.oila.crm.service.RecurringService;

import java.time.LocalDate;

/**
 * Муддатли тўловларни auto-post бекор қилади: кунда бир марта (03:00) текширув.
 * Frontend bootstrap chaqirilmasа ҳам муддати келган тўлов язилади.
 */
@Component
@RequiredArgsConstructor
public class RecurringAutoPostScheduler {

    private final RecurringService recurringService;

    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Tashkent")
    public void runDaily() {
        recurringService.autoPost(LocalDate.now());
    }
}
