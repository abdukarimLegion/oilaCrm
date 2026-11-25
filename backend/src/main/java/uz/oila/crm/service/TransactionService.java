package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.Category;
import uz.oila.crm.domain.FamilyMember;
import uz.oila.crm.domain.Transaction;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.CategoryRepository;
import uz.oila.crm.repo.FamilyMemberRepository;
import uz.oila.crm.repo.TransactionRepository;
import uz.oila.crm.repo.WalletRepository;
import uz.oila.crm.service.LocalDto.LocalTx;

import java.time.LocalDate;
import java.util.List;

/**
 * Транзакция (даромад/харажат) CRUD — ҳамён балансы билан бирга бошқарилади.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactions;
    private final WalletRepository wallets;
    private final CategoryRepository categories;
    private final FamilyMemberRepository members;

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return transactions.findAll();
    }

    @Transactional
    public Transaction create(LocalTx body) {
        Wallet wallet = getWallet(body.walletId());
        Category cat = categories.findById(body.categoryId())
                .orElseThrow(() -> notFound("Toifa topilmadi: " + body.categoryId()));
        FamilyMember m = members.findById(body.memberId())
                .orElseThrow(() -> notFound("Оила аъзоси топилмади: " + body.memberId()));

        Transaction tx = new Transaction();
        tx.setId(Ids.newId("tx_"));
        tx.setDate(body.date() != null ? body.date() : LocalDate.now());
        tx.setAmount(body.amount());
        tx.setType(body.type());
        tx.setCategory(cat);
        tx.setWallet(wallet);
        tx.setMember(m);
        tx.setNote(body.note());
        tx.setCurrency(body.currency());
        tx.setOriginalAmount(body.originalAmount());
        tx.setTags(body.tags() == null ? List.of() : body.tags());
        tx.setIsRecurring(Boolean.TRUE.equals(body.isRecurring()));
        tx.setRecurringItemId(body.recurringItemId());

        // Ҳамён балансыни янгиланг (income = +, expense = -)
        if (wallet != null) {
            long delta = "income".equals(tx.getType()) ? tx.getAmount() : -tx.getAmount();
            wallet.setBalance(wallet.getBalance() + delta);
            wallets.save(wallet);
        }

        return transactions.save(tx);
    }

    @Transactional
    public Transaction update(String id, LocalTx body) {
        Transaction tx = transactions.findById(id)
                .orElseThrow(() -> notFound("Транзакция топилмади: " + id));

        Wallet oldWallet = tx.getWallet();
        String oldType = tx.getType();
        long oldAmount = tx.getAmount();

        if (body.date() != null) tx.setDate(body.date());
        if (body.amount() != null) tx.setAmount(body.amount());
        if (body.type() != null) tx.setType(body.type());
        if (body.note() != null) tx.setNote(body.note());
        if (body.currency() != null) tx.setCurrency(body.currency());
        if (body.originalAmount() != null) tx.setOriginalAmount(body.originalAmount());
        if (body.tags() != null) tx.setTags(body.tags());
        if (body.categoryId() != null) {
            tx.setCategory(categories.findById(body.categoryId()).orElseThrow(() -> notFound("Toifa topilmadi: " + body.categoryId())));
        }
        if (body.memberId() != null) {
            tx.setMember(members.findById(body.memberId()).orElseThrow(() -> notFound("Оила аъзоси топилмади: " + body.memberId())));
        }

        // Ҳамён балансини қайта ҳисоблаш: эски тансазу (revert), янгини қўллаш
        Wallet targetWallet = body.walletId() != null ? getWallet(body.walletId()) : tx.getWallet();
        tx.setWallet(targetWallet);

        revert(oldWallet, oldAmount, oldType);
        if (targetWallet != null) {
            long delta = "income".equals(tx.getType()) ? tx.getAmount() : -tx.getAmount();
            targetWallet.setBalance(targetWallet.getBalance() + delta);
            wallets.save(targetWallet);
        }

        return transactions.save(tx);
    }

    @Transactional
    public void delete(String id) {
        Transaction tx = transactions.findById(id)
                .orElseThrow(() -> notFound("Транзакция топилмади: " + id));
        // revert wallet balance
        Wallet w = tx.getWallet();
        if (w != null) {
            long revert = "income".equals(tx.getType()) ? -tx.getAmount() : tx.getAmount();
            w.setBalance(w.getBalance() + revert);
            wallets.save(w);
        }
        transactions.delete(tx);
    }

    private void revert(Wallet skip, long amount, String type) {
        if (skip == null) return;
        long revert = "income".equals(type) ? -amount : amount;
        skip.setBalance(skip.getBalance() + revert);
        wallets.save(skip);
    }

    private Wallet getWallet(String walletId) {
        if (walletId == null) return null;
        return wallets.findById(walletId).orElseThrow(() -> notFound("Ҳамён топилмади: " + walletId));
    }

    private ResponseStatusException notFound(String msg) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, msg);
    }
}
