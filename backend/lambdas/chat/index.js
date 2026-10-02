/**
 * Lambda: POST /chat
 *
 * Accepts a user message + optional GIS feature context, then calls
 * Amazon Bedrock (Claude Sonnet) to generate a land-analysis response.
 *
 * Request body:
 * {
 *   "message":        "What crops suit this land?",       // required
 *   "featureContext": { "land_use": "fallow", ... }        // optional
 * }
 *
 * Response body:
 * {
 *   "reply":     "Based on the attributes...",
 *   "model":     "anthropic.claude-3-5-sonnet-...",
 *   "featureId": "parcel-001"  // echoed back if provided
 * }
 *
 * Phase 1: returns mock AI response from shared/bedrock.js
 * TODO (Phase 2): connect real Bedrock InvokeModel call in shared/bedrock.js
 */

'use strict'

const { ok, error, preflight } = require('../../shared/response')
const { generateResponse } = require('../../shared/bedrock')
const { getCallerIdentity } = require('../../shared/auth')

/** Maximum message length to prevent prompt injection / runaway tokens. */
const MAX_MESSAGE_LENGTH = 2000

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
exports.handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return preflight()
  }

  // Parse and validate body
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return error('Invalid JSON body', 400)
  }

  const { message, featureContext } = body

  if (!message || typeof message !== 'string') {
    return error('Missing required field: message', 400)
  }
  if (message.trim().length === 0) {
    return error('Message cannot be empty', 400)
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return error(`Message too long (max ${MAX_MESSAGE_LENGTH} chars)`, 400)
  }

  // Log caller identity (for audit trail in Phase 2)
  try {
    const caller = getCallerIdentity(event)
    console.info('[chat] Request from', caller.userId, '| feature:', featureContext?.id || 'none')
  } catch {
    // Auth is enforced by API Gateway in Phase 2; log but don't block in Phase 1
    console.warn('[chat] Could not resolve caller identity')
  }

  try {
    const { reply, model } = await generateResponse(message, featureContext)
    return ok({
      reply,
      model,
      featureId: featureContext?.id || null,
    })
  } catch (err) {
    console.error('[chat] Bedrock error:', err)
    return error('AI service temporarily unavailable', 503)
  }
}
