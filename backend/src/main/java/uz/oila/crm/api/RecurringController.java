package uz.oila.crm.api;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.LocalDto.LocalRecurring;
import uz.oila.crm.service.RecurringService;

import java.time.LocalDate;
import java.util.List;

/**
 * Муддатли (takrorlanuvchi) тўловлар — CRUD + pay + auto-post.
 */
@RestController
@RequestMapping("/api/recurring")
public class RecurringController {

    private final RecurringService service;

    public RecurringController(RecurringService service) {
        this.service = service;
    }

    @GetMapping
    public List<?> findAll() {
        return service.findAll();
    }

    @PostMapping
    public Object create(@RequestBody LocalRecurring body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable String id, @RequestBody LocalRecurring body) {
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/pay")
    public Object pay(@PathVariable String id,
                      @RequestParam(required = false) String date) {
        return service.pay(id, date == null ? LocalDate.now() : LocalDate.parse(date));
    }

    @PostMapping("/auto-post")
    public List<?> autoPost() {
        return service.autoPost(LocalDate.now());
    }
}
