package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Қарз дефтери ёзуви — они_ове (берилди) ёки i_owe (олинган).
 */
@Getter
@Setter
@Entity
@Table(name = "debt")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
public class Debt {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @JsonProperty("contactId")
    @Column(name = "contact_id", length = 63)
    private String contactId;

    @Column(name = "person_name", nullable = false)
    private String personName;

    @Column(name = "phone", nullable = false)
    private String phone = "";

    @Column(name = "telegram", length = 127)
    private String telegram;

    @Column(name = "whatsapp", length = 127)
    private String whatsapp;

    @Column(name = "type", nullable = false, length = 16)
    private String type; // they_owe | i_owe

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "paid_amount", nullable = false)
    private Long paidAmount;

    @Column(name = "remaining_amount", nullable = false)
    private Long remainingAmount;

    @Column(name = "given_date")
    private LocalDate givenDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "status", nullable = false, length = 16)
    private String status = "active"; // active | settled | overdue

    @Column(name = "notes")
    private String notes;

    @Column(name = "source_type", nullable = false, length = 16)
    private String sourceType = "wallet"; // wallet | goal

    @Column(name = "source_id", length = 63)
    private String sourceId;

    @Column(name = "settled_date")
    private LocalDate settledDate;

    @JsonProperty("payments")
    @OneToMany(mappedBy = "debt", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<DebtPayment> payments = new ArrayList<>();
}
