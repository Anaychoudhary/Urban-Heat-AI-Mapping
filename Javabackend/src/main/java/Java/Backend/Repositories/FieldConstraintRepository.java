package Java.Backend.Repositories;

import Java.Backend.Entities.FieldConstraint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FieldConstraintRepository extends JpaRepository<FieldConstraint, Long> {
    List<FieldConstraint> findByHotspot_Id(Long hotspotId);
}