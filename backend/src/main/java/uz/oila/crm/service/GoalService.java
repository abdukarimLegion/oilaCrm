package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.GoalContribution;
import uz.oila.crm.domain.SavingsGoal;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.SavingsGoalRepository;
import uz.oila.crm.repo.WalletRepository;
import uz.oila.crm.service.LocalDto.LocalContribution;
import uz.oila.crm.service.LocalDto.LocalGoal;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.util.List;

/**
 * Мақсадли жамғармалар — CRUD ва бадал/чиқим (contribute/withdraw) операциялари.
 */
@Service
@RequiredArgsConstructor
public class GoalService {

    private final SavingsGoalRepository goals;
    private final WalletRepository wallets;

    @PersistenceContext
    private EntityManager em;

    @Transactional(readOnly = true)
    public List<SavingsGoal> findAll() {
        return goals.findAll();
    }

    @Transactional
    public SavingsGoal create(LocalGoal body) {
        SavingsGoal g = new SavingsGoal();
        g.setId(Ids.newId("goal_"));
        applyFields(g, body);
        g.setCurrentAmount(0L);
        g.setHistory(new java.util.ArrayList<>());
        return goals.save(g);
    }

    @Transactional
    public SavingsGoal update(String id, LocalGoal body) {
        SavingsGoal g = getGoal(id);
        applyFields(g, body);
        return goals.save(g);
    }

    @Transactional
    public void delete(String id) {
        goals.delete(getGoal(id));
    }

    /**
     * Бадал (deposit) ёки чиқим (withdrawal). deposit: current++, wallet--; withdrawal: current--, wallet++.
     */
    @Transactional
    public SavingsGoal contribute(String goalId, LocalContribution body) {
        SavingsGoal g = getGoal(goalId);
        boolean withdraw = "withdrawal".equals(body.type());
        long amount = Math.abs(body.amount());

        if (!withdraw) {
            g.setCurrentAmount(g.getCurrentAmount() + amount);
        } else {
            g.setCurrentAmount(Math.max(0, g.getCurrentAmount() - amount));
        }

        GoalContribution contrib = new GoalContribution();
        contrib.setId(Ids.newId("h_"));
        contrib.setGoal(g);
        contrib.setDate(LocalDate.now());
        contrib.setAmount(withdraw ? -amount : amount);
        contrib.setWalletId(body.walletId());
        contrib.setNote(body.note());
        contrib.setType(withdraw ? "withdrawal" : "deposit");
        g.getHistory().add(0, contrib);
        // Yangi manual-id entity => persist (merge cascade xatosi oldini olish uchun)
        em.persist(contrib);

        if (body.walletId() != null) {
            Wallet w = getWallet(body.walletId());
            long delta = withdraw ? amount : -amount;
            w.setBalance(w.getBalance() + delta);
            wallets.save(w);
        }

        return goals.save(g);
    }

    private void applyFields(SavingsGoal g, LocalGoal body) {
        if (body.titleCyrl() != null) g.setTitleCyrl(body.titleCyrl());
        if (body.titleLatn() != null) g.setTitleLatn(body.titleLatn());
        if (body.targetAmount() != null) g.setTargetAmount(body.targetAmount());
        if (body.monthlyContribution() != null) g.setMonthlyContribution(body.monthlyContribution());
        if (body.targetDate() != null) g.setTargetDate(body.targetDate());
        if (body.category() != null) g.setCategory(body.category());
        if (body.icon() != null) g.setIcon(body.icon());
        if (body.color() != null) g.setColor(body.color());
        if (body.priority() != null) g.setPriority(body.priority());
        if (body.notes() != null) g.setNotes(body.notes());
    }

    private SavingsGoal getGoal(String id) {
        return goals.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Мақсад топилмади: " + id));
    }

    private Wallet getWallet(String id) {
        return wallets.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ҳамён топилмади: " + id));
    }
}
