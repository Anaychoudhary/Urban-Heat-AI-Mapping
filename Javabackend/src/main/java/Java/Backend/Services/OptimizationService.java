package Java.Backend.Services;

import Java.Backend.DTO.OptimizationResponse;
import Java.Backend.Entities.FieldConstraint;
import Java.Backend.Entities.Hotspot;
import Java.Backend.Entities.Scenario;
import Java.Backend.Entities.Ward;
import Java.Backend.Repositories.HotspotRepository;
import Java.Backend.Repositories.ScenarioRepository;
import Java.Backend.Repositories.WardRepository;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.core.codec.CodecException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeoutException;

@Service
public class OptimizationService {

    private static final Logger logger = LoggerFactory.getLogger(OptimizationService.class);
    private static final String DEFAULT_SCENARIO_NAME = "Baseline AI Plan";

    private final ScenarioRepository scenarioRepository;
    private final WardRepository wardRepository;
    private final HotspotRepository hotspotRepository;
    private final WebClient webClient;

    public OptimizationService(
            ScenarioRepository scenarioRepository,
            WardRepository wardRepository,
            HotspotRepository hotspotRepository,
            WebClient webClient) {
        this.scenarioRepository = scenarioRepository;
        this.wardRepository = wardRepository;
        this.hotspotRepository = hotspotRepository;
        this.webClient = webClient;
    }

    /**
     * Synchronous call protected by Resilience4j Circuit Breaker.
     * If Python fails or times out (5 seconds), fallbackOptimization() executes automatically.
     */
    @CircuitBreaker(name = "pythonEngine", fallbackMethod = "fallbackOptimization")
    public Scenario runBudgetOptimizer(Long wardId, Double budget, String scenarioName) {
        if (wardId == null || wardId <= 0) {
            throw new IllegalArgumentException("Ward ID must be positive");
        }
        if (budget == null || !Double.isFinite(budget) || budget < 100000) {
            throw new IllegalArgumentException("Minimum allocation budget is ₹1,00,000");
        }

        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found with ID: " + wardId));

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

        Map<String, Object> requestToPython = new HashMap<>();
        requestToPython.put("budget", budget);
        requestToPython.put("hotspotVulnerabilityMap", vulnerabilityMap);
        requestToPython.put("activeConstraints", constraintsMap);

        OptimizationResponse pythonData = webClient.post()
                .uri("/api/optimize")
                .bodyValue(requestToPython)
                .retrieve()
                .bodyToMono(OptimizationResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
        if (pythonData == null
                || pythonData.getTotalAllocatedCost() == null
                || pythonData.getPredictedCoolingBenefit() == null
                || pythonData.getEstimatedCo2Impact() == null
                || pythonData.getAllocationsJson() == null) {
            throw new OptimizationEngineException("Optimization engine returned an incomplete response");
        }

        Scenario plan = new Scenario();
        plan.setWard(ward);
        plan.setScenarioName(normalizeScenarioName(scenarioName));
        plan.setTotalAllocatedCost(pythonData.getTotalAllocatedCost());
        plan.setPredictedCoolingBenefit(pythonData.getPredictedCoolingBenefit());
        plan.setEstimatedCo2Impact(pythonData.getEstimatedCo2Impact());
        plan.setAllocationsJson(pythonData.getAllocationsJson());

        return scenarioRepository.save(plan);
    }

    /**
     * Asynchronous background execution (@Async).
     * Non-blocking for long-running scenario modeling.
     */
    @Async
    @CircuitBreaker(name = "pythonEngine", fallbackMethod = "fallbackOptimizationAsync")
    public CompletableFuture<Scenario> runBudgetOptimizerAsync(Long wardId, Double budget, String scenarioName) {
        Scenario result = runBudgetOptimizer(wardId, budget, scenarioName);
        return CompletableFuture.completedFuture(result);
    }

    /**
     * Circuit Breaker Fallback: Executes gracefully when Python is down or unreachable.
     */
    public Scenario fallbackOptimization(Long wardId, Double budget, String scenarioName, Throwable t) {
        if (!isOptimizationEngineFailure(t)) {
            if (t instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new IllegalStateException("Optimization failed", t);
        }
        if (wardId == null || wardId <= 0 || budget == null || !Double.isFinite(budget) || budget < 100000) {
            throw new IllegalArgumentException("Optimization request is invalid", t);
        }

        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found with ID: " + wardId, t));
        logger.warn("Python optimization unavailable; saving fallback scenario: {}", t.getMessage());

        Scenario fallbackPlan = new Scenario();
        fallbackPlan.setWard(ward);
        fallbackPlan.setScenarioName(normalizeScenarioName(scenarioName) + " (Offline Fallback)");
        fallbackPlan.setTotalAllocatedCost(BigDecimal.valueOf(budget * 0.95));
        fallbackPlan.setPredictedCoolingBenefit(2.4);
        fallbackPlan.setEstimatedCo2Impact(150.0);
        fallbackPlan.setAllocationsJson("{\"status\":\"FALLBACK\",\"note\":\"Python AI service offline. Showing cached baseline algorithm fallback.\"}");

        return scenarioRepository.save(fallbackPlan);
    }

    public CompletableFuture<Scenario> fallbackOptimizationAsync(
            Long wardId, Double budget, String scenarioName, Throwable t) {
        return CompletableFuture.completedFuture(fallbackOptimization(wardId, budget, scenarioName, t));
    }

    private String normalizeScenarioName(String scenarioName) {
        return scenarioName == null || scenarioName.isBlank() ? DEFAULT_SCENARIO_NAME : scenarioName;
    }

    private boolean isOptimizationEngineFailure(Throwable throwable) {
        for (Throwable cause = throwable; cause != null; cause = cause.getCause()) {
            if (cause instanceof WebClientException
                    || cause instanceof CodecException
                    || cause instanceof TimeoutException
                    || cause instanceof CallNotPermittedException
                    || cause instanceof OptimizationEngineException) {
                return true;
            }
        }
        return false;
    }

    private static final class OptimizationEngineException extends RuntimeException {
        private OptimizationEngineException(String message) {
            super(message);
        }
    }
}