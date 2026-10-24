package Java.Backend.Entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(precision = 14, scale = 2)
    private BigDecimal currentBudgetLimit;

    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL)
    private List<Hotspot> hotspots = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCurrentBudgetLimit() {
        return currentBudgetLimit;
    }

    public void setCurrentBudgetLimit(BigDecimal currentBudgetLimit) {
        this.currentBudgetLimit = currentBudgetLimit;
    }

    public List<Hotspot> getHotspots() {
        return hotspots;
    }

    public void addHotspot(Hotspot hotspot) {
        Objects.requireNonNull(hotspot, "hotspot must not be null");
        if (hotspot.getWard() == this) {
            addHotspotReference(hotspot);
        } else {
            hotspot.setWard(this);
        }
    }

    void addHotspotReference(Hotspot hotspot) {
        if (!hotspots.contains(hotspot)) {
            hotspots.add(hotspot);
        }
    }

    void removeHotspotReference(Hotspot hotspot) {
        hotspots.remove(hotspot);
    }
}