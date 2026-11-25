package uz.oila.crm.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.domain.Category;
import uz.oila.crm.domain.Contact;
import uz.oila.crm.domain.Debt;
import uz.oila.crm.domain.FamilyMember;
import uz.oila.crm.domain.RecurringItem;
import uz.oila.crm.domain.SavingsGoal;
import uz.oila.crm.domain.Transaction;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.CategoryRepository;
import uz.oila.crm.repo.ContactRepository;
import uz.oila.crm.repo.DebtRepository;
import uz.oila.crm.repo.FamilyMemberRepository;
import uz.oila.crm.repo.RecurringItemRepository;
import uz.oila.crm.repo.SavingsGoalRepository;
import uz.oila.crm.repo.TransactionRepository;
import uz.oila.crm.repo.WalletRepository;
import uz.oila.crm.service.RecurringService;
import uz.oila.crm.service.SettingService;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Frontend bootstrap — barcha domen ma'lumotlarini bir so'rovda qaytaradi.
 */
@RestController
@RequestMapping("/api")
public class BootstrapController {

    private final WalletRepository wallets;
    private final CategoryRepository categories;
    private final FamilyMemberRepository members;
    private final TransactionRepository transactions;
    private final SavingsGoalRepository goals;
    private final DebtRepository debts;
    private final ContactRepository contacts;
    private final RecurringItemRepository recurring;
    private final RecurringService recurringService;
    private final SettingService settings;

    public BootstrapController(WalletRepository wallets, CategoryRepository categories,
                               FamilyMemberRepository members, TransactionRepository transactions,
                               SavingsGoalRepository goals, DebtRepository debts,
                               ContactRepository contacts, RecurringItemRepository recurring,
                               RecurringService recurringService, SettingService settings) {
        this.wallets = wallets;
        this.categories = categories;
        this.members = members;
        this.transactions = transactions;
        this.goals = goals;
        this.debts = debts;
        this.contacts = contacts;
        this.recurring = recurring;
        this.recurringService = recurringService;
        this.settings = settings;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "oilacrm-backend");
    }

    @GetMapping("/bootstrap")
    public Map<String, Object> bootstrap() {
        // Auto-post: mudcati kelgan takroriy to'lovlar uchun transaction yaratadi
        recurringService.autoPost(LocalDate.now());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("wallets", wallets.findAll());
        result.put("categories", categories.findAll());
        result.put("members", members.findAll());
        result.put("transactions", transactions.findAll().stream()
                .sorted(Comparator.comparing(Transaction::getDate).reversed().thenComparing(t -> t.getId(), Comparator.reverseOrder()))
                .toList());
        result.put("goals", goals.findAll());
        result.put("debts", debts.findAll());
        result.put("contacts", contacts.findAll());
        result.put("recurringItems", recurring.findAll());

        Map<String, Object> settingsMap = new LinkedHashMap<>();
        settingsMap.put("exchangeRate", settings.getLong("exchange_rate", 12850));
        settingsMap.put("monthlyBudgetLimit", settings.getLong("monthly_budget_limit", 6_500_000));
        settingsMap.put("alertAt80", settings.getBool("alert_at_80", true));
        settingsMap.put("alertAt100", settings.getBool("alert_at_100", true));
        result.put("settings", settingsMap);
        result.put("serverDate", LocalDate.now().toString());
        return result;
    }
}
