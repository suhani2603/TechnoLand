# TechnoLand — Architecture Reference

## Data Flow Diagrams

### 1. Map Layer Load (Phase 2)

```
User opens app
    │
    ▼
React app (CloudFront CDN)
    │  GET /api/layers  (with Cognito JWT)
    ▼
API Gateway HTTP API
    │  JWT authorizer validates token against Cognito
    ▼
getLayers Lambda
    │  Scan DynamoDB `technoland-layers` table
    │  For each layer → GetSignedUrl from S3
    ▼
Returns: [ { layerId, name, url: "https://s3.presigned..." } ]
    │
    ▼
React fetches GeoJSON directly from S3 presigned URL
    │
    ▼
MapLibre renders polygons/lines on basemap
```

### 2. Feature Click → AI Analysis

```
User clicks polygon on map
    │
    ▼
MapLibre onClick → feature.properties extracted from GeoJSON
    │
    ▼
Zustand store: setSelectedFeature(feature)
    │
    ▼
FeatureInspector panel renders attributes

User types in AI Assistant panel
    │
    ▼
POST /api/chat
    {
      message: "Is this land suitable for cassava?",
      featureContext: {
        land_use: "fallow", soil_type: "loamy",
        rainfall_mm: 1250, suitability: "high"
      }
    }
    │
    ▼
chat Lambda
    │  Builds system prompt with featureContext
    │  Calls Bedrock InvokeModelWithResponseStream
    │  (Claude 3.5 Sonnet)
    ▼
Streaming response → API Gateway → React
    │
    ▼
AIAssistant panel renders streamed text
```

### 3. Authentication (Phase 2)

```
User visits CloudFront URL
    │
    ▼
React checks Amplify auth state
    │  Not authenticated
    ▼
Redirect to Cognito Hosted UI (technoland-demo.auth.us-east-1.amazoncognito.com)
    │  User logs in (email + password)
    ▼
Cognito issues: ID token, Access token, Refresh token
    │
    ▼
Amplify stores tokens in memory/localStorage
    │
    ▼
API client attaches: Authorization: Bearer <id_token>
    │
    ▼
API Gateway Cognito JWT Authorizer validates on every request
    │  Invalid/expired → 401 Unauthorized
    │  Valid → Lambda invoked
    ▼
Lambda extracts userId from JWT claims (for audit logging)
```

## Cost Estimate (Demo / Hackathon)

Assumptions: 50 active users, 2 hours of demo time, ~500 API calls total.

| Service | Cost |
|---------|------|
| Lambda (500 invocations × 256MB × 200ms) | ~$0.00 (free tier) |
| API Gateway HTTP API (500 requests) | ~$0.00 (free tier) |
| DynamoDB (500 reads, on-demand) | ~$0.00 (free tier) |
| S3 (50 MB GeoJSON, 500 GET requests) | ~$0.01 |
| CloudFront (1 GB transfer) | ~$0.09 |
| Bedrock Claude Sonnet (50 chats × ~500 tokens) | ~$0.38 |
| Cognito (50 MAUs) | ~$0.00 (free tier: 50k MAUs) |
| **Total** | **< $0.50** |

## Security Posture

| Control | Implementation |
|---------|---------------|
| Authentication | Cognito JWT, enforced at API Gateway |
| Data in transit | HTTPS everywhere (CloudFront, API Gateway) |
| Data at rest | S3 + DynamoDB AWS-managed encryption |
| S3 access | Blocked public access; CloudFront OAC only |
| Lambda permissions | Least-privilege IAM roles per function |
| CORS | Restricted to CloudFront origin in production |
| Bedrock prompt injection | Max 2000 chars on user message; system prompt isolation |
