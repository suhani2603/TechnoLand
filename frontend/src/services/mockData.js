/**
 * TechnoLand — Mock data service
 *
 * All data is SYNTHETIC DEMO DATA for the TechnoLand hackathon prototype.
 * Study region: Dehradun District, Uttarakhand, India (fictional demo parcels).
 *
 * This module mirrors the exact shape that real Lambda/API Gateway responses will
 * return — switching to AWS is a single config change in api.js.
 *
 * TODO (Phase 3): Replace with real API calls via services/api.js
 */

// ── Layer metadata ─────────────────────────────────────────────────────────────
export const MOCK_LAYERS = [
  {
    id: 'land-parcels',
    name: 'Land Parcels',
    description: 'Synthetic demo land parcels with soil, irrigation, and development data',
    color: '#22c55e',
    fillColor: 'rgba(34,197,94,0.18)',
    borderColor: '#16a34a',
    icon: 'grid',
  },
  {
    id: 'agricultural-zones',
    name: 'Agricultural Zones',
    description: 'Crop suitability and productivity zones across the demo region',
    color: '#f59e0b',
    fillColor: 'rgba(245,158,11,0.15)',
    borderColor: '#d97706',
    icon: 'wheat',
  },
  {
    id: 'water-bodies',
    name: 'Water & Irrigation',
    description: 'Rivers, canals, and irrigation infrastructure',
    color: '#38bdf8',
    fillColor: 'rgba(56,189,248,0.22)',
    borderColor: '#0ea5e9',
    icon: 'droplets',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Roads, schools, health centres, storage, and agricultural facilities',
    color: '#a78bfa',
    fillColor: 'rgba(167,139,250,0.2)',
    borderColor: '#8b5cf6',
    icon: 'road',
  },
]

// ── Dashboard statistics (derived from demo dataset) ──────────────────────────
export const MOCK_STATS = [
  { label: 'Demo Parcels',   value: '12',       trend: 'Synthetic',  up: true  },
  { label: 'Agri Area',      value: '101.7 ha',  trend: 'Demo data',  up: true  },
  { label: 'Irrigated',      value: '38%',        trend: 'Est. demo',  up: false },
  { label: 'High Priority',  value: '4 parcels',  trend: 'Dev focus',  up: true  },
]

// ── Suggested quick questions shown in the AI panel ───────────────────────────
export const SUGGESTED_QUESTIONS = [
  'Why is this area a development priority?',
  'Explain the irrigation situation here',
  'What infrastructure gap should be addressed?',
  'What evidence supports this insight?',
  'What crops are best suited for this land?',
  'How does water access affect this parcel?',
]

// ── Contextual AI response engine ─────────────────────────────────────────────
// Generates parcel-specific responses using the selected feature's properties.
// Each response includes an `evidence` array for the "Why this insight?" section.
// In Phase 3 this function is replaced by a real Bedrock call — the response
// shape remains identical so the frontend needs no changes.

/**
 * Generate a contextual AI response from a feature's properties.
 * @param {string} message     - The user's question.
 * @param {object|null} props  - Feature properties from the selected GeoJSON feature.
 * @returns {{ reply: string, evidence: Array<{label:string, value:string, signal:'positive'|'warning'|'negative'|'neutral'}> }}
 */
export function generateContextualResponse(message, props) {
  if (!props) return _genericResponse(message)

  const msg = message.toLowerCase()

  // Route to the most relevant handler based on keyword matching
  if (msg.includes('priority') || msg.includes('why') || msg.includes('development'))
    return _priorityResponse(props)
  if (msg.includes('irrigation') || msg.includes('canal') || msg.includes('water access'))
    return _irrigationResponse(props)
  if (msg.includes('infrastructure') || msg.includes('road') || msg.includes('missing'))
    return _infrastructureResponse(props)
  if (msg.includes('crop') || msg.includes('suit') || msg.includes('farm') || msg.includes('cultivat'))
    return _cropResponse(props)
  if (msg.includes('water') || msg.includes('river') || msg.includes('rainfall'))
    return _waterResponse(props)
  if (msg.includes('evidence') || msg.includes('insight') || msg.includes('data'))
    return _evidenceResponse(props)
  if (msg.includes('soil') || msg.includes('quality') || msg.includes('type'))
    return _soilResponse(props)

  // Default: general parcel summary
  return _summaryResponse(props)
}

// ── Response generators ────────────────────────────────────────────────────────

function _priorityResponse(props) {
  const priority = props.development_priority || 'moderate'
  const irrigation = props.irrigation_access || 'unknown'
  const water = props.water_access || 'unknown'
  const infra = props.infrastructure_access || 'unknown'
  const status = props.cultivation_status || 'unknown'
  const name = props.name || props.parcel_id || 'this parcel'

  const priorityText = {
    high: `**${name}** is flagged as a **high development priority** in the TechnoLand demo dataset.`,
    moderate: `**${name}** has **moderate development priority** — there are opportunities, but some basic services are already in place.`,
    low: `**${name}** has **low development priority** — it is already relatively well-served and productive.`,
  }[priority] || `**${name}** has been assessed for development priority.`

  const reasons = []
  if (irrigation === 'none') reasons.push('has no irrigation access — a critical gap for agricultural productivity')
  if (irrigation === 'limited') reasons.push('has only limited canal irrigation, constraining crop yields')
  if (water === 'limited') reasons.push('is far from reliable water sources')
  if (infra === 'low') reasons.push('lacks adequate road or market connectivity')
  if (status === 'fallow') reasons.push('is currently fallow and represents underutilised agricultural land')

  const body = reasons.length > 0
    ? `\n\nKey factors driving this assessment:\n${reasons.map((r, i) => `${i + 1}. The parcel ${r}.`).join('\n')}`
    : `\n\nThe parcel shows good overall conditions but was reviewed for development planning purposes.`

  const key = props.key_observation
    ? `\n\n**Key observation:** ${props.key_observation}`
    : ''

  return {
    reply: priorityText + body + key,
    evidence: _buildEvidence(props),
  }
}

function _irrigationResponse(props) {
  const irrigation = props.irrigation_access || 'unknown'
  const waterDist = props.water_distance_km
  const nearestIrr = props.nearest_irrigation || 'Not recorded'
  const name = props.name || props.parcel_id || 'this parcel'

  const irrigMap = {
    good:    `**${name}** has **good irrigation access**. Canal connectivity is reliable and supports both kharif and rabi cropping seasons.`,
    moderate:`**${name}** has **moderate irrigation access**. Seasonal canal supply is available but may be insufficient during peak demand.`,
    limited: `**${name}** has **limited irrigation access**. Only partial or informal irrigation is available, constraining productivity significantly.`,
    none:    `**${name}** has **no irrigation access**. All cultivation depends entirely on monsoon rainfall, making it highly vulnerable to dry years.`,
  }

  const base = irrigMap[irrigation] || `Irrigation access for **${name}** is **${irrigation}**.`

  const distNote = waterDist
    ? `\n\nNearest water source is approximately **${waterDist} km** away. ${waterDist > 2 ? 'This distance makes canal extension or pump-based irrigation challenging without dedicated investment.' : 'This proximity offers a realistic opportunity for irrigation improvement.'}`
    : ''

  const facility = `\n\n**Nearest irrigation facility:** ${nearestIrr}`

  const recommendation = irrigation === 'none' || irrigation === 'limited'
    ? '\n\n**Recommendation:** Prioritise pump irrigation connection or minor canal extension. Even a seasonal lift irrigation scheme could significantly improve yields.'
    : '\n\n**Recommendation:** Optimise existing canal usage through water user associations and demand-based scheduling.'

  return {
    reply: base + distNote + facility + recommendation,
    evidence: _buildEvidence(props),
  }
}

function _infrastructureResponse(props) {
  const infra = props.infrastructure_access || 'unknown'
  const roadDist = props.road_distance_km
  const name = props.name || props.parcel_id || 'this parcel'

  const infraMap = {
    good:    `**${name}** has **good infrastructure access**. Road connectivity enables reliable transport of produce to markets.`,
    moderate:`**${name}** has **moderate infrastructure access**. Basic connectivity exists but road quality or distance to markets could be improved.`,
    low:     `**${name}** has **low infrastructure access**. Poor road connectivity is a major constraint on agricultural commercialisation.`,
  }

  const base = infraMap[infra] || `Infrastructure access for **${name}** is **${infra}**.`

  const distNote = roadDist
    ? `\n\nNearest road is approximately **${roadDist} km** away.`
    : ''

  const gaps = []
  if (infra === 'low' || infra === 'none') gaps.push('all-weather road connectivity')
  if (props.water_access === 'limited' || props.water_access === 'none') gaps.push('water supply infrastructure')
  if (props.irrigation_access === 'none') gaps.push('irrigation facility')

  const gapText = gaps.length > 0
    ? `\n\n**Infrastructure gaps identified:**\n${gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}`
    : '\n\nNo critical infrastructure gaps identified in the demo dataset.'

  return {
    reply: base + distNote + gapText,
    evidence: _buildEvidence(props),
  }
}

function _cropResponse(props) {
  const landUse = props.land_use || 'unknown'
  const soil = props.soil_type || 'unknown'
  const crop = props.crop_type
  const irrigation = props.irrigation_access || 'unknown'
  const suitability = props.suitability || 'moderate'
  const elevation = props.elevation_m
  const rainfall = props.rainfall_mm
  const name = props.name || props.parcel_id || 'this parcel'

  // Crop recommendations based on soil and irrigation
  const cropRecs = {
    'alluvial':       irrigation === 'good' ? ['Rice', 'Sugarcane', 'Wheat'] : ['Wheat', 'Maize', 'Pulse'],
    'alluvial-loam':  irrigation !== 'none' ? ['Wheat', 'Rice', 'Vegetables'] : ['Wheat', 'Mustard', 'Maize'],
    'clay-loam':      ['Rice', 'Wheat', 'Vegetables'],
    'loam':           ['Wheat', 'Maize', 'Vegetables', 'Horticulture'],
    'sandy-loam':     elevation && elevation > 700 ? ['Potato', 'Ginger', 'Stone fruits'] : ['Maize', 'Millet', 'Groundnut'],
    'laterite':       ['Maize', 'Millet', 'Arhar (pigeon pea)'],
    'red-laterite':   ['Maize', 'Millet', 'Arhar (pigeon pea)'],
    'forest-humus':   ['Not suitable for cultivation'],
  }

  const recs = cropRecs[soil] || ['Wheat', 'Maize', 'Pulse']
  const currentCropNote = crop ? `\n\nThe parcel is currently under **${crop}** cultivation.` : '\n\nThe parcel is currently **fallow**.'
  const recsText = `\n\n**Recommended crops for ${soil} soil with ${irrigation} irrigation:**\n${recs.map(r => `• ${r}`).join('\n')}`

  const suitNote = suitability === 'high'
    ? `\n\n**Overall assessment:** High agricultural suitability. Yield improvement through better irrigation management is the main lever.`
    : suitability === 'moderate'
    ? `\n\n**Overall assessment:** Moderate suitability. Targeted soil improvement and water management can raise productivity.`
    : `\n\n**Overall assessment:** Low suitability. Challenging conditions — focus on resilient low-input crops.`

  return {
    reply: `**Crop analysis for ${name}**${currentCropNote}${recsText}${suitNote}`,
    evidence: _buildEvidence(props),
  }
}

function _waterResponse(props) {
  const waterDist = props.water_distance_km
  const waterAccess = props.water_access || 'unknown'
  const rainfall = props.rainfall_mm
  const nearestWater = props.nearest_water_body || 'Not recorded'
  const name = props.name || props.parcel_id || 'this parcel'

  const accessMap = {
    good:    `**${name}** has **good water access**. A reliable water source is within a short distance.`,
    moderate:`**${name}** has **moderate water access**. A water source is present nearby, but reliable connectivity to the parcel has not been established.`,
    limited: `**${name}** has **limited water access**. The nearest water source is too far for cost-effective gravity irrigation.`,
    none:    `**${name}** has **no recorded water access**. This is the most critical constraint on its agricultural potential.`,
  }

  const base = accessMap[waterAccess] || `Water access for **${name}** is **${waterAccess}**.`
  const distNote = waterDist ? `\n\n**Distance to nearest water body:** ${waterDist} km (${nearestWater})` : ''
  const rainfallNote = rainfall ? `\n**Annual rainfall:** ${rainfall} mm/year — ${rainfall > 2000 ? 'high, supports rain-fed cultivation during monsoon' : rainfall > 1500 ? 'moderate, seasonal supplemental irrigation advised' : 'low, irrigation is essential'}` : ''

  return {
    reply: base + distNote + rainfallNote,
    evidence: _buildEvidence(props),
  }
}

function _soilResponse(props) {
  const soil = props.soil_type || 'unknown'
  const slope = props.slope_pct
  const elevation = props.elevation_m
  const name = props.name || props.parcel_id || 'this parcel'

  const soilDesc = {
    'alluvial':       'Deep alluvial soil — highly fertile, good water retention, excellent for intensive agriculture.',
    'alluvial-loam':  'Alluvial-loam mix — fertile and well-draining. One of the best soil types in the Doon valley.',
    'clay-loam':      'Clay-loam — good fertility and water retention, slightly heavy. Suitable for paddy and wheat.',
    'loam':           'Loam — balanced texture with good drainage and fertility. Versatile for most crops.',
    'sandy-loam':     'Sandy-loam — moderate fertility, well-draining. Suitable for root crops and horticulture.',
    'red-laterite':   'Red laterite — acidic, lower natural fertility. Needs organic amendment for good yields.',
    'laterite':       'Laterite — low organic matter, moderate drainage. Best for drought-tolerant crops.',
    'forest-humus':   'Forest humus — rich organic content but not suitable for commercial cultivation.',
  }

  const desc = soilDesc[soil] || `Soil type recorded as **${soil}**.`
  const slopeNote = slope ? `\n\n**Slope:** ${slope}% — ${slope > 15 ? 'steep, erosion risk is high; terracing or conservation measures recommended' : slope > 8 ? 'moderate, some erosion management advisable' : 'gentle, suitable for mechanised farming'}` : ''
  const elevNote = elevation ? `\n**Elevation:** ${elevation} m — ${elevation > 700 ? 'upland, temperature variation affects crop calendar' : 'valley/plains, standard Doon valley cropping calendar applies'}` : ''

  return {
    reply: `**Soil analysis for ${name}**\n\n${desc}${slopeNote}${elevNote}`,
    evidence: _buildEvidence(props),
  }
}

function _evidenceResponse(props) {
  const name = props.name || props.parcel_id || 'this parcel'
  const evidence = _buildEvidence(props)

  const lines = evidence.map(e => `• **${e.label}:** ${e.value}`)
  return {
    reply: `**Evidence summary for ${name}**\n\nThe following data points from the TechnoLand demo dataset were used to generate insights for this parcel:\n\n${lines.join('\n')}\n\n*All values are from the synthetic demo dataset. Labels clearly marked as demo/synthetic data.*`,
    evidence,
  }
}

function _summaryResponse(props) {
  const name = props.name || props.parcel_id || 'this parcel'
  const landUse = props.land_use || 'unknown'
  const area = props.area_hectares
  const status = props.cultivation_status || 'unknown'
  const priority = props.development_priority || 'unknown'
  const suitability = props.suitability || 'unknown'
  const village = props.village || 'Unknown village'

  const summary = [
    `**${name}** is a ${area ? area + ' ha ' : ''}${landUse} parcel in the **${village}** demo area.`,
    status !== 'unknown' ? `Cultivation status: **${status}**.` : '',
    props.crop_type ? `Current crop: **${props.crop_type}**.` : '',
    suitability !== 'unknown' ? `Agricultural suitability: **${suitability}**.` : '',
    priority !== 'unknown' ? `Development priority: **${priority}**.` : '',
    props.key_observation ? `\n**Key observation:** ${props.key_observation}` : '',
  ].filter(Boolean).join(' ')

  return {
    reply: summary,
    evidence: _buildEvidence(props),
  }
}

function _genericResponse(message) {
  return {
    reply: 'Welcome to **TechnoLand AI**. Select a land parcel on the map and ask me about its agricultural potential, irrigation situation, infrastructure access, or development priority. I will generate insights based on the TechnoLand demo dataset.',
    evidence: [],
  }
}

// ── Evidence builder ───────────────────────────────────────────────────────────
/**
 * Build the evidence array from a feature's properties.
 * signal: 'positive' | 'warning' | 'negative' | 'neutral'
 */
function _buildEvidence(props) {
  const evidence = []

  if (props.parcel_id)
    evidence.push({ label: 'Parcel ID', value: props.parcel_id, signal: 'neutral' })
  if (props.village)
    evidence.push({ label: 'Demo Village', value: props.village, signal: 'neutral' })
  if (props.area_hectares)
    evidence.push({ label: 'Area', value: `${props.area_hectares} ha`, signal: 'neutral' })
  if (props.land_use)
    evidence.push({ label: 'Land Use', value: props.land_use, signal: 'neutral' })
  if (props.cultivation_status)
    evidence.push({
      label: 'Cultivation Status',
      value: props.cultivation_status,
      signal: props.cultivation_status === 'active' ? 'positive' : props.cultivation_status === 'fallow' ? 'warning' : 'neutral',
    })
  if (props.suitability)
    evidence.push({
      label: 'Agricultural Suitability',
      value: props.suitability,
      signal: props.suitability === 'high' ? 'positive' : props.suitability === 'moderate' ? 'warning' : 'negative',
    })
  if (props.irrigation_access)
    evidence.push({
      label: 'Irrigation Access',
      value: props.irrigation_access,
      signal: props.irrigation_access === 'good' ? 'positive' : props.irrigation_access === 'moderate' ? 'warning' : 'negative',
    })
  if (props.water_access)
    evidence.push({
      label: 'Water Access',
      value: props.water_access,
      signal: props.water_access === 'good' ? 'positive' : props.water_access === 'moderate' ? 'warning' : 'negative',
    })
  if (props.water_distance_km != null)
    evidence.push({
      label: 'Water Distance',
      value: `${props.water_distance_km} km`,
      signal: props.water_distance_km <= 1 ? 'positive' : props.water_distance_km <= 2 ? 'warning' : 'negative',
    })
  if (props.infrastructure_access)
    evidence.push({
      label: 'Infrastructure Access',
      value: props.infrastructure_access,
      signal: props.infrastructure_access === 'good' ? 'positive' : props.infrastructure_access === 'moderate' ? 'warning' : 'negative',
    })
  if (props.road_distance_km != null)
    evidence.push({
      label: 'Road Distance',
      value: `${props.road_distance_km} km`,
      signal: props.road_distance_km <= 1 ? 'positive' : props.road_distance_km <= 2 ? 'warning' : 'negative',
    })
  if (props.development_priority)
    evidence.push({
      label: 'Development Priority',
      value: props.development_priority,
      signal: props.development_priority === 'high' ? 'warning' : props.development_priority === 'low' ? 'positive' : 'neutral',
    })
  if (props.soil_type)
    evidence.push({ label: 'Soil Type', value: props.soil_type, signal: 'neutral' })
  if (props.rainfall_mm)
    evidence.push({
      label: 'Annual Rainfall',
      value: `${props.rainfall_mm} mm`,
      signal: props.rainfall_mm >= 1800 ? 'positive' : props.rainfall_mm >= 1200 ? 'warning' : 'negative',
    })
  if (props.nearest_irrigation)
    evidence.push({ label: 'Nearest Irrigation', value: props.nearest_irrigation, signal: 'neutral' })
  if (props.nearest_water_body)
    evidence.push({ label: 'Nearest Water Body', value: props.nearest_water_body, signal: 'neutral' })

  return evidence
}

// ── Insights data (for Insights/Reports page) ─────────────────────────────────
export const DEMO_INSIGHTS = [
  {
    id: 'ins-001',
    title: 'High-Priority Agricultural Parcels',
    description: '4 demo parcels are flagged as high development priority due to limited irrigation, poor infrastructure access, or fallow status.',
    parcels: ['DDN-LP-001', 'DDN-LP-003', 'DDN-LP-006', 'DDN-LP-008'],
    signal: 'warning',
    icon: '🔴',
  },
  {
    id: 'ins-002',
    title: 'No Irrigation Access',
    description: '3 demo parcels have zero irrigation access and rely entirely on monsoon rainfall — a significant productivity risk.',
    parcels: ['DDN-LP-003', 'DDN-LP-006', 'DDN-LP-008'],
    signal: 'negative',
    icon: '💧',
  },
  {
    id: 'ins-003',
    title: 'High Potential, Infrastructure Gap',
    description: 'DDN-LP-001 (Raipur Khas) has high agricultural suitability but limited canal irrigation. Canal extension could raise productivity significantly.',
    parcels: ['DDN-LP-001'],
    signal: 'warning',
    icon: '🌾',
  },
  {
    id: 'ins-004',
    title: 'Well-Served Productive Parcels',
    description: '3 parcels (Majra, Doiwala, Dakpathar) have good irrigation, water access, and infrastructure — minimal intervention needed.',
    parcels: ['DDN-LP-002', 'DDN-LP-004', 'DDN-LP-010'],
    signal: 'positive',
    icon: '✅',
  },
  {
    id: 'ins-005',
    title: 'Non-Functional Irrigation Facility',
    description: 'Niranjanpur Pump Station (DDN-INF-013) is non-functional. Repair would unlock irrigation for DDN-LP-003 and nearby parcels.',
    parcels: ['DDN-LP-003'],
    signal: 'negative',
    icon: '⚙️',
  },
  {
    id: 'ins-006',
    title: 'Forest Buffer — No Development',
    description: 'DDN-LP-012 (Lacchiwala) is designated forest buffer. Conservation value is high; no agricultural development is recommended.',
    parcels: ['DDN-LP-012'],
    signal: 'neutral',
    icon: '🌲',
  },
]
