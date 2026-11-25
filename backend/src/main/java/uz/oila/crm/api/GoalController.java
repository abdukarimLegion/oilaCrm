package uz.oila.crm.api;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.GoalService;
import uz.oila.crm.service.LocalDto.LocalContribution;
import uz.oila.crm.service.LocalDto.LocalGoal;

import java.util.List;

/**
 * Мақсадли жамғармалар — CRUD ва contribute/withdraw.
 */
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @GetMapping
    public List<?> findAll() {
        return service.findAll();
    }

    @PostMapping
    public Object create(@RequestBody LocalGoal body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable String id, @RequestBody LocalGoal body) {
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/contributions")
    public Object contribute(@PathVariable String id, @RequestBody LocalContribution body) {
        return service.contribute(id, body);
    }
}
