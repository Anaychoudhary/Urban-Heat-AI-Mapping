package Java.Backend.Services;

import Java.Backend.Entities.FieldConstraint;
import Java.Backend.Entities.Hotspot;
import Java.Backend.Entities.Scenario;
import Java.Backend.Repositories.FieldConstraintRepository;
import Java.Backend.Repositories.HotspotRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FieldConstraintService {

    private final FieldConstraintRepository constraintRepository;
    private final HotspotRepository hotspotRepository;
    private final OptimizationService optimizationService;

    public FieldConstraintService(
            FieldConstraintRepository constraintRepository,
            HotspotRepository hotspotRepository,
            OptimizationService optimizationService) {
        this.constraintRepository = constraintRepository;
        this.hotspotRepository = hotspotRepository;
        this.optimizationService = optimizationService;
    }

    @Transactional
    public Scenario addConstraintAndReoptimize(
            Long hotspotId,
            String category,
            String notes,
            String photoUrl,
            Double currentBudget) {
        Hotspot hotspot = hotspotRepository.findById(hotspotId)
                .orElseThrow(() -> new EntityNotFoundException("Hotspot not found: " + hotspotId));

        FieldConstraint constraint = new FieldConstraint();
        constraint.setHotspot(hotspot);
        constraint.setRestrictionCategory(category);
        constraint.setFieldNotes(notes);
        constraint.setPhotoUrl(photoUrl);
        constraintRepository.save(constraint);

        String scenarioName =
                "Recalculated Plan (Due to " + category + " at " + hotspot.getLocationName() + ")";
        return optimizationService.runBudgetOptimizer(
                hotspot.getWard().getId(),
                currentBudget,
                scenarioName);
    }
}
