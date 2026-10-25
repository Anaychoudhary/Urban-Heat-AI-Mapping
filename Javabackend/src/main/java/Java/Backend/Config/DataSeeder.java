package Java.Backend.Config;

import Java.Backend.Entities.Hotspot;
import Java.Backend.Entities.Ward;
import Java.Backend.Repositories.WardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final WardRepository wardRepository;

    public DataSeeder(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    @Override
    public void run(String... args) {
        if (wardRepository.count() > 0) {
            logger.info("Database already contains wards; skipping sample data seeding.");
            return;
        }

        Ward shivajinagar = new Ward();
        shivajinagar.setName("Shivajinagar");

        Ward kothrud = new Ward();
        kothrud.setName("Kothrud");

        shivajinagar.addHotspot(createHotspot(
                "JM Road Commercial Zone", 18.5246, 73.8436, 0.89, 43.5));
        shivajinagar.addHotspot(createHotspot(
                "Pune Railway Station Auto Stand", 18.5289, 73.8744, 0.94, 45.1));
        shivajinagar.addHotspot(createHotspot(
                "FC Road Pedestrian Pathway", 18.5212, 73.8391, 0.65, 39.8));
        kothrud.addHotspot(createHotspot(
                "Karve Road Junction", 18.5033, 73.8126, 0.78, 41.2));

        wardRepository.saveAll(List.of(shivajinagar, kothrud));
        logger.info("Seeded 2 wards and 4 hotspots.");
    }

    private static Hotspot createHotspot(
            String locationName,
            double latitude,
            double longitude,
            double vulnerabilityScore,
            double landSurfaceTemp) {
        Hotspot hotspot = new Hotspot();
        hotspot.setLocationName(locationName);
        hotspot.setLatitude(latitude);
        hotspot.setLongitude(longitude);
        hotspot.setVulnerabilityScore(vulnerabilityScore);
        hotspot.setLandSurfaceTemp(landSurfaceTemp);
        return hotspot;
    }
}
