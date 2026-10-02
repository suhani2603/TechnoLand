# TechnoLand Backend

Serverless Lambda handlers for the TechnoLand GIS platform.

## Structure

```
backend/
├── lambdas/
│   ├── getLayers/   GET /layers, GET /layers/{id}
│   ├── getFeature/  GET /features/{id}
│   ├── chat/        POST /chat
│   └── health/      GET /health
└── shared/
    ├── response.js  API Gateway response helpers
    ├── mockDb.js    In-memory mock data (Phase 1)
    ├── auth.js      Cognito JWT identity extraction
    ├── s3.js        Presigned URL generation
    └── bedrock.js   Claude AI invocation
```

## Local Testing

Each Lambda can be invoked directly with Node.js:

```bash
# Test health check
node -e "
const { handler } = require('./lambdas/health/index');
handler({}).then(r => console.log(JSON.stringify(r, null, 2)));
"

# Test getLayers (list)
node -e "
process.env.USE_MOCK='true';
const { handler } = require('./lambdas/getLayers/index');
handler({ requestContext: { http: { method: 'GET' } } })
  .then(r => console.log(JSON.stringify(JSON.parse(r.body), null, 2)));
"
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `USE_MOCK` | `true` | Use mock data instead of real AWS services |
| `AWS_REGION` | `us-east-1` | AWS region for SDK clients |
| `DATA_BUCKET_NAME` | `technoland-data` | S3 bucket for GeoJSON files |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin |
| `SERVICE_VERSION` | `1.0.0` | Reported in health check |

## Phase 2 Checklist

- [ ] Install `@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb`
- [ ] Replace `shared/mockDb.js` calls with real DynamoDB DocumentClient
- [ ] Install `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- [ ] Uncomment real S3 presigning in `shared/s3.js`
- [ ] Install `@aws-sdk/client-bedrock-runtime`
- [ ] Uncomment real Bedrock call in `shared/bedrock.js`
- [ ] Enable Claude 3.5 Sonnet model access in Bedrock console
- [ ] Set `USE_MOCK=false` in Lambda environment variables
