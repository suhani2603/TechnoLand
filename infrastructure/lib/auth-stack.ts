import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as cognito from 'aws-cdk-lib/aws-cognito'

/**
 * AuthStack — Amazon Cognito user pool, app client, and identity pool.
 *
 * Outputs:
 *   userPoolId        – referenced by ApiStack JWT authorizer
 *   userPoolClientId  – used by the frontend Amplify config
 *   identityPoolId    – for temporary AWS credentials (optional Phase 3)
 *
 * DO NOT DEPLOY in Phase 1.
 */
export class AuthStack extends cdk.Stack {
  /** Exported so ApiStack can configure the JWT authorizer. */
  public readonly userPool: cognito.UserPool

  /** Exported for frontend env var: VITE_COGNITO_CLIENT_ID */
  public readonly userPoolClient: cognito.UserPoolClient

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    // ── User Pool ──────────────────────────────────────────────────────────
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'technoland-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify:    { email: true },

      passwordPolicy: {
        minLength:        8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits:    true,
        requireSymbols:   false,
      },

      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: false, mutable: true },
      },

      // Auto-delete in dev — set to RETAIN for production
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // ── App Client (used by the React frontend via Amplify) ────────────────
    this.userPoolClient = this.userPool.addClient('WebClient', {
      userPoolClientName: 'technoland-web',
      authFlows: {
        userPassword:     true,
        userSrp:          true,
        custom:           false,
        adminUserPassword: false,
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        // TODO (Phase 2): replace with real CloudFront URL from HostingStack output
        callbackUrls: ['http://localhost:5173/callback'],
        logoutUrls:   ['http://localhost:5173/'],
      },
      // Tokens valid for demo duration
      accessTokenValidity:  cdk.Duration.hours(1),
      idTokenValidity:      cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(7),
      preventUserExistenceErrors: true,
    })

    // ── Hosted UI domain ───────────────────────────────────────────────────
    this.userPool.addDomain('HostedUIDomain', {
      cognitoDomain: {
        // Must be globally unique — customise before deploying
        domainPrefix: 'technoland-demo',
      },
    })

    // ── CloudFormation Outputs ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'UserPoolId', {
      value:       this.userPool.userPoolId,
      description: 'Cognito User Pool ID — set as VITE_COGNITO_USER_POOL_ID',
      exportName:  'TechnoLand-UserPoolId',
    })

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value:       this.userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID — set as VITE_COGNITO_CLIENT_ID',
      exportName:  'TechnoLand-UserPoolClientId',
    })
  }
}
