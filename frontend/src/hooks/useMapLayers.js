import { useQuery } from '@tanstack/react-query'
import { fetchLayers, fetchLayerGeoJSON } from '../services/api.js'

/**
 * Fetch the list of available layer metadata.
 */
export function useLayerList() {
  return useQuery({
    queryKey: ['layers'],
    queryFn: fetchLayers,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Fetch the GeoJSON for a specific layer by ID.
 * Only fetches when `enabled` is true (i.e., layer is toggled on).
 */
export function useLayerGeoJSON(layerId, enabled = true) {
  return useQuery({
    queryKey: ['layer-geojson', layerId],
    queryFn: () => fetchLayerGeoJSON(layerId),
    enabled: !!layerId && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
