package Java.Backend.Repositories;

import Java.Backend.Entities.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {
    @EntityGraph(attributePaths = "constraints")
    List<Hotspot> findByWard_Id(Long wardId);
}