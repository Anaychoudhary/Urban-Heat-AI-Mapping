package Java.Backend.Controllers;

import Java.Backend.DTO.ScenarioResponse;
import Java.Backend.Entities.Scenario;
import Java.Backend.Repositories.ScenarioRepository;
import Java.Backend.Services.OptimizationService;
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
@RequestMapping("/api/optimization")
@CrossOrigin(origins = "*")
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
            @RequestParam Long wardId,
            @RequestParam Double budget,
            @RequestParam(required = false, defaultValue = "Baseline AI Plan") String scenarioName) {
        Scenario scenario = optimizationService.runBudgetOptimizer(wardId, budget, scenarioName);
        return ResponseEntity.ok(ScenarioResponse.from(scenario));
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
