import React from 'react'
import useMapStore from '../../store/mapStore.js'
import './MapToolbar.css'

/**
 * Floating vertical toolbar — bottom-left of the map.
 * Provides home reset, AI assistant toggle.
 */
export default function MapToolbar({ mapRef }) {
  const { setMapViewport, setRightPanel, rightPanel } = useMapStore()

  const goHome = () => {
    // Dehradun district centre
    setMapViewport({ longitude: 77.95, latitude: 30.30, zoom: 10 })
    mapRef?.current?.flyTo({ center: [77.95, 30.30], zoom: 10, duration: 900 })
  }

  return (
    <div className="map-toolbar" role="toolbar" aria-label="Map tools">
      <button
        className="map-toolbar__btn"
        onClick={goHome}
        title="Reset to Dehradun overview"
        aria-label="Reset map to home view"
      >
        <HomeIcon />
      </button>

      <div className="map-toolbar__sep" aria-hidden="true" />

      <button
        className={['map-toolbar__btn', rightPanel === 'ai' ? 'map-toolbar__btn--active' : ''].join(' ')}
        onClick={() => setRightPanel(rightPanel === 'ai' ? null : 'ai')}
        title="Ask TechnoLand AI"
        aria-label="Open AI assistant"
        aria-pressed={rightPanel === 'ai'}
      >
        <BotIcon />
      </button>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function BotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <line x1="8"  y1="16" x2="8"  y2="16" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
