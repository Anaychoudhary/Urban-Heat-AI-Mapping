package Java.Backend.DTO;

import java.math.BigDecimal;

public class OptimizationResponse {

    private BigDecimal totalAllocatedCost;
    private Double predictedCoolingBenefit;
    private Double estimatedCo2Impact;
    private String allocationsJson;

    public BigDecimal getTotalAllocatedCost() { return totalAllocatedCost; }
    public void setTotalAllocatedCost(BigDecimal totalAllocatedCost) { this.totalAllocatedCost = totalAllocatedCost; }
    public Double getPredictedCoolingBenefit() { return predictedCoolingBenefit; }
    public void setPredictedCoolingBenefit(Double predictedCoolingBenefit) { this.predictedCoolingBenefit = predictedCoolingBenefit; }
    public Double getEstimatedCo2Impact() { return estimatedCo2Impact; }
    public void setEstimatedCo2Impact(Double estimatedCo2Impact) { this.estimatedCo2Impact = estimatedCo2Impact; }
    public String getAllocationsJson() { return allocationsJson; }
    public void setAllocationsJson(String allocationsJson) { this.allocationsJson = allocationsJson; }
}