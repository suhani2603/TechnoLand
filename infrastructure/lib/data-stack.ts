import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

/**
 * DataStack — S3 data bucket and DynamoDB tables.
 *
 * Resources:
 *   S3: technoland-data-{account}-{region}
 *     ├── mock/land-parcels.geojson
 *     ├── mock/agricultural-zones.geojson
 *     ├── mock/infrastructure.geojson
 *     └── mock/water-bodies.geojson
 *
 *   DynamoDB: technoland-layers  (PK: layerId)
 *   DynamoDB: technoland-features (PK: featureId, SK: layerId)
 *
 * DO NOT DEPLOY in Phase 1.
 */
export class DataStack extends cdk.Stack {
  public readonly dataBucket:    s3.Bucket
  public readonly layersTable:   dynamodb.Table
  public readonly featuresTable: dynamodb.Table

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    // ── S3 Data Bucket ─────────────────────────────────────────────────────
    this.dataBucket = new s3.Bucket(this, 'DataBucket', {
      bucketName:          `technoland-data-${this.account}-${this.region}`,
      versioned:           false,
      removalPolicy:       cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects:   true,   // set false in production

      // GeoJSON files are fetched by the frontend via presigned URLs
      blockPublicAccess:   s3.BlockPublicAccess.BLOCK_ALL,
      encryption:          s3.BucketEncryption.S3_MANAGED,

      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],   // TODO: restrict to CloudFront origin in production
          allowedHeaders: ['*'],
          maxAge:         3600,
        },
      ],

      lifecycleRules: [
        {
          id:                    'expire-old-versions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    })

    // ── DynamoDB: Layers table ─────────────────────────────────────────────
    // Stores metadata for each GIS layer (name, description, s3Key, etc.)
    this.layersTable = new dynamodb.Table(this, 'LayersTable', {
      tableName:    'technoland-layers',
      partitionKey: { name: 'layerId', type: dynamodb.AttributeType.STRING },
      billingMode:  dynamodb.BillingMode.PAY_PER_REQUEST,   // zero cost at rest
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,   // enable in production
      encryption:    dynamodb.TableEncryption.AWS_MANAGED,
    })

    // ── DynamoDB: Features table ───────────────────────────────────────────
    // Stores rich attribute data for each GIS feature (parcel, zone, etc.)
    this.featuresTable = new dynamodb.Table(this, 'FeaturesTable', {
      tableName:    'technoland-features',
      partitionKey: { name: 'featureId', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'layerId',   type: dynamodb.AttributeType.STRING },
      billingMode:  dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      encryption:    dynamodb.TableEncryption.AWS_MANAGED,
    })

    // GSI: query all features in a layer → GET /layers/{id}/features
    this.featuresTable.addGlobalSecondaryIndex({
      indexName:     'layerId-index',
      partitionKey:  { name: 'layerId',   type: dynamodb.AttributeType.STRING },
      sortKey:       { name: 'featureId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // ── CloudFormation Outputs ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'DataBucketName', {
      value:       this.dataBucket.bucketName,
      description: 'S3 bucket containing GeoJSON layer files',
      exportName:  'TechnoLand-DataBucketName',
    })

    new cdk.CfnOutput(this, 'LayersTableName', {
      value:       this.layersTable.tableName,
      description: 'DynamoDB table for GIS layer metadata',
      exportName:  'TechnoLand-LayersTableName',
    })

    new cdk.CfnOutput(this, 'FeaturesTableName', {
      value:       this.featuresTable.tableName,
      description: 'DynamoDB table for feature attributes',
      exportName:  'TechnoLand-FeaturesTableName',
    })
  }
}
