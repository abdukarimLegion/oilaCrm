package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.Category;
import uz.oila.crm.domain.FamilyMember;
import uz.oila.crm.domain.RecurringItem;
import uz.oila.crm.domain.Transaction;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.CategoryRepository;
import uz.oila.crm.repo.FamilyMemberRepository;
import uz.oila.crm.repo.RecurringItemRepository;
import uz.oila.crm.repo.TransactionRepository;
import uz.oila.crm.repo.WalletRepository;
import uz.oila.crm.service.LocalDto.LocalRecurring;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Муддатли (текrorlanuvchi) тўловлар — CRUD, қўлда тўлаш ва авто-постинг двигатель.
 */
@Service
@RequiredArgsConstructor
public class RecurringService {

    private final RecurringItemRepository items;
    private final TransactionRepository transactions;
    private final WalletRepository wallets;
    private final CategoryRepository categories;
    private final FamilyMemberRepository members;

    @Transactional(readOnly = true)
    public List<RecurringItem> findAll() {
        return items.findAll();
    }

    @Transactional
    public RecurringItem create(LocalRecurring body) {
        RecurringItem r = new RecurringItem();
        r.setId(Ids.newId("rec_"));
        apply(r, body);
        r.setLastPaidDate(null);
        r.setLastAutoPostedDate(null);
        return items.save(r);
    }

    @Transactional
    public RecurringItem update(String id, LocalRecurring body) {
        RecurringItem r = getItem(id);
        apply(r, body);
        return items.save(r);
    }

    @Transactional
    public void delete(String id) {
        items.deleteById(id);
    }

    /**
     * Қўлда тўлаш — ledger га транзакция ёзади ва ҳамён балансыни ўзгартиради.
     */
    @Transactional
    public RecurringItem pay(String id, LocalDate date) {
        RecurringItem r = getItem(id);
        LocalDate payDate = date != null ? date : LocalDate.now();

        Wallet w = wallets.findById(r.getWalletId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ҳамён топилмади: " + r.getWalletId()));
        long delta = "income".equals(r.getType()) ? r.getAmount() : -r.getAmount();
        w.setBalance(w.getBalance() + delta);
        wallets.save(w);

        Transaction tx = new Transaction();
        tx.setId(Ids.newId("tx_rec_"));
        tx.setDate(payDate);
        tx.setAmount(r.getAmount());
        tx.setType(r.getType());
        tx.setCategory(categories.findById(r.getCategoryId()).orElse(null));
        tx.setWallet(w);
        tx.setMember(members.findById(r.getMemberId()).orElse(null));
        tx.setNote("🔄 [Такрорланувчи тўлов] " + r.getTitle());
        tx.setIsRecurring(true);
        tx.setRecurringItemId(r.getId());
        transactions.save(tx);

        r.setLastPaidDate(payDate);
        r.setLastAutoPostedDate(payDate.withDayOfMonth(1).toString().substring(0, 7));
        return items.save(r);
    }

    /**
     * Авто-постинг: dueDayOfMonth ўтган ва жорий ойда ҳали авто-пост қилинмаган
     * ҳар бир фаол item учун транзакция яратади. Frontend yuklanishda chaqiriladi.
     */
    @Transactional
    public List<Transaction> autoPost(LocalDate today) {
        String yearMonth = today.toString().substring(0, 7);
        int day = today.getDayOfMonth();

        List<Transaction> created = new ArrayList<>();
        for (RecurringItem r : items.findByIsActiveTrueAndAutoPostTrue()) {
            if (r.getLastAutoPostedDate() != null && r.getLastAutoPostedDate().equals(yearMonth)) {
                continue; // бу ойда қилинган
            }
            if (day < r.getDueDayOfMonth()) {
                continue; // муддати ҳали келмаган
            }
            Wallet w = wallets.findById(r.getWalletId()).orElse(null);
            if (w == null) continue;

            long delta = "income".equals(r.getType()) ? r.getAmount() : -r.getAmount();
            w.setBalance(w.getBalance() + delta);
            wallets.save(w);

            Transaction tx = new Transaction();
            tx.setId(Ids.newId("tx_auto_"));
            tx.setDate(LocalDate.of(today.getYear(), today.getMonth(),
                    Math.min(r.getDueDayOfMonth(), today.getMonth().length(today.isLeapYear()))));
            tx.setAmount(r.getAmount());
            tx.setType(r.getType());
            tx.setCategory(categories.findById(r.getCategoryId()).orElse(null));
            tx.setWallet(w);
            tx.setMember(members.findById(r.getMemberId()).orElse(null));
            tx.setNote("🔄 [Авто-тўлов] " + r.getTitle());
            tx.setIsRecurring(true);
            tx.setRecurringItemId(r.getId());
            created.add(transactions.save(tx));

            r.setLastPaidDate(tx.getDate());
            r.setLastAutoPostedDate(yearMonth);
            items.save(r);
        }
        return created;
    }

    private void apply(RecurringItem r, LocalRecurring body) {
        if (body.title() != null) r.setTitle(body.title());
        if (body.amount() != null) r.setAmount(body.amount());
        if (body.type() != null) r.setType(body.type());
        if (body.frequency() != null) r.setFrequency(body.frequency());
        if (body.dueDayOfMonth() != null) r.setDueDayOfMonth(body.dueDayOfMonth());
        if (body.categoryId() != null) r.setCategoryId(body.categoryId());
        if (body.walletId() != null) r.setWalletId(body.walletId());
        if (body.memberId() != null) r.setMemberId(body.memberId());
        if (body.autoPost() != null) r.setAutoPost(body.autoPost());
        if (body.isActive() != null) r.setIsActive(body.isActive());
        if (body.notes() != null) r.setNotes(body.notes());
    }

    private RecurringItem getItem(String id) {
        return items.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Муддатли тўлов топилмади: " + id));
    }
}
