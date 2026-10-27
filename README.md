# Urban Heat AI Mapping

**A ward-level planning and field-reporting dashboard for urban heat mitigation in Pune.**

Explore heat-risk hotspots, plan and compare cooling investments, report on-the-ground constraints, and review predicted versus observed outcomes through a responsive web interface.

> **Data note:** This project is a planning prototype. Some map values are illustrative; review [Geographic data and limitations](#geographic-data-and-limitations) before using any dashboard values for operational decisions.

## What you can do

| Workspace | Purpose |
| --- | --- |
| Heat-risk map | Explore hotspot locations and heat-risk indicators by ward. |
| Budget optimizer | Submit a ward budget and review a proposed investment scenario. |
| Field portal | Report implementation constraints associated with a hotspot. |
| Scenario tracker | Compare saved scenarios and print a comparison report. |
| Outcome calibration | Review the prediction-versus-reality workflow. |

The interface includes role selection for commissioners and field engineers, and adapts to mobile-sized screens.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Mapping and charts:** Leaflet / React Leaflet, Recharts
- **Backend:** Java 25, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL

## Run locally

### Prerequisites

- Node.js and npm
- Java 25
- PostgreSQL

### 1. Configure the database

Create a PostgreSQL database named `urbanheat`, or update the datasource settings in [`Javabackend/src/main/resources/application.properties`](./Javabackend/src/main/resources/application.properties) to match your local database. Keep credentials local; do not commit secrets.

### 2. Start the backend

In PowerShell, from the repository root:

```powershell
cd Javabackend
.\mvnw.cmd spring-boot:run
```

The frontend API client expects the Spring Boot API at `http://localhost:8080`. Make sure the backend's CORS configuration allows the Vite development server.

### 3. Start the frontend

In a second terminal, from the repository root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run:

```powershell
npm run build
```

## Application routes

| Route | Screen |
| --- | --- |
| `/` or `/login` | Role selection |
| `/page1` | Heat-risk map |
| `/page2` or `/budget-optimizer` | Budget optimizer |
| `/page3` or `/field-reporter` | Field restriction portal |
| `/page4` | Saved scenarios and change tracker |
| `/page5` | Prediction-versus-reality calibration |

The role-selection screen links commissioners to the map and field engineers to the field portal.

## Backend API

The typed frontend client is [`frontend/apiService.ts`](./frontend/apiService.ts). It communicates with these endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/field/hotspots/{wardId}` | Load a ward's hotspots |
| `POST` | `/api/optimization/run` | Submit a budget optimization request |
| `GET` | `/api/optimization/scenarios/{wardId}` | Load saved scenario history |
| `POST` | `/api/field/constraint` | Report a field constraint |

Import the client functions from `./apiService`:

```ts
const hotspots = await getHotspots(wardId);
const scenario = await runOptimization({ wardId, budget, scenarioName });
const scenarios = await getScenarioHistory(wardId);
const result = await reportFieldConstraint({
  hotspotId,
  category,
  notes,
  currentBudget,
});
```

Call them from a component's effect or event handler. API errors are surfaced in the screens. Field reports accept an optional hosted `photoUrl`; local photo previews are not uploaded.

## Geographic data and limitations

- The ward selector contains 41 Pune ward names and IDs supplied for this project. The repository does not include ward boundary geometry, coordinates for those wards, or an independently verified PMC ward dataset.
- Four citywide hotspot points and their heat, NDVI, vulnerability, and population measurements are illustrative sample records.
- Selecting an individual ward requests hotspot records from the Spring Boot API. The API does not provide verified ward-average temperatures, vegetation measurements, or dated historical observations, so the date filter is disabled.
- Scenario approval and model recalibration are frontend demonstrations. The scenario comparison's PDF action opens the browser print dialog; use the browser's save-to-PDF option.

Connect official ward boundaries and validated, ward-linked time-series data before treating map or dashboard values as operational data.
