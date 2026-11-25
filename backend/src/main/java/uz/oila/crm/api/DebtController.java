package uz.oila.crm.api;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.DebtService;
import uz.oila.crm.service.LocalDto.LocalDebt;
import uz.oila.crm.service.LocalDto.LocalPayment;

import java.util.List;

/**
 * Қарз дефтери — яратиш, ўчириш, тўлиқ ёпиш ва қисман тўлов.
 */
@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final DebtService service;

    public DebtController(DebtService service) {
        this.service = service;
    }

    @GetMapping
    public List<?> findAll() {
        return service.findAll();
    }

    @PostMapping
    public Object create(@RequestBody LocalDebt body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable String id, @RequestBody LocalDebt body) {
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/settle")
    public Object settle(@PathVariable String id, @RequestBody(required = false) LocalPayment body) {
        return service.settle(id, body);
    }

    @PostMapping("/{id}/payments")
    public Object payPartial(@PathVariable String id, @RequestBody LocalPayment body) {
        return service.payPartial(id, body);
    }
}
