import React, { useMemo } from 'react'
import useMapStore from '../../store/mapStore.js'
import { useFeatureSelection } from '../../hooks/useFeatureSelection.js'
import './Panel.css'
import './FeatureInspector.css'

/* ══════════════════════════════════════════════════════════
   FeatureInspector
   Shows land parcel / zone / infrastructure attributes,
   Development Signals grid, and a TechnoLand-derived
   priority score when viewing a land parcel.
══════════════════════════════════════════════════════════ */

/* ── Property label map ─────────────────────────────────── */
const PROP_LABELS = {
  parcel_id: 'Parcel ID', zone_id: 'Zone ID', feature_id: 'Feature ID',
  name: 'Name', village: 'Village', tehsil: 'Tehsil',
  land_use: 'Land Use', area_hectares: 'Area (ha)',
  cultivation_status: 'Cultivation Status', crop_type: 'Crop',
  soil_type: 'Soil Type', elevation_m: 'Elevation (m)',
  slope_pct: 'Slope (%)', rainfall_mm: 'Rainfall (mm/yr)',
  irrigation_access: 'Irrigation Access', irrigation_status: 'Irrigation Status',
  water_access: 'Water Access', water_distance_km: 'Water Distance (km)',
  infrastructure_access: 'Infrastructure Access', road_distance_km: 'Road Distance (km)',
  suitability: 'Suitability', productivity_level: 'Productivity Level',
  water_availability: 'Water Availability', soil_quality: 'Soil Quality',
  avg_rainfall_mm: 'Avg Rainfall (mm)', coverage_villages: 'Villages Covered',
  type: 'Type', status: 'Status', approximate_capacity: 'Capacity',
  irrigation_coverage: 'Irrigation Coverage', related_area_ha: 'Related Area (ha)',
  seasonal: 'Seasonal', category: 'Category', road_type: 'Road Type',
  surface: 'Surface', length_km: 'Length (km)', condition: 'Condition',
  facility_type: 'Facility Type', capacity: 'Capacity', serves_villages: 'Serves Villages',
  nearest_irrigation: 'Nearest Irrigation', nearest_water_body: 'Nearest Water Body',
  notes: 'Notes',
}

/* Keys shown in hero/signals sections — excluded from table */
const HIDDEN_TABLE_KEYS = new Set([
  '_disclaimer', '__technoland_type',
  'name', 'parcel_id', 'zone_id', 'feature_id',
  'village', 'development_priority', 'suitability',
  'irrigation_access', 'water_access', 'infrastructure_access',
  'key_observation',
])

/* ── Derived priority score ─────────────────────────────── */
/**
 * Computes a 0–100 TechnoLand Derived Development Priority Score
 * from key feature properties. Completely transparent — each factor
 * is shown to the user.
 *
 * Higher score = greater development need / opportunity.
 */
function computePriorityScore(props) {
  if (!props) return null
  let score = 0
  const factors = []

  const add = (label, pts, reason) => {
    if (pts > 0) { score += pts; factors.push({ label, pts, reason, positive: true }) }
    else if (pts < 0) { score += pts; factors.push({ label, pts: Math.abs(pts), reason, positive: false }) }
  }

  // Agricultural suitability
  if (props.suitability === 'high')     add('High Agricultural Suitability', 25, 'High-potential land raises development priority')
  else if (props.suitability === 'moderate') add('Moderate Suitability', 12, 'Moderate potential with room for improvement')

  // Irrigation gap (negative = need)
  if (props.irrigation_access === 'none')     add('No Irrigation Access', 25, 'Zero irrigation is the sharpest productivity constraint')
  else if (props.irrigation_access === 'limited') add('Limited Irrigation', 15, 'Partial irrigation constrains full productivity')
  else if (props.irrigation_access === 'moderate') add('Moderate Irrigation', 8, 'Seasonal gaps still limit double-cropping')

  // Water proximity
  if (props.water_distance_km > 3)      add('Distant Water Source', 15, `${props.water_distance_km} km to nearest water body`)
  else if (props.water_distance_km > 1.5) add('Moderate Water Distance', 8, `${props.water_distance_km} km — viable with pump investment`)

  // Infrastructure gap
  if (props.infrastructure_access === 'low') add('Poor Infrastructure Access', 15, 'Limited road connectivity restricts market reach')
  else if (props.infrastructure_access === 'moderate') add('Moderate Infrastructure', 7, 'Some connectivity gaps remain')

  // Fallow land
  if (props.cultivation_status === 'fallow') add('Currently Fallow', 10, 'Underutilised agricultural land')

  // Cap at 100
  score = Math.max(0, Math.min(100, score))

  if (factors.length === 0) return null
  return { score, factors }
}

/* ── Signal helpers ─────────────────────────────────────── */
function levelBadge(val) {
  const v = String(val).toLowerCase()
  if (['high','good','active','perennial','operational','functional'].includes(v)) return 'badge--green'
  if (['moderate','partial','seasonal','limited','fair','seasonal-good'].includes(v)) return 'badge--yellow'
  if (['low','none','poor','fallow','non-functional','rain-dependent'].includes(v)) return 'badge--red'
  return 'badge--gray'
}
function signalClass(val) {
  const v = String(val).toLowerCase()
  if (['high','good','active','perennial','operational','functional'].includes(v)) return 'fi-signal--positive'
  if (['moderate','limited','partial','fair','seasonal'].includes(v)) return 'fi-signal--warning'
  if (['low','none','poor','fallow','non-functional'].includes(v)) return 'fi-signal--negative'
  return 'fi-signal--neutral'
}
function priorityClass(p) {
  if (p === 'high')     return 'fi-priority--high'
  if (p === 'moderate') return 'fi-priority--moderate'
  return 'fi-priority--low'
}
function scoreColor(s) {
  if (s >= 60) return '#f87171'
  if (s >= 35) return '#fbbf24'
  return '#4ade80'
}

function getCategory(layerId) {
  if (layerId.includes('agri'))  return 'Agricultural Zone'
  if (layerId.includes('water')) return 'Water & Irrigation'
  if (layerId.includes('infra')) return 'Infrastructure'
  return 'Land Parcel'
}
function FeatureEmoji({ layerId }) {
  if (layerId.includes('agri'))  return '🌾'
  if (layerId.includes('water')) return '💧'
  if (layerId.includes('infra')) return '🏗️'
  return '🗺️'
}

/* ════════════════════════════════════════════════════════
   Main component
═════════════════════════════════════════════════════════ */
export default function FeatureInspector() {
  const { selectedFeature, clearFeature } = useFeatureSelection()
  const { setRightPanel } = useMapStore()

  /* ── Empty state ── */
  if (!selectedFeature) {
    return (
      <div className="fi-panel">
        <div className="fi-panel__header">
          <h1 className="fi-panel__title">Land Inspector</h1>
          <button className="fi-icon-btn" onClick={() => setRightPanel(null)} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="fi-empty">
          <div className="fi-empty__icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="fi-empty__heading">Nothing selected</p>
          <p className="fi-empty__sub">Click any map feature to inspect its attributes and development signals.</p>
          <p className="fi-empty__region">TechnoLand Demo · Dehradun, Uttarakhand</p>
        </div>
      </div>
    )
  }

  const props = selectedFeature.properties || {}
  const layerId = selectedFeature.layer?.id || ''
  const category = getCategory(layerId)
  const isParcel = category === 'Land Parcel'

  const area = props.area_hectares ?? props.related_area_ha
  const rainfall = props.rainfall_mm ?? props.avg_rainfall_mm

  const priority = useMemo(() => computePriorityScore(props), [props])

  const tableEntries = Object.entries(props).filter(([k, v]) => {
    if (HIDDEN_TABLE_KEYS.has(k)) return false
    if (v === null || v === undefined || v === '') return false
    return !!PROP_LABELS[k]
  })

  return (
    <div className="fi-panel">

      {/* ── Header ── */}
      <div className="fi-panel__header">
        <h1 className="fi-panel__title">Land Inspector</h1>
        <button
          className="fi-icon-btn"
          onClick={() => { clearFeature(); setRightPanel(null) }}
          aria-label="Close inspector"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="fi-panel__body">

        {/* ── Hero card ── */}
        <div className="fi-hero">
          <div className="fi-hero__icon" aria-hidden="true">
            <FeatureEmoji layerId={layerId} />
          </div>
          <div className="fi-hero__info">
            <h2 className="fi-hero__name">
              {props.name || props.parcel_id || props.zone_id || props.feature_id || 'Unnamed Feature'}
            </h2>
            <div className="fi-hero__badges">
              <span className="badge badge--blue">{category}</span>
              {props.village && <span className="badge badge--gray">{props.village}</span>}
              {props.tehsil  && <span className="badge badge--gray">{props.tehsil}</span>}
            </div>
          </div>
        </div>

        {/* ── Key observation callout ── */}
        {props.key_observation && (
          <p className="fi-observation">{props.key_observation}</p>
        )}

        {/* ── Quick metrics ── */}
        {(area || props.elevation_m || props.slope_pct || rainfall) && (
          <div className="fi-metrics">
            {area          && <MetricChip icon="📐" label="Area"      value={`${area} ha`} />}
            {props.elevation_m && <MetricChip icon="⛰️" label="Elevation" value={`${props.elevation_m} m`} />}
            {props.slope_pct != null && <MetricChip icon="📉" label="Slope" value={`${props.slope_pct}%`} />}
            {rainfall      && <MetricChip icon="🌧️" label="Rainfall"  value={`${rainfall} mm`} />}
          </div>
        )}

        {/* ── TechnoLand Derived Priority Score (parcels only) ── */}
        {isParcel && priority && (
          <div className="fi-priority-block">
            <div className="fi-priority-block__header">
              <span className="fi-priority-block__label">
                TechnoLand Derived Development Priority
              </span>
              <span
                className="fi-priority-block__score"
                style={{ color: scoreColor(priority.score) }}
              >
                {priority.score}
                <span className="fi-priority-block__max">/100</span>
              </span>
            </div>

            {/* Score bar */}
            <div className="fi-score-bar" role="meter" aria-valuenow={priority.score} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="fi-score-bar__fill"
                style={{ width: `${priority.score}%`, background: scoreColor(priority.score) }}
              />
            </div>

            {/* Factors */}
            <div className="fi-priority-factors">
              {priority.factors.map((f, i) => (
                <div key={i} className="fi-priority-factor">
                  <span className="fi-priority-factor__dot" style={{ background: f.positive ? '#fbbf24' : '#4ade80' }} aria-hidden="true" />
                  <span className="fi-priority-factor__label">{f.label}</span>
                  <span className="fi-priority-factor__pts">+{f.pts}</span>
                </div>
              ))}
            </div>
            <p className="fi-priority-block__note">
              ⚠ TechnoLand derived indicator · not an official government classification
            </p>
          </div>
        )}

        {/* ── Explicit priority badge ── */}
        {props.development_priority && (
          <div className={`fi-priority-badge ${priorityClass(props.development_priority)}`}>
            <span className="fi-priority-badge__label">Development Priority</span>
            <span className={`badge ${levelBadge(props.development_priority)}`}>
              {props.development_priority}
            </span>
          </div>
        )}

        {/* ── Development Signals grid (parcels) ── */}
        {isParcel && (
          <div className="fi-signals">
            <p className="fi-signals__title">Development Signals</p>
            <div className="fi-signals__grid">
              <SignalCard label="Irrigation"     value={props.irrigation_access} />
              <SignalCard label="Water Access"   value={props.water_access} />
              <SignalCard label="Infrastructure" value={props.infrastructure_access} />
              <SignalCard label="Suitability"    value={props.suitability} />
              <SignalCard label="Cultivation"    value={props.cultivation_status} />
              <SignalCard label="Priority"       value={props.development_priority} />
            </div>
          </div>
        )}

        {/* ── Suitability (zones) ── */}
        {!isParcel && props.suitability && (
          <div className="fi-priority-badge fi-priority-badge--flat">
            <span className="fi-priority-badge__label">Suitability</span>
            <span className={`badge ${levelBadge(props.suitability)}`}>{props.suitability}</span>
          </div>
        )}

        {/* ── Attributes table ── */}
        {tableEntries.length > 0 && (
          <section aria-label="Feature attributes">
            <p className="fi-section-title">Attributes</p>
            <dl className="fi-attrs">
              {tableEntries.map(([k, v]) => (
                <div className="fi-attr-row" key={k}>
                  <dt className="fi-attr-key">{PROP_LABELS[k]}</dt>
                  <dd className="fi-attr-val">
                    {['irrigation_access','water_access','infrastructure_access',
                      'status','condition','productivity_level','water_availability',
                      'irrigation_status','irrigation_coverage'].includes(k)
                      ? <span className={`badge ${levelBadge(v)}`}>{String(v)}</span>
                      : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ── Nearest resources ── */}
        {(props.nearest_irrigation || props.nearest_water_body) && (
          <section aria-label="Nearest resources">
            <p className="fi-section-title">Nearest Resources</p>
            <dl className="fi-attrs">
              {props.nearest_irrigation && (
                <div className="fi-attr-row">
                  <dt className="fi-attr-key">Irrigation Facility</dt>
                  <dd className="fi-attr-val">{props.nearest_irrigation}</dd>
                </div>
              )}
              {props.nearest_water_body && (
                <div className="fi-attr-row">
                  <dt className="fi-attr-key">Water Body</dt>
                  <dd className="fi-attr-val">{props.nearest_water_body}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* ── Ask AI CTA ── */}
        <button
          className="fi-ai-cta"
          onClick={() => setRightPanel('ai')}
          aria-label="Ask TechnoLand AI about this feature"
        >
          <BotIcon />
          <span>Ask TechnoLand AI about this area</span>
          <ArrowIcon />
        </button>

        <p className="fi-disclaimer">Synthetic demo data · Dehradun District, Uttarakhand</p>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function MetricChip({ icon, label, value }) {
  return (
    <div className="fi-metric">
      <span className="fi-metric__icon" aria-hidden="true">{icon}</span>
      <span className="fi-metric__value">{value}</span>
      <span className="fi-metric__label">{label}</span>
    </div>
  )
}

function SignalCard({ label, value }) {
  if (!value) return null
  const cls = signalClass(String(value))
  return (
    <div className={`fi-signal ${cls}`}>
      <span className="fi-signal__label">{label}</span>
      <span className="fi-signal__value">{String(value)}</span>
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */
function CloseIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function BotIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
}
function ArrowIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}
