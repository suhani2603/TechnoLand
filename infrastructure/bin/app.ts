#!/usr/bin/env node
/**
 * TechnoLand CDK Application entry point.
 *
 * Stack deployment order (dependencies flow downward):
 *   AuthStack  ──► ApiStack ──► HostingStack
 *   DataStack  ──┘
 *   AIStack (independent — only needs IAM role from ApiStack)
 *
 * DO NOT RUN `cdk deploy` until Phase 2.
 * Use `cdk synth` to validate the CloudFormation templates locally.
 */

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AuthStack }    from '../lib/auth-stack'
import { DataStack }    from '../lib/data-stack'
import { ApiStack }     from '../lib/api-stack'
import { HostingStack } from '../lib/hosting-stack'
import { AIStack }      from '../lib/ai-stack'

const app = new cdk.App()

// ── Environment ────────────────────────────────────────────────────────────
// Set your AWS account + region before deploying.
// Can also be passed via CDK context: cdk deploy --context account=123456789
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region:  process.env.CDK_DEFAULT_REGION || 'us-east-1',
}

const stackProps: cdk.StackProps = {
  env,
  tags: {
    Project:     'TechnoLand',
    Environment: 'dev',
    ManagedBy:   'CDK',
  },
}

// ── Stacks ─────────────────────────────────────────────────────────────────
const authStack = new AuthStack(app, 'TechnoLand-Auth', {
  ...stackProps,
  description: 'TechnoLand: Cognito user pool, app client, and identity pool',
})

const dataStack = new DataStack(app, 'TechnoLand-Data', {
  ...stackProps,
  description: 'TechnoLand: S3 data bucket and DynamoDB tables',
})

const apiStack = new ApiStack(app, 'TechnoLand-Api', {
  ...stackProps,
  description: 'TechnoLand: API Gateway, Lambda functions, and IAM roles',
  userPool:    authStack.userPool,
  dataBucket:  dataStack.dataBucket,
  layersTable: dataStack.layersTable,
  featuresTable: dataStack.featuresTable,
})

const _hostingStack = new HostingStack(app, 'TechnoLand-Hosting', {
  ...stackProps,
  description: 'TechnoLand: CloudFront distribution and S3 hosting bucket',
  apiUrl:      apiStack.apiUrl,
})

const _aiStack = new AIStack(app, 'TechnoLand-AI', {
  ...stackProps,
  description: 'TechnoLand: Bedrock model access policy and chat Lambda IAM role',
  chatLambdaRole: apiStack.chatLambdaRole,
})

app.synth()
