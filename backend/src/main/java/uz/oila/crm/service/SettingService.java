package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.oila.crm.domain.AppSetting;
import uz.oila.crm.repo.AppSettingRepository;

import java.util.Map;

/**
 * Global sozlanmalar (kurs, oylik limit, alert settings) — settings inline grafigi.
 */
@Service
@RequiredArgsConstructor
public class SettingService {

    private final AppSettingRepository settings;

    @Transactional(readOnly = true)
    public Map<String, String> all() {
        return settings.findAllAsMap();
    }

    @Transactional
    public void put(String key, String value) {
        settings.save(new AppSetting(key, value));
    }

    @Transactional
    public void putAll(Map<String, String> map) {
        map.forEach(settings::put);
    }

    @Transactional(readOnly = true)
    public long getLong(String key, long fallback) {
        AppSetting s = settings.findById(key).orElse(null);
        if (s == null) return fallback;
        try {
            return Long.parseLong(s.getValue());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    @Transactional(readOnly = true)
    public boolean getBool(String key, boolean fallback) {
        AppSetting s = settings.findById(key).orElse(null);
        if (s == null) return fallback;
        return Boolean.parseBoolean(s.getValue());
    }
}
