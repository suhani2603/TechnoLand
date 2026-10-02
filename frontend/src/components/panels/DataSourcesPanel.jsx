import React, { useState } from 'react'
import useMapStore from '../../store/mapStore.js'
import './DataSourcesPanel.css'

/* ── Data catalogue ─────────────────────────────────────── */
const SOURCES = [
  {
    id: 'agri-kharif',
    category: 'Agriculture',
    categoryColor: '#f59e0b',
    name: 'Kharif Crop Reports 2019–2023',
    org: 'Agriculture Department, Government of Uttarakhand',
    url: 'https://agriculture.uk.gov.in/document-category/kharif-crop/',
    years: '2019–20, 2020–21, 2021–22, 2022–23',
    format: 'PDF',
    geography: 'Uttarakhand (district-level data)',
    files: [
      'kharif_crop_2022-23.pdf (4 MB)',
      'kharif_crop_2021-22.pdf (6 MB)',
      'kharif_crop_2020-21.pdf (8 MB)',
      'kharif_crop_2019-20_part1.pdf (7 MB)',
      'kharif_crop_2019-20_part2.pdf (7 MB)',
    ],
    status: 'downloaded',
    type: 'public',
    use: 'Agricultural area statistics, crop mix, irrigation coverage by district. Will populate the agricultural analysis when processed.',
    limitation: 'District-level aggregates only. Sub-district parcel mapping requires field survey data.',
  },
  {
    id: 'water-nwdp',
    category: 'Water',
    categoryColor: '#38bdf8',
    name: 'Uttarakhand Surface Waterbodies',
    org: 'National Water Data Portal (NWDP), National Water Informatics Centre (NWIC)',
    url: 'https://www.nwdp.nwic.gov.in/en/dataset/surface-waterbodies',
    years: 'Current (updated periodically)',
    format: 'GeoJSON (zipped)',
    geography: 'Uttarakhand state',
    files: ['wb_uk_geojson.zip — download URL identified: resource d7270a67'],
    status: 'identified',
    type: 'public',
    use: 'Real water-body polygon boundaries for the Dehradun region. Will replace synthetic water layer when processed.',
    limitation: 'Contains waterbodies ≥ 0.1 ha. Irrigation channels below this threshold not captured.',
  },
  {
    id: 'osm-infra',
    category: 'Infrastructure',
    categoryColor: '#a78bfa',
    name: 'OpenStreetMap — Northern Zone India',
    org: 'OpenStreetMap contributors via Geofabrik',
    url: 'https://download.geofabrik.de/asia/india/northern-zone.html',
    years: 'Daily updated extract',
    format: 'OSM PBF',
    geography: 'Northern India (incl. Uttarakhand)',
    files: ['northern-zone-latest.osm.pbf (~200 MB)'],
    status: 'pending',
    type: 'public',
    use: 'Roads, schools, hospitals, markets and irrigation infrastructure for Dehradun. Requires clipping to study area and conversion to GeoJSON.',
    limitation: 'Geofabrik is accessible but blocked by current network proxy. Download manually or from a direct connection. File is ~200 MB — clip to Uttarakhand bounding box before use.',
  },
  {
    id: 'lulc-bhuvan',
    category: 'Land Use / Land Cover',
    categoryColor: '#22c55e',
    name: 'LULC Time-Series 2005–2023',
    org: 'ISRO / NRSC — Bhuvan National Geoportal',
    url: 'https://bhuvan-app1.nrsc.gov.in/2dresources/bhuvanstore.php',
    years: '2005–06, 2011–12, 2015–16, 2018–19, 2020–21, 2021–22, 2022–23',
    format: 'GeoTIFF / Shapefile (Clip & Ship)',
    geography: 'India national coverage — clip to Uttarakhand / Dehradun',
    files: ['Not integrated in current demo'],
    status: 'pending',
    type: 'public',
    use: 'Multi-year LULC change analysis for Dehradun. Essential for the historical land-use change insight.',
    limitation: 'Bhuvan requires browser-based interactive authentication and a Clip & Ship area selection — automated download is not possible without credentials.',
  },
  {
    id: 'stats-dehradun',
    category: 'Statistics',
    categoryColor: '#f87171',
    name: 'Dehradun Statistical Reports',
    org: 'District Administration, Dehradun',
    url: 'https://dehradun.gov.in/document-category/statistical-report/',
    years: 'Multiple years',
    format: 'PDF',
    geography: 'Dehradun district',
    files: ['Pending — portal returned HTTP 503 during automated probe'],
    status: 'pending',
    type: 'public',
    use: 'District-level agricultural, land, and demographic statistics to enrich analysis context.',
    limitation: 'Portal was temporarily unavailable (503). Retry manually at the source URL.',
  },
  {
    id: 'demo-synthetic',
    category: 'Synthetic Demo',
    categoryColor: '#64748b',
    name: 'TechnoLand Synthetic Demo Dataset',
    org: 'TechnoLand (generated)',
    url: null,
    years: '2024 (created for hackathon demo)',
    format: 'GeoJSON',
    geography: 'Fictional parcels within Dehradun District extent',
    files: [
      'land-parcels.geojson',
      'agricultural-zones.geojson',
      'water-bodies.geojson',
      'infrastructure.geojson',
    ],
    status: 'active',
    type: 'synthetic',
    use: 'Powers all current map layers and AI analysis. Clearly marked as synthetic throughout the UI. Will be progressively replaced by real public data as sources above are processed.',
    limitation: 'All parcel boundaries, ownership details, and attribute values are entirely fictional. Do not use for any planning, legal, or administrative purpose.',
  },
]

const STATUS_META = {
  downloaded:      { label: 'Downloaded',       color: '#4ade80', bg: 'rgba(34,197,94,0.1)'    },
  identified:      { label: 'URL Identified',   color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  pending:         { label: 'Pending',           color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  'manual-required':{ label: 'Manual Required', color: '#f87171', bg: 'rgba(248,113,113,0.1)'  },
  active:          { label: 'Active (Demo)',     color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
}

const TYPE_META = {
  public:    { label: 'Public Source',    badge: 'badge--blue'  },
  derived:   { label: 'Derived',          badge: 'badge--purple'},
  synthetic: { label: 'Synthetic Demo',   badge: 'badge--gray'  },
}

/* ── Component ──────────────────────────────────────────── */
export default function DataSourcesPanel() {
  const { setActivePage } = useMapStore()
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  const categories = ['all', ...new Set(SOURCES.map((s) => s.category))]
  const visible = filter === 'all' ? SOURCES : SOURCES.filter((s) => s.category === filter)

  return (
    <div className="ds-panel">
      {/* Header */}
      <div className="ds-panel__header">
        <div>
          <h1 className="ds-panel__title">Data Sources</h1>
          <p className="ds-panel__subtitle">
            Provenance, status and limitations of every dataset used in TechnoLand
          </p>
        </div>
        <button
          className="ds-panel__back-btn"
          onClick={() => setActivePage('map')}
          aria-label="Back to map"
        >
          <BackIcon /> Back to Map
        </button>
      </div>

      {/* Data type legend */}
      <div className="ds-panel__legend">
        {Object.entries(TYPE_META).map(([type, meta]) => (
          <div key={type} className="ds-panel__legend-item">
            <span className={`badge ${meta.badge}`}>{meta.label}</span>
          </div>
        ))}
        <span className="ds-panel__legend-note">
          TechnoLand clearly distinguishes public data from derived analysis and synthetic demonstration data.
        </span>
      </div>

      {/* Category filter */}
      <div className="ds-panel__filters" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            className={['ds-filter-btn', filter === cat ? 'active' : ''].join(' ')}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All Sources' : cat}
          </button>
        ))}
      </div>

      {/* Source cards */}
      <div className="ds-panel__list">
        {visible.map((src) => {
          const isOpen = expanded === src.id
          const sm = STATUS_META[src.status] || STATUS_META.pending
          const tm = TYPE_META[src.type]    || TYPE_META.public
          return (
            <div
              key={src.id}
              className={['ds-card', isOpen ? 'ds-card--open' : ''].join(' ')}
              style={{ '--cat-color': src.categoryColor }}
            >
              {/* Card header */}
              <button
                className="ds-card__header"
                onClick={() => setExpanded(isOpen ? null : src.id)}
                aria-expanded={isOpen}
              >
                <div className="ds-card__left">
                  <span
                    className="ds-card__cat-dot"
                    style={{ background: src.categoryColor }}
                    aria-hidden="true"
                  />
                  <div className="ds-card__meta">
                    <span className="ds-card__cat">{src.category}</span>
                    <span className="ds-card__name">{src.name}</span>
                    <span className="ds-card__org">{src.org}</span>
                  </div>
                </div>
                <div className="ds-card__badges">
                  <span
                    className="ds-card__status"
                    style={{ color: sm.color, background: sm.bg }}
                  >
                    {sm.label}
                  </span>
                  <span className={`badge ${tm.badge}`}>{tm.label}</span>
                  <ChevronIcon open={isOpen} />
                </div>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="ds-card__body animate-fadeIn">
                  <div className="ds-card__grid">
                    <Detail label="Years / Version" value={src.years} />
                    <Detail label="Format" value={src.format} />
                    <Detail label="Geography" value={src.geography} />
                    {src.url && (
                      <div className="ds-detail">
                        <span className="ds-detail__label">Source URL</span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ds-detail__link"
                        >
                          {src.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Files */}
                  <div className="ds-card__section">
                    <p className="ds-card__section-title">Files</p>
                    <ul className="ds-card__files">
                      {src.files.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>

                  {/* Intended use */}
                  <div className="ds-card__section">
                    <p className="ds-card__section-title">Intended Use in TechnoLand</p>
                    <p className="ds-card__text">{src.use}</p>
                  </div>

                  {/* Limitation */}
                  <div className="ds-card__section ds-card__section--warn">
                    <p className="ds-card__section-title">
                      <WarnIcon /> Known Limitations
                    </p>
                    <p className="ds-card__text">{src.limitation}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function Detail({ label, value }) {
  return (
    <div className="ds-detail">
      <span className="ds-detail__label">{label}</span>
      <span className="ds-detail__value">{value}</span>
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ display:'inline',marginRight:4,verticalAlign:'middle' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ display:'inline',marginRight:4,verticalAlign:'middle' }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
