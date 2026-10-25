package Java.Backend.DTO;

import Java.Backend.Entities.Hotspot;

public record HotspotResponse(
        Long id,
        String locationName,
        Double latitude,
        Double longitude,
        Double vulnerabilityScore,
        Double landSurfaceTemp) {

    public static HotspotResponse from(Hotspot hotspot) {
        return new HotspotResponse(
                hotspot.getId(),
                hotspot.getLocationName(),
                hotspot.getLatitude(),
                hotspot.getLongitude(),
                hotspot.getVulnerabilityScore(),
                hotspot.getLandSurfaceTemp());
    }
}
