import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as path from 'path'

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool
  dataBucket: s3.Bucket
  layersTable: dynamodb.Table
  featuresTable: dynamodb.Table
}

/**
 * ApiStack — API Gateway HTTP API + Lambda functions.
 *
 * Routes (all protected by Cognito JWT authorizer, except /health):
 *   GET  /health
 *   GET  /layers
 *   GET  /layers/{id}
 *   GET  /features/{id}
 *   POST /chat
 *
 * DO NOT DEPLOY in Phase 1.
 */
export class ApiStack extends cdk.Stack {
  /** API base URL — passed to HostingStack for frontend env var. */
  public readonly apiUrl: string

  /** Chat Lambda execution role — passed to AIStack to attach Bedrock policy. */
  public readonly chatLambdaRole: iam.IRole

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const { userPool, dataBucket, layersTable, featuresTable } = props

    // ── Shared Lambda environment ──────────────────────────────────────────
    const commonEnv: Record<string, string> = {
      USE_MOCK: 'false',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DATA_BUCKET_NAME: dataBucket.bucketName,
      LAYERS_TABLE_NAME: layersTable.tableName,
      FEATURES_TABLE_NAME: featuresTable.tableName,
    }

    // ── Shared Lambda settings ─────────────────────────────────────────────
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    }

    // ── Lambda: health ─────────────────────────────────────────────────────
    const healthFn = new lambda.Function(this, 'HealthFn', {
      ...commonLambdaProps,
      functionName: 'technoland-health',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../backend/lambdas/health')
      ),
      environment: { ...commonEnv, SERVICE_VERSION: '1.0.0' },
      description: 'TechnoLand health check endpoint',
    })

    // ── Lambda: getLayers ──────────────────────────────────────────────────
    const getLayersFn = new lambda.Function(this, 'GetLayersFn', {
      ...commonLambdaProps,
      functionName: 'technoland-get-layers',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../backend/lambdas/getLayers')
      ),
      environment: commonEnv,
      description: 'List GIS layers and return presigned S3 URLs',
    })

    dataBucket.grantRead(getLayersFn)
    layersTable.grantReadData(getLayersFn)

    // ── Lambda: getFeature ─────────────────────────────────────────────────
    const getFeatureFn = new lambda.Function(this, 'GetFeatureFn', {
      ...commonLambdaProps,
      functionName: 'technoland-get-feature',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../backend/lambdas/getFeature')
      ),
      environment: commonEnv,
      description: 'Return full attribute data for a GIS feature',
    })

    featuresTable.grantReadData(getFeatureFn)

    // ── Lambda: chat ───────────────────────────────────────────────────────
    const chatFn = new lambda.Function(this, 'ChatFn', {
      ...commonLambdaProps,
      functionName: 'technoland-chat',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../backend/lambdas/chat')
      ),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        ...commonEnv,
        BEDROCK_REGION: this.region,
        BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      },
      description: 'AI chat handler using Amazon Bedrock Claude Sonnet',
    })

    // Bedrock permissions are granted in AIStack (separation of concerns)
    this.chatLambdaRole = chatFn.role!

    // ── Cognito JWT Authorizer ─────────────────────────────────────────────
const userPoolClient = userPool.addClient('ApiClient', {
  generateSecret: false,
})



const jwtAuthorizer = new authorizers.HttpJwtAuthorizer(
  'CognitoAuthorizer',
  `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
  {
    jwtAudience: [userPoolClient.userPoolClientId],
    authorizerName: 'cognito-jwt',
  }
)
    // ── HTTP API ───────────────────────────────────────────────────────────
    const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: 'technoland-api',
      description: 'TechnoLand GIS platform REST API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1),
      },
    })

    // Helper to create a Lambda integration
    const integration = (fn: lambda.Function) =>
      new integrations.HttpLambdaIntegration(
        `${fn.node.id}Integration`,
        fn
      )

    // ── Routes ─────────────────────────────────────────────────────────────

    // /health — no auth
    httpApi.addRoutes({
      path: '/health',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: integration(healthFn),
    })

    // /layers — JWT protected
    httpApi.addRoutes({
      path: '/layers',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: integration(getLayersFn),
      authorizer: jwtAuthorizer,
    })

    httpApi.addRoutes({
      path: '/layers/{id}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: integration(getLayersFn),
      authorizer: jwtAuthorizer,
    })

    httpApi.addRoutes({
      path: '/features/{id}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: integration(getFeatureFn),
      authorizer: jwtAuthorizer,
    })

    httpApi.addRoutes({
      path: '/chat',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: integration(chatFn),
      authorizer: jwtAuthorizer,
    })

    this.apiUrl = httpApi.apiEndpoint

    // ── CloudFormation Outputs ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway endpoint URL — set as VITE_API_URL in frontend',
      exportName: 'TechnoLand-ApiUrl',
    })
  }
}