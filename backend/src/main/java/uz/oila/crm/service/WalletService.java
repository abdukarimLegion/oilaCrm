package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.Wallet;
import uz.oila.crm.repo.WalletRepository;

import java.util.List;

/**
 * Ҳамёнлар (wallets) CRUD.
 */
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository wallets;

    @Transactional(readOnly = true)
    public List<Wallet> findAll() {
        return wallets.findAll();
    }

    @Transactional
    public Wallet create(LocalDto.LocalWallet body) {
        Wallet w = new Wallet();
        w.setId(Ids.newId("w_"));
        apply(w, body);
        if (w.getBalance() == null) w.setBalance(0L);
        if (w.getCurrency() == null) w.setCurrency("UZS");
        return wallets.save(w);
    }

    @Transactional
    public Wallet update(String id, LocalDto.LocalWallet body) {
        Wallet w = wallets.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ҳамён топилмади: " + id));
        apply(w, body);
        return wallets.save(w);
    }

    private void apply(Wallet w, LocalDto.LocalWallet body) {
        if (body.nameCyrl() != null) w.setNameCyrl(body.nameCyrl());
        if (body.nameLatn() != null) w.setNameLatn(body.nameLatn());
        if (body.type() != null) w.setType(body.type());
        if (body.balance() != null) w.setBalance(body.balance());
        if (body.currency() != null) w.setCurrency(body.currency());
        if (body.color() != null) w.setColor(body.color());
    }
}
