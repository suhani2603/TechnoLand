import React from 'react'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import MapView from '../map/MapView.jsx'
import FeatureInspector from '../panels/FeatureInspector.jsx'
import AIAssistant from '../panels/AIAssistant.jsx'
import InsightsPanel from '../panels/InsightsPanel.jsx'
import SettingsPanel from '../panels/SettingsPanel.jsx'
import DataSourcesPanel from '../panels/DataSourcesPanel.jsx'
import useMapStore from '../../store/mapStore.js'
import './AppShell.css'

/**
 * Full-page views: replace the map area entirely.
 * Right slide-in panels: float over the map.
 */
const FULL_PAGES = new Set(['reports', 'settings', 'data-sources'])

export default function AppShell() {
  const { rightPanel, sidebarCollapsed, activePage } = useMapStore()
  const isFullPage = FULL_PAGES.has(activePage)

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main
          className={[
            'app-main',
            sidebarCollapsed ? 'app-main--sidebar-collapsed' : '',
            (!isFullPage && rightPanel) ? 'app-main--panel-open' : '',
          ].filter(Boolean).join(' ')}
        >
          {/* Full-page panels */}
          {activePage === 'reports'      && <InsightsPanel />}
          {activePage === 'settings'     && <SettingsPanel />}
          {activePage === 'data-sources' && <DataSourcesPanel />}

          {/* Map — visible for 'map' and 'layers' pages */}
          {!isFullPage && <MapView />}
        </main>

        {/* Right slide-in panels — map pages only */}
        {!isFullPage && rightPanel === 'inspector' && (
          <aside className="right-panel animate-slideIn" aria-label="Feature Inspector">
            <FeatureInspector />
          </aside>
        )}
        {!isFullPage && rightPanel === 'ai' && (
          <aside className="right-panel animate-slideIn" aria-label="AI Assistant">
            <AIAssistant />
          </aside>
        )}
      </div>
    </div>
  )
}
