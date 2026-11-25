package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.Contact;

public interface ContactRepository extends JpaRepository<Contact, String> {
}
