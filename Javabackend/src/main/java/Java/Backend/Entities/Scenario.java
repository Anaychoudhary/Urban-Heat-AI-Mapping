package Java.Backend.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scenarios")
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    private String scenarioName;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalAllocatedCost;
    private Double predictedCoolingBenefit;
    private Double estimatedCo2Impact;

    @Column(columnDefinition = "TEXT")
    private String allocationsJson;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    public BigDecimal getTotalAllocatedCost() {
        return totalAllocatedCost;
    }

    public void setTotalAllocatedCost(BigDecimal totalAllocatedCost) {
        this.totalAllocatedCost = totalAllocatedCost;
    }

    public Double getPredictedCoolingBenefit() {
        return predictedCoolingBenefit;
    }

    public void setPredictedCoolingBenefit(Double predictedCoolingBenefit) {
        this.predictedCoolingBenefit = predictedCoolingBenefit;
    }

    public Double getEstimatedCo2Impact() {
        return estimatedCo2Impact;
    }

    public void setEstimatedCo2Impact(Double estimatedCo2Impact) {
        this.estimatedCo2Impact = estimatedCo2Impact;
    }

    public String getAllocationsJson() {
        return allocationsJson;
    }

    public void setAllocationsJson(String allocationsJson) {
        this.allocationsJson = allocationsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}