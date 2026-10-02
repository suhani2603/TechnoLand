/**
 * JWT verification helper for Cognito ID tokens.
 *
 * In Phase 1 (mock mode): passes all requests through.
 * In Phase 2 (AWS): API Gateway's Cognito JWT Authorizer handles token
 * verification before the Lambda is invoked, so this module is a safety
 * net for direct invocations / testing only.
 *
 * TODO (Phase 2): configure the API Gateway Cognito authorizer; this
 * module then only needs to decode the already-validated token to extract
 * the sub / email for business logic.
 */

const MOCK_MODE = process.env.USE_MOCK !== 'false'

/**
 * Extract the caller identity from the Lambda event.
 * Returns { userId, email } or throws if unauthenticated.
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
function getCallerIdentity(event) {
  if (MOCK_MODE) {
    // In mock mode, return a synthetic demo user
    return { userId: 'demo-user-001', email: 'demo@technoland.dev' }
  }

  // In real mode, the Cognito JWT Authorizer attaches claims here:
  const claims =
    event.requestContext?.authorizer?.jwt?.claims ||
    event.requestContext?.authorizer?.claims

  if (!claims?.sub) {
    throw new Error('Unauthorised: missing identity claims')
  }

  return {
    userId: claims.sub,
    email: claims.email || claims['cognito:username'] || 'unknown',
  }
}

module.exports = { getCallerIdentity }
