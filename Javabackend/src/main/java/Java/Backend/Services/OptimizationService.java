package Java.Backend.Services;

import Java.Backend.DTO.OptimizationRequest;
import Java.Backend.DTO.OptimizationResponse;
import Java.Backend.Entities.FieldConstraint;
import Java.Backend.Entities.Hotspot;
import Java.Backend.Entities.Scenario;
import Java.Backend.Entities.Ward;
import Java.Backend.Repositories.HotspotRepository;
import Java.Backend.Repositories.ScenarioRepository;
import Java.Backend.Repositories.WardRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OptimizationService {

    private final WardRepository wardRepository;
    private final HotspotRepository hotspotRepository;
    private final ScenarioRepository scenarioRepository;

    private static final String PYTHON_ENGINE_URL = "http://localhost:5000/api/optimize";
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    public OptimizationService(
            WardRepository wardRepository,
            HotspotRepository hotspotRepository,
            ScenarioRepository scenarioRepository) {
        this.wardRepository = wardRepository;
        this.hotspotRepository = hotspotRepository;
        this.scenarioRepository = scenarioRepository;
    }

    public Scenario runBudgetOptimizer(Long wardId, Double budget, String scenarioName) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        List<Hotspot> hotspots = hotspotRepository.findByWard_Id(wardId);

        OptimizationRequest request = new OptimizationRequest();
        request.setBudget(budget);

        Map<Long, Double> vulnerabilityMap = new HashMap<>();
        Map<Long, List<String>> constraintsMap = new HashMap<>();

        for (Hotspot hotspot : hotspots) {
            vulnerabilityMap.put(hotspot.getId(), hotspot.getVulnerabilityScore());

            if (hotspot.getConstraints() != null) {
                List<String> constraintNames = hotspot.getConstraints().stream()
                        .map(FieldConstraint::getRestrictionCategory)
                        .collect(Collectors.toList());
                constraintsMap.put(hotspot.getId(), constraintNames);
            }
        }

        request.setHotspotVulnerabilityMap(vulnerabilityMap);
        request.setActiveConstraints(constraintsMap);

        OptimizationResponse pythonResponse = restTemplate.postForObject(
                PYTHON_ENGINE_URL,
                request,
                OptimizationResponse.class
        );
        if (pythonResponse == null) {
            throw new IllegalStateException("Optimization engine returned an empty response");
        }

        Scenario newScenario = new Scenario();
        newScenario.setWard(ward);
        newScenario.setScenarioName(scenarioName);
        BigDecimal totalAllocatedCost = pythonResponse.getTotalAllocatedCost();
        newScenario.setTotalAllocatedCost(totalAllocatedCost);
        newScenario.setPredictedCoolingBenefit(pythonResponse.getPredictedCoolingBenefit());
        newScenario.setEstimatedCo2Impact(pythonResponse.getEstimatedCo2Impact());
        newScenario.setAllocationsJson(pythonResponse.getAllocationsJson());

        return scenarioRepository.save(newScenario);
    }
}