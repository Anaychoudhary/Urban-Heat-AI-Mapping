package Java.Backend.Controllers;

import Java.Backend.DTO.HotspotResponse;
import Java.Backend.DTO.ScenarioResponse;
import Java.Backend.Entities.Scenario;
import Java.Backend.Repositories.HotspotRepository;
import Java.Backend.Services.FieldConstraintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/field")
@CrossOrigin(origins = "*")
public class FieldController {

    private final FieldConstraintService fieldConstraintService;
    private final HotspotRepository hotspotRepository;

    public FieldController(
            FieldConstraintService fieldConstraintService,
            HotspotRepository hotspotRepository) {
        this.fieldConstraintService = fieldConstraintService;
        this.hotspotRepository = hotspotRepository;
    }

    @GetMapping("/hotspots/{wardId}")
    public ResponseEntity<List<HotspotResponse>> getHotspotsByWard(@PathVariable Long wardId) {
        List<HotspotResponse> hotspots = hotspotRepository.findByWard_Id(wardId)
                .stream()
                .map(HotspotResponse::from)
                .toList();
        return ResponseEntity.ok(hotspots);
    }

    @PostMapping("/constraint")
    public ResponseEntity<ScenarioResponse> reportConstraint(
            @RequestParam Long hotspotId,
            @RequestParam String category,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String photoUrl,
            @RequestParam Double currentBudget) {
        Scenario scenario = fieldConstraintService.addConstraintAndReoptimize(
                hotspotId, category, notes, photoUrl, currentBudget);
        return ResponseEntity.ok(ScenarioResponse.from(scenario));
    }
}
