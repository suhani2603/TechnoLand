/**
 * S3 helper — generates presigned GET URLs for GeoJSON layer files.
 *
 * Phase 1 (mock mode): returns a path pointing to the local public/mock-data/
 * folder served by Vite's dev server.
 *
 * Phase 2 (AWS): uses @aws-sdk/s3-request-presigner to generate a real
 * presigned URL from the TechnoLand data bucket.
 *
 * TODO (Phase 2):
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   Uncomment the real implementation below.
 */

const MOCK_MODE = process.env.USE_MOCK !== 'false'
const BUCKET_NAME = process.env.DATA_BUCKET_NAME || 'technoland-data'
const PRESIGNED_URL_TTL = 3600 // seconds

/**
 * Return a URL from which the caller can download a GeoJSON layer.
 *
 * @param {string} s3Key  - The object key inside the data bucket (e.g. "mock/land-parcels.geojson").
 * @returns {Promise<string>} A URL valid for PRESIGNED_URL_TTL seconds.
 */
async function getLayerUrl(s3Key) {
  if (MOCK_MODE) {
    // Strip the "mock/" prefix — Vite serves files from frontend/public/mock-data/
    const filename = s3Key.replace(/^mock\//, '')
    return `/mock-data/${filename}`
  }

  // ── Real AWS implementation (Phase 2) ──────────────────────────────────────
  // const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
  // const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
  //
  // const client = new S3Client({ region: process.env.AWS_REGION })
  // const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key })
  // return getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL })
  // ──────────────────────────────────────────────────────────────────────────

  throw new Error('Real S3 presigning not yet implemented — set USE_MOCK=true')
}

module.exports = { getLayerUrl }
