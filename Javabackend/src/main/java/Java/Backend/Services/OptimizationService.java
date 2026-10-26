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
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OptimizationService {

    private static final String PYTHON_ENGINE_URL = "http://localhost:5000/api/optimize";

    private final WardRepository wardRepository;
    private final HotspotRepository hotspotRepository;
    private final ScenarioRepository scenarioRepository;
    private final RestTemplate restTemplate;

    public OptimizationService(
            WardRepository wardRepository,
            HotspotRepository hotspotRepository,
            ScenarioRepository scenarioRepository,
            RestTemplate restTemplate) {
        this.wardRepository = wardRepository;
        this.hotspotRepository = hotspotRepository;
        this.scenarioRepository = scenarioRepository;
        this.restTemplate = restTemplate;
    }

    public Scenario runBudgetOptimizer(Long wardId, Double budget, String scenarioName) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found: " + wardId));
        List<Hotspot> hotspots = hotspotRepository.findByWard_Id(wardId);

        Map<Long, Double> vulnerabilityMap = new HashMap<>();
        Map<Long, List<String>> constraintsMap = new HashMap<>();
        for (Hotspot hotspot : hotspots) {
            vulnerabilityMap.put(hotspot.getId(), hotspot.getVulnerabilityScore());
            constraintsMap.put(
                    hotspot.getId(),
                    hotspot.getConstraints().stream()
                            .map(FieldConstraint::getRestrictionCategory)
                            .toList());
        }

        OptimizationRequest request = new OptimizationRequest();
        request.setBudget(budget);
        request.setHotspotVulnerabilityMap(vulnerabilityMap);
        request.setActiveConstraints(constraintsMap);

        OptimizationResponse response = restTemplate.postForObject(
                PYTHON_ENGINE_URL,
                request,
                OptimizationResponse.class);
        if (response == null) {
            throw new IllegalStateException("Optimization engine returned an empty response");
        }

        Scenario scenario = new Scenario();
        scenario.setWard(ward);
        scenario.setScenarioName(scenarioName);
        scenario.setTotalAllocatedCost(response.getTotalAllocatedCost());
        scenario.setPredictedCoolingBenefit(response.getPredictedCoolingBenefit());
        scenario.setEstimatedCo2Impact(response.getEstimatedCo2Impact());
        scenario.setAllocationsJson(response.getAllocationsJson());

        return scenarioRepository.save(scenario);
    }
}
