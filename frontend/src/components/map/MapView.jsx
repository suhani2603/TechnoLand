import React, { useCallback, useRef, useState } from 'react'
import Map, { Source, Layer, NavigationControl, ScaleControl, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import useMapStore from '../../store/mapStore.js'
import { useFeatureSelection } from '../../hooks/useFeatureSelection.js'
import { useLayerGeoJSON } from '../../hooks/useMapLayers.js'
import LayerControl from './LayerControl.jsx'
import MapToolbar from './MapToolbar.jsx'
import './MapView.css'

/**
 * Free OpenFreeMap basemap — no API key required.
 * TODO (Phase 3): replace with AWS Location Service map style URL.
 */
const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export default function MapView() {
  const mapRef = useRef(null)
  const { mapViewport, setMapViewport, activeLayers } = useMapStore()
  const { selectedFeature, selectFeature } = useFeatureSelection()
  const [hoverInfo, setHoverInfo] = useState(null)

  /* ── Click ─────────────────────────────────────────────── */
  const handleMapClick = useCallback(
    (event) => {
      const features = event.features
      if (features && features.length > 0) {
        selectFeature(features[0])
      } else {
        selectFeature(null)
      }
    },
    [selectFeature]
  )

  /* ── Hover ─────────────────────────────────────────────── */
  const handleMouseMove = useCallback((event) => {
    const features = event.features
    if (features && features.length > 0) {
      const f = features[0]
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        name: f.properties?.name || f.properties?.parcel_id || f.properties?.zone_id || f.properties?.feature_id || 'Feature',
        type: f.properties?.category || f.properties?.land_use || f.properties?.type || '',
      })
    } else {
      setHoverInfo(null)
    }
  }, [])

  const handleMouseLeave = useCallback(() => setHoverInfo(null), [])

  /* ── Interactive layer IDs (polygons + lines only; points use circle) ── */
  const interactiveLayers = [
    activeLayers.has('land-parcels')        && 'land-parcels-fill',
    activeLayers.has('agricultural-zones')  && 'agricultural-zones-fill',
    activeLayers.has('water-bodies')        && 'water-bodies-fill',
    activeLayers.has('infrastructure')      && 'infrastructure-line',
    activeLayers.has('infrastructure')      && 'infrastructure-points-circle',
  ].filter(Boolean)

  return (
    <div className="map-view" role="application" aria-label="TechnoLand interactive GIS map">
      <Map
        ref={mapRef}
        initialViewState={mapViewport}
        onMove={(evt) => setMapViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={BASEMAP_STYLE}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={interactiveLayers}
        cursor={hoverInfo ? 'pointer' : 'grab'}
        attributionControl={true}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {/* GIS layers — rendered back-to-front */}
        <AgriculturalZonesLayer visible={activeLayers.has('agricultural-zones')} />
        <WaterBodiesLayer       visible={activeLayers.has('water-bodies')} />
        <LandParcelsLayer       visible={activeLayers.has('land-parcels')} selectedId={selectedFeature?.id} />
        <InfrastructureLayer    visible={activeLayers.has('infrastructure')} />

        {/* Hover tooltip */}
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
          >
            <div className="map-tooltip">
              <strong>{hoverInfo.name}</strong>
              {hoverInfo.type && <span className="map-tooltip__type">{hoverInfo.type}</span>}
              <span className="map-tooltip__hint">Click to inspect</span>
            </div>
          </Popup>
        )}
      </Map>

      {/* DEMO region indicator */}
      <div className="map-demo-badge" aria-label="Demo region indicator">
        <span className="map-demo-badge__dot" aria-hidden="true" />
        TechnoLand Demo Region · Dehradun, Uttarakhand
      </div>

      <LayerControl />
      <MapToolbar mapRef={mapRef} />
    </div>
  )
}

/* ── Layer components ────────────────────────────────────── */

function LandParcelsLayer({ visible, selectedId }) {
  const { data, isLoading } = useLayerGeoJSON('land-parcels', visible)
  if (!visible || isLoading || !data) return null

  return (
    <Source id="land-parcels-src" type="geojson" data={data}>
      {/* Fill — colours keyed to Phase 2 land_use values */}
      <Layer
        id="land-parcels-fill"
        type="fill"
        paint={{
          'fill-color': [
            'match', ['get', 'land_use'],
            'agricultural', '#22c55e',
            'mixed',        '#86efac',
            'forest',       '#15803d',
            'wetland',      '#0ea5e9',
            'built_up',     '#94a3b8',
            '#4ade80',  /* fallback */
          ],
          'fill-opacity': [
            'case',
            ['==', ['id'], selectedId ?? -1], 0.6,
            0.22,
          ],
        }}
      />
      {/* Outline — white highlight on selected */}
      <Layer
        id="land-parcels-outline"
        type="line"
        paint={{
          'line-color': [
            'case',
            ['==', ['id'], selectedId ?? -1], '#ffffff',
            '#16a34a',
          ],
          'line-width': [
            'case',
            ['==', ['id'], selectedId ?? -1], 2.5,
            1,
          ],
          'line-opacity': 0.85,
        }}
      />
    </Source>
  )
}

function AgriculturalZonesLayer({ visible }) {
  const { data, isLoading } = useLayerGeoJSON('agricultural-zones', visible)
  if (!visible || isLoading || !data) return null

  return (
    <Source id="agri-zones-src" type="geojson" data={data}>
      <Layer
        id="agricultural-zones-fill"
        type="fill"
        paint={{
          'fill-color': [
            'match', ['get', 'productivity_level'],
            'high',     '#f59e0b',
            'moderate', '#fcd34d',
            'low',      '#fef3c7',
            '#f59e0b',
          ],
          'fill-opacity': 0.2,
        }}
      />
      <Layer
        id="agricultural-zones-outline"
        type="line"
        paint={{
          'line-color': '#d97706',
          'line-width': 1.5,
          'line-dasharray': [4, 2],
          'line-opacity': 0.65,
        }}
      />
    </Source>
  )
}

function WaterBodiesLayer({ visible }) {
  const { data, isLoading } = useLayerGeoJSON('water-bodies', visible)
  if (!visible || isLoading || !data) return null

  return (
    <Source id="water-src" type="geojson" data={data}>
      <Layer
        id="water-bodies-fill"
        type="fill"
        paint={{
          'fill-color': [
            'match', ['get', 'type'],
            'canal',      '#7dd3fc',
            'reservoir',  '#38bdf8',
            'river',      '#0ea5e9',
            'waterbody',  '#bae6fd',
            '#38bdf8',
          ],
          'fill-opacity': 0.45,
        }}
      />
      <Layer
        id="water-bodies-outline"
        type="line"
        paint={{
          'line-color': '#0284c7',
          'line-width': 1.5,
          'line-opacity': 0.9,
        }}
      />
    </Source>
  )
}

function InfrastructureLayer({ visible }) {
  const { data, isLoading } = useLayerGeoJSON('infrastructure', visible)
  if (!visible || isLoading || !data) return null

  /* Split the mixed FeatureCollection into lines and points */
  const lineData = {
    type: 'FeatureCollection',
    features: data.features.filter(
      (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
    ),
  }
  const pointData = {
    type: 'FeatureCollection',
    features: data.features.filter(
      (f) => f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
    ),
  }

  return (
    <>
      {/* ── Road lines ── */}
      <Source id="infrastructure-lines-src" type="geojson" data={lineData}>
        <Layer
          id="infrastructure-line"
          type="line"
          paint={{
            'line-color': [
              'match', ['get', 'road_type'],
              'national_highway', '#a78bfa',
              'state_highway',    '#c4b5fd',
              'district_road',    '#ddd6fe',
              'village_road',     '#ede9fe',
              '#a78bfa',
            ],
            'line-width': [
              'match', ['get', 'road_type'],
              'national_highway', 3,
              'state_highway',    2.5,
              'district_road',    2,
              1.5,
            ],
            'line-opacity': 0.85,
          }}
        />
      </Source>

      {/* ── Facility points ── */}
      <Source id="infrastructure-points-src" type="geojson" data={pointData}>
        {/* Coloured circle by category */}
        <Layer
          id="infrastructure-points-circle"
          type="circle"
          paint={{
            'circle-color': [
              'match', ['get', 'category'],
              'school',               '#34d399',
              'health_center',        '#f87171',
              'agricultural_storage', '#fbbf24',
              'irrigation_facility',  '#60a5fa',
              'market',               '#a78bfa',
              '#94a3b8',
            ],
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              8, 4,
              12, 7,
              15, 10,
            ],
            'circle-stroke-color': 'rgba(15,25,35,0.85)',
            'circle-stroke-width': 1.5,
            'circle-opacity': 0.9,
          }}
        />
        {/* White inner dot for readability */}
        <Layer
          id="infrastructure-points-inner"
          type="circle"
          paint={{
            'circle-color': '#ffffff',
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              8, 1.5,
              12, 2.5,
              15, 4,
            ],
            'circle-opacity': 0.7,
          }}
        />
      </Source>
    </>
  )
}
