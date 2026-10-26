"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  getScenarioHistory,
  runOptimization as runBackendOptimization,
} from "./apiService";
import type { Scenario } from "./apiService";
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Check,
  ChevronDown,
  CloudSun,
  Flame,
  LoaderCircle,
  MapPin,
  Save,
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
          <label htmlFor={id} className="text-base font-semibold text-slate-200">
            {label}
          </label>
          <p className="mt-0.5 text-base text-slate-500">{description}</p>
        </div>
        <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-base font-semibold tabular-nums text-emerald-300">
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
      <div className="flex justify-between text-base text-slate-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function Page2BudgetOptimizer() {
  const wardId = 1;
  const [budget, setBudget] = useState(2500000);
  const [budgetInput, setBudgetInput] = useState(() => INR.format(2500000));
  const [vulnerabilityWeight, setVulnerabilityWeight] = useState(70);
  const [coolingPreference, setCoolingPreference] = useState(65);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [constraintsApplied, setConstraintsApplied] = useState(
    () => new URLSearchParams(window.location.search).get("fieldConstraints") === "1",
  );
  const [saved, setSaved] = useState(false);
  const [backendScenario, setBackendScenario] = useState<Scenario | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [scenarioHistory, setScenarioHistory] = useState<Scenario[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
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

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingHistory(true);
    setHistoryError(null);

    getScenarioHistory(wardId, controller.signal)
      .then(setScenarioHistory)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setHistoryError(
            error instanceof Error ? error.message : "Could not load scenario history.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingHistory(false);
      });

    return () => controller.abort();
  }, [wardId]);

  const changeBudget = (value: string) => {
    setBudgetInput(value);
    const amount = Number(value.replace(/,/g, ""));
    setBudget(Number.isFinite(amount) ? Math.max(0, amount) : 0);
    setSaved(false);
  };

  const formatBudgetInput = () => {
    if (Number.isFinite(budget)) {
      setBudgetInput(INR.format(budget));
    }
  };

  const runOptimization = async () => {
    setIsRunning(true);
    setIsOptimized(false);
    setApiError(null);
    setBackendScenario(null);
    try {
      const scenario = await runBackendOptimization({
        wardId,
        budget,
        scenarioName: "Ward 1 Budget Optimization",
      });
      setBackendScenario(scenario);
      setIsOptimized(true);
      try {
        const history = await getScenarioHistory(wardId);
        setScenarioHistory(history);
        setHistoryError(null);
      } catch (error) {
        setHistoryError(
          error instanceof Error ? error.message : "Could not refresh scenario history.",
        );
      }
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not run the optimization.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const saveBaseline = () => {
    window.localStorage.setItem(
      "pmc-ward-budget-baseline",
      JSON.stringify({
        ward: "Ward 1",
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
              href="/page1"
              aria-label="Back to heat risk map"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
            >
              <ArrowLeft size={16} />
            </a>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Wallet size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-wide text-slate-100">
                PMC Climate Action
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <MapPin size={13} className="text-emerald-300" />
            <span className="text-sm font-medium text-slate-500">Active ward</span>
            <span className="text-base font-semibold text-slate-200">Ward 1</span>
            <ChevronDown size={13} className="text-slate-500" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[30px]">
              <span>Commissioner Budget Dashboard</span>
              <span className="mt-1 block text-[15px] font-medium tracking-normal text-slate-500 sm:mt-0 sm:ml-2 sm:inline">
                Ward: 1
              </span>
            </h1>
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-200">
                  Optimization controls
                </h2>
              </div>
            </div>
            {isOptimized && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-sm font-medium text-emerald-300">
                <Check size={12} />
                Plan optimized
              </span>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(225px,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-7">
            <div>
              <label
                htmlFor="budget-input"
                className="mb-2 block text-base font-semibold text-slate-300"
              >
                Ward Budget (₹)
              </label>
              <div className="flex h-11 items-center rounded-lg border border-slate-300 bg-slate-50 px-3 focus-within:border-emerald-700">
                <BadgeIndianRupee size={16} className="mr-2 shrink-0 text-emerald-300" />
                <input
                  id="budget-input"
                  type="text"
                  inputMode="decimal"
                  aria-label="Ward Budget in rupees"
                  value={budgetInput}
                  onChange={(event) => changeBudget(event.target.value)}
                  onBlur={formatBudgetInput}
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold tabular-nums text-slate-900 outline-none"
                />
              </div>
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
              className="group flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-400 px-4 text-base font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={16} aria-hidden="true" />
              )}
              {isRunning ? "Optimizing..." : "Run AI Budget Optimizer"}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {apiError && (
          <p role="alert" className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-base text-rose-200">
            {apiError}
          </p>
        )}

        {backendScenario && (
          <section aria-live="polite" className="mb-4 rounded-xl border border-white/[0.08] bg-[#0e161f] p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-100">
              Executive summary
            </h2>
            <div className="mt-4 grid gap-3 text-base text-slate-300 sm:grid-cols-3">
              <SummaryResult
                label="Total allocated cost"
                value={formatCurrency(backendScenario.totalAllocatedCost)}
              />
              <SummaryResult
                label="Predicted cooling benefit"
                value={`${backendScenario.predictedCoolingBenefit.toFixed(1)}°C`}
              />
              <SummaryResult
                label="Estimated CO₂ impact"
                value={`${backendScenario.estimatedCo2Impact.toLocaleString("en-IN")} tons`}
              />
            </div>
            <AllocationResults data={backendScenario.allocationsJson} />
          </section>
        )}

        <section aria-label="Scenario history" className="mb-4 rounded-xl border border-white/[0.08] bg-[#0e161f] p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-100">Saved scenario history</h2>
          {isLoadingHistory ? (
            <p className="mt-2 text-base text-slate-500">Loading saved scenarios…</p>
          ) : historyError ? (
            <p role="alert" className="mt-2 text-base text-rose-300">{historyError}</p>
          ) : scenarioHistory.length ? (
            <ul className="mt-2 space-y-1 text-base text-slate-300">
              {scenarioHistory.slice(0, 3).map((scenario, index) => (
                <li key={scenario.id ?? `${scenario.scenarioName ?? "scenario"}-${index}`}>
                  {scenario.scenarioName ?? `Scenario ${scenario.id ?? index + 1}`} ·{" "}
                  {formatCurrency(scenario.totalAllocatedCost)} ·{" "}
                  {scenario.predictedCoolingBenefit.toFixed(1)}°C cooling
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-base text-slate-500">No saved scenarios for this ward yet.</p>
          )}
        </section>

        {constraintsApplied && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-base text-amber-200">
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
                <h2 className="text-base font-semibold text-slate-100">
                  Recommended allocation
                </h2>
              </div>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-sm font-medium text-slate-500">
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
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                        <InterventionIcon type={hotspot.icon} />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-200">
                          Hotspot {hotspot.id}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {hotspot.locality}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-md border px-1.5 py-1 text-sm font-semibold uppercase tracking-wide ${
                        hotspot.vulnerability >= 0.75
                          ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-200"
                      }`}
                    >
                      Vₕ {hotspot.vulnerability.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-white/[0.07] pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-base text-slate-500">Allocated amount</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-100">
                          {formatCurrency(hotspot.allocated)}
                        </p>
                      </div>
                      <p className="text-right text-base font-semibold leading-snug text-slate-500">
                        <span className="block text-lg text-slate-200">
                          {hotspot.populationAtRisk.toLocaleString("en-IN")}
                        </span>
                        residents at risk
                      </p>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-emerald-900/[0.045] px-2.5 py-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <InterventionIcon type={hotspot.icon} />
                        <div className="min-w-0">
                          <p className="text-base font-medium text-slate-300">
                            {hotspot.interventionLabel}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {hotspot.intervention}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-lg font-semibold text-emerald-300">
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
                  <h2 className="text-base font-semibold text-slate-100">
                    Budget utilization
                  </h2>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-200">
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
                  <span className="mt-0.5 text-sm uppercase tracking-[0.12em] text-slate-500">
                    allocated
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-white/[0.07] pt-3">
                <div className="flex items-center justify-between gap-3 text-base">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-700" />
                    <span>Allocated</span>
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(totalAllocated)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-base">
                  <span className="flex items-center gap-2 text-base text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-[#d7d5ca]" />
                    <span>Remaining unallocated</span>
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(remaining)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2 text-base">
                  <span className="text-slate-500">Total budget</span>
                  <span className="font-semibold tabular-nums text-slate-200">
                    {formatCurrency(budget)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-900/[0.045] px-3 py-2">
                <Flame size={13} className="text-rose-300" />
                <span className="text-base text-slate-500">Projected cumulative cooling</span>
                <span className="ml-auto text-lg font-semibold text-emerald-300">
                  −{totalCooling.toFixed(1)}°C
                </span>
              </div>
            </section>

            <section className="optimizer-explanation rounded-2xl border p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                  <Sparkles size={15} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Why this plan was selected
                  </h2>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                <ExplanationItem>
                  🔴 <strong>Hotspot A (High Priority):</strong> Severe vulnerability (<strong className="text-lg">Vh=0.85</strong>) and <strong className="text-lg">12k+</strong> at-risk residents.
                </ExplanationItem>
                <ExplanationItem>
                  🔵 <strong>Hotspot B (Cool Roofs):</strong> <strong className="text-lg">91%</strong> roof-area ratio makes surface coating the most cost-efficient choice.
                </ExplanationItem>
                <ExplanationItem>
                  ⚖️ <strong>Optimization Balance:</strong> Weighted <strong className="text-lg">{coolingPreference}%</strong> for maximum cooling and <strong className="text-lg">{100 - coolingPreference}%</strong> for cost efficiency.
                </ExplanationItem>
                <ExplanationItem>
                  💰 <strong>Budget Reserve:</strong> <strong className="text-lg">4%</strong> retained for procurement variance.
                </ExplanationItem>
              </ul>
            </section>
          </aside>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={saveBaseline}
                className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-base font-semibold transition ${
                  saved
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-white/[0.1] bg-transparent text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? "Baseline Saved" : "Save Baseline Scenario"}
              </button>
              <button
                type="button"
                onClick={() => setConstraintsApplied((current) => !current)}
                className="group flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-base font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300"
              >
                {constraintsApplied ? "Update Field Constraints" : "Simulate Field Constraints"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="flex flex-col items-stretch gap-2 rounded-xl border border-amber-800/10 bg-amber-900/[0.035] p-3 sm:basis-full sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <span className="flex items-center gap-2 text-base text-slate-500">
                <MapPin size={14} className="shrink-0 text-amber-300" />
                <span className="font-semibold text-slate-200">Next: field verification</span>
              </span>
              <a
                href={`/page3?budget=${encodeURIComponent(budget)}`}
                className="group flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 text-base font-semibold text-amber-200 transition hover:bg-amber-400/20 sm:px-4"
              >
                Open field report
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function ExplanationItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-base leading-relaxed text-slate-300">
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function SummaryResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111a24] p-4 shadow-sm">
      <p className="text-base text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-100">
        {value}
      </p>
    </div>
  );
}

function AllocationResults({ data }: { data: unknown }) {
  let allocations = data;
  if (typeof data === "string") {
    try {
      allocations = JSON.parse(data) as unknown;
    } catch {
      return (
        <p role="alert" className="mt-4 text-base text-rose-300">
          Allocation details are not valid JSON.
        </p>
      );
    }
  }

  if (allocations === null || allocations === undefined) {
    return (
      <p className="mt-4 text-base text-slate-400">
        No allocation details were returned.
      </p>
    );
  }

  const entries: [string, unknown][] = Array.isArray(allocations)
    ? allocations.map((allocation, index) => [`Allocation ${index + 1}`, allocation])
    : typeof allocations === "object"
      ? Object.entries(allocations)
      : [["Allocation", allocations]];

  return (
    <section className="mt-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">
        Allocation plan
      </h3>
      {entries.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {entries.map(([label, value]) => (
            <li
              key={label}
              className="rounded-xl border border-white/[0.08] bg-[#111a24] p-4 shadow-sm"
            >
              <p className="mb-2 text-base font-semibold text-slate-200">
                {label}
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
                {typeof value === "string"
                  ? value
                  : JSON.stringify(value, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-slate-400">No allocation entries returned.</p>
      )}
    </section>
  );
}
