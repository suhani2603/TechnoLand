import React from 'react'
import useMapStore from '../../store/mapStore.js'
import './Navbar.css'

export default function Navbar() {
  const { rightPanel, setRightPanel, goToLanding, activePage, setActivePage } = useMapStore()

  return (
    <header className="navbar" role="banner">

      {/* ── Brand ── */}
      <div className="navbar__brand">
        <button
          className="navbar__logo-btn"
          onClick={goToLanding}
          aria-label="Return to TechnoLand home"
          title="Home"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#16a34a" />
            <path d="M8 22 L16 10 L24 22 Z" fill="white" opacity="0.95" />
            <circle cx="16" cy="16" r="3" fill="#86efac" />
          </svg>
        </button>
        <div className="navbar__title-group">
          <span className="navbar__title">TechnoLand</span>
          <span className="navbar__subtitle">GIS &amp; Rural Development</span>
        </div>
      </div>

      {/* ── Region pill ── */}
      <div className="navbar__region" aria-label="Study region">
        <PinIcon />
        <span className="navbar__region-name">Dehradun, Uttarakhand</span>
        <span className="navbar__region-sep" aria-hidden="true" />
        <span className="navbar__region-data">Demo dataset</span>
      </div>

      {/* ── Spacer ── */}
      <div className="navbar__spacer" aria-hidden="true" />

      {/* ── Quick nav tabs (desktop) ── */}
      <nav className="navbar__tabs" aria-label="Quick navigation">
        {[
          { id: 'map',          label: 'Map'           },
          { id: 'reports',      label: 'Insights'      },
          { id: 'data-sources', label: 'Data Sources'  },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={['navbar__tab', activePage === id ? 'active' : ''].join(' ')}
            onClick={() => setActivePage(id)}
            aria-current={activePage === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Actions ── */}
      <div className="navbar__actions">
        {/* Ask AI toggle */}
        <button
          className={['navbar__action-btn', rightPanel === 'ai' ? 'active' : ''].join(' ')}
          onClick={() => setRightPanel(rightPanel === 'ai' ? null : 'ai')}
          aria-label="Toggle AI assistant"
          aria-pressed={rightPanel === 'ai'}
          title="Ask TechnoLand AI"
        >
          <BotIcon />
          <span className="navbar__action-label">Ask AI</span>
        </button>

        {/* Demo indicator */}
        <div className="navbar__demo-pill" aria-label="Demo mode">
          <span className="navbar__demo-dot" aria-hidden="true" />
          Demo
        </div>
      </div>
    </header>
  )
}

/* ── Icons ──────────────────────────────────────────────── */
function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <line x1="8"  y1="16" x2="8"  y2="16" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
