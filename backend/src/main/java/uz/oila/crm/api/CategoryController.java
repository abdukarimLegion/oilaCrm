package uz.oila.crm.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.domain.Category;
import uz.oila.crm.repo.CategoryRepository;
import uz.oila.crm.service.LocalDto.LocalBudgets;

import java.util.List;

/**
 * Тоифалар — GET ва бджет лимиттулари (daily/weekly/monthly) ваefactiern.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Category> findAll() {
        return repository.findAll();
    }

    @PutMapping("/{id}/budgets")
    public Category updateBudgets(@PathVariable String id, @RequestBody LocalBudgets body) {
        Category c = repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Toifa topilmadi: " + id));
        if (body.dailyBudget() != null) c.setDailyBudget(body.dailyBudget());
        if (body.weeklyBudget() != null) c.setWeeklyBudget(body.weeklyBudget());
        if (body.monthlyBudget() != null) c.setMonthlyBudget(body.monthlyBudget());
        return repository.save(c);
    }
}
