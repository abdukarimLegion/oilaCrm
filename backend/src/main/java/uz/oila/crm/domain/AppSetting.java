package uz.oila.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Иловачауш sozlanmalari (key-value): exchange_rate, monthly_budget_limit, alert_at_80, alert_at_100.
 */
@Getter
@Setter
@Entity
@Table(name = "app_setting")
@NoArgsConstructor
public class AppSetting {

    @Id
    @Column(name = "key", length = 63)
    private String key;

    @Column(name = "value", nullable = false)
    private String value;

    public AppSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }
}
