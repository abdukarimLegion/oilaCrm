package uz.oila.crm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.oila.crm.domain.FamilyMember;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, String> {
}
