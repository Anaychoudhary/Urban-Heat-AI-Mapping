package Java.Backend.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "field_constraints")
public class FieldConstraint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotspot_id", nullable = false)
    private Hotspot hotspot;

    private String restrictionCategory;
    private String fieldNotes;
    private String photoUrl;

    private LocalDateTime reportedAt;

    @PrePersist
    protected void onCreate() {
        if (reportedAt == null) {
            reportedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Hotspot getHotspot() {
        return hotspot;
    }

    public void setHotspot(Hotspot hotspot) {
        if (this.hotspot == hotspot) {
            return;
        }
        Hotspot previousHotspot = this.hotspot;
        this.hotspot = hotspot;
        if (previousHotspot != null) {
            previousHotspot.removeConstraintReference(this);
        }
        if (hotspot != null) {
            hotspot.addConstraintReference(this);
        }
    }

    public String getRestrictionCategory() {
        return restrictionCategory;
    }

    public void setRestrictionCategory(String restrictionCategory) {
        this.restrictionCategory = restrictionCategory;
    }

    public String getFieldNotes() {
        return fieldNotes;
    }

    public void setFieldNotes(String fieldNotes) {
        this.fieldNotes = fieldNotes;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }
}