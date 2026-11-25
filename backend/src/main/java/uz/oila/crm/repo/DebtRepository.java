package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.Debt;

public interface DebtRepository extends JpaRepository<Debt, String> {
}
