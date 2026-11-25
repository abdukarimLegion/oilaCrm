package uz.oila.crm.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.SeedService;

import java.util.Map;

/**
 * Demo ma'lumotlarni qayta yuklash (frontend resetToSampleData funksiyasi).
 */
@RestController
@RequestMapping("/api/dev")
public class DevController {

    private final SeedService seedService;

    public DevController(SeedService seedService) {
        this.seedService = seedService;
    }

    @PostMapping("/reset")
    public Map<String, Object> reset() {
        seedService.reset();
        return Map.of("status", "reset");
    }
}
