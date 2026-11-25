package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Харажат/даромад тоифаси — JSON'da frontend TableType.ga muvofiq snake_case maydonlar bilan beriladi.
 */
@Getter
@Setter
@Entity
@Table(name = "category")
@NoArgsConstructor
public class Category {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "name_cyrl", nullable = false)
    private String nameCyrl;

    @Column(name = "name_latn", nullable = false)
    private String nameLatn;

    @Column(name = "type", nullable = false, length = 16)
    private String type; // income | expense

    @Column(name = "icon", length = 64, nullable = false)
    private String icon;

    @Column(name = "color", length = 32, nullable = false)
    private String color;

    @Column(name = "monthly_budget")
    private Long monthlyBudget;

    @Column(name = "daily_budget")
    private Long dailyBudget;

    @Column(name = "weekly_budget")
    private Long weeklyBudget;

    @JsonProperty("name_cyrl")
    public String getNameCyrl() {
        return nameCyrl;
    }

    @JsonProperty("name_latn")
    public String getNameLatn() {
        return nameLatn;
    }
}
