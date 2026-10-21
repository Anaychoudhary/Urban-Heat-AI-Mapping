import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  CloudSun,
  Crosshair,
  ImagePlus,
  MapPin,
  Radio,
  ShieldCheck,
  Upload,
  X,
  Zap,
} from "lucide-react";

const hotspotOptions = [
  "Hotspot A - Baner Road Junction",
  "Hotspot B - Hadapsar Market",
  "Hotspot C - Kothrud Depot",
  "Hotspot D - Aundh Gaon",
];

const constraintCategories = [
  "Overhead Power Lines",
  "Underground Pipes",
  "Narrow Footpath",
  "Private Property",
];

const restrictionOutcomes: Record<string, string> = {
  "Overhead Power Lines": "Tall canopy trees excluded",
  "Underground Pipes": "Deep-rooted trees excluded",
  "Narrow Footpath": "Wide-canopy planting excluded",
  "Private Property": "Private parcels excluded",
};

export default function Page3FieldRestrictionPortal() {
  const [hotspot, setHotspot] = useState(hotspotOptions[0]);
  const [category, setCategory] = useState(constraintCategories[0]);
  const [notes, setNotes] = useState(
    "Overhead 11kV lines detected. Tall canopy trees restricted.",
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const clearPhotoPreview = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoName(null);
  };

  const setPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      clearPhotoPreview();
      setPhotoError("Choose an image file to attach field evidence.");
      setSubmitted(false);
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      clearPhotoPreview();
      setPhotoError("That image is over 12 MB. Choose a smaller photo.");
      setSubmitted(false);
      return;
    }
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoName(file.name);
    setPhotoError(null);
    setSubmitted(false);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        setCoordinates(
          `${position.latitude.toFixed(5)}°, ${position.longitude.toFixed(5)}°`,
        );
        setLocationError(null);
        setIsLocating(false);
        setSubmitted(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still submit this report."
            : "Could not get a location fix. Try again or submit without GPS.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const removePhoto = () => {
    clearPhotoPreview();
    setPhotoError(null);
    setSubmitted(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setPhoto(event.dataTransfer.files[0]);
  };

  const submitRestriction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="theme-warm min-h-screen bg-[#0a1017] pb-10 text-slate-100">
      <header className="relative z-10 border-b border-white/[0.07] bg-[#0c131b]/90">
        <div className="mx-auto flex min-h-[72px] max-w-[1120px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <a
              href="/page2"
              aria-label="Back to budget optimizer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
            >
              <ArrowLeft size={17} />
            </a>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-800/10 bg-amber-900/[0.06] text-amber-800">
              <Radio size={19} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-wide text-slate-100 sm:text-sm">
                Field Team Obstacle Reporter
              </p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-slate-500">
                Ward: Aundh
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-800/15 bg-emerald-900/[0.06] px-2.5 py-1.5 text-[9px] font-semibold text-emerald-800 sm:gap-2 sm:px-3 sm:text-[10px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-700 opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-700" />
            </span>
            <span className="hidden sm:inline">Mode: </span>
            Field Engineer On-Site
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-4 pb-8 pt-6 sm:px-7 sm:pt-9">
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Climate intelligence</span>
            <span>/</span>
            <span>Ward planning</span>
            <span>/</span>
            <span className="text-emerald-800">03 Field report</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-100 sm:text-[28px]">
            Field Restriction &amp; Constraint Portal
          </h1>
          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-slate-500 sm:text-xs">
            Record on-site obstacles with geotagged evidence so the ward plan
            reflects what crews can safely build.
          </p>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-5">
          <form
            onSubmit={submitRestriction}
            className="rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/[0.07] text-emerald-800">
                <ClipboardCheck size={19} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  On-site constraint report
                </h2>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Add a location, evidence photo, and details from the field.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold text-slate-300">
                  Hotspot location
                </span>
                <span className="relative block">
                  <MapPin
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800"
                  />
                  <select
                    value={hotspot}
                    onChange={(event) => {
                      setHotspot(event.target.value);
                      setSubmitted(false);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.025] pl-9 pr-9 text-[11px] text-slate-200 outline-none transition focus:border-emerald-800/40"
                  >
                    {hotspotOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold text-slate-300">
                  Constraint category
                </span>
                <span className="relative block">
                  <Zap
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-800"
                  />
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setSubmitted(false);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.025] pl-9 pr-9 text-[11px] text-slate-200 outline-none transition focus:border-emerald-800/40"
                  >
                    {constraintCategories.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </span>
              </label>
            </div>

            <section className="mt-5">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-[10px] font-semibold text-slate-300">
                  Geotagged photo evidence
                </h3>
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isLocating}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-800/10 px-2 text-[9px] font-medium text-emerald-800 transition hover:bg-emerald-900/[0.05] disabled:opacity-60"
                >
                  <Crosshair size={12} />
                  {isLocating
                    ? "Finding GPS…"
                    : coordinates
                      ? "Refresh GPS"
                      : "Capture GPS"}
                </button>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`overflow-hidden rounded-xl border border-dashed transition ${
                  isDragging
                    ? "border-emerald-700 bg-emerald-900/[0.06]"
                    : "border-white/[0.14] bg-white/[0.015]"
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-[#d8d2c6] sm:h-56">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`Field evidence: ${photoName ?? "uploaded photo"}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <OverheadWiresPreview />
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-[#fbfaf6]/95 px-2.5 py-1.5 text-[9px] font-medium text-[#48574c] shadow-sm">
                    <MapPin size={11} className="text-emerald-800" />
                    {coordinates ?? "Aundh, Pune · sample site"}
                  </span>
                  <span className="absolute bottom-3 left-3 rounded-md bg-[#fbfaf6]/95 px-2 py-1 text-[9px] font-medium text-[#29352f] shadow-sm">
                    {photoName ?? "Sample photo · overhead electrical wires"}
                  </span>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      aria-label="Remove uploaded photo"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-[#fbfaf6]/95 text-[#29352f] shadow-sm transition hover:bg-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <div className="flex items-start gap-2">
                    <ImagePlus
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-800"
                    />
                    <p className="text-[9px] leading-relaxed text-slate-500">
                      Drop an image here, browse files, or take a site photo.
                      Images are limited to 12 MB.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-label="Upload field photo"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-label="Take a field photo"
                    />
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="inline-flex min-h-10 whitespace-nowrap items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[10px] font-semibold text-slate-300 transition hover:bg-white/[0.04]"
                    >
                      <Upload size={13} className="shrink-0" />
                      Upload photo
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex min-h-10 whitespace-nowrap items-center justify-center gap-1.5 rounded-lg border border-emerald-800/15 bg-emerald-900/[0.05] px-3 text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-900/[0.1]"
                    >
                      <Camera size={13} className="shrink-0" />
                      Camera snap
                    </button>
                  </div>
                </div>
                {photoError && (
                  <p role="alert" className="mt-2 text-[10px] font-medium text-rose-700">
                    {photoError}
                  </p>
                )}
                {locationError && (
                  <p role="status" className="mt-2 text-[10px] text-amber-800">
                    {locationError}
                  </p>
                )}
                <p className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-500">
                  <MapPin size={11} className="text-emerald-800" />
                  {coordinates
                    ? `Device location captured · ${coordinates}`
                    : "Sample site shown. Capture GPS to add your device location."}
                </p>
              </div>
            </section>

            <label className="mt-5 block">
              <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-300">
                <span>Field notes</span>
                <span className="font-normal text-slate-500">Add practical details</span>
              </span>
              <textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setSubmitted(false);
                }}
                rows={3}
                placeholder="Describe the obstacle, its location, and any safety concerns…"
                className="w-full resize-y rounded-lg border border-white/[0.1] bg-white/[0.025] px-3 py-2.5 text-[11px] leading-relaxed text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-emerald-800/40"
              />
            </label>

            <button
              type="submit"
              className="group mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-center text-[11px] font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300"
            >
              {submitted ? <Check size={15} /> : <ShieldCheck size={15} />}
              {submitted
                ? "Restriction submitted"
                : "Submit Field Restriction & Trigger Re-Optimization"}
              {!submitted && (
                <ArrowRight
                  size={15}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
            <p className="mt-2 text-center text-[9px] text-slate-500">
              Submitting updates this planning scenario only; it does not
              approve field work.
            </p>
          </form>

          <aside className="space-y-4">
            {submitted ? (
              <section
                aria-live="polite"
                className="rounded-2xl border border-amber-800/15 bg-[#fbfaf6] p-4 sm:p-5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-900/[0.08] text-amber-800">
                    <AlertTriangle size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#29352f]">
                      Constraint Recorded!
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-[#718078]">
                      {restrictionOutcomes[category]} at {hotspot.split(" - ")[0]}.
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-emerald-800/10 bg-[#eef1e9] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#657b58]">
                    Recalculation log · just now
                  </p>
                  <div className="mt-3 flex gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dce5d5] text-[#657b58]">
                      <Check size={11} />
                    </span>
                    <p className="text-[10px] leading-relaxed text-[#48574c]">
                      Engine updated feasible species. Reallocating unspent{" "}
                      <strong>₹2.5L</strong> to Hotspot B cool roofs.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-[#d8e0d0] pt-3 text-[9px] text-[#718078]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#819572]" />
                    Scenario recalculated with field constraints
                  </div>
                </div>
                <a
                  href={`/page4?fieldConstraints=1&hotspot=${encodeURIComponent(hotspot)}&category=${encodeURIComponent(category)}`}
                  className="group mt-4 flex min-h-11 items-center justify-between gap-2 rounded-lg bg-[#819572] px-3 text-[10px] font-semibold text-white transition hover:bg-[#657b58]"
                >
                  <span>View Plan Changes in Scenario Comparison</span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              </section>
            ) : (
              <section className="rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:p-5">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900/[0.07] text-emerald-800">
                    <CloudSun size={16} />
                  </span>
                  <div>
                    <h2 className="text-xs font-semibold text-slate-100">
                      Field safety first
                    </h2>
                    <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                      Record site conditions before crews begin planting or
                      installation.
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 text-[10px] leading-relaxed text-slate-500">
                  <li className="flex gap-2">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                    Keep a safe distance from energized lines.
                  </li>
                  <li className="flex gap-2">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                    Include the obstacle and surrounding context in your photo.
                  </li>
                  <li className="flex gap-2">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                    The optimizer uses this report to update feasible work.
                  </li>
                </ul>
              </section>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-[9px] leading-relaxed text-slate-500">
              <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-800" />
              <p>
                <span className="font-semibold text-slate-300">Location status</span>
                <br />
                Aundh ward · capture GPS above for device coordinates
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-500">
          <a
            href="/page2"
            className="inline-flex min-h-9 items-center gap-1.5 transition hover:text-emerald-800"
          >
            <ArrowLeft size={12} />
            Back to budget optimizer
          </a>
          <span>PMC Climate Cell · Field planning workspace</span>
        </footer>
      </div>
    </main>
  );
}

function OverheadWiresPreview() {
  return (
    <svg
      viewBox="0 0 900 440"
      role="img"
      aria-label="Sample field photo showing overhead electrical wires above a street"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="field-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b9c6c2" />
          <stop offset="1" stopColor="#e5d5bd" />
        </linearGradient>
        <linearGradient id="field-road" x1="0" x2="0.9" y1="0" y2="1">
          <stop offset="0" stopColor="#8d8980" />
          <stop offset="1" stopColor="#c0b6a5" />
        </linearGradient>
      </defs>
      <rect width="900" height="440" fill="url(#field-sky)" />
      <path d="M0 263 148 208l163 51 153-54 163 42 129-54 144 39v208H0Z" fill="#7b8b78" />
      <path d="m0 326 186-59 160 48 145-53 184 51 113-40 112 28v139H0Z" fill="#b3a995" />
      <path d="M0 353 255 309l645 84v47H0Z" fill="url(#field-road)" />
      <path d="M0 392 900 423" stroke="#e5ddc9" strokeWidth="5" strokeDasharray="26 22" opacity=".75" />
      <g fill="#857d70">
        <path d="m85 239 15-150h9l13 151Z" />
        <path d="m702 251 14-175h9l15 180Z" />
        <path d="m480 262 10-123h8l11 127Z" />
      </g>
      <g stroke="#514d48" fill="none">
        <path d="M40 121 842 165" strokeWidth="4" />
        <path d="M44 138 842 184" strokeWidth="2.5" />
        <path d="M47 157 845 203" strokeWidth="2" />
        <path d="M92 103 93 184M103 105 104 185M483 128 484 192M495 129 496 193M711 91 712 190M724 92 725 192" strokeWidth="2" />
      </g>
      <g fill="#e4d7c2" stroke="#948a7a" strokeWidth="2">
        <path d="m168 284 52-33 59 16-8 38-72 11Z" />
        <path d="m343 297 55-34 60 18-6 41-87 8Z" />
        <path d="m575 308 54-34 71 23-11 38-89 4Z" />
        <path d="m741 278 47-26 55 18-8 39-70 6Z" />
      </g>
      <g fill="#596c57" opacity=".9">
        <circle cx="315" cy="244" r="45" />
        <circle cx="351" cy="251" r="34" />
        <circle cx="555" cy="244" r="43" />
        <circle cx="588" cy="251" r="34" />
      </g>
      <rect x="24" y="24" width="198" height="29" rx="14.5" fill="#fbfaf6" fillOpacity=".9" />
      <circle cx="42" cy="38.5" r="4" fill="#a34e4c" />
      <text x="54" y="43" fill="#48574c" fontSize="12" fontFamily="sans-serif">
        SAMPLE SITE EVIDENCE · 11kV
      </text>
    </svg>
  );
}
