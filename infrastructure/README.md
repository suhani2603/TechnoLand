# TechnoLand Infrastructure

AWS CDK TypeScript project defining all TechnoLand cloud resources.

> **Phase 1 status:** This infrastructure is defined but NOT deployed.  
> Run `cdk synth` to validate templates locally without creating any resources.

## Stack Overview

| Stack | Resources | Purpose |
|-------|-----------|---------|
| `TechnoLand-Auth` | Cognito User Pool + App Client | User authentication |
| `TechnoLand-Data` | S3 Bucket + 2x DynamoDB Tables | GeoJSON storage + feature attributes |
| `TechnoLand-Api` | API Gateway HTTP API + 4x Lambda | REST API for frontend |
| `TechnoLand-Hosting` | CloudFront + S3 | SPA hosting + CDN |
| `TechnoLand-AI` | IAM Policy (Bedrock) | Claude model access for chat Lambda |

## Local Setup (Phase 2)

```bash
cd infrastructure
npm install
npm run build     # compile TypeScript
npm run synth     # generate CloudFormation templates (no AWS calls)
```

## Deploying (Phase 2 only)

Prerequisites:
1. AWS CLI authenticated (`aws sts get-caller-identity`)
2. CDK bootstrapped: `cdk bootstrap aws://ACCOUNT/REGION`
3. Claude model access enabled in Bedrock console (us-east-1)
4. Frontend built: `cd ../frontend && npm run build`

```bash
# Deploy all stacks in dependency order
cdk deploy --all

# Or deploy individually
cdk deploy TechnoLand-Auth
cdk deploy TechnoLand-Data
cdk deploy TechnoLand-Api
cdk deploy TechnoLand-Hosting
cdk deploy TechnoLand-AI
```

## Environment Variables (post-deploy)

After `cdk deploy`, copy the stack outputs to `frontend/.env.local`:

```env
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com
VITE_USE_MOCK=false
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```
