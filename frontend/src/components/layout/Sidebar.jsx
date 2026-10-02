import React from 'react'
import useMapStore from '../../store/mapStore.js'
import { MOCK_LAYERS } from '../../services/mockData.js'
import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'map',          label: 'Map',          Icon: MapIcon       },
  { id: 'layers',       label: 'Layers',       Icon: LayersIcon    },
  { id: 'reports',      label: 'Insights',     Icon: InsightsIcon  },
  { id: 'data-sources', label: 'Data Sources', Icon: DataIcon      },
  { id: 'settings',     label: 'Settings',     Icon: SettingsIcon  },
]

export default function Sidebar() {
  const {
    sidebarCollapsed, toggleSidebar,
    activePage, setActivePage,
    activeLayers, toggleLayer,
  } = useMapStore()

  const collapsed = sidebarCollapsed

  return (
    <aside
      className={['sidebar', collapsed ? 'sidebar--collapsed' : ''].join(' ')}
      aria-label="Main navigation"
    >
      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Site sections">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={['sidebar__nav-item', activePage === id ? 'active' : ''].join(' ')}
            onClick={() => setActivePage(id)}
            title={collapsed ? label : undefined}
            aria-current={activePage === id ? 'page' : undefined}
          >
            <span className="sidebar__nav-icon"><Icon /></span>
            {!collapsed && <span className="sidebar__nav-label">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Layer toggles — map/layers pages only, not collapsed */}
      {!collapsed && (activePage === 'map' || activePage === 'layers') && (
        <div className="sidebar__layers">
          <p className="sidebar__section-title">Map Layers</p>
          {MOCK_LAYERS.map((layer) => {
            const on = activeLayers.has(layer.id)
            return (
              <label key={layer.id} className="sidebar__layer-row">
                <input
                  type="checkbox"
                  className="visually-hidden"
                  checked={on}
                  onChange={() => toggleLayer(layer.id)}
                  aria-label={`Toggle ${layer.name} layer`}
                />
                {/* Toggle switch */}
                <span className={['sidebar__toggle', on ? 'on' : ''].join(' ')} aria-hidden="true" />
                {/* Colour dot */}
                <span
                  className="sidebar__layer-dot"
                  style={{ background: layer.color }}
                  aria-hidden="true"
                />
                <div className="sidebar__layer-text">
                  <span className="sidebar__layer-name">{layer.name}</span>
                </div>
              </label>
            )
          })}
        </div>
      )}

      {/* Spacer pushes collapse btn to bottom */}
      <div className="sidebar__spacer" aria-hidden="true" />

      {/* Collapse toggle */}
      <button
        className="sidebar__collapse-btn"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronIcon flipped={!collapsed} />
      </button>
    </aside>
  )
}

/* ── Icons ───────────────────────────────────────────────── */
function MapIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  )
}
function LayersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
}
function InsightsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}
function DataIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="5"  rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function ChevronIcon({ flipped }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true"
      style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}
    >
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
