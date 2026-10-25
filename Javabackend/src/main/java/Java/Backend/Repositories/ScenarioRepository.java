package Java.Backend.Repositories;

import Java.Backend.Entities.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    List<Scenario> findByWard_IdOrderByCreatedAtDesc(Long wardId);
}
