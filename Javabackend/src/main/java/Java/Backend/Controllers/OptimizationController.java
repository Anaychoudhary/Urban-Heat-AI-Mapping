package Java.Backend.Controllers;

import Java.Backend.DTO.OptimizationRequest;
import Java.Backend.DTO.ScenarioResponse;
import Java.Backend.Entities.Scenario;
import Java.Backend.Repositories.ScenarioRepository;
import Java.Backend.Services.OptimizationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/optimization")
@CrossOrigin(origins = "*")
@Validated
public class OptimizationController {

    private final OptimizationService optimizationService;
    private final ScenarioRepository scenarioRepository;

    public OptimizationController(
            OptimizationService optimizationService,
            ScenarioRepository scenarioRepository) {
        this.optimizationService = optimizationService;
        this.scenarioRepository = scenarioRepository;
    }

    @PostMapping("/run")
    public ResponseEntity<ScenarioResponse> runOptimization(
            @Positive @RequestParam Long wardId,
            @DecimalMin("100000.00") @RequestParam Double budget,
            @RequestParam(defaultValue = "Baseline AI Plan") String scenarioName) {

        Scenario result = optimizationService.runBudgetOptimizer(wardId, budget, scenarioName);
        return ResponseEntity.ok(ScenarioResponse.from(result));
    }

    // Endpoint supporting JSON Body with @Valid annotation
    @PostMapping("/run-json")
    public ResponseEntity<ScenarioResponse> runOptimizationJson(@Valid @RequestBody OptimizationRequest request) {
        Scenario result = optimizationService.runBudgetOptimizer(
                request.getWardId(),
                request.getBudget(),
                request.getScenarioName()
        );
        return ResponseEntity.ok(ScenarioResponse.from(result));
    }

    @GetMapping("/scenarios/{wardId}")
    public ResponseEntity<List<ScenarioResponse>> getScenarios(@PathVariable Long wardId) {
        List<ScenarioResponse> scenarios = scenarioRepository
                .findByWard_IdOrderByCreatedAtDesc(wardId)
                .stream()
                .map(ScenarioResponse::from)
                .toList();
        return ResponseEntity.ok(scenarios);
    }
}