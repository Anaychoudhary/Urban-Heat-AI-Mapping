package Java.Backend.DTO;

import Java.Backend.Entities.Scenario;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ScenarioResponse(
        Long id,
        String scenarioName,
        BigDecimal totalAllocatedCost,
        Double predictedCoolingBenefit,
        Double estimatedCo2Impact,
        String allocationsJson,
        LocalDateTime createdAt) {

    public static ScenarioResponse from(Scenario scenario) {
        return new ScenarioResponse(
                scenario.getId(),
                scenario.getScenarioName(),
                scenario.getTotalAllocatedCost(),
                scenario.getPredictedCoolingBenefit(),
                scenario.getEstimatedCo2Impact(),
                scenario.getAllocationsJson(),
                scenario.getCreatedAt());
    }
}
