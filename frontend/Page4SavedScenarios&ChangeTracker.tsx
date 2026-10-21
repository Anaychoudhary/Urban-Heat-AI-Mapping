import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  GitCompareArrows,
  IndianRupee,
  Leaf,
  MapPin,
  ShieldCheck,
  Trees,
} from "lucide-react";

type ScenarioId = "baseline" | "field";

export default function Page4SavedScenariosChangeTracker() {
  const [scenarioA, setScenarioA] = useState<ScenarioId>("baseline");
  const [scenarioB, setScenarioB] = useState<ScenarioId>("field");
  const [exported, setExported] = useState(false);
  const [approved, setApproved] = useState(false);

  const baselineFirst = scenarioA === "baseline";
  const scenariosMatch = scenarioA === scenarioB;
  const allocationFor = (baseline: string, field: string, scenario: string) =>
    scenario === "baseline" ? baseline : field;
  const varianceFor = (baseline: string, field: string) =>
    scenariosMatch ? "No change" : baselineFirst ? baseline : field;
  const directionFor = (direction: "up" | "down"): "up" | "down" | "neutral" =>
    scenariosMatch ? "neutral" : baselineFirst ? direction : direction === "up" ? "down" : "up";

  return (
    <main className="scenario-diff-report theme-warm min-h-screen bg-[#0a1017] pb-10 text-slate-100">
      <header className="border-b border-white/[0.07] bg-[#0c131b]/90 print:hidden">
        <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-7">
          <a
            href="/page3"
            aria-label="Back to field report"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
          >
            <ArrowLeft size={17} />
          </a>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-800/10 bg-emerald-900/[0.06] text-emerald-800">
            <GitCompareArrows size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-100 sm:text-sm">
              PMC Climate Action
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-slate-500">
              Scenario management
            </p>
          </div>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-emerald-800/10 bg-emerald-900/[0.045] px-3 py-1.5 text-[10px] font-medium text-emerald-800 sm:inline-flex">
            <MapPin size={12} />
            Aundh Ward
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 sm:px-7 sm:pt-9">
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Climate intelligence <span className="mx-1.5">/</span> Ward planning{" "}
            <span className="mx-1.5">/</span>{" "}
            <span className="text-emerald-800">Scenario comparison</span>
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-100 sm:text-[28px]">
            Scenario Management &amp; Plan Diff Analysis
          </h1>
          <p className="mt-1.5 text-[11px] text-slate-500 sm:text-xs">
            Compare the baseline with the field-adjusted ward plan.
          </p>
        </div>

        <section
          aria-label="Choose scenarios to compare"
          className="mb-5 grid gap-3 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:grid-cols-2 sm:gap-4 sm:p-5"
        >
          <ScenarioSelect
            label="Scenario A"
            value={scenarioA}
            onChange={setScenarioA}
            options={[
              { value: "baseline", label: "25L Initial Ward Allocation" },
              { value: "field", label: "Post-Field Restriction · Hotspot A" },
            ]}
          />
          <ScenarioSelect
            label="Scenario B"
            value={scenarioB}
            onChange={setScenarioB}
            options={[
              { value: "field", label: "Post-Field Restriction · Overhead Wires at Hotspot A" },
              { value: "baseline", label: "25L Initial Ward Allocation" },
            ]}
          />
        </section>

        <section aria-label="Scenario summary comparison" className="grid gap-3 sm:grid-cols-2">
          <ScenarioSummary
            label="Scenario A"
            title={scenarioA === "baseline" ? "25L Initial Ward Allocation" : "Post-Field Restriction · Hotspot A"}
            cost={scenarioA === "baseline" ? "₹24.0L" : "₹24.5L"}
            cooling={scenarioA === "baseline" ? "−2.8°C" : "−2.5°C"}
            co2={scenarioA === "baseline" ? "14.2 Tons/yr" : "12.8 Tons/yr"}
            scenarioKind={scenarioA}
          />
          <ScenarioSummary
            label="Scenario B"
            title={scenarioB === "field" ? "Post-Field Restriction · Hotspot A" : "25L Initial Ward Allocation"}
            cost={scenarioB === "field" ? "₹24.5L" : "₹24.0L"}
            cooling={scenarioB === "field" ? "−2.5°C" : "−2.8°C"}
            co2={scenarioB === "field" ? "12.8 Tons/yr" : "14.2 Tons/yr"}
            scenarioKind={scenarioB}
          />
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e161f]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Plan changes</h2>
              <p className="mt-1 text-[10px] text-slate-500">
                Allocation differences by hotspot and intervention
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/10 bg-emerald-900/[0.045] px-2.5 py-1.5 text-[9px] font-medium text-emerald-800">
              <Check size={12} />
              Field report applied
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.025] text-[9px] font-semibold uppercase tracking-[0.11em] text-slate-500">
                  <th className="px-4 py-3 sm:px-5">Hotspot</th>
                  <th className="px-4 py-3">Intervention type</th>
                  <th className="px-4 py-3">Scenario A</th>
                  <th className="px-4 py-3">Scenario B</th>
                  <th className="px-4 py-3 sm:px-5">Variance / reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <DiffRow
                  hotspot="Hotspot A"
                  locality="Baner Road Junction"
                  intervention={scenarioA === "field" && scenarioB === "field" ? "Medium shrubs" : "Neem tall trees"}
                  scenarioA={allocationFor("400 units · ₹8L", "50 medium shrubs · ₹2L", scenarioA)}
                  scenarioB={allocationFor("400 units · ₹8L", "50 medium shrubs · ₹2L", scenarioB)}
                  variance={varianceFor("−₹6.0L", "+₹6.0L")}
                  reason={scenariosMatch ? "Same scenario selected" : "Overhead wires"}
                  direction={directionFor("down")}
                  icon={<Trees size={15} />}
                />
                <DiffRow
                  hotspot="Hotspot B"
                  locality="Hadapsar Market"
                  intervention="Cool roofs"
                  scenarioA={allocationFor("₹9.0L", "₹13.0L", scenarioA)}
                  scenarioB={allocationFor("₹9.0L", "₹13.0L", scenarioB)}
                  variance={varianceFor("+₹4.0L", "−₹4.0L")}
                  reason={scenariosMatch ? "Same scenario selected" : baselineFirst ? "Reallocated from Hotspot A" : "Baseline allocation"}
                  direction={directionFor("up")}
                  icon={<IndianRupee size={15} />}
                />
                <DiffRow
                  hotspot="Hotspot C"
                  locality="Kothrud Depot"
                  intervention="Shaded canopy"
                  scenarioA={allocationFor("₹5.0L", "₹6.5L", scenarioA)}
                  scenarioB={allocationFor("₹5.0L", "₹6.5L", scenarioB)}
                  variance={varianceFor("+₹1.5L", "−₹1.5L")}
                  reason={scenariosMatch ? "Same scenario selected" : baselineFirst ? "Reallocated" : "Baseline allocation"}
                  direction={directionFor("up")}
                  icon={<Leaf size={15} />}
                />
              </tbody>
            </table>
          </div>
          <p className="border-t border-white/[0.06] px-4 py-3 text-[10px] text-slate-500 sm:px-5">
            Swipe horizontally to review all comparison columns.
          </p>
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 print:hidden">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900/[0.06] text-emerald-800">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h2 className="text-xs font-semibold text-slate-200">Scenario actions</h2>
              <p className="mt-1 text-[10px] text-slate-500">
                Export the comparison or approve the active scenario.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:flex">
            <button
              type="button"
              onClick={() => {
                setExported(true);
                window.print();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.1] px-4 text-[10px] font-semibold text-slate-300 transition hover:bg-white/[0.04]"
            >
              <Download size={14} />
              {exported ? "Report ready to print" : "Export PDF Report for Commissioner"}
            </button>
            <button
              type="button"
              onClick={() => setApproved(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-[10px] font-semibold text-[#07120f] shadow-md shadow-emerald-950/10 transition hover:bg-emerald-300"
            >
              {approved ? <Check size={14} /> : <ShieldCheck size={14} />}
              {approved ? "Scenario B approved" : "Approve & Deploy Scenario B"}
            </button>
          </div>
          {approved && (
            <p role="status" className="text-[10px] font-medium text-emerald-800 sm:basis-full sm:text-right">
              Scenario B marked approved for deployment.
            </p>
          )}
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-500 print:hidden">
          <a href="/page3" className="inline-flex min-h-9 items-center gap-1.5 hover:text-emerald-800">
            <ArrowLeft size={12} />
            Back to field report
          </a>
          <a href="/page5" className="inline-flex min-h-9 items-center gap-1.5 hover:text-emerald-800">
            Outcome tracking
            <ArrowRight size={12} />
          </a>
        </footer>
      </div>
    </main>
  );
}

function ScenarioSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: ScenarioId;
  onChange: (value: ScenarioId) => void;
  options: { value: ScenarioId; label: string }[];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value === "baseline" ? "baseline" : "field")
          }
          className="h-11 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.025] px-3 pr-9 text-[10px] font-medium text-slate-200 outline-none transition focus:border-emerald-800/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function ScenarioSummary({
  label,
  title,
  cost,
  cooling,
  co2,
  scenarioKind,
}: {
  label: string;
  title: string;
  cost: string;
  cooling: string;
  co2: string;
  scenarioKind: ScenarioId;
}) {
  const active = scenarioKind === "field";
  return (
    <article className={`rounded-2xl border p-4 sm:p-5 ${active ? "border-emerald-800/15 bg-[#eef1e9]" : "border-white/[0.08] bg-[#0e161f]"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-[9px] font-semibold uppercase tracking-[0.13em] ${active ? "text-emerald-800" : "text-slate-500"}`}>{label}</p>
          <h2 className={`mt-1 truncate text-xs font-semibold ${active ? "text-[#29352f]" : "text-slate-200"}`}>{title}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold ${active ? "bg-[#dce5d5] text-[#657b58]" : "bg-white/[0.05] text-slate-500"}`}>
          {active ? "ACTIVE" : "BASELINE"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Total cost" value={cost} active={active} />
        <Metric label="Est. cooling" value={cooling} active={active} />
        <Metric label="CO₂ offset" value={co2} active={active} />
      </div>
    </article>
  );
}

function Metric({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`text-[8px] leading-relaxed ${active ? "text-[#718078]" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 break-words text-[12px] font-semibold tabular-nums sm:text-sm ${active ? "text-[#29352f]" : "text-slate-100"}`}>{value}</p>
    </div>
  );
}

function DiffRow({
  hotspot,
  locality,
  intervention,
  scenarioA,
  scenarioB,
  variance,
  reason,
  direction,
  icon,
}: {
  hotspot: string;
  locality: string;
  intervention: string;
  scenarioA: string;
  scenarioB: string;
  variance: string;
  reason: string;
  direction: "up" | "down" | "neutral";
  icon: ReactNode;
}) {
  const isReduction = direction === "down";
  const isNeutral = direction === "neutral";
  return (
    <tr className="align-top">
      <td className="px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold text-slate-200">{hotspot}</p>
        <p className="mt-1 text-[9px] text-slate-500">{locality}</p>
      </td>
      <td className="px-4 py-4">
        <span className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-900/[0.06] text-emerald-800">{icon}</span>
          {intervention}
        </span>
      </td>
      <td className="px-4 py-4 text-[10px] font-medium tabular-nums text-slate-400">{scenarioA}</td>
      <td className="px-4 py-4 text-[10px] font-semibold tabular-nums text-slate-200">{scenarioB}</td>
      <td className="px-4 py-4 sm:px-5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold tabular-nums ${isNeutral ? "bg-slate-100 text-slate-600" : isReduction ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"}`}>
          {isNeutral ? null : isReduction ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {variance}
        </span>
        <p className={`mt-1.5 max-w-[180px] text-[9px] leading-relaxed ${isReduction ? "text-rose-700" : "text-emerald-800"}`}>{reason}</p>
      </td>
    </tr>
  );
}