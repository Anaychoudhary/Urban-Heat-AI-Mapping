# Urban Heat AI Mapping

Frontend for ward heat-risk mapping, budget optimization, field constraints,
scenario comparison, and outcome tracking.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The flow starts at `/` and continues through
`/page2`, `/page3`, `/page4`, and `/page5`. The home route opens the role
selection page first; commissioners continue to `/page1`, and field engineers
continue to `/page3`. The frontend layouts adapt for mobile-sized screens.

Scenario approval and model recalibration are front-end demonstrations. The
scenario comparison's PDF action opens the browser print dialog, where the
report can be saved as a PDF.

## Spring Boot API integration

The shared typed HTTP client is in [`frontend/apiService.ts`](./frontend/apiService.ts)
and targets `http://localhost:8080`. It handles ward hotspot lookups, optimizer
requests and history, and field constraint reports. Ward-specific map markers
and the field portal use the hotspot endpoint; the budget optimizer submits an
optimization request and loads saved scenario history.
The current dashboard targets Aundh Ward 08 and carries its selected budget
into the field report; update the ward ID when using a different ward.

The screens use the API like this:

```ts
const hotspots = await getHotspots(wardId);
const scenario = await runOptimization({ wardId, budget, scenarioName });
const scenarios = await getScenarioHistory(wardId);
const recalculated = await reportFieldConstraint({
  hotspotId,
  category,
  notes,
  currentBudget,
});
```

Import these functions from `./apiService` and call them from a component's
`useEffect` or submit handler. API failures are surfaced in the screens; ensure
Spring Boot is available at port 8080. The frontend does not upload image
files: the field endpoint accepts an optional hosted `photoUrl`, which can be
entered separately from the local photo preview.

## Geographic data coverage

The ward selector is populated with the 41 Pune ward names and IDs supplied by
the project user. Those names are available for selection, but this project
does not include a ward boundary file, coordinates, or a separate verified PMC
source.

The map's four citywide hotspot points and their heat, NDVI, vulnerability, and
population measurements remain illustrative sample records. Selecting an
individual Pune ward requests its hotspots from the Spring Boot API and places
those records on the map. The API does not provide a verified ward temperature
average, vegetation measurements, or dated historical observations; the date
filter remains disabled for that reason.

Connect official ward boundaries and validated, ward-linked time-series
measurements before treating the map or dashboard values as operational data.
