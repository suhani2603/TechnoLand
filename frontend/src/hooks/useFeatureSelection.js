import { useCallback } from 'react'
import useMapStore from '../store/mapStore.js'

/**
 * Returns helpers for selecting and clearing the active map feature.
 * Components should use this hook rather than touching the store directly.
 */
export function useFeatureSelection() {
  const selectedFeature = useMapStore((s) => s.selectedFeature)
  const setSelectedFeature = useMapStore((s) => s.setSelectedFeature)
  const clearSelectedFeature = useMapStore((s) => s.clearSelectedFeature)
  const setRightPanel = useMapStore((s) => s.setRightPanel)

  const selectFeature = useCallback(
    (feature) => {
      setSelectedFeature(feature)
      // Auto-open the inspector panel whenever a feature is selected
      if (feature) setRightPanel('inspector')
    },
    [setSelectedFeature, setRightPanel]
  )

  const clearFeature = useCallback(() => {
    clearSelectedFeature()
    setRightPanel(null)
  }, [clearSelectedFeature, setRightPanel])

  return { selectedFeature, selectFeature, clearFeature }
}
