package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, String> {
}
