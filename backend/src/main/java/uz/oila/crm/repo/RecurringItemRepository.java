package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.RecurringItem;

public interface RecurringItemRepository extends JpaRepository<RecurringItem, String> {

    java.util.List<RecurringItem> findByIsActiveTrueAndAutoPostTrue();
}
