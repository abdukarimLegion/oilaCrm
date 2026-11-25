package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
}
