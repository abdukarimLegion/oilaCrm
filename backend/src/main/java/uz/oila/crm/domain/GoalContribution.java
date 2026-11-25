package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Мақсадли жамғарма тарихи — депозит ёки чиқим ёзуви. JSON'da history array elementi shaklida beriladi.
 */
@Getter
@Setter
@Entity
@Table(name = "goal_contribution")
@NoArgsConstructor
public class GoalContribution {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    private SavingsGoal goal;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "note")
    private String note;

    @Column(name = "wallet_id", length = 63)
    private String walletId;

    @Column(name = "type", nullable = false, length = 16)
    private String type = "deposit"; // deposit | withdrawal
}
