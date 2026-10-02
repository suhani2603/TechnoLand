/**
 * HTTP response helpers for API Gateway Lambda proxy integration.
 * Every Lambda handler returns one of these shapes.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

/**
 * Build a successful JSON response.
 * @param {*} body   - Any JSON-serialisable value.
 * @param {number} statusCode - HTTP status (default 200).
 */
function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

/**
 * Build an error JSON response.
 * @param {string} message   - Human-readable error message.
 * @param {number} statusCode - HTTP status (default 500).
 */
function error(message, statusCode = 500) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify({ error: message }),
  }
}

/** Preflight CORS response for OPTIONS requests. */
function preflight() {
  return { statusCode: 204, headers: CORS_HEADERS, body: '' }
}

module.exports = { ok, error, preflight }
