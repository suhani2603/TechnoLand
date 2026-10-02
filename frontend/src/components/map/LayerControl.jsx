import React, { useState } from 'react'
import useMapStore from '../../store/mapStore.js'
import { MOCK_LAYERS } from '../../services/mockData.js'
import './LayerControl.css'

/* ── Land-use colour legend — matches MapView layer expressions ── */
const LAND_USE_LEGEND = [
  { color: '#22c55e', label: 'Agricultural'  },
  { color: '#86efac', label: 'Mixed use'     },
  { color: '#15803d', label: 'Forest'        },
  { color: '#0ea5e9', label: 'Wetland'       },
  { color: '#94a3b8', label: 'Built-up'      },
]

const INFRA_LEGEND = [
  { color: '#34d399', label: 'School'       },
  { color: '#f87171', label: 'Health centre'},
  { color: '#fbbf24', label: 'Storage'      },
  { color: '#60a5fa', label: 'Irrigation'   },
  { color: '#a78bfa', label: 'Road / Market'},
]

export default function LayerControl() {
  const [open, setOpen] = useState(false)
  const [tab,  setTab]  = useState('layers')   // 'layers' | 'legend'
  const { activeLayers, toggleLayer } = useMapStore()

  const activeCount = activeLayers.size

  return (
    <div className="lc">
      {/* Trigger button */}
      <button
        className={['lc__trigger', open ? 'lc__trigger--open' : ''].join(' ')}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Open layer controls"
        title="Layer controls"
      >
        <LayersIcon />
        <span className="lc__trigger-label">Layers</span>
        <span className="lc__trigger-count">{activeCount}/{MOCK_LAYERS.length}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Panel */}
      {open && (
        <div className="lc__panel animate-fadeIn" role="dialog" aria-label="Map layer controls">

          {/* Panel tab bar */}
          <div className="lc__tabs">
            <button
              className={['lc__tab', tab === 'layers' ? 'active' : ''].join(' ')}
              onClick={() => setTab('layers')}
            >Layers</button>
            <button
              className={['lc__tab', tab === 'legend' ? 'active' : ''].join(' ')}
              onClick={() => setTab('legend')}
            >Legend</button>
          </div>

          {/* Layers tab */}
          {tab === 'layers' && (
            <div className="lc__layer-list">
              {MOCK_LAYERS.map((layer) => {
                const on = activeLayers.has(layer.id)
                return (
                  <label key={layer.id} className="lc__layer-row">
                    <span className="lc__swatch" style={{ background: layer.color }} aria-hidden="true" />
                    <div className="lc__layer-text">
                      <span className="lc__layer-name">{layer.name}</span>
                      <span className="lc__layer-desc">{layer.description}</span>
                    </div>
                    <div className="lc__toggle-wrap">
                      <input
                        type="checkbox"
                        className="visually-hidden"
                        checked={on}
                        onChange={() => toggleLayer(layer.id)}
                        aria-label={`Toggle ${layer.name}`}
                      />
                      <span className={['lc__toggle', on ? 'on' : ''].join(' ')} aria-hidden="true" />
                    </div>
                  </label>
                )
              })}
              <p className="lc__data-note">
                Demo data · Dehradun, Uttarakhand
              </p>
            </div>
          )}

          {/* Legend tab */}
          {tab === 'legend' && (
            <div className="lc__legend-body">
              <p className="lc__legend-section">Land Use (Land Parcel layer)</p>
              {LAND_USE_LEGEND.map(({ color, label }) => (
                <div key={label} className="lc__legend-row">
                  <span className="lc__legend-swatch" style={{ background: color }} aria-hidden="true" />
                  <span className="lc__legend-label">{label}</span>
                </div>
              ))}

              <p className="lc__legend-section" style={{ marginTop: 10 }}>
                Infrastructure Facilities
              </p>
              {INFRA_LEGEND.map(({ color, label }) => (
                <div key={label} className="lc__legend-row">
                  <span
                    className="lc__legend-swatch lc__legend-swatch--circle"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="lc__legend-label">{label}</span>
                </div>
              ))}

              <p className="lc__legend-section" style={{ marginTop: 10 }}>
                Agricultural Zones
              </p>
              {[
                { color: '#f59e0b', label: 'High productivity'     },
                { color: '#fcd34d', label: 'Moderate productivity' },
                { color: '#fef3c7', label: 'Low productivity'      },
              ].map(({ color, label }) => (
                <div key={label} className="lc__legend-row">
                  <span className="lc__legend-swatch lc__legend-swatch--zone"
                    style={{ background: color }} aria-hidden="true" />
                  <span className="lc__legend-label">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LayersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
}
function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
