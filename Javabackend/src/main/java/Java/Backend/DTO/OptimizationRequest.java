package Java.Backend.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OptimizationRequest {

    @NotNull(message = "Ward ID is mandatory")
    @Positive(message = "Ward ID must be positive")
    private Long wardId;

    @NotNull(message = "Budget is mandatory")
    @DecimalMin(value = "100000.00", message = "Minimum allocation budget is ₹1,00,000")
    private Double budget;

    @NotBlank(message = "Scenario name must not be blank")
    private String scenarioName = "Baseline AI Plan";

    public Long getWardId() { return wardId; }
    public void setWardId(Long wardId) { this.wardId = wardId; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getScenarioName() { return scenarioName; }
    public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }
}