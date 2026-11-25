package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Молиявий операция (даромад ёки харажат).
 */
@Getter
@Setter
@Entity
@Table(name = "transaction")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
public class Transaction {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "type", nullable = false, length = 16)
    private String type; // income | expense

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private FamilyMember member;

    @Column(name = "note")
    private String note;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "original_amount")
    private Long originalAmount;

    @Column(name = "tags")
    @Convert(converter = TagsConverter.class)
    private List<String> tags = new java.util.ArrayList<>();

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Column(name = "recurring_item_id", length = 63)
    private String recurringItemId;

    // ---------- JSON adaptatsiya (frontend types/index.ts) ----------

    @JsonProperty("categoryId")
    public String getCategoryId() {
        return category != null ? category.getId() : null;
    }

    @JsonProperty("walletId")
    public String getWalletId() {
        return wallet != null ? wallet.getId() : null;
    }

    @JsonProperty("memberId")
    public String getMemberId() {
        return member != null ? member.getId() : null;
    }
}
