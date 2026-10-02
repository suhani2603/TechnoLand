/**
 * In-memory mock "database" used while DynamoDB is not yet connected.
 *
 * Shape mirrors what the real DynamoDB tables will contain.
 * When Phase 2 wires up DynamoDB, replace the exported functions with
 * real DocumentClient calls — callers (Lambda handlers) need no changes.
 *
 * TODO (Phase 2): replace each function body with a real DynamoDB query.
 */

// ── Layer metadata ────────────────────────────────────────────────────────────
const LAYERS = [
  {
    layerId: 'land-parcels',
    name: 'Land Parcels',
    description: 'Cadastral land parcel boundaries with land-use classification',
    s3Key: 'mock/land-parcels.geojson',
    color: '#22c55e',
    icon: 'grid',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    layerId: 'agricultural-zones',
    name: 'Agricultural Zones',
    description: 'Crop suitability and farming activity zones',
    s3Key: 'mock/agricultural-zones.geojson',
    color: '#f59e0b',
    icon: 'wheat',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    layerId: 'infrastructure',
    name: 'Infrastructure',
    description: 'Roads, bridges, and key rural infrastructure',
    s3Key: 'mock/infrastructure.geojson',
    color: '#60a5fa',
    icon: 'road',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    layerId: 'water-bodies',
    name: 'Water Bodies',
    description: 'Rivers, lakes, reservoirs, and irrigation channels',
    s3Key: 'mock/water-bodies.geojson',
    color: '#38bdf8',
    icon: 'droplets',
    updatedAt: '2026-01-15T00:00:00Z',
  },
]

// ── Feature attribute store ───────────────────────────────────────────────────
const FEATURES = {
  'parcel-001': {
    featureId: 'parcel-001',
    layerId: 'land-parcels',
    name: 'Birni North Parcel A',
    land_use: 'arable',
    area_ha: 12.4,
    soil_type: 'loamy',
    elevation_m: 420,
    slope_pct: 3,
    rainfall_mm: 1250,
    owner_type: 'smallholder',
    suitability: 'high',
    crop: 'maize',
    notes: 'Active cultivation. Soil test 2025.',
  },
  'parcel-002': {
    featureId: 'parcel-002',
    layerId: 'land-parcels',
    name: 'Gwoza Valley Plot',
    land_use: 'fallow',
    area_ha: 8.1,
    soil_type: 'sandy-loam',
    elevation_m: 380,
    slope_pct: 6,
    rainfall_mm: 1100,
    owner_type: 'community',
    suitability: 'moderate',
    crop: null,
    notes: 'Fallow since 2024. Ready for cultivation.',
  },
  'zone-001': {
    featureId: 'zone-001',
    layerId: 'agricultural-zones',
    name: 'Damboa High-Potential Zone',
    suitability: 'high',
    area_ha: 340,
    crop: 'sorghum',
    rainfall_mm: 1400,
    soil_type: 'clay-loam',
    notes: 'Government-designated priority zone.',
  },
}

// ── Exported data-access functions ────────────────────────────────────────────

/** Return all layer metadata records. */
async function getAllLayers() {
  return LAYERS
}

/** Return a single layer by ID, or null if not found. */
async function getLayerById(layerId) {
  return LAYERS.find((l) => l.layerId === layerId) || null
}

/** Return a single feature by ID, or null if not found. */
async function getFeatureById(featureId) {
  return FEATURES[featureId] || null
}

module.exports = { getAllLayers, getLayerById, getFeatureById }
