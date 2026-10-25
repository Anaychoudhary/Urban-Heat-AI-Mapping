package Java.Backend.DTO;

import java.util.List;
import java.util.Map;

public class OptimizationRequest {

    private Double budget;
    private Map<Long, Double> hotspotVulnerabilityMap;
    private Map<Long, List<String>> activeConstraints;

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public Map<Long, Double> getHotspotVulnerabilityMap() { return hotspotVulnerabilityMap; }
    public void setHotspotVulnerabilityMap(Map<Long, Double> hotspotVulnerabilityMap) { this.hotspotVulnerabilityMap = hotspotVulnerabilityMap; }
    public Map<Long, List<String>> getActiveConstraints() { return activeConstraints; }
    public void setActiveConstraints(Map<Long, List<String>> activeConstraints) { this.activeConstraints = activeConstraints; }
}