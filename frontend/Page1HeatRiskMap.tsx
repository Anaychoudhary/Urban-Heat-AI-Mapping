import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crosshair,
  Flame,
  Layers3,
  Leaf,
  MapPin,
  Search,
  ShieldAlert,
  Trees,
  UsersRound,
  Wind,
  X,
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

export interface Ward {
  id: string;
  name: string;
  riskLevel: "Critical" | "High" | "Moderate";
  averageTemp: number;
  vulnerablePopulation: string;
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
  ndvi: number;
  vulnerabilityScore: number;
  vulnerablePopulation: string;
  area: string;
  risk: "Critical" | "Moderate";
  interventions: Intervention[];
}

export interface PuneLocality {
  name: string;
  coordinates: [number, number];
}

const puneCenter: [number, number] = [18.5204, 73.8567];

const wards: Ward[] = [
  {
    id: "aundh",
    name: "Aundh",
    riskLevel: "Moderate",
    averageTemp: 38.7,
    vulnerablePopulation: "18.4k",
  },
  {
    id: "kothrud",
    name: "Kothrud",
    riskLevel: "High",
    averageTemp: 40.1,
    vulnerablePopulation: "24.8k",
  },
  {
    id: "shivajinagar",
    name: "Shivajinagar",
    riskLevel: "Critical",
    averageTemp: 42.6,
    vulnerablePopulation: "31.2k",
  },
  {
    id: "hadapsar",
    name: "Hadapsar",
    riskLevel: "Critical",
    averageTemp: 43.1,
    vulnerablePopulation: "36.7k",
  },
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

const localities: PuneLocality[] = [
  { name: "Shivajinagar", coordinates: [18.5314, 73.8478] },
  { name: "Hadapsar", coordinates: [18.5018, 73.9272] },
  { name: "Kothrud", coordinates: [18.5074, 73.8077] },
  { name: "Aundh", coordinates: [18.559, 73.8075] },
  { name: "Koregaon Park", coordinates: [18.5362, 73.8958] },
  { name: "Baner", coordinates: [18.559, 73.7868] },
  { name: "Swargate", coordinates: [18.5018, 73.8636] },
  { name: "Pimpri", coordinates: [18.6298, 73.7997] },
];

const getRiskColor = (risk: Hotspot["risk"]) =>
  risk === "Critical" ? "#fb6470" : "#f4ad54";

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

function InterventionIcon({ type }: { type: Intervention["icon"] }) {
  if (type === "trees") return <Trees size={16} strokeWidth={1.8} />;
  if (type === "roof") return <Building2 size={16} strokeWidth={1.8} />;
  return <Wind size={16} strokeWidth={1.8} />;
}

export default function Page1HeatRiskMap() {
  const defaultWardHotspot = hotspots.find((hotspot) => hotspot.locality === wards[0].name) ?? hotspots[0];
  const [selectedWard, setSelectedWard] = useState(wards[0].id);
  const [selectedHotspotId, setSelectedHotspotId] = useState(defaultWardHotspot.id);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<[number, number]>(defaultWardHotspot.coordinates);
  const [mapTilesUnavailable, setMapTilesUnavailable] = useState(false);

  const selectedWardData = wards.find((ward) => ward.id === selectedWard) ?? wards[0];
  const selectedHotspot =
    hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? hotspots[0];
  const matchingLocalities = useMemo(
    () =>
      query.trim()
        ? localities.filter((locality) =>
            locality.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : [],
    [query],
  );

  const chooseLocality = (locality: PuneLocality) => {
    setQuery(locality.name);
    setMapTarget(locality.coordinates);
    setSearchOpen(false);
    const matchingHotspot = hotspots.find(
      (hotspot) => hotspot.locality === locality.name,
    );
    if (matchingHotspot) selectHotspot(matchingHotspot);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (matchingLocalities[0]) chooseLocality(matchingLocalities[0]);
  };

  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId);
    const wardHotspot: Record<string, string> = {
      aundh: "D",
      kothrud: "C",
      shivajinagar: "A",
      hadapsar: "B",
    };
    const hotspot = hotspots.find(
      (item) => item.id === (wardHotspot[wardId] ?? "A"),
    );
    if (hotspot) {
      setSelectedHotspotId(hotspot.id);
      setMapTarget(hotspot.coordinates);
    }
  };

  const selectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspotId(hotspot.id);
    setMapTarget(hotspot.coordinates);
  };

  return (
    <main className="theme-warm min-h-screen bg-[#0a1017] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-[38%] h-[440px] w-[440px] rounded-full bg-rose-500/[0.035] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-emerald-400/[0.025] blur-[110px]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.07] bg-[#0c131b]/90">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <a href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.09] text-rose-300">
              <Flame size={21} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-wide text-slate-100">
                PMC Heat Island Risk Map
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.17em] text-slate-500">
                Pune Municipal Corporation
              </span>
            </span>
          </a>

          <div className="ml-auto flex items-center gap-3">
            <label className="relative hidden lg:block">
              <span className="sr-only">Select ward</span>
              <select
                value={selectedWard}
                onChange={(event) => handleWardChange(event.target.value)}
                className="h-10 min-w-[176px] appearance-none rounded-lg border border-white/[0.09] bg-[#111a24] py-2 pl-3.5 pr-10 text-xs font-medium text-slate-200 outline-none transition hover:border-white/20 focus:border-emerald-400/50"
              >
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name} Ward
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </label>

            <div className="relative hidden lg:block">
              <form
                onSubmit={handleSearch}
                className="flex h-10 w-[250px] items-center gap-2.5 rounded-lg border border-white/[0.09] bg-[#111a24] px-3 transition focus-within:border-emerald-400/50"
              >
                <Search size={15} className="shrink-0 text-slate-500" />
                <input
                  aria-label="Search Pune localities"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Search Pune localities..."
                  className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setMapTarget(puneCenter);
                    }}
                    className="text-slate-500 transition hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
              {searchOpen && matchingLocalities.length > 0 && (
                <div className="absolute right-0 top-12 z-[1000] w-full overflow-hidden rounded-xl border border-white/10 bg-[#111a24] p-1.5 shadow-2xl shadow-black/50">
                  {matchingLocalities.slice(0, 5).map((locality) => (
                    <button
                      key={locality.name}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseLocality(locality)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <MapPin size={14} className="text-emerald-400" />
                      {locality.name}, Pune
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden h-8 w-px bg-white/[0.08] xl:block" />
            <div className="hidden items-center gap-2 xl:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Live monitoring
              </span>
            </div>
            <button
              type="button"
              aria-label="Help"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200 sm:flex"
            >
              <CircleHelp size={17} />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 lg:hidden">
            <label className="relative shrink-0">
              <span className="sr-only">Select ward</span>
              <select
                value={selectedWard}
                onChange={(event) => handleWardChange(event.target.value)}
                className="h-10 w-[132px] appearance-none rounded-lg border border-white/[0.09] bg-[#111a24] py-2 pl-3 pr-8 text-xs font-medium text-slate-200 outline-none transition focus:border-emerald-400/50"
              >
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </label>

            <div className="relative min-w-0 flex-1">
              <form
                onSubmit={handleSearch}
                className="flex h-10 items-center gap-2.5 rounded-lg border border-white/[0.09] bg-[#111a24] px-3 transition focus-within:border-emerald-400/50"
              >
                <Search size={15} className="shrink-0 text-slate-500" />
                <input
                  aria-label="Search Pune localities"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Search Pune localities..."
                  className="w-full min-w-0 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setMapTarget(puneCenter);
                    }}
                    className="shrink-0 text-slate-500 transition hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
              {searchOpen && matchingLocalities.length > 0 && (
                <div className="absolute left-0 right-0 top-12 z-[1000] overflow-hidden rounded-xl border border-white/10 bg-[#111a24] p-1.5 shadow-2xl shadow-black/20">
                  {matchingLocalities.slice(0, 5).map((locality) => (
                    <button
                      key={locality.name}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseLocality(locality)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <MapPin size={14} className="text-emerald-400" />
                      {locality.name}, Pune
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-8 pt-6 sm:px-8">
        <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Climate intelligence</span>
              <ChevronRight size={12} />
              <span className="text-emerald-400/90">Heat risk overview</span>
            </div>
            <h1 className="text-[23px] font-semibold tracking-tight text-white sm:text-[27px]">
              Heat risk command map
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Identify heat-vulnerable communities and prioritize ward-level action.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-400">
            <Clock3 size={14} className="text-slate-500" />
            Data updated <span className="font-medium text-slate-300">Today, 14:32</span>
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryMetric
            label="Ward average"
            value={`${selectedWardData.averageTemp.toFixed(1)}°`}
            unit="C"
            icon={<Flame size={16} />}
            accent="rose"
            change="+1.8° vs. seasonal avg."
          />
          <SummaryMetric
            label="Active hotspots"
            value={String(hotspots.length).padStart(2, "0")}
            unit="zones"
            icon={<Crosshair size={16} />}
            accent="amber"
            change="2 critical · 2 moderate"
          />
          <SummaryMetric
            label="People at risk"
            value={selectedWardData.vulnerablePopulation}
            unit="residents"
            icon={<UsersRound size={16} />}
            accent="amber"
            change="Elderly & informal settlements"
          />
          <SummaryMetric
            label="Vegetation cover"
            value="18.6"
            unit="%"
            icon={<Leaf size={16} />}
            accent="emerald"
            change="−2.3% over the last 5 years"
          />
        </section>

        <section className="grid min-h-[680px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(340px,0.96fr)]">
          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e161f]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/[0.1] text-rose-300">
                  <Layers3 size={16} />
                </span>
                <div>
                  <h2 className="text-xs font-semibold text-slate-100">Thermal exposure map</h2>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {selectedWardData.name} Ward · Surface temperature
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <MapLegend color="#fb6470" label="Critical · &gt;42°C" />
                <MapLegend color="#f4ad54" label="Moderate · &gt;38°C" />
              </div>
            </div>

            <div className="relative min-h-[440px] flex-1 bg-[#17232a] sm:min-h-[500px]">
              <MapContainer
                center={puneCenter}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom
                aria-label="Interactive Pune heat risk map"
                className="heat-risk-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{
                    tileerror: () => setMapTilesUnavailable(true),
                  }}
                />
                <ZoomControl position="bottomright" />
                <MapViewport target={mapTarget} />

                {hotspots.map((hotspot) => (
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

                {hotspots.map((hotspot) => (
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
                  <span>PUNE</span>
                </div>
              </MapContainer>

              <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0c131b]/90 px-3 py-2 shadow-lg backdrop-blur">
                <MapPin size={14} className="text-emerald-400" />
                <span className="text-[10px] font-medium text-slate-200">
                  {query || "Pune, Maharashtra"}
                </span>
              </div>

              {mapTilesUnavailable && (
                <div
                  role="status"
                  className="absolute right-4 top-4 z-[500] max-w-[190px] rounded-lg border border-amber-800/15 bg-[#fbfaf6]/95 px-3 py-2 text-[9px] font-medium leading-relaxed text-amber-800 shadow-sm"
                >
                  Basemap unavailable · hotspot risk overlay remains active
                </div>
              )}

              <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0c131b]/90 px-3 py-2 shadow-lg backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-slate-400">
                  Thermal risk zones <span className="text-slate-200">· 100m</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMapTarget(puneCenter);
                  setQuery("");
                }}
                aria-label="Reset map to Pune"
                className="absolute bottom-4 right-[60px] z-[500] flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/[0.12] bg-[#0c131b]/90 text-slate-300 shadow-lg backdrop-blur transition hover:border-emerald-400/30 hover:text-emerald-300"
              >
                <Crosshair size={15} />
              </button>
            </div>
          </div>

          <aside className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e161f]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Hotspot intelligence
                  </h2>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                    LIVE
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Select a map marker to inspect a zone
                </p>
              </div>
              <button
                type="button"
                aria-label="Previous hotspot"
                onClick={() => {
                  const index = hotspots.findIndex(
                    (hotspot) => hotspot.id === selectedHotspotId,
                  );
                  selectHotspot(
                    hotspots[(index - 1 + hotspots.length) % hotspots.length],
                  );
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-semibold tracking-tight text-white">
                      {selectedHotspot.name}
                    </h3>
                    <RiskBadge risk={selectedHotspot.risk} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={13} />
                    {selectedHotspot.locality}, Pune
                    <span className="text-slate-700">·</span>
                    {selectedHotspot.area}
                  </p>
                </div>
                <div className="flex gap-1 pt-0.5">
                  {hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      type="button"
                      aria-label={`Select ${hotspot.name}`}
                      aria-pressed={hotspot.id === selectedHotspotId}
                      onClick={() => selectHotspot(hotspot)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-semibold transition ${
                        hotspot.id === selectedHotspotId
                          ? "bg-white/[0.12] text-white ring-1 ring-white/15"
                          : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                      }`}
                    >
                      {hotspot.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-rose-400/[0.12] bg-gradient-to-br from-rose-400/[0.09] to-transparent p-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">
                      Surface temperature
                    </span>
                    <Flame size={14} className="text-rose-300" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[27px] font-semibold leading-none tracking-tight text-rose-200">
                      {selectedHotspot.surfaceTemp.toFixed(1)}
                    </span>
                    <span className="text-xs text-rose-200/70">°C</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-rose-300/80">
                    <ArrowUpRight size={12} />
                    {(selectedHotspot.surfaceTemp - 38.3).toFixed(1)}° above city average
                  </div>
                </div>
                <div className="rounded-xl border border-amber-400/[0.12] bg-gradient-to-br from-amber-400/[0.07] to-transparent p-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">
                      NDVI vegetation index
                    </span>
                    <Leaf size={14} className="text-amber-300" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[27px] font-semibold leading-none tracking-tight text-amber-200">
                      {selectedHotspot.ndvi.toFixed(2)}
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-amber-300/90">
                      Critical
                    </span>
                  </div>
                  <div className="mt-2 text-[9px] text-slate-500">
                    Low canopy · city avg. 0.34
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-300" />
                    <span className="text-[10px] font-medium text-slate-300">
                      Vulnerability score <span className="text-slate-500">V<sub>h</sub></span>
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-amber-300">HIGH EXPOSURE</span>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[23px] font-semibold leading-none text-slate-100">
                      {selectedHotspot.vulnerabilityScore.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs text-slate-500">/ 1.0</span>
                  </div>
                  <span className="max-w-[180px] text-right text-[9px] leading-relaxed text-slate-500">
                    Based on elderly & informal settlement density
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                    style={{ width: `${selectedHotspot.vulnerabilityScore * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500">
                  <span>Low risk</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <UsersRound size={11} />
                    {selectedHotspot.vulnerablePopulation} vulnerable residents
                  </span>
                  <span>High risk</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                    Feasible interventions
                  </h4>
                  <span className="text-[9px] text-slate-600">EST. COOLING IMPACT</span>
                </div>
                <div className="space-y-1.5">
                  {selectedHotspot.interventions.map((intervention) => (
                    <div
                      key={intervention.name}
                      className="flex items-center justify-between rounded-lg border border-white/[0.055] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400/[0.09] text-emerald-300">
                          <InterventionIcon type={intervention.icon} />
                        </span>
                        <span className="text-[10px] font-medium text-slate-300">
                          {intervention.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-300">
                        {intervention.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="/page2"
                className="group mt-auto flex min-h-[48px] items-center justify-between rounded-xl bg-emerald-400 px-4 text-xs font-semibold text-[#07120f] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300"
              >
                <span>Optimize Ward Budget (₹25L)</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <p className="mt-2 text-center text-[9px] text-slate-600">
                Generate an optimized intervention plan for {selectedWardData.name} Ward
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-600">
          <span>Source: PMC Climate Cell · Landsat 9 thermal imagery · Census 2011</span>
          <span className="flex items-center gap-1.5">
            <ArrowDownRight size={11} />
            Indicative analysis · 100m resolution
          </span>
        </footer>
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
        .heat-risk-map .leaflet-control-attribution {
          background: rgba(10, 16, 23, 0.72);
          color: #64748b;
          font-size: 9px;
        }
        .heat-risk-map .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.78) saturate(0.72);
        }
        .heat-risk-map .leaflet-control-attribution a {
          color: #94a3b8;
        }
        .heat-risk-map .leaflet-bar {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9px;
          box-shadow: none;
        }
        .heat-risk-map .leaflet-bar a {
          border-bottom-color: rgba(255, 255, 255, 0.08);
          background: rgba(12, 19, 27, 0.92);
          color: #cbd5e1;
        }
        .heat-risk-map .leaflet-bar a:hover {
          background: #17232a;
          color: #fff;
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
          color: rgba(226, 232, 240, 0.75);
          font: 700 9px/1 ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0.18em;
          pointer-events: none;
          text-shadow: 0 1px 4px #071018;
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
          background: #111a24;
          color: #e2e8f0;
        }
        .heat-risk-map .leaflet-popup-content {
          margin: 10px 13px;
          font-size: 11px;
          line-height: 1.6;
        }
        .heat-risk-map .leaflet-popup-close-button {
          color: #94a3b8 !important;
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
    <div className="rounded-xl border border-white/[0.07] bg-[#0e161f] px-4 py-3.5 transition hover:border-white/[0.12]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-500">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentStyles[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[21px] font-semibold tracking-tight text-slate-100">
          {value}
        </span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </div>
      <p className={`mt-1 text-[9px] ${detailStyles[accent]}`}>{change}</p>
    </div>
  );
}

function MapLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
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

function RiskBadge({ risk }: { risk: Hotspot["risk"] }) {
  const critical = risk === "Critical";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9px] font-semibold uppercase tracking-wide ${
        critical
          ? "border-rose-400/20 bg-rose-400/[0.09] text-rose-300"
          : "border-amber-400/20 bg-amber-400/[0.09] text-amber-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          critical ? "bg-rose-400" : "bg-amber-400"
        }`}
      />
      {risk}
    </span>
  );
}