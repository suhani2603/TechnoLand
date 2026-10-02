/**
 * Lambda: GET /layers        → list all available GIS layers
 * Lambda: GET /layers/{id}   → return presigned S3 URL for a specific layer
 *
 * Connected to: DynamoDB (layer metadata) + S3 (GeoJSON files)
 * Auth: Cognito JWT Authorizer on API Gateway (Phase 2)
 *
 * Phase 1: returns mock data from shared/mockDb.js + shared/s3.js
 */

'use strict'

const { ok, error, preflight } = require('../../shared/response')
const { getAllLayers, getLayerById } = require('../../shared/mockDb')
const { getLayerUrl } = require('../../shared/s3')

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return preflight()
  }

  try {
    const layerId = event.pathParameters?.id

    // GET /layers/{id} — return presigned URL for one layer
    if (layerId) {
      const layer = await getLayerById(layerId)
      if (!layer) {
        return error(`Layer not found: ${layerId}`, 404)
      }
      const url = await getLayerUrl(layer.s3Key)
      return ok({ layerId: layer.layerId, name: layer.name, url })
    }

    // GET /layers — return all layer metadata (no presigned URLs in list view)
    const layers = await getAllLayers()
    return ok(layers)
  } catch (err) {
    console.error('[getLayers] Error:', err)
    return error('Internal server error', 500)
  }
}
