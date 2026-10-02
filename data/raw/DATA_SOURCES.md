# TechnoLand — Data Sources Register

**Study region:** Dehradun District, Uttarakhand, India  
**Last updated:** September 2026

---

## Data Classification

| Label | Meaning |
|---|---|
| **PUBLIC SOURCE** | Downloaded from official government or authoritative public sources, unmodified |
| **DERIVED** | Calculated or transformed by TechnoLand from public source data |
| **SYNTHETIC DEMO** | Entirely fictional data created for demonstration purposes only |

> ⚠️ TechnoLand does **not** display, store, or process private land ownership records,
> Aadhaar numbers, personal contact details, or any other personally identifiable information.

---

## 1. Uttarakhand Kharif Crop Reports

| Field | Value |
|---|---|
| Dataset name | Kharif Crop Reports (Kharif Fasal Vivaraniya) |
| Source organisation | Department of Agriculture, Government of Uttarakhand |
| Source URL | https://agriculture.uk.gov.in/document-category/kharif-crop/ |
| Years | 2019–20 (Part 1 & 2), 2020–21, 2021–22, 2022–23 |
| Format | PDF |
| Coverage | Uttarakhand state — district-level tabular data |
| Status | ✅ Downloaded |
| Classification | PUBLIC SOURCE |

### Files

| File | Approx. size |
|---|---|
| `agriculture/kharif_crop_2022-23.pdf` | ~4 MB |
| `agriculture/kharif_crop_2021-22.pdf` | ~6 MB |
| `agriculture/kharif_crop_2020-21.pdf` | ~8 MB |
| `agriculture/kharif_crop_2019-20_part1.pdf` | ~7 MB |
| `agriculture/kharif_crop_2019-20_part2.pdf` | ~7 MB |

### Intended use

District-level kharif crop area, production, and irrigation coverage statistics.
Will be used to populate real agricultural data in the Insights panel and validate
synthetic agricultural zone classifications once PDF tables are extracted.

### Limitations

District-level aggregates only. Sub-district or parcel-level mapping requires
field survey data. PDFs require table extraction before use.

---

## 2. Uttarakhand Surface Waterbodies (NWDP)

| Field | Value |
|---|---|
| Dataset name | Waterbody Uttarakhand |
| Source organisation | National Water Data Portal (NWDP), National Water Informatics Centre (NWIC) |
| Source URL | https://www.nwdp.nwic.gov.in/en/dataset/surface-waterbodies |
| Resource ID | d7270a67-5421-4ef8-b35f-847036a8220e |
| Direct URL | https://nwdp.nwic.gov.in/dataset/811f6a62-61c2-4d79-b90b-deeee4151f6d/resource/d7270a67-5421-4ef8-b35f-847036a8220e/download/wb_uk_geojson.zip |
| Format | GeoJSON (zipped) |
| Coverage | Uttarakhand state — waterbodies ≥ 0.1 ha |
| Status | ⚠️ URL identified — manual download pending |
| Classification | PUBLIC SOURCE |

### Manual download

```bash
curl -L "<direct-url-above>" -o water/wb_uk_geojson.zip
unzip water/wb_uk_geojson.zip -d water/
mv water/wb_uk.geojson water/uttarakhand_waterbodies.geojson
```

### Intended use

Real water-body polygons for Dehradun. Will replace synthetic `water-bodies.geojson`
and enable accurate water-proximity calculations.

---

## 3. OpenStreetMap — Northern Zone India

| Field | Value |
|---|---|
| Source organisation | OpenStreetMap contributors via Geofabrik |
| Source URL | https://download.geofabrik.de/asia/india/northern-zone.html |
| Licence | Open Database Licence (ODbL) — attribution required |
| Format | OSM PBF (~200 MB) |
| Coverage | Northern India including Uttarakhand |
| Status | ❌ Download pending (network proxy blocked automated download) |
| Classification | PUBLIC SOURCE |

### Manual download and processing

```bash
# Download
curl -L "https://download.geofabrik.de/asia/india/northern-zone-latest.osm.pbf" \
  -o infrastructure/northern-zone-latest.osm.pbf

# Clip to Dehradun bounding box (requires osmium-tool)
osmium extract --bbox 77.55,29.95,78.35,30.65 \
  infrastructure/northern-zone-latest.osm.pbf \
  -o infrastructure/dehradun-osm.pbf

# Export roads and facilities to GeoJSON
osmium export infrastructure/dehradun-osm.pbf --geometry-types=linestring \
  -o infrastructure/dehradun-roads.geojson
osmium export infrastructure/dehradun-osm.pbf --geometry-types=point \
  -o infrastructure/dehradun-facilities.geojson
```

Do not load the full northern-zone PBF into the React frontend — clip first.

---

## 4. LULC Time-Series (Bhuvan / NRSC)

| Field | Value |
|---|---|
| Dataset name | Land Use Land Cover (LULC) 50K / 250K time series |
| Source organisation | ISRO / NRSC — Bhuvan National Geoportal |
| Portal URL | https://bhuvan-app1.nrsc.gov.in/2dresources/bhuvanstore.php |
| Years needed | 2005–06, 2011–12, 2015–16, 2018–19, 2020–21, 2021–22, 2022–23 |
| Format | GeoTIFF / Shapefile (Clip & Ship) |
| Status | ❌ Manual browser authentication required — cannot automate |
| Classification | PUBLIC SOURCE |

### Manual steps

1. Register at https://bhuvan.nrsc.gov.in (free)
2. Log in → Bhuvan Store
3. Search for **LULC 50K**
4. Use **Clip & Ship** with bounding box `77.55°E, 29.95°N` → `78.35°E, 30.65°N`
5. Select all required years and download
6. Save to `data/raw/lulc/`

---

## 5. Dehradun District Statistical Reports

| Field | Value |
|---|---|
| Source organisation | District Administration, Dehradun |
| Source URL | https://dehradun.gov.in/document-category/statistical-report/ |
| Format | PDF |
| Status | ❌ Portal returned HTTP 503 — retry when available |
| Classification | PUBLIC SOURCE |

---

## 6. TechnoLand Synthetic Demo Dataset (current active data)

| Field | Value |
|---|---|
| Created by | TechnoLand project |
| Year | 2024 |
| Format | GeoJSON |
| Status | ✅ Active — loaded by default in all map layers |
| Classification | **SYNTHETIC DEMO** |

### Files

| File | Features | Description |
|---|---|---|
| `frontend/public/mock-data/land-parcels.geojson` | 12 polygons | Fictional land parcels |
| `frontend/public/mock-data/agricultural-zones.geojson` | 6 polygons | Fictional crop zones |
| `frontend/public/mock-data/water-bodies.geojson` | 8 polygons/lines | Fictional water features |
| `frontend/public/mock-data/infrastructure.geojson` | 15 features | Fictional roads and facilities |

**All boundaries, attribute values, names, and locations in these files are entirely
fictional.** They do not represent real cadastral records, official land ownership,
real infrastructure locations, or any official measurement. The Dehradun District
geographic extent is used for basemap context only.

---

## Summary

| Dataset | Status |
|---|---|
| Kharif Crop Reports 2019–2023 | ✅ Downloaded (5 PDFs, ~32 MB) |
| NWDP Uttarakhand Waterbodies | ⚠️ URL identified — download manually |
| OSM Northern Zone PBF | ❌ Download manually (~200 MB) then clip |
| Bhuvan LULC Time-series | ❌ Manual browser login required |
| Dehradun Statistical Reports | ❌ Portal unavailable — retry |
| Synthetic Demo Dataset | ✅ Active in frontend |
