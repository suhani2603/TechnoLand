# 🌍 TechnoLand

**GIS-based decision-support platform** connecting land, agriculture, infrastructure, and rural-development data.

Built for the **AWS Zero to Shipped 2026 Hackathon**.

> _Phase 1 complete — running fully on mock data locally._  
> _Phase 2 will wire up Amazon Bedrock, DynamoDB, S3, Cognito, API Gateway, and CloudFront._

---

## What it does

TechnoLand lets rural planners, agronomists, and land administrators:

1. **Explore** land parcels, agricultural zones, roads, and water bodies on an interactive GIS map
2. **Inspect** detailed attributes (soil type, elevation, suitability, crop data) by clicking any feature
3. **Ask AI** — the "Ask TechnoLand" panel sends the selected parcel's context to Claude (via Amazon Bedrock) and returns natural-language land-analysis insights

---

## Monorepo structure

```
TechnoLand/
├── frontend/          React + Vite + MapLibre GL JS SPA
├── backend/           AWS Lambda handlers (Node.js)
├── infrastructure/    AWS CDK TypeScript stacks
├── data/              Mock GeoJSON datasets
│   └── mock/          land-parcels, agricultural-zones, infrastructure, water-bodies
└── docs/              Architecture diagrams (Phase 2)
```

---

## Quick start — run locally

### Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |

### 1 — Install dependencies

```bash
cd frontend
npm install
```

### 2 — Start the development server

```bash
npm run dev
```

Open **http://localhost:5173** — the app loads immediately with mock data; no AWS account needed.

### 3 — Try the features

| Action | Result |
|--------|--------|
| Toggle layers | Click "Layers" button (top-left of map) to show/hide land parcels, agricultural zones, roads, water |
| Inspect a parcel | Click any coloured polygon on the map → Feature Inspector opens on the right |
| Ask AI | With a parcel selected, click "Ask TechnoLand AI about this parcel" → type your question |
| Open AI directly | Click "Ask AI" in the top navbar, or the 🤖 toolbar button (bottom-left of map) |
| Collapse sidebar | Click the `‹` button at the bottom of the left sidebar |
| Reset map view | Click the 🏠 toolbar button (bottom-left of map) |

---

## Environment variables

Create `frontend/.env.local` to override defaults:

```env
# Phase 1 defaults (mock mode — no AWS needed)
VITE_USE_MOCK=true

# Phase 2: fill these in after cdk deploy
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com
VITE_USE_MOCK=false
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Architecture

### Phase 1 (current — local mock)

```
Browser
  └── React/Vite SPA (http://localhost:5173)
        ├── MapLibre GL JS  ← GeoJSON from /public/mock-data/*.geojson
        ├── Feature Inspector  ← data from clicked GeoJSON feature properties
        └── AI Assistant  ← mock responses (simulated 1–2 s delay)
```

### Phase 2 (AWS — planned)

```
Browser
  └── CloudFront (HTTPS) ──► S3 (React build)
        │
        ├── /api/layers     ──► API Gateway ──► Lambda: getLayers ──► DynamoDB + S3
        ├── /api/features/* ──► API Gateway ──► Lambda: getFeature ──► DynamoDB
        └── /api/chat       ──► API Gateway ──► Lambda: chat ──► Amazon Bedrock (Claude)

Authentication: Cognito User Pool → JWT Authorizer on API Gateway
```

### AWS services used (Phase 2)

| Service | Role | Why |
|---------|------|-----|
| **Amazon S3** | GeoJSON storage + static site hosting | Durable, cheap, CDN-friendly |
| **Amazon CloudFront** | CDN + HTTPS for frontend | Global edge, SSL, SPA routing |
| **API Gateway (HTTP API)** | REST API | HTTP v2 is cheaper + faster than REST v1 |
| **AWS Lambda** | Business logic | Zero idle cost, scales to zero |
| **Amazon DynamoDB** | Feature attribute store | Serverless, ms latency, no capacity planning |
| **Amazon Cognito** | Auth — user pool + hosted UI | Amplify integrates in minutes |
| **Amazon Bedrock (Claude Sonnet)** | AI land assistant | No model hosting, pay-per-token |
| **AWS CDK (TypeScript)** | Infrastructure as code | Same language as backend |

---

## Project structure — detail

### Frontend (`frontend/`)

```
src/
├── components/
│   ├── layout/       AppShell, Navbar, Sidebar
│   ├── map/          MapView, LayerControl, MapToolbar
│   └── panels/       FeatureInspector, AIAssistant
├── hooks/            useMapLayers, useFeatureSelection, useAIChat
├── services/         api.js (mock/real toggle), mockData.js
└── store/            mapStore.js (Zustand)
```

**Key design decision:** `services/api.js` checks `VITE_USE_MOCK`. When `true`, all calls return local data. When `false`, it calls the real API Gateway endpoint. No component code changes between modes.

### Backend (`backend/`)

```
lambdas/
├── getLayers/    GET /layers, GET /layers/{id}
├── getFeature/   GET /features/{id}
├── chat/         POST /chat  (→ Bedrock)
└── health/       GET /health
shared/
├── response.js   API Gateway response helpers
├── mockDb.js     In-memory data (Phase 1) → swap for DynamoDB (Phase 2)
├── auth.js       Cognito JWT identity extraction
├── s3.js         Presigned URL generation
└── bedrock.js    Claude invocation (mock in Phase 1)
```

### Infrastructure (`infrastructure/`)

```
lib/
├── auth-stack.ts     Cognito User Pool + App Client + Hosted UI
├── data-stack.ts     S3 data bucket + DynamoDB tables (layers, features)
├── api-stack.ts      API Gateway HTTP API + 4 Lambda functions + IAM
├── hosting-stack.ts  CloudFront + S3 hosting bucket + deployment
└── ai-stack.ts       Bedrock IAM policy for chat Lambda
```

> ⚠️ CDK stacks are defined but **not deployed**. Run `cdk synth` to validate templates locally.

### Data (`data/`)

```
mock/
├── land-parcels.geojson       8 synthetic parcels with soil/crop/ownership data
├── agricultural-zones.geojson 4 suitability zones (high/moderate/low)
├── infrastructure.geojson     6 road features (primary/secondary/feeder)
└── water-bodies.geojson       4 water features (river/lake/reservoir/canal)
```

All mock data centres on north-central Nigeria (~7–9°E, 8–10°N) for a realistic rural-Africa context. Data is **synthetic** — not real cadastral information.

---

## Phase 2 implementation checklist

### AWS setup
- [ ] Bootstrap CDK: `cdk bootstrap aws://ACCOUNT/us-east-1`
- [ ] Enable Bedrock model access (Claude 3.5 Sonnet, us-east-1)
- [ ] Deploy stacks: `cd infrastructure && cdk deploy --all`

### Backend wiring
- [ ] Install `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`
- [ ] Replace `shared/mockDb.js` with real DynamoDB calls
- [ ] Install `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- [ ] Uncomment real S3 presigning in `shared/s3.js`
- [ ] Install `@aws-sdk/client-bedrock-runtime`
- [ ] Uncomment real Bedrock call in `shared/bedrock.js`
- [ ] Set `USE_MOCK=false` in Lambda environment variables

### Frontend wiring
- [ ] Copy CDK outputs to `frontend/.env.local`
- [ ] Set `VITE_USE_MOCK=false`
- [ ] Add Amplify auth: `npm install aws-amplify`
- [ ] Wire `Amplify.configure()` in `src/main.jsx`
- [ ] Wrap routes with `ProtectedRoute` component
- [ ] Run `npm run build` + deploy to S3/CloudFront

### Upload real GeoJSON data
- [ ] Download layers from FAO, OSM, ESA WorldCover
- [ ] Process to GeoJSON (QGIS or ogr2ogr)
- [ ] Upload to S3: `aws s3 sync data/real/ s3://technoland-data-*/`
- [ ] Seed DynamoDB with layer metadata

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite 5 |
| Language | JavaScript (frontend), TypeScript (CDK), Node.js (Lambda) |
| Map engine | MapLibre GL JS + react-map-gl |
| State management | Zustand |
| Server state | TanStack Query (React Query) |
| Styling | CSS custom properties (no framework dependency) |
| Backend runtime | Node.js 18 (Lambda ARM64 / Graviton2) |
| AI model | Amazon Bedrock — Claude 3.5 Sonnet |
| IaC | AWS CDK v2 (TypeScript) |

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*TechnoLand — AWS Zero to Shipped 2026 Hackathon submission*
