/**
 * Lambda: GET /health
 *
 * Simple health check endpoint — no auth required.
 * API Gateway warms this route; monitoring can poll it.
 */

'use strict'

const { ok } = require('../../shared/response')

exports.handler = async () => {
  return ok({
    status: 'ok',
    service: 'technoland-api',
    version: process.env.SERVICE_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    mock: process.env.USE_MOCK !== 'false',
  })
}
