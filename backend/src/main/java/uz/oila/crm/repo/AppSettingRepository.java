package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.AppSetting;

import java.util.LinkedHashMap;
import java.util.Map;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {

    default Map<String, String> findAllAsMap() {
        Map<String, String> map = new LinkedHashMap<>();
        findAll().forEach(s -> map.put(s.getKey(), s.getValue()));
        return map;
    }

    default void put(String key, String value) {
        save(new AppSetting(key, value));
    }
}
