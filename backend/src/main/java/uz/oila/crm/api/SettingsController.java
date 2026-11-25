package uz.oila.crm.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.LocalDto.LocalSettings;
import uz.oila.crm.service.SettingService;

import java.util.Map;

/**
 * Global sozlanmalar — kurs, oylik budget limit va alert'lar.
 */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingService settings;

    public SettingsController(SettingService settings) {
        this.settings = settings;
    }

    @GetMapping
    public Map<String, Object> get() {
        return Map.of(
                "exchangeRate", settings.getLong("exchange_rate", 12850),
                "monthlyBudgetLimit", settings.getLong("monthly_budget_limit", 6_500_000),
                "alertAt80", settings.getBool("alert_at_80", true),
                "alertAt100", settings.getBool("alert_at_100", true)
        );
    }

    @PutMapping
    public Map<String, Object> update(@RequestBody LocalSettings body) {
        if (body.exchangeRate() != null) settings.put("exchange_rate", String.valueOf(body.exchangeRate()));
        if (body.monthlyBudgetLimit() != null) settings.put("monthly_budget_limit", String.valueOf(body.monthlyBudgetLimit()));
        if (body.alertAt80() != null) settings.put("alert_at_80", String.valueOf(body.alertAt80()));
        if (body.alertAt100() != null) settings.put("alert_at_100", String.valueOf(body.alertAt100()));
        return get();
    }
}
