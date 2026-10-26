import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  Flame,
  Layers3,
  Leaf,
  Maximize2,
  MapPin,
  Minimize2,
  Trees,
  Wind,
} from "lucide-react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getHotspots } from "./apiService";
import type { Hotspot as ApiHotspot } from "./apiService";

export interface Ward {
  id: string;
  name: string;
}

export interface Intervention {
  name: string;
  impact: string;
  icon: "trees" | "roof" | "canopy";
}

export interface Hotspot {
  id: string;
  name: string;
  locality: string;
  coordinates: [number, number];
  surfaceTemp: number;
  ndvi?: number;
  vulnerabilityScore: number;
  vulnerablePopulation?: string;
  area?: string;
  risk: "Critical" | "Moderate" | "Low";
  interventions?: Intervention[];
}

interface City {
  id: string;
  name: string;
  region: string;
  center: [number, number];
  wards: Ward[];
}

const puneCenter: [number, number] = [18.5204, 73.8567];
const ALL_WARDS = "all";

const wards: Ward[] = [
  { id: "01", name: "Kalas - Dhanori - Remaining Lohgaon" },
  { id: "02", name: "Phulenagar - Nagpur Chawl" },
  { id: "03", name: "Viman nagar - Lohgaon" },
  { id: "04", name: "Kharadi - Wagholi" },
  { id: "05", name: "Kalyaninagar - Vadagaonsheri" },
  { id: "06", name: "Yerawada - Gandhinagar" },
  { id: "07", name: "Gokhale nagar - Wakadewadi" },
  { id: "08", name: "Aundh - Bopodi" },
  { id: "09", name: "Sus - Baner - Pashan" },
  { id: "10", name: "Bavdhan - Bhusari Colony" },
  { id: "11", name: "Ram Baug Colony - Shivtirthanagar" },
  { id: "12", name: "Ch. Shivajinagar - Model Colony" },
  { id: "13", name: "Pune Station - Jay Jawan Nagar" },
  { id: "14", name: "Koregaon Park - Ghorpadi - Mundhawa" },
  { id: "15", name: "Manjari Budruk - Keshavnagar - Sadesatara Nali" },
  { id: "16", name: "Hadapsar - Satavwadi" },
  { id: "17", name: "Ramtekdi - Malwadi - Vaiduwadi" },
  { id: "18", name: "Vanawadi - Salukhe Vihar" },
  { id: "19", name: "Kondhawa Khurd - Kausarbaug" },
  { id: "20", name: "Shankar Maharaj Math - Bibwewadi" },
  { id: "21", name: "Mukundnagar - Salisbury Park" },
  { id: "22", name: "Kashewadi - Dias Plot" },
  { id: "23", name: "Ravivar Peth - Nana Peth" },
  { id: "24", name: "Kasaba Ganpati - Kamala Nehru Hospital - K.E.M. Hospital" },
  { id: "25", name: "Shaniwar Peth - Mahatma Phule Mandai" },
  { id: "26", name: "Ghorpade Peth - Guruvar Peth - Samatabhumi" },
  { id: "27", name: "Navi Peth - Parvati" },
  { id: "28", name: "Janata Vasahat - Hingane Khurd" },
  { id: "29", name: "Deccan Gymkhana - Happy Colony" },
  { id: "30", name: "Karvenagar - Hingne Home Colony" },
  { id: "31", name: "Mayur Colony - Kothrud" },
  { id: "32", name: "Warje - Popular Nagar" },
  { id: "33", name: "Shivane - Khadakwasala - Dhayari (Part)" },
  { id: "34", name: "Narhe - Vadgaon Budruk - Dhayari" },
  { id: "35", name: "Suncity - Manik Bagh" },
  { id: "36", name: "Sahakarnagar - Padmavati" },
  { id: "37", name: "Dhankawadi - Katraj Dairy" },
  { id: "38", name: "Balaji Nagar - Ambegaon - Katraj" },
  { id: "39", name: "Uppar Super Indiranagar" },
  { id: "40", name: "Kondhwa Budruk - Yewalewadi" },
  { id: "41", name: "Mohammadwadi - Undri" },
];

const hotspots: Hotspot[] = [
  {
    id: "A",
    name: "Hotspot A",
    locality: "Shivajinagar",
    coordinates: [18.5314, 73.8478],
    surfaceTemp: 43.5,
    ndvi: 0.12,
    vulnerabilityScore: 0.85,
    vulnerablePopulation: "12,480",
    area: "1.8 km²",
    risk: "Critical",
    interventions: [
      { name: "Street-side tree clusters", impact: "−2.4°C", icon: "trees" },
      { name: "Cool roofs · 1,240 homes", impact: "−1.8°C", icon: "roof" },
      { name: "Bus-stop shade canopies", impact: "−1.2°C", icon: "canopy" },
    ],
  },
  {
    id: "B",
    name: "Hotspot B",
    locality: "Hadapsar",
    coordinates: [18.5018, 73.9272],
    surfaceTemp: 42.4,
    ndvi: 0.18,
    vulnerabilityScore: 0.78,
    vulnerablePopulation: "9,260",
    area: "2.1 km²",
    risk: "Critical",
    interventions: [
      { name: "Neighbourhood tree clusters", impact: "−2.1°C", icon: "trees" },
      { name: "Cool roofs · 860 homes", impact: "−1.5°C", icon: "roof" },
      { name: "Market shade canopies", impact: "−1.0°C", icon: "canopy" },
    ],
  },
  {
    id: "C",
    name: "Hotspot C",
    locality: "Kothrud",
    coordinates: [18.5074, 73.8077],
    surfaceTemp: 39.6,
    ndvi: 0.24,
    vulnerabilityScore: 0.67,
    vulnerablePopulation: "7,940",
    area: "1.4 km²",
    risk: "Moderate",
    interventions: [
      { name: "Pocket park tree planting", impact: "−1.8°C", icon: "trees" },
      { name: "Cool roofs · 540 homes", impact: "−1.3°C", icon: "roof" },
      { name: "Schoolyard shade canopies", impact: "−0.8°C", icon: "canopy" },
    ],
  },
  {
    id: "D",
    name: "Hotspot D",
    locality: "Aundh",
    coordinates: [18.559, 73.8075],
    surfaceTemp: 38.9,
    ndvi: 0.29,
    vulnerabilityScore: 0.54,
    vulnerablePopulation: "5,180",
    area: "1.2 km²",
    risk: "Moderate",
    interventions: [
      { name: "Roadside native trees", impact: "−1.5°C", icon: "trees" },
      { name: "Cool roofs · 380 homes", impact: "−1.0°C", icon: "roof" },
      { name: "Transit stop canopies", impact: "−0.7°C", icon: "canopy" },
    ],
  },
];

const cities: City[] = [
  { id: "pune", name: "Pune", region: "Maharashtra", center: puneCenter, wards },
  { id: "mumbai", name: "Mumbai", region: "Maharashtra", center: [19.076, 72.8777], wards: [] },
  { id: "delhi", name: "Delhi", region: "Delhi", center: [28.6139, 77.209], wards: [] },
  { id: "nagpur", name: "Nagpur", region: "Maharashtra", center: [21.1458, 79.0882], wards: [] },
  { id: "noida", name: "Noida", region: "Uttar Pradesh", center: [28.5355, 77.391], wards: [] },
  { id: "chennai", name: "Chennai", region: "Tamil Nadu", center: [13.0827, 80.2707], wards: [] },
  { id: "ahmedabad", name: "Ahmedabad", region: "Gujarat", center: [23.0225, 72.5714], wards: [] },
  { id: "kolkata", name: "Kolkata", region: "West Bengal", center: [22.5726, 88.3639], wards: [] },
  { id: "bengaluru", name: "Bengaluru", region: "Karnataka", center: [12.9716, 77.5946], wards: [] },
  { id: "hyderabad", name: "Hyderabad", region: "Telangana", center: [17.385, 78.4867], wards: [] },
];

type MapLayer = "all" | "risk-zones" | "hotspots" | "base-map";

const getRiskColor = (risk: Hotspot["risk"]) => {
  if (risk === "Critical") return "#fb6470";
  if (risk === "Moderate") return "#f4ad54";
  return "#34d399";
};

const getTemperatureRisk = (temperature: number): Hotspot["risk"] => {
  if (temperature > 42) return "Critical";
  if (temperature >= 38) return "Moderate";
  return "Low";
};

const createHotspotIcon = (hotspot: Hotspot, selected: boolean) =>
  L.divIcon({
    className: "",
    html: `<div class="hotspot-marker ${selected ? "hotspot-marker--selected" : ""} hotspot-marker--${hotspot.risk.toLowerCase()}">
      <span class="hotspot-marker__pulse"></span>
      <span class="hotspot-marker__label">${hotspot.id}</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

function MapViewport({
  target,
}: {
  target: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(target, 13, { duration: 0.8 });
  }, [map, target]);

  return null;
}

function MapSizeHandler({ resizeKey }: { resizeKey: boolean }) {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [map, resizeKey]);

  return null;
}

export default function Page1HeatRiskMap() {
  const [selectedCityId, setSelectedCityId] = useState("pune");
  const [selectedWardId, setSelectedWardId] = useState("01");
  const [selectedHotspotId, setSelectedHotspotId] = useState("");
  const [mapLayer, setMapLayer] = useState<MapLayer>("all");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapTarget, setMapTarget] = useState<[number, number]>(puneCenter);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const [mapTilesUnavailable, setMapTilesUnavailable] = useState(false);
  const [wardHotspots, setWardHotspots] = useState<ApiHotspot[]>([]);
  const [isLoadingWardHotspots, setIsLoadingWardHotspots] = useState(false);
  const [wardHotspotsError, setWardHotspotsError] = useState<string | null>(null);

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const availableWards = selectedCity?.wards ?? [];
  const selectedWardData = availableWards.find(
    (ward) => ward.id === selectedWardId,
  );
  const wardMapHotspots = useMemo<Hotspot[]>(
    () =>
      wardHotspots.map((hotspot) => {
        const vulnerability =
          hotspot.vulnerabilityScore > 1
            ? hotspot.vulnerabilityScore / 10
            : hotspot.vulnerabilityScore;
        return {
          id: String(hotspot.id),
          name: hotspot.locationName,
          locality: hotspot.locationName,
          coordinates: [hotspot.latitude, hotspot.longitude],
          surfaceTemp: hotspot.landSurfaceTemp,
          vulnerabilityScore: vulnerability,
          risk: getTemperatureRisk(hotspot.landSurfaceTemp),
        };
      }),
    [wardHotspots],
  );
  const visibleHotspots =
    selectedCityId === "pune" && selectedWardData
      ? wardMapHotspots
      : selectedCityId === "pune" && selectedWardId === ALL_WARDS
        ? hotspots
        : [];
  const selectedHotspot = visibleHotspots.find(
    (hotspot) => hotspot.id === selectedHotspotId,
  );
  const showRiskZones = mapLayer === "all" || mapLayer === "risk-zones";
  const showHotspotMarkers = mapLayer === "all" || mapLayer === "hotspots";

  useEffect(() => {
    if (!selectedWardData || selectedCityId !== "pune") {
      setWardHotspots([]);
      setWardHotspotsError(null);
      setIsLoadingWardHotspots(false);
      return;
    }

    const controller = new AbortController();
    setWardHotspots([]);
    setIsLoadingWardHotspots(true);
    setWardHotspotsError(null);

    getHotspots(Number(selectedWardData.id), controller.signal)
      .then((items) => {
        setWardHotspots(items);
        setSelectedHotspotId(items[0] ? String(items[0].id) : "");
        if (items[0]) setMapTarget([items[0].latitude, items[0].longitude]);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setWardHotspotsError(
            error instanceof Error ? error.message : "Could not load ward hotspots.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingWardHotspots(false);
      });

    return () => controller.abort();
  }, [selectedCityId, selectedWardData]);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsMapFullscreen(document.fullscreenElement === mapPanelRef.current);
    };
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const handleCityChange = (cityId: string) => {
    const city = cities.find((item) => item.id === cityId);
    setSelectedCityId(cityId);
    setSelectedWardId(ALL_WARDS);
    setSelectedHotspotId("");
    setMapTarget(city?.center ?? puneCenter);
  };

  const handleWardChange = (wardId: string) => {
    setSelectedWardId(wardId);
    if (wardId === ALL_WARDS) {
      setSelectedHotspotId("");
      setMapTarget(selectedCity?.center ?? puneCenter);
      return;
    }
    setSelectedHotspotId("");
    setMapTarget(selectedCity?.center ?? puneCenter);
  };

  const selectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspotId(hotspot.id);
    setMapTarget(hotspot.coordinates);
  };

  const toggleMapFullscreen = () => {
    const mapPanel = mapPanelRef.current;
    if (!mapPanel) return;
    if (document.fullscreenElement === mapPanel) {
      void document.exitFullscreen();
    } else {
      void mapPanel.requestFullscreen();
    }
  };

  return (
    <main className="theme-warm min-h-screen bg-[#0a1017] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-[38%] h-[440px] w-[440px] rounded-full bg-rose-500/[0.035] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-emerald-400/[0.025] blur-[110px]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.07] bg-[#0c131b]/90">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-3 sm:px-8">
          <a href="/page1" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.09] text-rose-300">
              <Flame size={21} strokeWidth={1.8} />
            </span>
            <span className="truncate text-sm font-semibold tracking-wide text-slate-100 sm:text-base">
              Urban-Heat-AI-Mapping
            </span>
          </a>

          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto sm:ml-auto">
            <label className="flex min-w-[150px] flex-1 flex-col gap-1 sm:flex-none">
              <span className="text-base font-medium text-slate-500">Select City</span>
              <span className="relative">
                <select
                  aria-label="Select City"
                  value={selectedCityId}
                  onChange={(event) => handleCityChange(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-white/[0.09] bg-[#111a24] py-2 pl-3.5 pr-10 text-base font-medium text-slate-200 outline-none transition hover:border-white/20 focus:border-emerald-400/50 sm:min-w-[160px]"
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </span>
            </label>

            <label className="flex min-w-[170px] flex-1 flex-col gap-1 sm:flex-none">
              <span className="text-base font-medium text-slate-500">Select Ward</span>
              <span className="relative">
                <select
                  aria-label="Select Ward"
                  value={selectedWardId}
                  disabled={!selectedCity || availableWards.length === 0}
                  onChange={(event) => handleWardChange(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-white/[0.09] bg-[#111a24] py-2 pl-3.5 pr-10 text-base font-medium text-slate-200 outline-none transition hover:border-white/20 focus:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[190px]"
                >
                  <option value={ALL_WARDS}>
                    {availableWards.length ? "All Wards" : selectedCity ? "Ward data unavailable" : "Select a city"}
                  </option>
                  {availableWards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name} (Ward {ward.id})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </span>
            </label>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <button
              type="button"
              aria-label="Help"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200 sm:flex"
            >
              <CircleHelp size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-8 pt-6 sm:px-8">
        <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[23px] font-semibold tracking-tight text-white sm:text-[27px]">
              Heat risk command map
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-base text-slate-400">
            <Clock3 size={14} className="text-slate-500" />
            Data updated <span className="font-medium text-slate-300">Project sample</span>
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div
            ref={mapPanelRef}
            className="map-panel flex min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e161f] shadow-sm sm:min-h-[560px] lg:col-span-2"
          >
            <div className="flex flex-col gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center">
                <span className="rounded-lg bg-emerald-900/[0.08] px-3 py-2 text-base font-semibold text-emerald-800">
                  Heat Map
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#111a24] px-2.5">
                  <Layers3 size={14} className="text-slate-500" />
                  <select
                    aria-label="Map layer"
                    value={mapLayer}
                    onChange={(event) => {
                      const layer = event.currentTarget.value;
                      if (
                        layer === "all" ||
                        layer === "risk-zones" ||
                        layer === "hotspots" ||
                        layer === "base-map"
                      ) {
                        setMapLayer(layer);
                      }
                    }}
                    className="h-9 min-w-28 bg-transparent text-sm text-slate-200 outline-none focus:border-emerald-400/50"
                  >
                    <option value="all">Risk zones & hotspots</option>
                    <option value="risk-zones">Risk zones only</option>
                    <option value="hotspots">Hotspots only</option>
                    <option value="base-map">Base map only</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#111a24] px-2.5">
                  <Clock3 size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-400">Date</span>
                  <select
                    aria-label="Map date"
                    disabled
                    title="Date filtering is unavailable because the connected dataset has no dated time series."
                    className="h-9 bg-transparent text-sm text-slate-400 opacity-70"
                  >
                    <option>Latest available</option>
                  </select>
                </label>
                <button
                  type="button"
                  aria-label={isMapFullscreen ? "Exit full screen map" : "Full screen map"}
                  title={isMapFullscreen ? "Exit full screen" : "Full screen"}
                  onClick={toggleMapFullscreen}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
                >
                  {isMapFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            <div className="relative min-h-[320px] flex-1 bg-[#17232a] sm:min-h-[500px]">
              <MapContainer
                center={puneCenter}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom
                aria-label={`Interactive ${selectedCity?.name ?? "city"} heat risk map`}
                className="heat-risk-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{
                    tileerror: () => setMapTilesUnavailable(true),
                  }}
                />
                <ZoomControl position="topleft" />
                <MapViewport target={mapTarget} />
                <MapSizeHandler resizeKey={isMapFullscreen} />

                {showRiskZones && visibleHotspots.map((hotspot) => (
                  <Circle
                    key={`risk-${hotspot.id}`}
                    center={hotspot.coordinates}
                    radius={hotspot.risk === "Critical" ? 920 : 760}
                    pathOptions={{
                      color: getRiskColor(hotspot.risk),
                      fillColor: getRiskColor(hotspot.risk),
                      fillOpacity: hotspot.id === selectedHotspotId ? 0.2 : 0.12,
                      opacity: hotspot.id === selectedHotspotId ? 0.72 : 0.42,
                      weight: hotspot.id === selectedHotspotId ? 1.5 : 1,
                    }}
                  />
                ))}

                {showHotspotMarkers && visibleHotspots.map((hotspot) => (
                  <Marker
                    key={hotspot.id}
                    position={hotspot.coordinates}
                    icon={createHotspotIcon(
                      hotspot,
                      hotspot.id === selectedHotspotId,
                    )}
                    eventHandlers={{
                      click: () => selectHotspot(hotspot),
                    }}
                  >
                    <Popup>
                      <strong>{hotspot.name}</strong>
                      <br />
                      {hotspot.locality} · {hotspot.surfaceTemp.toFixed(1)}°C
                    </Popup>
                  </Marker>
                ))}

                <div className="map-center-label">
                  <span className="map-center-label__dot" />
                  <span>{selectedCity?.name.toUpperCase() ?? "SELECT A CITY"}</span>
                </div>
              </MapContainer>

              <div className="absolute right-4 top-4 z-[500] flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0c131b]/90 px-3 py-2 shadow-lg backdrop-blur">
                <MapPin size={14} className="text-emerald-400" />
                <span className="text-base font-medium text-slate-200">
                  {selectedWardData
                    ? `${selectedWardData.name} (Ward ${selectedWardData.id}), ${selectedCity?.name}`
                    : selectedCity
                      ? `${selectedCity.name}, ${selectedCity.region}`
                      : "Select a city"}
                </span>
              </div>

              {mapTilesUnavailable && (
                <div
                  role="status"
                  className="absolute right-4 top-4 z-[500] max-w-[240px] rounded-lg border border-amber-800/15 bg-[#fbfaf6]/95 px-3 py-2 text-sm font-medium leading-relaxed text-amber-800 shadow-sm"
                >
                  Basemap unavailable · hotspot risk overlay remains active
                </div>
              )}

              <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0c131b]/90 px-3 py-2 shadow-lg backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm text-slate-400">
                  {selectedWardData
                    ? isLoadingWardHotspots
                      ? `Loading hotspots for Ward ${selectedWardData.id}…`
                      : wardHotspotsError
                        ? `Could not load hotspots for Ward ${selectedWardData.id}`
                        : visibleHotspots.length
                          ? `${visibleHotspots.length} mapped hotspot${visibleHotspots.length === 1 ? "" : "s"}`
                          : `No hotspots found for Ward ${selectedWardData.id}`
                    : visibleHotspots.length
                      ? `${visibleHotspots.length} sample locations · ward mapping unavailable`
                      : "No hotspot data available"}
                </span>
              </div>
              {selectedWardData && wardHotspotsError && (
                <div
                  role="alert"
                  className="absolute bottom-16 left-4 z-[500] max-w-[min(420px,calc(100%-2rem))] rounded-lg border border-rose-700/20 bg-rose-100/95 px-3 py-2 text-sm font-medium leading-relaxed text-rose-900 shadow-sm"
                >
                  {wardHotspotsError}
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-[500] space-y-2 rounded-lg border border-white/[0.09] bg-[#0c131b]/90 px-3 py-2.5 shadow-lg backdrop-blur">
                <p className="text-sm font-semibold text-slate-200">Heat risk</p>
                <MapLegend color="#fb6470" label="Critical" />
                <MapLegend color="#f4ad54" label="Moderate" />
              </div>

              <button
                type="button"
                onClick={() => {
                  handleWardChange(ALL_WARDS);
                }}
                aria-label={`Reset map to ${selectedCity?.name ?? "city"} overview`}
                className="absolute bottom-4 left-[220px] z-[500] flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/[0.12] bg-[#0c131b]/90 text-slate-300 shadow-lg backdrop-blur transition hover:border-emerald-400/30 hover:text-emerald-300"
              >
                <Crosshair size={15} />
              </button>
            </div>
          </div>

          <aside
            aria-live="polite"
            className="flex min-h-[420px] flex-col rounded-2xl border border-white/[0.08] bg-[#0e161f] p-5 sm:min-h-[560px]"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Hotspot details
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-100">
                  {selectedHotspot?.name ?? "Select a map marker"}
                </h2>
              </div>
              {selectedHotspot && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedHotspot.risk === "Critical"
                      ? "bg-rose-400/10 text-rose-300"
                      : selectedHotspot.risk === "Moderate"
                        ? "bg-amber-400/10 text-amber-300"
                        : "bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {selectedHotspot.risk}
                </span>
              )}
            </div>

            {selectedHotspot ? (
              <div className="space-y-3">
                <DetailValue
                  label="Location"
                  value={selectedHotspot.locality}
                />
                <DetailValue
                  label="Land surface temperature"
                  value={`${selectedHotspot.surfaceTemp.toFixed(1)}°C`}
                />
                <DetailValue
                  label="Vulnerability score"
                  value={`${(selectedHotspot.vulnerabilityScore * 100).toFixed(0)}%`}
                />
                <DetailValue
                  label="Coordinates"
                  value={`${selectedHotspot.coordinates[0].toFixed(4)}, ${selectedHotspot.coordinates[1].toFixed(4)}`}
                />
              </div>
            ) : (
              <p className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm leading-relaxed text-slate-400">
                {isLoadingWardHotspots
                  ? `Loading hotspot data for Ward ${selectedWardData?.id ?? "—"}…`
                  : wardHotspotsError
                    ? wardHotspotsError
                    : selectedWardData
                      ? `No hotspot data is available for Ward ${selectedWardData.id}.`
                      : "Choose a ward or select a marker to inspect its heat and vulnerability data."}
              </p>
            )}

            <div className="mt-auto border-t border-white/[0.07] pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Temperature risk
              </p>
              <div className="space-y-2">
                <MapLegend color="#fb6470" label="Critical · above 42°C" />
                <MapLegend color="#f4ad54" label="Moderate · 38–42°C" />
                <MapLegend color="#34d399" label="Lower · below 38°C" />
              </div>
            </div>
          </aside>

          <div className="grid grid-cols-1 gap-3 lg:col-span-3 sm:grid-cols-3">
            <SummaryMetric
              label="Ward average"
              value="—"
              unit=""
              icon={<Flame size={16} />}
              accent="rose"
              change={selectedWardData
                ? `Temperature data unavailable for Ward ${selectedWardData.id}`
                : selectedCity
                  ? selectedCity.id === "pune"
                    ? "No verified aggregate for all 41 wards"
                    : "City-wide temperature data unavailable"
                  : "Select a city to view measurements"}
            />
            <SummaryMetric
              label="Active hotspots"
              value={
                selectedWardData && (isLoadingWardHotspots || wardHotspotsError || !visibleHotspots.length) || !visibleHotspots.length
                  ? "—"
                  : String(visibleHotspots.length).padStart(2, "0")
              }
              unit={visibleHotspots.length ? selectedWardData ? "mapped locations" : "sample locations" : ""}
              icon={<Crosshair size={16} />}
              accent="amber"
              change={selectedWardData
                ? isLoadingWardHotspots
                  ? "Loading ward hotspots"
                  : wardHotspotsError
                    ? "Ward hotspot request failed"
                    : visibleHotspots.length
                      ? `${visibleHotspots.filter((hotspot) => hotspot.risk === "Critical").length} critical · ${visibleHotspots.filter((hotspot) => hotspot.risk === "Moderate").length} moderate`
                      : "No hotspot records for this ward"
                : visibleHotspots.length
                  ? `${visibleHotspots.filter((hotspot) => hotspot.risk === "Critical").length} critical · ${visibleHotspots.filter((hotspot) => hotspot.risk === "Moderate").length} moderate · illustrative`
                  : "City-specific hotspot data unavailable"}
            />
            <SummaryMetric
              label="Vegetation cover"
              value={selectedCity?.id === "pune" && !selectedWardData ? "18.6" : "—"}
              unit={selectedCity?.id === "pune" && !selectedWardData ? "%" : ""}
              icon={<Leaf size={16} />}
              accent="emerald"
              change={selectedWardData
                ? `Vegetation data unavailable for Ward ${selectedWardData.id}`
                : selectedCity?.id === "pune"
                  ? "Illustrative city estimate · ward data unavailable"
                  : selectedCity
                    ? "City-specific vegetation data unavailable"
                    : "Select a city to view measurements"}
            />
          </div>

          <div className="mx-auto w-full max-w-[360px] text-center">
            <a
              href="/page2"
              className="group flex min-h-[48px] items-center justify-between rounded-xl bg-emerald-400 px-4 text-base font-semibold text-[#07120f] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300"
            >
              <span>Optimize Ward Budget (₹25L)</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>

        </section>
      </div>

      <style>{`
        .heat-risk-map {
          position: absolute;
          inset: 0;
          z-index: 0;
          height: 100%;
          width: 100%;
          background: #17232a;
          font-family: inherit;
        }
        .map-panel:fullscreen {
          width: 100vw;
          min-height: 100vh;
          border-radius: 0;
          background: var(--warm-panel);
        }
        .heat-risk-map .leaflet-control-attribution {
          background: rgba(251, 250, 246, 0.92);
          color: #48574c;
          font-size: 11px;
        }
        .heat-risk-map .leaflet-tile-pane {
          filter: none;
        }
        .heat-risk-map .leaflet-control-attribution a {
          color: #657b58;
        }
        .heat-risk-map .leaflet-bar {
          overflow: hidden;
          border: 1px solid #deded3;
          border-radius: 9px;
          box-shadow: none;
        }
        .heat-risk-map .leaflet-bar a {
          border-bottom-color: #deded3;
          background: #fbfaf6;
          color: #29352f;
        }
        .heat-risk-map .leaflet-bar a:hover {
          background: #eeece3;
          color: #657b58;
        }
        .hotspot-marker {
          position: relative;
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.62);
          border-radius: 999px;
          color: #fff;
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.48);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .hotspot-marker--critical {
          background: rgba(251, 100, 112, 0.92);
        }
        .hotspot-marker--moderate {
          background: rgba(244, 173, 84, 0.94);
        }
        .hotspot-marker--low {
          background: rgba(52, 211, 153, 0.92);
        }
        .hotspot-marker--selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.12), 0 0 24px rgba(251, 100, 112, 0.4);
        }
        .hotspot-marker__label {
          position: relative;
          z-index: 2;
          font: 700 12px/1 ui-sans-serif, system-ui, sans-serif;
        }
        .hotspot-marker__pulse {
          position: absolute;
          inset: -5px;
          border: 1px solid currentColor;
          border-radius: inherit;
          opacity: 0.38;
        }
        .map-center-label {
          position: absolute;
          top: 53%;
          left: 48%;
          z-index: 400;
          display: flex;
          align-items: center;
          gap: 5px;
          color: rgba(41, 53, 47, 0.82);
          font: 700 9px/1 ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0.18em;
          pointer-events: none;
          text-shadow: 0 1px 4px rgba(251, 250, 246, 0.9);
        }
        .map-center-label__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }
        .heat-risk-map .leaflet-popup-content-wrapper,
        .heat-risk-map .leaflet-popup-tip {
          background: #fbfaf6;
          color: #29352f;
        }
        .heat-risk-map .leaflet-popup-content {
          margin: 10px 13px;
          font-size: 14px;
          line-height: 1.6;
        }
        .heat-risk-map .leaflet-popup-close-button {
          color: #718078 !important;
        }
      `}</style>
    </main>
  );
}

function SummaryMetric({
  label,
  value,
  unit,
  icon,
  accent,
  change,
}: {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  accent: "rose" | "amber" | "emerald";
  change: string;
}) {
  const accentStyles = {
    rose: "bg-rose-400/[0.09] text-rose-300",
    amber: "bg-amber-400/[0.09] text-amber-300",
    emerald: "bg-emerald-400/[0.09] text-emerald-300",
  };
  const detailStyles = {
    rose: "text-rose-300/80",
    amber: "text-amber-300/80",
    emerald: "text-emerald-300/80",
  };

  return (
    <div className="h-full min-h-[112px] rounded-xl border border-white/[0.07] bg-[#0e161f] px-4 py-3.5 transition hover:border-white/[0.12]">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-slate-500">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentStyles[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tracking-tight text-slate-100">
          {value}
        </span>
        <span className="text-base text-slate-500">{unit}</span>
      </div>
      <p className={`mt-1 text-sm leading-snug ${detailStyles[accent]}`}>{change}</p>
    </div>
  );
}

function MapLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-slate-400">
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 7px ${color}80`,
        }}
      />
      {label}
    </span>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}
