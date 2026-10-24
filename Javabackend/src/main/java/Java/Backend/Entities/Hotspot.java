package Java.Backend.Entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "hotspots")
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    private String locationName;
    private Double latitude;
    private Double longitude;

    private Double vulnerabilityScore;
    private Double landSurfaceTemp;

    @Column(name = "is_restricted", nullable = false)
    private boolean restricted;

    @OneToMany(mappedBy = "hotspot", cascade = CascadeType.ALL)
    private List<FieldConstraint> constraints = new ArrayList<>();

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
        if (this.ward == ward) {
            return;
        }
        Ward previousWard = this.ward;
        this.ward = ward;
        if (previousWard != null) {
            previousWard.removeHotspotReference(this);
        }
        if (ward != null) {
            ward.addHotspotReference(this);
        }
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getVulnerabilityScore() {
        return vulnerabilityScore;
    }

    public void setVulnerabilityScore(Double vulnerabilityScore) {
        this.vulnerabilityScore = vulnerabilityScore;
    }

    public Double getLandSurfaceTemp() {
        return landSurfaceTemp;
    }

    public void setLandSurfaceTemp(Double landSurfaceTemp) {
        this.landSurfaceTemp = landSurfaceTemp;
    }

    public boolean isRestricted() {
        return restricted;
    }

    public void setRestricted(boolean restricted) {
        this.restricted = restricted;
    }

    public List<FieldConstraint> getConstraints() {
        return constraints;
    }

    public void addConstraint(FieldConstraint constraint) {
        Objects.requireNonNull(constraint, "constraint must not be null");
        if (constraint.getHotspot() == this) {
            addConstraintReference(constraint);
        } else {
            constraint.setHotspot(this);
        }
    }

    void addConstraintReference(FieldConstraint constraint) {
        if (!constraints.contains(constraint)) {
            constraints.add(constraint);
        }
    }

    void removeConstraintReference(FieldConstraint constraint) {
        constraints.remove(constraint);
    }
}