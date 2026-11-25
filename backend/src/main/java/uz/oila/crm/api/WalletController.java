package uz.oila.crm.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.LocalDto.LocalWallet;
import uz.oila.crm.service.WalletService;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService service;

    public WalletController(WalletService service) {
        this.service = service;
    }

    @GetMapping
    public List<?> findAll() {
        return service.findAll();
    }

    @PostMapping
    public Object create(@RequestBody LocalWallet body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable String id, @RequestBody LocalWallet body) {
        return service.update(id, body);
    }
}
