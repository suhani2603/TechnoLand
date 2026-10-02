/**
 * Lambda: GET /features/{id}
 *
 * Returns the full attribute set for a single GIS feature.
 * In the real data model, GeoJSON properties are stored in DynamoDB
 * alongside the geometry stored in S3 — this handler queries the attribute
 * table for richer data than what ships inside the GeoJSON itself.
 *
 * Phase 1: returns mock data from shared/mockDb.js
 * TODO (Phase 2): replace mockDb calls with real DynamoDB DocumentClient queries
 */

'use strict'

const { ok, error, preflight } = require('../../shared/response')
const { getFeatureById } = require('../../shared/mockDb')

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
exports.handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return preflight()
  }

  const featureId = event.pathParameters?.id
  if (!featureId) {
    return error('Missing feature ID', 400)
  }

  try {
    const feature = await getFeatureById(featureId)
    if (!feature) {
      return error(`Feature not found: ${featureId}`, 404)
    }
    return ok(feature)
  } catch (err) {
    console.error('[getFeature] Error:', err)
    return error('Internal server error', 500)
  }
}
