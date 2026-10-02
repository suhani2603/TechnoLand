import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'

interface AIStackProps extends cdk.StackProps {
  chatLambdaRole: iam.IRole
}

/**
 * AIStack — Amazon Bedrock model access permissions for the chat Lambda.
 *
 * This stack is deliberately minimal:
 *   - No Bedrock resources are created (Bedrock is fully managed)
 *   - We only attach the necessary IAM policy to the chat Lambda's role
 *   - Model access must be enabled manually in the Bedrock console before deploying
 *
 * Model access checklist (Bedrock console → Model access → us-east-1):
 *   ☐ Anthropic Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20241022-v2:0)
 *   ☐ Anthropic Claude 3 Haiku  (cheaper fallback for testing)
 *
 * DO NOT DEPLOY in Phase 1.
 */
export class AIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AIStackProps) {
    super(scope, id, props)

    const { chatLambdaRole } = props

    // ── Bedrock InvokeModel policy ─────────────────────────────────────────
    // Grants the chat Lambda permission to call InvokeModel and InvokeModelWithResponseStream
    // for the specific Claude Sonnet model ARN.
    const bedrockPolicy = new iam.Policy(this, 'BedrockInvokePolicy', {
      policyName:  'technoland-bedrock-invoke',
      statements: [
        new iam.PolicyStatement({
          sid:       'AllowBedrockInvoke',
          effect:    iam.Effect.ALLOW,
          actions: [
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream',
          ],
          resources: [
            // Claude 3.5 Sonnet v2 — update ARN if using a different model/region
            `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
            // Claude 3 Haiku — inexpensive fallback for testing
            `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
          ],
        }),
      ],
    })

    chatLambdaRole.attachInlinePolicy(bedrockPolicy)

    // ── CloudWatch Logs for Bedrock usage tracking ─────────────────────────
    // Optional: enables CloudWatch Logs insights queries on AI usage
    const cwLogsPolicy = new iam.Policy(this, 'CWLogsPolicy', {
      policyName: 'technoland-bedrock-cwlogs',
      statements: [
        new iam.PolicyStatement({
          sid:     'AllowCloudWatchLogging',
          effect:  iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/technoland-chat*`],
        }),
      ],
    })

    chatLambdaRole.attachInlinePolicy(cwLogsPolicy)

    // ── CloudFormation Outputs ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'BedrockModelId', {
      value:       'anthropic.claude-3-5-sonnet-20241022-v2:0',
      description: 'Bedrock model ID used by the chat Lambda',
    })

    new cdk.CfnOutput(this, 'BedrockRegion', {
      value:       this.region,
      description: 'AWS region where Bedrock is invoked (must have model access)',
    })

    new cdk.CfnOutput(this, 'BedrockModelAccessUrl', {
      value:       `https://${this.region}.console.aws.amazon.com/bedrock/home?region=${this.region}#/modelaccess`,
      description: 'Open this URL to enable Claude model access before deploying',
    })
  }
}
