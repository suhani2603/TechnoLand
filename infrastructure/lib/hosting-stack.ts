import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as path from 'path'

interface HostingStackProps extends cdk.StackProps {
  apiUrl: string
}

/**
 * HostingStack — CloudFront distribution + S3 static site hosting.
 *
 * Architecture:
 *   Browser → CloudFront → S3 (React/Vite build)
 *                       ↘ API Gateway (via /api/* path prefix)
 *
 * Benefits:
 *   - Single domain for both frontend and API (no CORS issues)
 *   - Automatic SSL certificate via CloudFront
 *   - Global CDN edge caching for static assets + GeoJSON
 *
 * DO NOT DEPLOY in Phase 1.
 */
export class HostingStack extends cdk.Stack {
  public readonly distributionUrl: string

  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id, props)

    // ── S3 Hosting Bucket ──────────────────────────────────────────────────
    // autoDeleteObjects is intentionally NOT set here.
    // Enabling it generates a Custom::S3AutoDeleteObjects Lambda whose execution
    // role can hit an IAM eventual-consistency race at deploy time
    // ("The role defined for the function cannot be assumed by Lambda").
    // For this deployment the bucket is private (BLOCK_ALL) and served only
    // through CloudFront OAC, so manual object cleanup on stack deletion is
    // acceptable.  To empty the bucket before deleting the stack run:
    //   aws s3 rm s3://technoland-frontend-<account>-<region> --recursive
    const hostingBucket = new s3.Bucket(this, 'HostingBucket', {
      bucketName:        `technoland-frontend-${this.account}-${this.region}`,
      removalPolicy:     cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,   // CloudFront OAC only
      encryption:        s3.BucketEncryption.S3_MANAGED,
    })

    // ── Origin Access Control (OAC) — replaces legacy OAI ─────────────────
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: 'TechnoLand CloudFront OAC for S3 hosting bucket',
    })

    // ── API Gateway origin ─────────────────────────────────────────────────
    // props.apiUrl is a CDK Token at synth time, so .replace() cannot strip
    // the 'https://' prefix — the colon survives and CloudFront rejects it.
    // Use CloudFormation intrinsic functions (Fn::Select + Fn::Split) to
    // extract the hostname at deploy time, after the token resolves.
    const apiHostname = cdk.Fn.select(2, cdk.Fn.split('/', props.apiUrl))

    const apiOrigin = new origins.HttpOrigin(apiHostname, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      originPath:     '',
    })

    // ── CloudFront Distribution ────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment:           'TechnoLand GIS Platform',
      defaultRootObject: 'index.html',
      priceClass:        cloudfront.PriceClass.PRICE_CLASS_100,  // US + EU + Asia

      defaultBehavior: {
        origin:               origins.S3BucketOrigin.withOriginAccessControl(
          hostingBucket, { originAccessControl: oac }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy:          cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress:             true,
      },

      additionalBehaviors: {
        // Proxy /api/* to API Gateway — no caching
        '/api/*': {
          origin:               apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy:          cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:  cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          allowedMethods:       cloudfront.AllowedMethods.ALLOW_ALL,
        },

        // Cache GeoJSON assets aggressively (they change infrequently)
        '/mock-data/*': {
          origin:               origins.S3BucketOrigin.withOriginAccessControl(
            hostingBucket, { originAccessControl: oac }
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy:          cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress:             true,
        },
      },

      // SPA: serve index.html for all 403/404 (React Router client-side routing)
      errorResponses: [
        {
          httpStatus:          403,
          responseHttpStatus:  200,
          responsePagePath:    '/index.html',
          ttl:                 cdk.Duration.seconds(0),
        },
        {
          httpStatus:          404,
          responseHttpStatus:  200,
          responsePagePath:    '/index.html',
          ttl:                 cdk.Duration.seconds(0),
        },
      ],
    })

    this.distributionUrl = `https://${distribution.distributionDomainName}`

    // ── S3 Deployment (uploads Vite build output) ──────────────────────────
    // NOTE: Run `npm run build` in frontend/ before deploying.
    // SymlinkFollowMode.NEVER prevents errors on Windows/OneDrive reparse points.
    new s3deploy.BucketDeployment(this, 'FrontendDeployment', {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '../../frontend/dist'),
          { followSymlinks: cdk.SymlinkFollowMode.NEVER }
        ),
      ],
      destinationBucket:   hostingBucket,
      distribution,
      distributionPaths:   ['/*'],   // invalidate all CloudFront cache on deploy
      memoryLimit:         256,
      prune:               true,
    })

    // ── CloudFormation Outputs ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value:       this.distributionUrl,
      description: 'CloudFront URL — share this as the demo URL',
      exportName:  'TechnoLand-DistributionUrl',
    })

    new cdk.CfnOutput(this, 'HostingBucketName', {
      value:       hostingBucket.bucketName,
      description: 'S3 bucket for frontend static assets',
      exportName:  'TechnoLand-HostingBucketName',
    })

    new cdk.CfnOutput(this, 'DistributionId', {
      value:       distribution.distributionId,
      description: 'CloudFront distribution ID — used to manually invalidate cache',
      exportName:  'TechnoLand-DistributionId',
    })
  }
}
