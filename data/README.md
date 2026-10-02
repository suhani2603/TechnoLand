# TechnoLand — Mock GeoJSON Data

> ⚠️ **DEMO DATA ONLY** — All features, names, coordinates, and attributes
> in this folder are synthetic and created for demonstration purposes.
> They do not represent real land parcels, ownership, or official measurements.

## Files

| File | Layer ID | Features | Description |
|------|----------|----------|-------------|
| `mock/land-parcels.geojson` | `land-parcels` | 8 polygons | Cadastral land parcels with soil, ownership, and land-use data |
| `mock/agricultural-zones.geojson` | `agricultural-zones` | 4 polygons | Crop suitability zones with rainfall and soil data |
| `mock/infrastructure.geojson` | `infrastructure` | 6 lines | Primary, secondary, and feeder roads |
| `mock/water-bodies.geojson` | `water-bodies` | 4 polygons | Rivers, lakes, and reservoirs |

## Coordinate System

All data uses **WGS84 (EPSG:4326)** — standard longitude/latitude.

The mock data is centred on a synthetic rural region in **north-central Nigeria**
(approximately 7–9°E, 8–10°N) to represent a realistic African rural-development context.

## Phase 2 — Real Data Sources

Replace mock files with real GeoJSON from these open sources:

| Layer | Source |
|-------|--------|
| Land parcels | National surveying agency cadastre or GADM admin boundaries |
| Agricultural zones | [FAO GeoNetwork](https://data.fao.org/map) crop suitability layers |
| Roads | [Geofabrik OSM extracts](https://download.geofabrik.de/) |
| Water bodies | [ESA WorldCover](https://esa-worldcover.org/) or HydroSHEDS |
| Soil types | [ISRIC SoilGrids](https://www.isric.org/explore/soilgrids) |

## Frontend Integration

Vite dev server serves these files as static assets from `frontend/public/mock-data/`.
The `api.js` service layer fetches them at `/mock-data/{layerId}.geojson`
when `VITE_USE_MOCK=true` (the default in Phase 1).
