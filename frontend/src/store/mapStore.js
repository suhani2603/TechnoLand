import { create } from 'zustand'

/**
 * Global map state managed by Zustand.
 *
 * selectedFeature  – the GeoJSON feature the user last clicked.
 * activeLayers     – set of layer IDs currently visible on the map.
 * mapViewport      – current lng/lat/zoom (controlled by the map).
 * rightPanel       – which right panel is open: 'inspector' | 'ai' | null
 * sidebarCollapsed – whether the left nav is collapsed to icon-only mode.
 */
const useMapStore = create((set, get) => ({
  // ── App-level state (landing | app) ───────────────────────
  // 'landing' shows the intro screen; 'app' shows the full workspace
  appState: 'landing',
  enterApp: () => set({ appState: 'app' }),
  goToLanding: () => set({ appState: 'landing' }),

  // ── Selected feature ──────────────────────────────────────
  selectedFeature: null,
  setSelectedFeature: (feature) =>
    set({ selectedFeature: feature, rightPanel: feature ? 'inspector' : null }),
  clearSelectedFeature: () =>
    set({ selectedFeature: null }),

  // ── Layer visibility ──────────────────────────────────────
  activeLayers: new Set(['land-parcels', 'agricultural-zones', 'infrastructure', 'water-bodies']),
  toggleLayer: (layerId) => {
    const current = new Set(get().activeLayers)
    if (current.has(layerId)) current.delete(layerId)
    else current.add(layerId)
    set({ activeLayers: current })
  },
  isLayerActive: (layerId) => get().activeLayers.has(layerId),

  // ── Map viewport ──────────────────────────────────────────
  // Centred on Dehradun District, Uttarakhand, India
  mapViewport: {
    longitude: 77.95,
    latitude: 30.30,
    zoom: 10,
  },
  setMapViewport: (viewport) => set({ mapViewport: { ...get().mapViewport, ...viewport } }),

  // ── UI panels ─────────────────────────────────────────────
  rightPanel: null,   // 'inspector' | 'ai' | null
  setRightPanel: (panel) => set({ rightPanel: panel }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ── Active page/view ──────────────────────────────────────
  activePage: 'map',  // 'map' | 'layers' | 'reports' | 'settings'
  setActivePage: (page) => set({ activePage: page }),
}))

export default useMapStore
