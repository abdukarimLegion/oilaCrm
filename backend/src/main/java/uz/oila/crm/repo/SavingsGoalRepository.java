package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.SavingsGoal;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, String> {
}
