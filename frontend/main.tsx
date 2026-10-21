import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import Page1HeatRiskMap from "./Page1HeatRiskMap";
import "./styles.css";

const Page2BudgetOptimizer = lazy(
  () => import("./Page2BudgetOptimizer"),
);

const root = document.getElementById("root");

if (!root) {
  throw new Error("Could not find the root element.");
}

createRoot(root).render(
  <StrictMode>
    {window.location.pathname === "/page2" ? (
      <Suspense
        fallback={
          <main className="theme-warm flex min-h-screen items-center justify-center bg-[#0a1017] text-slate-100">
            <p className="text-xs text-slate-500">Loading budget optimizer…</p>
          </main>
        }
      >
        <Page2BudgetOptimizer />
      </Suspense>
    ) : (
      <Page1HeatRiskMap />
    )}
  </StrictMode>,
);
