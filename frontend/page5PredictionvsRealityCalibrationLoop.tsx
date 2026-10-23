import { useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Info,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const temperatureHistory = [
  { month: "Month 0", predicted: 43.5, observed: 43.6 },
  { month: "Month 1", predicted: 42.8, observed: 43.0 },
  { month: "Month 2", predicted: 42.1, observed: 42.2 },
  { month: "Month 3", predicted: 41.5, observed: 41.4 },
  { month: "Month 4", predicted: 40.8, observed: 40.9 },
  { month: "Month 5", predicted: 40.2, observed: 40.1 },
  { month: "Month 6", predicted: 39.6, observed: 39.8 },
];

export default function Page5PredictionvsRealityCalibrationLoop() {
  const [calibrated, setCalibrated] = useState(false);

  return (
    <main className="theme-warm min-h-screen bg-[#0a1017] pb-10 text-slate-100">
      <header className="border-b border-white/[0.07] bg-[#0c131b]/90">
        <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-7">
          <a
            href="/page4"
            aria-label="Back to scenario comparison"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
          >
            <ArrowLeft size={17} />
          </a>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-800/10 bg-emerald-900/[0.06] text-emerald-800">
            <Activity size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-100">
              PMC Climate Action
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 sm:px-7 sm:pt-9">
        <div className="mb-5">
          <h1 className="max-w-4xl text-[22px] font-semibold leading-tight tracking-tight text-slate-100 sm:text-[28px]">
            Model outcomes &amp; calibration
          </h1>
        </div>

        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-800/10 bg-sky-50 px-3 py-3 text-base leading-relaxed text-sky-900 sm:px-4">
          <Info size={15} className="mt-0.5 shrink-0" />
          <p className="font-medium">
            Illustrative data · 6-month outcome tracking
          </p>
        </div>

        <section aria-label="Model outcome metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryMetric label="Projects tracked" value="12" unit="sites" icon={<Crosshair size={16} />} />
          <SummaryMetric label="Mean absolute error" value="0.45" unit="°C" icon={<TrendingDown size={16} />} />
          <SummaryMetric label="Cooling accuracy" value="91.2" unit="%" icon={<Activity size={16} />} />
          <SummaryMetric
            label="Calibration status"
            value="Active"
            unit="Auto-adjusted −0.3°C bias"
            icon={<ShieldCheck size={16} />}
            status
          />
        </section>

        <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <article className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0e161f] p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-100">
                Predicted vs. observed temperature
              </h2>
              <p className="mt-1 text-sm text-slate-500">Surface temperature · °C</p>
            </div>
            <div className="h-[270px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureHistory} margin={{ top: 8, right: 10, bottom: 4, left: -16 }}>
                  <CartesianGrid stroke="#deded3" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#718078", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#deded3" }}
                    interval={0}
                    tickFormatter={(_, index) => `M${index}`}
                  />
                  <YAxis
                    domain={[38, 45]}
                    tick={{ fill: "#718078", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `${value}°`}
                  />
                  <Tooltip
                    contentStyle={{ border: "1px solid #deded3", borderRadius: 12, backgroundColor: "#fbfaf6", color: "#29352f", fontSize: 14 }}
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)}°C`,
                      name === "predicted" ? "Predicted LST" : "Observed LST",
                    ]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    iconSize={7}
                    formatter={(value: string) => value === "predicted" ? "Predicted LST" : "Observed LST"}
                    wrapperStyle={{ color: "#718078", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="predicted"
                    stroke="#5b83bd"
                    strokeWidth={2.5}
                    strokeDasharray="6 5"
                    dot={{ r: 3, fill: "#5b83bd", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive
                    animationDuration={850}
                  />
                  <Line
                    type="monotone"
                    dataKey="observed"
                    name="observed"
                    stroke="#65866b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#65866b", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e161f]">
            <div className="border-b border-white/[0.07] px-4 py-4 sm:px-5">
              <h2 className="text-base font-semibold text-slate-100">Site calibration log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-white/[0.025] text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-3 py-3">Site name</th>
                    <th className="px-3 py-3">Intervention</th>
                    <th className="px-3 py-3">Predicted</th>
                    <th className="px-3 py-3">Measured</th>
                    <th className="px-3 py-3">Error</th>
                    <th className="px-3 py-3">Calibration applied</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    <td className="px-3 py-4 text-base font-semibold text-slate-200">Hotspot B</td>
                    <td className="px-3 py-4 text-base text-slate-400">Cool roof</td>
                    <td className="px-3 py-4 text-base tabular-nums text-slate-400">38.2°C</td>
                    <td className="px-3 py-4 text-base tabular-nums text-slate-200">38.6°C</td>
                    <td className="px-3 py-4">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-sm font-semibold tabular-nums text-amber-800">+0.4°C</span>
                    </td>
                    <td className="px-3 py-4 text-sm leading-relaxed text-slate-400">
                      Benefit factor −5%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="border-t border-white/[0.06] px-4 py-3 text-sm text-slate-500 sm:px-5">
              Swipe horizontally to review all calibration columns.
            </p>
          </article>
        </section>

        <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-800/10 bg-[#eef1e9] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dce5d5] text-[#657b58]">
              <RefreshCw size={16} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#29352f]">Recalibrate optimizer</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalibrated(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#819572] px-4 text-base font-semibold text-white transition hover:bg-[#657b58]"
          >
            {calibrated ? <Check size={14} /> : <RefreshCw size={14} />}
            {calibrated ? "Model recalibrated" : "Recalibrate model"}
            {!calibrated && <ArrowRight size={13} />}
          </button>
        </section>

        {calibrated && (
          <div
            role="status"
            className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-800/15 bg-[#eef1e9] px-4 py-3 text-base font-medium text-[#657b58] shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:w-fit"
          >
            <Check size={15} />
            Model weights updated based on observed field data.
          </div>
        )}

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-slate-500">
          <a href="/page4" className="inline-flex min-h-9 items-center gap-1.5 hover:text-emerald-800">
            <ArrowLeft size={12} />
            Back to scenario comparison
          </a>
        </footer>
      </div>
    </main>
  );
}

function SummaryMetric({
  label,
  value,
  unit,
  icon,
  status = false,
}: {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  status?: boolean;
}) {
  return (
    <article className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0e161f] p-3.5 sm:rounded-2xl sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-medium leading-relaxed text-slate-500">{label}</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-900/[0.06] text-emerald-800">{icon}</span>
      </div>
      <p className={`mt-2 break-words font-semibold tabular-nums ${status ? "text-lg" : "text-xl"} text-slate-100`}>
        {value}
      </p>
      <p className="mt-0.5 text-base leading-relaxed text-slate-500">{unit}</p>
    </article>
  );
}