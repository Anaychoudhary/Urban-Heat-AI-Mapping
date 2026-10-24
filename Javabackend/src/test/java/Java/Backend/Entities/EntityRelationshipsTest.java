package Java.Backend.Entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import Java.Backend.UrbanHeat.UrbanHeatApplication;
import jakarta.persistence.Entity;
import org.junit.jupiter.api.Test;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

class EntityRelationshipsTest {

    @Test
    void entityPackageIsIncludedInJpaScanning() {
        EntityScan entityScan = UrbanHeatApplication.class.getAnnotation(EntityScan.class);

        assertNotNull(entityScan);
        assertEquals(Ward.class, entityScan.basePackageClasses()[0]);
        assertTrue(Ward.class.isAnnotationPresent(Entity.class));
        assertTrue(Hotspot.class.isAnnotationPresent(Entity.class));
        assertTrue(FieldConstraint.class.isAnnotationPresent(Entity.class));
        assertTrue(Scenario.class.isAnnotationPresent(Entity.class));
    }

    @Test
    void keepsWardAndHotspotRelationshipInSync() {
        Ward firstWard = new Ward();
        Ward secondWard = new Ward();
        Hotspot hotspot = new Hotspot();

        firstWard.addHotspot(hotspot);

        assertSame(firstWard, hotspot.getWard());
        assertEquals(1, firstWard.getHotspots().size());

        hotspot.setWard(secondWard);

        assertEquals(0, firstWard.getHotspots().size());
        assertSame(secondWard, hotspot.getWard());
        assertEquals(1, secondWard.getHotspots().size());

        assertEquals(1, secondWard.getHotspots().size());
    }

    @Test
    void keepsHotspotAndFieldConstraintRelationshipInSync() {
        Hotspot firstHotspot = new Hotspot();
        Hotspot secondHotspot = new Hotspot();
        FieldConstraint constraint = new FieldConstraint();

        assertFalse(firstHotspot.isRestricted());

        firstHotspot.addConstraint(constraint);

        assertSame(firstHotspot, constraint.getHotspot());
        assertEquals(1, firstHotspot.getConstraints().size());

        constraint.setHotspot(secondHotspot);

        assertEquals(0, firstHotspot.getConstraints().size());
        assertSame(secondHotspot, constraint.getHotspot());
        assertEquals(1, secondHotspot.getConstraints().size());

        assertEquals(1, secondHotspot.getConstraints().size());
    }
}
