package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
}
