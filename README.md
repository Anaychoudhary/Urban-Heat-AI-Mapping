# Urban Heat AI Mapping

Frontend for ward heat-risk mapping, budget optimization, field constraints,
scenario comparison, and outcome tracking.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The flow starts at `/` and continues through
`/page2`, `/page3`, `/page4`, and `/page5`.

Scenario approval and model recalibration are front-end demonstrations. The
scenario comparison's PDF action opens the browser print dialog, where the
report can be saved as a PDF.

## Geographic data coverage

The ward selector is populated with the 41 Pune ward names and IDs supplied by
the project user. Those names are available for selection, but this project
does not include a ward boundary file, coordinates, or a separate verified PMC
source.

The map's four hotspot points and their heat, NDVI, vulnerability, and
population measurements remain illustrative sample records. They are not
joined to the supplied ward list, so selecting an individual ward shows
unavailable ward metrics and does not place sample hotspots on that ward.
Citywide hotspot counts are labeled as sample locations, not a complete
41-ward aggregate. Citywide averages, verified vegetation measurements, a live
feed, and dated historical observations are not connected; the date filter is
disabled for that reason.

Connect official ward boundaries and validated, ward-linked time-series
measurements before treating the map or dashboard values as operational data.
