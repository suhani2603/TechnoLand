/**
 * TechnoLand — API service layer.
 *
 * In mock mode (default for Phase 1 & 2 local dev), all calls return local
 * synthetic data without any AWS connection.
 * When AWS backend is ready, set VITE_API_URL and VITE_USE_MOCK=false —
 * no changes required in any component.
 *
 * Study region: Dehradun District, Uttarakhand, India (synthetic demo data).
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_URL || ''

// ── Base fetch helper ─────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // TODO (Phase 3): Add Cognito Authorization header:
      // 'Authorization': `Bearer ${await getIdToken()}`
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API ${res.status}: ${error}`)
  }
  return res.json()
}

// ── Layers ────────────────────────────────────────────────────────────────────
import { MOCK_LAYERS, generateContextualResponse } from './mockData.js'

export async function fetchLayers() {
  if (USE_MOCK) {
    await delay(280)
    return MOCK_LAYERS
  }
  return apiFetch('/layers')
}

export async function fetchLayerGeoJSON(layerId) {
  if (USE_MOCK) {
    await delay(350)
    const res = await fetch(`/mock-data/${layerId}.geojson`)
    if (!res.ok) throw new Error(`Failed to load mock GeoJSON for layer: ${layerId}`)
    return res.json()
  }
  // Real: GET /layers/{id} returns a presigned S3 URL
  const { url } = await apiFetch(`/layers/${layerId}`)
  const res = await fetch(url)
  return res.json()
}

// ── Features ──────────────────────────────────────────────────────────────────
export async function fetchFeature(featureId) {
  if (USE_MOCK) {
    await delay(180)
    return null // Feature data is embedded in GeoJSON properties in mock mode
  }
  return apiFetch(`/features/${featureId}`)
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
/**
 * Send a chat message with optional GIS feature context.
 * Returns: { reply: string, evidence: Array, model: string, featureId: string|null }
 *
 * In mock mode: uses the contextual response engine in mockData.js.
 * In real mode: POST /chat → Lambda → Amazon Bedrock (Claude Sonnet).
 *
 * The response shape is identical in both modes so the frontend needs no changes
 * when AWS is connected.
 */
export async function sendChatMessage({ message, featureContext }) {
  if (USE_MOCK) {
    // Realistic delay to simulate LLM response time
    await delay(900 + Math.random() * 700)

    // Generate a contextual response using actual feature properties
    const { reply, evidence } = generateContextualResponse(
      message,
      featureContext || null
    )

    return {
      reply,
      evidence: evidence || [],
      model: 'mock-contextual',
      featureId: featureContext?.parcel_id || featureContext?.id || null,
    }
  }

  // Real AWS Bedrock path
  return apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, featureContext }),
  })
}

// ── Utility ───────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
