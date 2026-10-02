import React, { useState } from 'react'
import useMapStore from '../../store/mapStore.js'
import { DEMO_INSIGHTS } from '../../services/mockData.js'
import './InsightsPanel.css'

/* ── Signal config ──────────────────────────────────────── */
const SIG = {
  positive: { border: 'rgba(74,222,128,0.2)',  bg: 'rgba(74,222,128,0.06)',  badge: 'badge--green',  accent: '#4ade80' },
  warning:  { border: 'rgba(251,191,36,0.22)', bg: 'rgba(251,191,36,0.06)', badge: 'badge--yellow', accent: '#fbbf24' },
  negative: { border: 'rgba(248,113,113,0.22)',bg: 'rgba(248,113,113,0.06)',badge: 'badge--red',    accent: '#f87171' },
  neutral:  { border: 'rgba(148,163,184,0.15)',bg: 'rgba(148,163,184,0.04)',badge: 'badge--gray',   accent: '#94a3b8' },
}

/* ── Summary stats derived from DEMO_INSIGHTS ───────────── */
const SUMMARY = [
  { icon: '🔴', value: '4', label: 'High Priority Areas'  },
  { icon: '💧', value: '3', label: 'No Irrigation Access' },
  { icon: '✅', value: '3', label: 'Well-Served Parcels'  },
  { icon: '🌲', value: '1', label: 'Protected Buffer'     },
]

/* ── Simple horizontal bar visual ──────────────────────── */
function BarViz({ items }) {
  const total = items.reduce((s, i) => s + i.count, 0)
  if (!total) return null
  return (
    <div className="ins-bar-viz" aria-label="Irrigation access breakdown">
      <div className="ins-bar-track">
        {items.map((item) => (
          <div
            key={item.label}
            className="ins-bar-segment"
            style={{
              width: `${(item.count / total) * 100}%`,
              background: item.color,
            }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <div className="ins-bar-legend">
        {items.map((item) => (
          <div key={item.label} className="ins-bar-legend-item">
            <span className="ins-bar-legend-dot" style={{ background: item.color }} aria-hidden="true" />
            <span>{item.label}</span>
            <span className="ins-bar-legend-val">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────── */
export default function InsightsPanel() {
  const { setActivePage } = useMapStore()
  const [expanded, setExpanded] = useState('ins-001')   // first card open by default

  const toggle = (id) => setExpanded((p) => (p === id ? null : id))

  return (
    <div className="ins-panel">

      {/* ── Header ── */}
      <div className="ins-panel__header">
        <div>
          <h1 className="ins-panel__title">Insights &amp; Analysis</h1>
          <p className="ins-panel__subtitle">
            Evidence-based findings derived from the TechnoLand demo dataset ·
            Dehradun, Uttarakhand
          </p>
        </div>
        <button
          className="ins-panel__back-btn"
          onClick={() => setActivePage('map')}
          aria-label="Back to map"
        >
          <BackIcon /> Back to Map
        </button>
      </div>

      {/* ── Summary strip ── */}
      <div className="ins-panel__summary" aria-label="Summary statistics">
        {SUMMARY.map((s) => (
          <div className="ins-summary-card" key={s.label}>
            <span className="ins-summary-card__icon" aria-hidden="true">{s.icon}</span>
            <span className="ins-summary-card__value">{s.value}</span>
            <span className="ins-summary-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Irrigation access visualisation ── */}
      <div className="ins-panel__viz-block">
        <p className="ins-viz-title">Irrigation Access Distribution (Demo Parcels)</p>
        <BarViz items={[
          { label: 'Good',    count: 3, color: '#4ade80' },
          { label: 'Moderate',count: 2, color: '#fbbf24' },
          { label: 'Limited', count: 4, color: '#f97316' },
          { label: 'None',    count: 3, color: '#f87171' },
        ]} />
        <p className="ins-viz-note">
          Based on TechnoLand synthetic demo data · 12 parcels
        </p>
      </div>

      {/* ── Insight cards ── */}
      <div className="ins-panel__list" role="list">
        {DEMO_INSIGHTS.map((ins) => {
          const sig = SIG[ins.signal] || SIG.neutral
          const isOpen = expanded === ins.id
          return (
            <article
              key={ins.id}
              className={['ins-card', isOpen ? 'ins-card--open' : ''].join(' ')}
              style={{ '--sig-border': sig.border, '--sig-bg': sig.bg, '--sig-accent': sig.accent }}
              role="listitem"
            >
              <button
                className="ins-card__toggle"
                onClick={() => toggle(ins.id)}
                aria-expanded={isOpen}
              >
                <span className="ins-card__icon" aria-hidden="true">{ins.icon}</span>
                <span className="ins-card__title">{ins.title}</span>
                <span className={`badge ${sig.badge} ins-card__sig-badge`}>
                  {ins.signal}
                </span>
                <ChevronIcon open={isOpen} />
              </button>

              {isOpen && (
                <div className="ins-card__body animate-fadeIn">
                  {/* What we found */}
                  <div className="ins-card__section">
                    <p className="ins-card__section-label">
                      <FindingIcon /> What we found
                    </p>
                    <p className="ins-card__text">{ins.description}</p>
                  </div>

                  {/* Why it matters */}
                  <div className="ins-card__section">
                    <p className="ins-card__section-label">
                      <WhyIcon /> Why it matters
                    </p>
                    <p className="ins-card__text">{getWhyItMatters(ins)}</p>
                  </div>

                  {/* Evidence */}
                  {ins.parcels.length > 0 && (
                    <div className="ins-card__section ins-card__section--evidence">
                      <p className="ins-card__section-label">
                        <EvidenceIcon /> Evidence — Demo Parcels
                      </p>
                      <div className="ins-card__parcel-list">
                        {ins.parcels.map((p) => (
                          <span key={p} className={`badge ${sig.badge}`}>{p}</span>
                        ))}
                      </div>
                      <p className="ins-card__evidence-note">
                        Based on TechnoLand synthetic demo data · not official government data
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* ── Footer ── */}
      <div className="ins-panel__footer">
        <p className="ins-panel__disclaimer">
          All insights are derived from the TechnoLand synthetic demo dataset.
          Parcel IDs, boundaries and attributes are fictional.
          When real public data (OSM, NWDP, Bhuvan LULC) is processed,
          these insights will reflect actual conditions.
        </p>
        <button
          className="ins-panel__data-btn"
          onClick={() => setActivePage('data-sources')}
        >
          View Data Sources <ArrowIcon />
        </button>
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */
function getWhyItMatters(ins) {
  const map = {
    'ins-001': 'High development priority areas represent the greatest potential return on infrastructure investment. Targeted interventions in these parcels could unlock agricultural productivity currently constrained by access gaps.',
    'ins-002': 'Rain-fed agriculture is highly vulnerable to monsoon variability. Parcels without irrigation access face yield uncertainty every dry year, limiting both food security and farmer income.',
    'ins-003': 'When agricultural potential is high but irrigation is the sole bottleneck, a relatively small investment in canal extension or pump infrastructure can deliver outsized productivity gains.',
    'ins-004': 'Identifying well-served productive parcels helps planners focus resources on under-served areas and understand which models of connectivity and irrigation to replicate elsewhere.',
    'ins-005': 'Non-functional infrastructure often has higher cost-effectiveness for improvement than building new. Repair of this pump station could serve multiple parcels at a fraction of new-build cost.',
    'ins-006': 'Forest buffers provide ecosystem services (water regulation, erosion control) that benefit surrounding agricultural land. Protecting this area has direct positive value for Dehradun valley agriculture.',
  }
  return map[ins.id] || 'This finding contributes to understanding development priorities and resource allocation in the demo study region.'
}

/* ── Icon sub-components ─────────────────────────────────── */
function FindingIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{display:'inline',marginRight:4,verticalAlign:'middle'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function WhyIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{display:'inline',marginRight:4,verticalAlign:'middle'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function EvidenceIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{display:'inline',marginRight:4,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function BackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
}
function ArrowIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}
function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease', flexShrink: 0, marginLeft: 'auto' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
