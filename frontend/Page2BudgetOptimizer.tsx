import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Check,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Flame,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trees,
  Wallet,
  Wind,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface HotspotBudgetInput {
  id: "A" | "B" | "C" | "D";
  locality: string;
  vulnerability: number;
  coolingNeed: number;
  costEfficiency: number;
  populationAtRisk: number;
  roofAreaRatio: number;
  baseCost: number;
  intervention: string;
  icon: "tree" | "roof" | "canopy";
  cooling: number;
}

interface HotspotAllocation extends HotspotBudgetInput {
  weight: number;
  allocated: number;
  quantity: number;
  interventionLabel: string;
  projectedCooling: number;
}

const hotspotInputs: HotspotBudgetInput[] = [
  {
    id: "A",
    locality: "Shivajinagar",
    vulnerability: 0.85,
    coolingNeed: 0.93,
    costEfficiency: 0.78,
    populationAtRisk: 12480,
    roofAreaRatio: 0.69,
    baseCost: 2000,
    intervention: "Native shade trees",
    icon: "tree",
    cooling: 2.4,
  },
  {
    id: "B",
    locality: "Hadapsar",
    vulnerability: 0.78,
    coolingNeed: 0.88,
    costEfficiency: 0.9,
    populationAtRisk: 9260,
    roofAreaRatio: 0.91,
    baseCost: 2400,
    intervention: "Cool roof coating",
    icon: "roof",
    cooling: 2.1,
  },
  {
    id: "C",
    locality: "Kothrud",
    vulnerability: 0.67,
    coolingNeed: 0.68,
    costEfficiency: 0.86,
    populationAtRisk: 7940,
    roofAreaRatio: 0.58,
    baseCost: 1700,
    intervention: "Pocket park canopy",
    icon: "canopy",
    cooling: 1.6,
  },
  {
    id: "D",
    locality: "Aundh",
    vulnerability: 0.54,
    coolingNeed: 0.55,
    costEfficiency: 0.72,
    populationAtRisk: 5180,
    roofAreaRatio: 0.47,
    baseCost: 1500,
    intervention: "Native shade trees",
    icon: "tree",
    cooling: 1.3,
  },
];

const INR = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number) => `₹${INR.format(amount)}`;

function parseBudget(value: string, isLakhs: boolean) {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(amount)) return 0;
  const multiplier = isLakhs ? 100000 : 1;
  return Math.max(0, amount * multiplier);
}

function formatBudgetInput(amount: number, isLakhs: boolean) {
  if (isLakhs) return (amount / 100000).toFixed(2);
  return INR.format(amount);
}

function formatInterventionQuantity(
  icon: HotspotBudgetInput["icon"],
  quantity: number,
) {
  const formattedQuantity = quantity.toLocaleString("en-IN");
  if (icon === "roof") return `${formattedQuantity} homes · cool roof coating`;
  if (icon === "canopy") return `${formattedQuantity} m² · pocket park canopy`;
  return `${formattedQuantity} native shade trees`;
}

function calculateAllocations(
  budget: number,
  vulnerabilityWeight: number,
  coolingPreference: number,
  constrainedHotspotId: HotspotBudgetInput["id"] | null,
): HotspotAllocation[] {
  const vulnerabilityShare = vulnerabilityWeight / 100;
  const coolingShare = coolingPreference / 100;
  const availableUnits = Math.floor((budget * 0.96) / 10000);

  const scoredHotspots = hotspotInputs.map((hotspot) => {
    const priority =
      vulnerabilityShare * hotspot.vulnerability +
      (1 - vulnerabilityShare) * hotspot.populationAtRisk / 12480;
    const performance =
      coolingShare * hotspot.coolingNeed +
      (1 - coolingShare) * hotspot.costEfficiency;
    const constraintFactor = hotspot.id === constrainedHotspotId ? 0.72 : 1;
    return {
      ...hotspot,
      weight: priority * performance * constraintFactor,
      constraintFactor,
    };
  });
  const totalWeight = scoredHotspots.reduce((sum, hotspot) => sum + hotspot.weight, 0);
  const allocationsInUnits = scoredHotspots.map((hotspot) => {
    const exactUnits = totalWeight
      ? (availableUnits * hotspot.weight) / totalWeight
      : 0;
    return { units: Math.floor(exactUnits), remainder: exactUnits % 1 };
  });
  const leftoverUnits =
    availableUnits - allocationsInUnits.reduce((sum, item) => sum + item.units, 0);
  const distributionOrder = allocationsInUnits
    .map((allocation, index) => ({ index, remainder: allocation.remainder }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < leftoverUnits; index += 1) {
    const next = distributionOrder[index];
    if (next) allocationsInUnits[next.index].units += 1;
  }

  return scoredHotspots.map((hotspot, index) => {
    const constraintFactor = hotspot.constraintFactor;
    const allocated = allocationsInUnits[index].units * 10000;
    const quantity = Math.max(0, Math.floor(allocated / hotspot.baseCost));
    const projectedCooling =
      hotspot.cooling * Math.min(1.2, allocated / 600000) * constraintFactor;

    return {
      ...hotspot,
      allocated,
      quantity,
      interventionLabel: formatInterventionQuantity(hotspot.icon, quantity),
      projectedCooling,
    };
  });
}

function InterventionIcon({ type }: { type: HotspotBudgetInput["icon"] }) {
  if (type === "roof") return <CloudSun size={17} strokeWidth={1.8} />;
  if (type === "canopy") return <Wind size={17} strokeWidth={1.8} />;
  return <Trees size={17} strokeWidth={1.8} />;
}

function StrategySlider({
  id,
  label,
  description,
  value,
  lowLabel,
  highLabel,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: number;
  lowLabel: string;
  highLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="text-[11px] font-semibold text-slate-200">
            {label}
          </label>
          <p className="mt-0.5 text-[9px] text-slate-500">{description}</p>
        </div>
        <span className="rounded-md border border-emerald-800/10 bg-emerald-900/[0.06] px-2 py-1 text-[10px] font-semibold tabular-nums text-emerald-800">
          {value}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="optimizer-slider w-full cursor-pointer"
        style={{ "--range-progress": `${value}%` } as CSSProperties}
      />
      <div className="flex justify-between text-[9px] text-slate-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function Page2BudgetOptimizer() {
  const [budget, setBudget] = useState(2500000);
  const [budgetInput, setBudgetInput] = useState("25,00,000");
  const [isLakhs, setIsLakhs] = useState(false);
  const [vulnerabilityWeight, setVulnerabilityWeight] = useState(70);
  const [coolingPreference, setCoolingPreference] = useState(65);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [constraintsApplied, setConstraintsApplied] = useState(
    () => new URLSearchParams(window.location.search).get("fieldConstraints") === "1",
  );
  const [saved, setSaved] = useState(false);
  const scenarioSearch = new URLSearchParams(window.location.search);
  const reportedHotspot = scenarioSearch.get("hotspot");
  const reportedCategory = scenarioSearch.get("category");
  const reportedHotspotId = hotspotInputs.find(
    (hotspot) => hotspot.id === reportedHotspot?.match(/^Hotspot ([A-D])/i)?.[1],
  )?.id;
  const constrainedHotspotId = constraintsApplied
    ? reportedHotspotId ?? "C"
    : null;

  const allocations = useMemo(
    () =>
      calculateAllocations(
        budget,
        vulnerabilityWeight,
        coolingPreference,
        constrainedHotspotId,
      ),
    [budget, vulnerabilityWeight, coolingPreference, constrainedHotspotId],
  );
  const totalAllocated = allocations.reduce((sum, hotspot) => sum + hotspot.allocated, 0);
  const remaining = Math.max(0, budget - totalAllocated);
  const allocationPercent = budget > 0 ? (totalAllocated / budget) * 100 : 0;
  const totalCooling = allocations.reduce(
    (sum, hotspot) => sum + hotspot.projectedCooling,
    0,
  );

  const changeBudget = (value: string) => {
    setBudgetInput(value);
    setBudget(parseBudget(value, isLakhs));
    setSaved(false);
  };

  const toggleFormat = () => {
    const nextFormatIsLakhs = !isLakhs;
    setIsLakhs(nextFormatIsLakhs);
    setBudgetInput(formatBudgetInput(budget, nextFormatIsLakhs));
  };

  const runOptimization = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setIsOptimized(true);
      setIsRunning(false);
    }, 650);
  };

  const saveBaseline = () => {
    window.localStorage.setItem(
      "pmc-ward-budget-baseline",
      JSON.stringify({
        ward: "Aundh",
        budget,
        vulnerabilityWeight,
        coolingPreference,
        allocations: allocations.map(({ id, allocated, interventionLabel }) => ({
          id,
          allocated,
          interventionLabel,
        })),
      }),
    );
    setSaved(true);
  };

  return (
    <main className="theme-warm min-h-screen bg-[#0a1017] pb-28 text-slate-100">
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0c131b]/90">
        <div className="mx-auto flex min-h-[70px] max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/"
              aria-label="Back to heat risk map"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
            >
              <ArrowLeft size={16} />
            </a>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-900/10 bg-emerald-900/[0.06] text-emerald-800">
              <Wallet size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-wide text-slate-100 sm:text-sm">
                PMC Climate Action
              </p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Municipal planning suite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <MapPin size={13} className="text-emerald-800" />
            <span className="text-[10px] font-medium text-slate-500">Active ward</span>
            <span className="text-[11px] font-semibold text-slate-200">Aundh</span>
            <ChevronDown size={13} className="text-slate-500" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-500">
              <span>Climate intelligence</span>
              <span className="text-slate-300">/</span>
              <span>Ward planning</span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-800">Budget optimizer</span>
            </div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[30px]">
              <span>Municipal Budget Optimizer</span>
              <span className="mt-1 block text-[15px] font-medium tracking-normal text-slate-500 sm:mt-0 sm:ml-2 sm:inline">
                Ward: Aundh
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-500">
              Balance heat reduction with community vulnerability to build an
              evidence-led ward intervention plan.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-800" />
            Scenario workspace
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-700" />
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/[0.06] text-emerald-800">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="text-xs font-semibold text-slate-200">
                  Optimization controls
                </h2>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Tune the model priorities for this ward
                </p>
              </div>
            </div>
            {isOptimized && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/10 bg-emerald-900/[0.06] px-2.5 py-1 text-[9px] font-medium text-emerald-800">
                <Check size={12} />
                Plan optimized
              </span>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(225px,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-7">
            <div>
              <label
                htmlFor="budget-input"
                className="mb-2 block text-[10px] font-semibold text-slate-300"
              >
                Ward intervention budget
              </label>
              <div className="flex h-11 items-center rounded-lg border border-white/[0.1] bg-white/[0.025] px-3 focus-within:border-emerald-800/30">
                <BadgeIndianRupee size={16} className="mr-2 shrink-0 text-emerald-800" />
                <input
                  id="budget-input"
                  inputMode="decimal"
                  aria-label="Ward intervention budget"
                  value={budgetInput}
                  onChange={(event) => changeBudget(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold tabular-nums text-slate-100 outline-none"
                />
                <span className="ml-2 text-[9px] text-slate-500">
                  {isLakhs ? "LAKHS" : "INR"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleFormat}
                className="mt-1.5 flex items-center gap-1 text-[9px] font-medium text-emerald-800 transition hover:text-emerald-700"
              >
                <RotateCcw size={10} />
                Show in ₹ {isLakhs ? "rupees" : "lakhs"}
              </button>
            </div>

            <StrategySlider
              id="vulnerability-weight"
              label="Vulnerability weight · Vₕ"
              description="Prioritize elderly residents and informal settlements"
              value={vulnerabilityWeight}
              lowLabel="Population-led"
              highLabel="Vulnerability-led"
              onChange={(value) => {
                setVulnerabilityWeight(value);
                setIsOptimized(false);
                setSaved(false);
              }}
            />

            <StrategySlider
              id="cooling-preference"
              label="Cooling vs. cost efficiency"
              description="Trade off maximum cooling against cost per impact"
              value={coolingPreference}
              lowLabel="Cost efficiency"
              highLabel="Max cooling"
              onChange={(value) => {
                setCoolingPreference(value);
                setIsOptimized(false);
                setSaved(false);
              }}
            />

            <button
              type="button"
              onClick={runOptimization}
              disabled={isRunning || budget <= 0}
              className="group flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-400 px-4 text-[11px] font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full bg-current ${
                  isRunning ? "animate-ping" : "animate-pulse"
                }`}
              />
              {isRunning ? "Optimizing..." : "Run Optimization Engine"}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {constraintsApplied && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-700/10 bg-amber-100/40 px-4 py-3 text-[10px] text-amber-900">
            <span className="flex items-center gap-2">
              <Wind size={14} />
              {reportedHotspot && reportedCategory
                ? `Field restriction recorded at ${reportedHotspot}: ${reportedCategory}. Feasible allocations have been adjusted.`
                : "Field constraints simulated: limited public land access in Kothrud; allocations have been adjusted."}
            </span>
            <button
              type="button"
              onClick={() => setConstraintsApplied(false)}
              className="font-semibold underline underline-offset-2"
            >
              Clear simulation
            </button>
          </div>
        )}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.48fr)_minmax(350px,0.82fr)]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Recommended allocation
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Four hotspot interventions · estimates update with your budget
                </p>
              </div>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[9px] font-medium text-slate-500">
                {isOptimized ? "OPTIMIZED SCENARIO" : "DRAFT SCENARIO"}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {allocations.map((hotspot) => (
                <article
                  key={hotspot.id}
                  className="rounded-xl border border-white/[0.075] bg-white/[0.02] p-4 transition hover:border-emerald-800/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-900/[0.06] text-emerald-800">
                        <InterventionIcon type={hotspot.icon} />
                      </span>
                      <div>
                        <h3 className="text-[11px] font-semibold text-slate-200">
                          Hotspot {hotspot.id}
                        </h3>
                        <p className="mt-0.5 text-[9px] text-slate-500">
                          {hotspot.locality}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-md border px-1.5 py-1 text-[8px] font-semibold uppercase tracking-wide ${
                        hotspot.vulnerability >= 0.75
                          ? "border-rose-700/10 bg-rose-100/60 text-rose-800"
                          : "border-amber-700/10 bg-amber-100/60 text-amber-900"
                      }`}
                    >
                      Vₕ {hotspot.vulnerability.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-white/[0.07] pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9px] text-slate-500">Allocated amount</p>
                        <p className="mt-1 text-[19px] font-semibold tracking-tight text-slate-100">
                          {formatCurrency(hotspot.allocated)}
                        </p>
                      </div>
                      <p className="text-right text-[9px] text-slate-500">
                        {hotspot.populationAtRisk.toLocaleString("en-IN")}
                        <br />
                        residents at risk
                      </p>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-emerald-900/[0.045] px-2.5 py-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <InterventionIcon type={hotspot.icon} />
                        <div className="min-w-0">
                          <p className="text-[9px] font-medium text-slate-300">
                            {hotspot.interventionLabel}
                          </p>
                          <p className="mt-0.5 text-[8px] text-slate-500">
                            {hotspot.intervention}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-emerald-800">
                        −{hotspot.projectedCooling.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Budget utilization
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Aundh Ward · current scenario
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/60 text-amber-900">
                  <Wallet size={15} />
                </span>
              </div>

              <div className="relative mx-auto mt-3 h-[180px] w-full max-w-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Allocated", value: totalAllocated },
                        { name: "Unallocated", value: remaining },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={78}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="none"
                    >
                      <Cell fill="#819572" />
                      <Cell fill="#e5e3d9" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        border: "1px solid #deded3",
                        borderRadius: 10,
                        background: "#fbfaf6",
                        color: "#29352f",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[24px] font-semibold tracking-tight text-slate-100">
                    {allocationPercent.toFixed(0)}%
                  </span>
                  <span className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-500">
                    allocated
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-white/[0.07] pt-3">
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-700" />
                    <span>Allocated</span>
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(totalAllocated)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-[#d7d5ca]" />
                    <span>Remaining unallocated</span>
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(remaining)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2 text-[10px]">
                  <span className="text-slate-500">Total budget</span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(budget)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-900/[0.045] px-3 py-2">
                <Flame size={13} className="text-rose-700" />
                <span className="text-[9px] text-slate-500">Projected cumulative cooling</span>
                <span className="ml-auto text-[11px] font-semibold text-emerald-800">
                  −{totalCooling.toFixed(1)}°C
                </span>
              </div>
            </section>

            <section className="optimizer-explanation rounded-2xl border p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900/[0.08] text-emerald-800">
                  <Sparkles size={15} />
                </span>
                <div>
                  <h2 className="text-xs font-semibold text-slate-100">
                    Why this plan was selected
                  </h2>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Transparent allocation logic
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                <ExplanationItem>
                  <strong>Hotspot A leads:</strong> Vₕ=0.85 and 12,480 residents
                  at risk give it the largest vulnerability-weighted share.
                </ExplanationItem>
                <ExplanationItem>
                  <strong>Hotspot B gets cool roofs:</strong> its 0.91 roof-area
                  ratio makes coating more efficient than street-level planting.
                </ExplanationItem>
                <ExplanationItem>
                  <strong>Impact is balanced:</strong> {coolingPreference}% cooling
                  priority is combined with a {100 - coolingPreference}% cost-efficiency
                  preference.
                </ExplanationItem>
                <ExplanationItem>
                  <strong>Reserve protected:</strong> 4% remains unallocated for
                  procurement variance and field delivery.
                </ExplanationItem>
              </ul>
            </section>
          </aside>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-3 sm:p-4">
          <div className="flex items-center gap-2 pl-1">
            <LockKeyhole size={13} className="text-slate-500" />
            <p className="text-[9px] text-slate-500">
              Changes are saved as a planning scenario, not a committed budget.
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={saveBaseline}
                className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[10px] font-semibold transition ${
                  saved
                    ? "border-emerald-800/20 bg-emerald-900/[0.06] text-emerald-800"
                    : "border-white/[0.1] bg-transparent text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? "Baseline Saved" : "Save Baseline Scenario"}
              </button>
              <button
                type="button"
                onClick={() => setConstraintsApplied((current) => !current)}
                className="group flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-[10px] font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300"
              >
                {constraintsApplied ? "Update Field Constraints" : "Simulate Field Constraints"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-800/10 bg-amber-900/[0.035] p-3 sm:basis-full sm:justify-between sm:px-4">
              <span className="flex items-center gap-2 text-[10px] text-slate-500">
                <MapPin size={14} className="shrink-0 text-amber-800" />
                <span>
                  <span className="block font-semibold text-slate-200">Next: field verification</span>
                  Report on-site restrictions to refine this draft plan.
                </span>
              </span>
              <a
                href="/page3"
                className="group flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-800/15 bg-[#fbfaf6] px-3 text-[10px] font-semibold text-amber-800 transition hover:bg-amber-900/[0.06] sm:px-4"
              >
                Open field report
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-500">
          <a href="/" className="flex items-center gap-1.5 transition hover:text-emerald-800">
            <ArrowLeft size={11} />
            Back to heat risk map
          </a>
          <span className="flex items-center gap-1.5">
            <CircleHelp size={11} />
            Indicative estimates · Confirm costs with ward engineering team
          </span>
        </footer>
      </div>
    </main>
  );
}

function ExplanationItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-[9px] leading-relaxed text-slate-500">
      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-emerald-700" />
      <span>
        {children}
      </span>
    </li>
  );
}
