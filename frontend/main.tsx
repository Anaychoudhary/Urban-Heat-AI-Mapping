import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import Page1HeatRiskMap from "./Page1HeatRiskMap";
import "./styles.css";

const Page2BudgetOptimizer = lazy(
  () => import("./Page2BudgetOptimizer"),
);
const Page3FieldRestrictionPortal = lazy(
  () => import("./Page3FieldRestrictionPortal"),
);
const Page4SavedScenariosChangeTracker = lazy(
  () => import("./Page4SavedScenarios&ChangeTracker"),
);
const Page5PredictionvsRealityCalibrationLoop = lazy(
  () => import("./page5PredictionvsRealityCalibrationLoop"),
);

const root = document.getElementById("root");

if (!root) {
  throw new Error("Could not find the root element.");
}

function renderCurrentPage() {
  switch (window.location.pathname) {
    case "/page5":
      return (
        <Suspense fallback={<LoadingPage label="Loading outcome tracking…" />}>
          <Page5PredictionvsRealityCalibrationLoop />
        </Suspense>
      );
    case "/page4":
      return (
        <Suspense fallback={<LoadingPage label="Loading scenario comparison…" />}>
          <Page4SavedScenariosChangeTracker />
        </Suspense>
      );
    case "/page3":
      return (
        <Suspense fallback={<LoadingPage label="Loading field portal…" />}>
          <Page3FieldRestrictionPortal />
        </Suspense>
      );
    case "/page2":
      return (
        <Suspense fallback={<LoadingPage label="Loading budget optimizer…" />}>
          <Page2BudgetOptimizer />
        </Suspense>
      );
    default:
      return <Page1HeatRiskMap />;
  }
}

function LoadingPage({ label }: { label: string }) {
  return (
    <main className="theme-warm flex min-h-screen items-center justify-center bg-[#0a1017] text-slate-100">
      <p className="text-xs text-slate-500">{label}</p>
    </main>
  );
}

createRoot(root).render(
  <StrictMode>
    {renderCurrentPage()}
  </StrictMode>,
);
