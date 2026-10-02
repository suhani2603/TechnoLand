import React, { useState } from 'react'
import useMapStore from '../../store/mapStore.js'
import './LandingPage.css'

/* ─── Main component ────────────────────────────────────── */
export default function LandingPage() {
  const { enterApp, setActivePage, setRightPanel } = useMapStore()
  const [showHow, setShowHow] = useState(false)

  /* Navigate to a section inside the app workspace */
  const goTo = (page, panel = null) => {
    enterApp()
    setActivePage(page)
    if (panel) setRightPanel(panel)
  }

  return (
    <div className="landing">
      {/* Background grid + topographic texture */}
      <div className="landing__bg" aria-hidden="true">
        <div className="landing__grid" />
        <div className="landing__topo" />
        <div className="landing__glow landing__glow--1" />
        <div className="landing__glow landing__glow--2" />
      </div>

      {/* Nav bar */}
      <header className="landing__nav">
        <div className="landing__nav-brand">
          <LogoMark />
          <span className="landing__nav-title">TechnoLand</span>
        </div>
        <div className="landing__nav-links">
          <span className="landing__nav-tag">
            <DotIcon color="#4ade80" />
            Dehradun Demo
          </span>
          <span className="landing__nav-tag">
            <DotIcon color="#38bdf8" />
            Public + Derived Data
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="landing__hero">
        <div className="landing__hero-content">
          {/* Eyebrow */}
          <div className="landing__eyebrow">
            <span className="landing__eyebrow-dot" aria-hidden="true" />
            GIS · Agriculture · Rural Development · AI Insights
          </div>

          {/* Headline */}
          <h1 className="landing__headline">
            Connecting Land,<br />
            <span className="landing__headline-accent">Data &amp; Development</span>
          </h1>

          {/* Sub */}
          <p className="landing__subline">
            Explore how land, agriculture, water and infrastructure interact —
            and discover evidence-backed insights for smarter rural development.
          </p>

          {/* CTAs */}
          <div className="landing__ctas">
            <button
              className="landing__btn-primary"
              onClick={enterApp}
              aria-label="Open TechnoLand map for Dehradun"
            >
              <MapArrowIcon />
              Explore Dehradun
            </button>
            <button
              className="landing__btn-secondary"
              onClick={() => setShowHow((v) => !v)}
              aria-expanded={showHow}
            >
              {showHow ? 'Close' : 'How TechnoLand Works'}
            </button>
          </div>

          {/* How it works — expandable */}
          {showHow && (
            <div className="landing__how animate-fadeIn" aria-label="How TechnoLand works">
              {[
                { step: '01', label: 'Load the Map', desc: 'The GIS workspace opens centred on Dehradun District, Uttarakhand with multiple data layers pre-loaded.' },
                { step: '02', label: 'Click a Feature', desc: 'Click any land parcel, agricultural zone or infrastructure point to open the Land Inspector panel.' },
                { step: '03', label: 'Read the Evidence', desc: 'Development Signals show irrigation access, water proximity, infrastructure gaps and agricultural suitability.' },
                { step: '04', label: 'Ask TechnoLand AI', desc: 'Ask a question about the selected parcel. The AI uses actual feature data to explain findings, not generic responses.' },
              ].map(({ step, label, desc }) => (
                <div className="landing__how-step" key={step}>
                  <span className="landing__how-num">{step}</span>
                  <div>
                    <p className="landing__how-label">{label}</p>
                    <p className="landing__how-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Study region callout */}
          <div className="landing__region-tag">
            <GlobeIcon />
            <span>
              <strong>Study Region:</strong> Dehradun District, Uttarakhand, India
            </span>
            <span className="landing__region-sep" aria-hidden="true">·</span>
            <span className="landing__region-note">Demo dataset — see Data Sources for details</span>
          </div>
        </div>

        {/* Visual panel (right side) */}
        <div className="landing__visual" aria-hidden="true">
          <GISVisual />
        </div>
      </main>

      {/* Feature cards */}
      <section className="landing__features" aria-label="Platform features">
        <div className="landing__features-grid">
          {[
            {
              icon: <LandIcon />,
              title: 'Explore the Land',
              body: 'Understand land use and agricultural patterns through interactive GIS maps centred on Dehradun, Uttarakhand.',
              accent: '#22c55e',
              onClick: () => goTo('map'),
              ariaLabel: 'Go to Map View',
            },
            {
              icon: <GapIcon />,
              title: 'Discover Gaps',
              body: 'Identify water, irrigation and infrastructure accessibility gaps across agricultural areas.',
              accent: '#38bdf8',
              onClick: () => goTo('reports'),
              ariaLabel: 'Go to Insights page',
            },
            {
              icon: <ChangeIcon />,
              title: 'Understand Change',
              body: 'Explore land-use patterns and development indicators to understand where intervention matters most.',
              accent: '#f59e0b',
              onClick: () => goTo('reports'),
              ariaLabel: 'Go to Insights page',
            },
            {
              icon: <AIIcon />,
              title: 'Ask TechnoLand AI',
              body: 'Ask questions about any land parcel and receive evidence-backed insights grounded in the underlying data.',
              accent: '#a78bfa',
              onClick: () => goTo('map', 'ai'),
              ariaLabel: 'Open AI Assistant',
            },
          ].map((f) => (
            <button
              className="landing__card"
              key={f.title}
              style={{ '--card-accent': f.accent }}
              onClick={f.onClick}
              aria-label={f.ariaLabel}
            >
              <div className="landing__card-icon">{f.icon}</div>
              <h2 className="landing__card-title">{f.title}</h2>
              <p className="landing__card-body">{f.body}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom CTA bar */}
      <div className="landing__bottom-bar">
        <div className="landing__bottom-left">
          <span className="landing__bottom-disclaimer">
            All spatial data is either public-source, derived analysis, or clearly marked as synthetic demonstration data.
            No private land ownership information is displayed.
          </span>
        </div>
        <button className="landing__btn-primary landing__btn-sm" onClick={enterApp}>
          Open Map
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

/* ─── GIS visual composition ────────────────────────────── */
function GISVisual() {
  return (
    <svg
      className="landing__gis-svg"
      viewBox="0 0 420 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Grid background */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 40} x2="420" y2={i * 40} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={i * 42} y1="0" x2={i * 42} y2="380" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}

      {/* Agricultural zone — amber */}
      <polygon points="60,80 200,60 240,160 180,200 80,180" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="6 3" />
      {/* Agricultural zone 2 */}
      <polygon points="220,140 320,120 360,200 300,240 210,210" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="5 3" />

      {/* Land parcel — green fill */}
      <polygon points="90,110 160,100 175,160 120,175" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
      {/* Land parcel 2 */}
      <polygon points="240,170 300,155 315,225 255,235" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.45)" strokeWidth="1.5" />
      {/* Land parcel 3 — selected highlight */}
      <polygon points="145,185 205,175 215,235 160,248" fill="rgba(34,197,94,0.30)" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
      {/* Selection pulse ring */}
      <polygon points="140,181 210,170 221,239 154,253" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />

      {/* Water body — blue */}
      <ellipse cx="320" cy="290" rx="55" ry="30" fill="rgba(56,189,248,0.25)" stroke="rgba(56,189,248,0.6)" strokeWidth="1.5" />
      {/* River line */}
      <path d="M180,310 Q240,290 320,290 Q370,290 400,310" stroke="rgba(56,189,248,0.5)" strokeWidth="2.5" fill="none" />

      {/* Infrastructure — purple roads */}
      <path d="M30,200 L420,180" stroke="rgba(167,139,250,0.6)" strokeWidth="3" />
      <path d="M200,30 L210,380" stroke="rgba(167,139,250,0.4)" strokeWidth="2" />
      <path d="M30,120 Q120,140 200,120 Q280,100 420,130" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" strokeDasharray="8 4" />

      {/* Facility points */}
      <circle cx="130" cy="200" r="5" fill="#f87171" stroke="#1a2535" strokeWidth="1.5" />
      <circle cx="270" cy="165" r="5" fill="#34d399" stroke="#1a2535" strokeWidth="1.5" />
      <circle cx="360" cy="185" r="5" fill="#fbbf24" stroke="#1a2535" strokeWidth="1.5" />
      <circle cx="90" cy="160" r="5" fill="#60a5fa" stroke="#1a2535" strokeWidth="1.5" />

      {/* Selected parcel tooltip card */}
      <rect x="168" y="118" width="130" height="60" rx="6" fill="#1a2535" stroke="rgba(34,197,94,0.5)" strokeWidth="1" />
      <rect x="168" y="118" width="130" height="60" rx="6" fill="rgba(34,197,94,0.06)" />
      <text x="177" y="134" fontSize="8" fill="#4ade80" fontFamily="system-ui">LAND PARCEL</text>
      <text x="177" y="148" fontSize="9" fill="#e2e8f0" fontFamily="system-ui" fontWeight="600">Majra Demo Block</text>
      <line x1="177" y1="153" x2="288" y2="153" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="177" y="165" fontSize="8" fill="#94a3b8" fontFamily="system-ui">Suitability: </text>
      <text x="222" y="165" fontSize="8" fill="#4ade80" fontFamily="system-ui">High</text>
      <text x="177" y="175" fontSize="8" fill="#94a3b8" fontFamily="system-ui">Irrigation: </text>
      <text x="213" y="175" fontSize="8" fill="#fbbf24" fontFamily="system-ui">Limited</text>

      {/* Coordinate labels */}
      <text x="8" y="12" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">30.38°N</text>
      <text x="8" y="372" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">30.22°N</text>
      <text x="340" y="375" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">78.12°E</text>

      {/* Scale bar */}
      <line x1="310" y1="358" x2="390" y2="358" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="310" y1="354" x2="310" y2="362" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="390" y1="354" x2="390" y2="362" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="340" y="353" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace">10 km</text>

      {/* Compass */}
      <text x="392" y="46" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">N</text>
      <line x1="396" y1="48" x2="396" y2="62" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <polygon points="396,48 393,58 396,56 399,58" fill="rgba(255,255,255,0.3)" />
    </svg>
  )
}

/* ─── Inline SVG icons ──────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#16a34a" />
      <path d="M8 22 L16 10 L24 22 Z" fill="white" opacity="0.9" />
      <circle cx="16" cy="16" r="3" fill="#86efac" />
    </svg>
  )
}
function DotIcon({ color }) {
  return <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill={color} /></svg>
}
function MapArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}
function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function LandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}
function GapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function ChangeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function AIIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
