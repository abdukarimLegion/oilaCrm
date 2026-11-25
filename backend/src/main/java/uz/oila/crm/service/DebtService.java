package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.Category;
import uz.oila.crm.domain.Debt;
import uz.oila.crm.domain.DebtPayment;
import uz.oila.crm.domain.FamilyMember;
import uz.oila.crm.domain.SavingsGoal;
import uz.oila.crm.domain.Transaction;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.CategoryRepository;
import uz.oila.crm.repo.DebtRepository;
import uz.oila.crm.repo.FamilyMemberRepository;
import uz.oila.crm.repo.SavingsGoalRepository;
import uz.oila.crm.repo.TransactionRepository;
import uz.oila.crm.repo.WalletRepository;
import uz.oila.crm.service.LocalDto.LocalDebt;
import uz.oila.crm.service.LocalDto.LocalPayment;

import java.time.LocalDate;
import java.util.List;

/**
 * Қарз дефтери — берилди (they_owe) ва олинган (i_owe) қарзлар.
 * Баланс тақсимоти: wallet ёки savings goal манба/манзил бўлиши мумкин,
 * ҳар бир ҳаракат ledger га аудит транзакцияси сифатида ёзилади.
 */
@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debts;
    private final WalletRepository wallets;
    private final SavingsGoalRepository goals;
    private final CategoryRepository categories;
    private final FamilyMemberRepository members;
    private final TransactionRepository transactions;

    @Transactional(readOnly = true)
    public List<Debt> findAll() {
        return debts.findAll();
    }

    /**
     * Янги қарз: мана (source) балансини олдқазц ва аудит транзакция яратади.
     */
    @Transactional
    public Debt create(LocalDebt body) {
        Debt d = new Debt();
        d.setId(Ids.newId("d_"));
        d.setContactId(body.contactId());
        d.setPersonName(body.personName());
        d.setPhone(body.phone() == null ? "" : body.phone());
        d.setTelegram(body.telegram());
        d.setWhatsapp(body.whatsapp());
        d.setType(body.type());
        d.setTotalAmount(body.totalAmount());
        d.setPaidAmount(0L);
        d.setRemainingAmount(body.totalAmount());
        d.setGivenDate(body.givenDate() != null ? body.givenDate() : LocalDate.now());
        d.setDueDate(body.dueDate());
        d.setStatus(isOverdue(body.dueDate()) ? "overdue" : "active");
        d.setNotes(body.notes());
        d.setSourceType(body.sourceType() == null ? "wallet" : body.sourceType());
        d.setSourceId(body.sourceId());
        d.setPayments(new java.util.ArrayList<>());

        // Қаражат манбаси балансини ўзгартириш:
        // they_owe → мана чиқади (минус); i_owe → мана келади (плюс)
        adjust(d.getSourceType(), d.getSourceId(), "they_owe".equals(d.getType()) ? -d.getTotalAmount() : d.getTotalAmount());

        String defaultWalletId = resolveDefaultWalletId();
        boolean lentOut = "they_owe".equals(d.getType());
        transactions.save(auditTx(
                d.getGivenDate() != null ? d.getGivenDate() : LocalDate.now(),
                lentOut ? "expense" : "income",
                lentOut ? "Қарз берилди: " + d.getPersonName() + " (" + notesSafe(d) + ")"
                        : "Қарз олинди: " + d.getPersonName() + " (" + notesSafe(d) + ")",
                d.getTotalAmount(),
                "wallet".equals(d.getSourceType()) ? d.getSourceId() : defaultWalletId));

        return debts.save(d);
    }

    /**
     * Тўлиқ ундириш/ёпиш: қолги манзил (wallet/goal) га тушadi.
     */
    @Transactional
    public Debt settle(String id, LocalPayment body) {
        Debt d = getDebt(id);
        long remaining = d.getRemainingAmount();
        String targetType = body != null && body.targetType() != null ? body.targetType() : "wallet";
        String targetId = body != null && body.targetId() != null ? body.targetId() : resolveDefaultWalletId();

        applyDestination(d, remaining, targetType, targetId);

        boolean incoming = "they_owe".equals(d.getType());
        transactions.save(auditTx(
                LocalDate.now(),
                incoming ? "income" : "expense",
                incoming ? "Қарз ундирилди: " + d.getPersonName() + " тўлиқ ёпилди"
                        : "Қарз қайтарилди: " + d.getPersonName() + "га тўлиқ тўланди",
                remaining,
                "wallet".equals(targetType) ? targetId : resolveDefaultWalletId()));

        DebtPayment p = new DebtPayment();
        p.setId(Ids.newId("p_"));
        p.setDebt(d);
        p.setDate(LocalDate.now());
        p.setAmount(remaining);
        p.setNote("Тўлиқ ундирилди / Ёпилди");
        p.setTargetType(targetType);
        p.setTargetId(targetId);
        d.getPayments().add(0, p);

        d.setPaidAmount(d.getTotalAmount());
        d.setRemainingAmount(0L);
        d.setStatus("settled");
        d.setSettledDate(LocalDate.now());
        return debts.save(d);
    }

    /**
     * Қарз ёзуини тахрирлаш: шахсий маълумот, сумм ва муддат.
     * totalAmount ўзгарса — remainingAmount = totalAmount - paidAmount қайта ҳисобланади.
     */
    @Transactional
    public Debt update(String id, LocalDebt body) {
        Debt d = getDebt(id);
        boolean changedTotal = body.totalAmount() != null && body.totalAmount() != d.getTotalAmount();

        if (body.contactId() != null) d.setContactId(body.contactId());
        if (body.personName() != null) d.setPersonName(body.personName());
        if (body.phone() != null) d.setPhone(body.phone());
        if (body.telegram() != null) d.setTelegram(body.telegram());
        if (body.whatsapp() != null) d.setWhatsapp(body.whatsapp());
        if (body.notes() != null) d.setNotes(body.notes());
        if (body.dueDate() != null) {
            d.setDueDate(body.dueDate());
            if (!"settled".equals(d.getStatus())) {
                d.setStatus(isOverdue(body.dueDate()) ? "overdue" : "active");
            }
        }
        if (changedTotal) {
            long delta = body.totalAmount() - d.getTotalAmount();
            // Summa o'zgarishini manba (source) balansiga aks ettiring
            adjust(d.getSourceType(), d.getSourceId(), "they_owe".equals(d.getType()) ? delta : -delta);
            d.setTotalAmount(body.totalAmount());
            if (!"settled".equals(d.getStatus())) {
                d.setRemainingAmount(Math.max(0, body.totalAmount() - d.getPaidAmount()));
            }
        }
        return debts.save(d);
    }

    /**
     * Қисман тўлов.
     */
    @Transactional
    public Debt payPartial(String id, LocalPayment body) {
        Debt d = getDebt(id);
        long amount = Math.abs(body.amount());
        String targetType = body.targetType() == null ? "wallet" : body.targetType();
        String targetId = body.targetId() != null ? body.targetId() : resolveDefaultWalletId();

        applyDestination(d, amount, targetType, targetId);

        boolean incoming = "they_owe".equals(d.getType());
        transactions.save(auditTx(
                LocalDate.now(),
                incoming ? "income" : "expense",
                incoming ? "Қарз қисман ундирилди: " + d.getPersonName() + (body.note() == null ? "" : " (" + body.note() + ")")
                        : "Қарз қисман тўланди: " + d.getPersonName() + "га" + (body.note() == null ? "" : " (" + body.note() + ")"),
                amount,
                "wallet".equals(targetType) ? targetId : resolveDefaultWalletId()));

        DebtPayment p = new DebtPayment();
        p.setId(Ids.newId("p_"));
        p.setDebt(d);
        p.setDate(LocalDate.now());
        p.setAmount(amount);
        p.setNote(body.note() != null ? body.note() : "Қисман тўлов");
        p.setTargetType(targetType);
        p.setTargetId(targetId);
        d.getPayments().add(0, p);

        long newPaid = d.getPaidAmount() + amount;
        long newRemaining = Math.max(0, d.getTotalAmount() - newPaid);
        d.setPaidAmount(newPaid);
        d.setRemainingAmount(newRemaining);
        if (newRemaining <= 0) {
            d.setStatus("settled");
            d.setSettledDate(LocalDate.now());
        }
        return debts.save(d);
    }

    @Transactional
    public void delete(String id) {
        debts.deleteById(id);
    }

    // ---------- ichki yordamchi metodlar ----------

    private void adjust(String sourceType, String sourceId, long delta) {
        if (sourceId == null) return;
        if ("wallet".equals(sourceType)) {
            Wallet w = wallets.findById(sourceId).orElse(null);
            if (w != null) {
                w.setBalance(w.getBalance() + delta);
                wallets.save(w);
            }
        } else if ("goal".equals(sourceType)) {
            SavingsGoal g = goals.findById(sourceId).orElse(null);
            if (g != null) {
                g.setCurrentAmount(Math.max(0, g.getCurrentAmount() + delta));
                goals.save(g);
            }
        }
    }

    private void applyDestination(Debt d, long amount, String targetType, String targetId) {
        // they_owe → пул келади (манзилда плюс); i_owe → пул чиқади (манзилда минус)
        boolean incoming = "they_owe".equals(d.getType());
        adjust(targetType, targetId, incoming ? amount : -amount);
    }

    private Transaction auditTx(LocalDate date, String type, String note, long amount, String walletId) {
        Category cat = categories.findById("income".equals(type) ? "inc_other" : "exp_other").orElse(null);
        FamilyMember member = members.findAll().stream().findFirst().orElse(null);

        Transaction tx = new Transaction();
        tx.setId(Ids.newId("tx_"));
        tx.setDate(date);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setCategory(cat);
        tx.setWallet(walletId != null ? wallets.findById(walletId).orElse(null) : null);
        tx.setMember(member);
        tx.setNote(note);
        return tx;
    }

    private String resolveDefaultWalletId() {
        return wallets.findAll().stream().findFirst().map(Wallet::getId).orElse(null);
    }

    private String notesSafe(Debt d) {
        return d.getNotes() == null ? "Қарз дафтари" : d.getNotes();
    }

    private boolean isOverdue(LocalDate dueDate) {
        return dueDate != null && dueDate.isBefore(LocalDate.now());
    }

    private Debt getDebt(String id) {
        return debts.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Қарз топилмади: " + id));
    }
}
