package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Муддатли / такрорланувчи тўлов (recurring bill).
 */
@Getter
@Setter
@Entity
@Table(name = "recurring_item")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
public class RecurringItem {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "type", nullable = false, length = 16)
    private String type; // income | expense

    @Column(name = "frequency", nullable = false, length = 16)
    private String frequency = "monthly";

    @Column(name = "due_day_of_month", nullable = false)
    private Integer dueDayOfMonth = 1;

    @Column(name = "category_id", length = 63, nullable = false)
    private String categoryId;

    @Column(name = "wallet_id", length = 63, nullable = false)
    private String walletId;

    @Column(name = "member_id", length = 63, nullable = false)
    private String memberId;

    @Column(name = "last_paid_date")
    private java.time.LocalDate lastPaidDate;

    @Column(name = "auto_post", nullable = false)
    private Boolean autoPost = false;

    @Column(name = "last_auto_posted_date", length = 7)
    private String lastAutoPostedDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "notes")
    private String notes;
}
