package uz.oila.crm.service;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.Map;

/**
 * Request body record-lari (frontend types/index.ts ga mos).
 */
import jakarta.validation.constraints.NotNull;

public final class LocalDto {

    private LocalDto() {
    }

    public record LocalTx(
            LocalDate date,
            Long amount,
            String type,
            String categoryId,
            String walletId,
            String memberId,
            String note,
            String currency,
            Long originalAmount,
            List<String> tags,
            Boolean isRecurring,
            String recurringItemId
    ) {
    }

    /**
     * Frontend SavingsGoal type snake_case (title_cyrl) jo'natadi — @JsonAlias ikkala formatni qamrab oladi.
     */
    public record LocalGoal(
            @JsonAlias("title_cyrl") String titleCyrl,
            @JsonAlias("title_latn") String titleLatn,
            Long targetAmount,
            Long monthlyContribution,
            LocalDate targetDate,
            String category,
            String icon,
            String color,
            String priority,
            String notes
    ) {
    }

    public record LocalContribution(
            Long amount,
            String walletId,
            String note,
            String type // deposit | withdrawal
    ) {
    }

    public record LocalContact(
            String name,
            String phone,
            String telegram,
            String whatsapp,
            String notes,
            String avatarColor
    ) {
    }

    public record LocalDebt(
            String contactId,
            String personName,
            String phone,
            String telegram,
            String whatsapp,
            String type, // they_owe | i_owe
            Long totalAmount,
            LocalDate givenDate,
            LocalDate dueDate,
            String notes,
            String sourceType, // wallet | goal
            String sourceId
    ) {
    }

    public record LocalPayment(
            Long amount,
            String targetType, // wallet | goal
            String targetId,
            String note
    ) {
    }

    public record LocalRecurring(
            String title,
            Long amount,
            String type,
            String frequency,
            Integer dueDayOfMonth,
            String categoryId,
            String walletId,
            String memberId,
            Boolean autoPost,
            Boolean isActive,
            String notes
    ) {
    }

    public record LocalBudgets(
            Long dailyBudget,
            Long weeklyBudget,
            Long monthlyBudget
    ) {
    }

    public record LocalSettings(
            Long exchangeRate,
            Long monthlyBudgetLimit,
            Boolean alertAt80,
            Boolean alertAt100
    ) {
    }

    public record LocalWallet(
            @JsonAlias("name_cyrl") String nameCyrl,
            @JsonAlias("name_latn") String nameLatn,
            String type,
            Long balance,
            String currency,
            String color
    ) {
    }
}
