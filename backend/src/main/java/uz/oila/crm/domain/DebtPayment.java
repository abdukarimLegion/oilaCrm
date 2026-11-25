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
 * Қарз тўлови (partial / full).
 */
@Getter
@Setter
@Entity
@Table(name = "debt_payment")
@NoArgsConstructor
public class DebtPayment {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    @Column(name = "debt_id", length = 63, insertable = false, updatable = false)
    private String debtId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "note")
    private String note;

    @Column(name = "target_type", nullable = false, length = 16)
    private String targetType = "wallet"; // wallet | goal

    @Column(name = "target_id", length = 63)
    private String targetId;
}
