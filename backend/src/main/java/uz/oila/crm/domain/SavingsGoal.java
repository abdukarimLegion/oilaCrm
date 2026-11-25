package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Мақсадли жамғарма (savings goal).
 */
@Getter
@Setter
@Entity
@Table(name = "savings_goal")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
public class SavingsGoal {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "title_cyrl", nullable = false)
    private String titleCyrl;

    @Column(name = "title_latn", nullable = false)
    private String titleLatn;

    @Column(name = "target_amount", nullable = false)
    private Long targetAmount;

    @Column(name = "current_amount", nullable = false)
    private Long currentAmount;

    @Column(name = "monthly_contribution", nullable = false)
    private Long monthlyContribution;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "category", length = 127)
    private String category;

    @Column(name = "icon", length = 64, nullable = false)
    private String icon;

    @Column(name = "color", length = 32, nullable = false)
    private String color;

    @Column(name = "priority", nullable = false, length = 16)
    private String priority = "medium";

    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy = "goal", fetch = FetchType.EAGER)
    @JsonProperty("history")
    private List<GoalContribution> history = new ArrayList<>();

    @JsonProperty("title_cyrl")
    public String getTitleCyrl() {
        return titleCyrl;
    }

    @JsonProperty("title_latn")
    public String getTitleLatn() {
        return titleLatn;
    }
}
