import { Construct } from "constructs";
import { TerraformOutput, TerraformStack } from "cdktf";
import { Lambda } from "./lambda";
import { VpcConfig } from "../../types";
import { Apigatewayv2Api } from "@cdktf/provider-aws/lib/apigatewayv2-api";
import { SnsTopic } from "@cdktf/provider-aws/lib/sns-topic";
import { DataAwsSubnets } from "@cdktf/provider-aws/lib/data-aws-subnets";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

export class HarbourApp extends TerraformStack {
  constructor(
    scope: Construct,
    name: string,
    tableArn: string,
    vpc: VpcConfig
  ) {
    super(scope, name);

    new AwsProvider(this, "frankfurt");

    const snsTopic = new SnsTopic(this, "ErrorTopic", {
      displayName: "CircuitBreaker Error Topics",
      name: "circuit-breaker-errors",
    });

    const subnetIds = new DataAwsSubnets(this, "privateSubnetIds", {
      filter: [
        {
          name: "tag:Name",
          values: ["harbour-private-*"],
        },
      ],
    });

    vpc.privateSubnets = subnetIds.ids;

    const api = new Lambda(this, "api", vpc, {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      ERROR_THRESHOLD: process.env.ERROR_THRESHOLD,
      TARGET_TOPIC_ARN: snsTopic.arn,
      TARGET_API_RESPONSE_THRESHOLD: process.env.TARGET_API_RESPONSE_THRESHOLD,
      TARGET_API: process.env.TARGET_API,
    });

    api.iamRole.addOverride("inline_policy", [
      {
        name: "AllowDynamoDBAccess",
        policy: new DataAwsIamPolicyDocument(this, "ReadDynamodbPolicy", {
          statement: [
            {
              effect: "Allow",
              actions: ["dynamodb:GetItem", "dynamodb:Query"],
              resources: [tableArn],
            },
          ],
        }).json,
      },
      {
        name: "AllowSnsAccess",
        policy: new DataAwsIamPolicyDocument(this, "PublishSnsPolicy", {
          statement: [
            {
              effect: "Allow",
              actions: ["sns:Publish"],
              resources: [snsTopic.arn],
            },
          ],
        }).json,
      },
    ]);

    const errorHandler = new Lambda(this, "errorhandler", vpc, {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      CLEAR_ERROR_TIMEOUT: process.env.CLEAR_ERROR_TIMEOUT,
    });

    errorHandler.iamRole.addOverride("inline_policy", [
      {
        name: "AllowDynamoDBAccess",
        policy: new DataAwsIamPolicyDocument(this, `ManageDynamodbPolicy`, {
          statement: [
            {
              actions: ["dynamodb:PutItem"],
              resources: [tableArn],
            },
          ],
        }).json,
      },
    ]);

    const externalApiGw = new Apigatewayv2Api(this, "external-api-gw", {
      name: name,
      protocolType: "HTTP",
      target: api.thisLambda.arn,
    });

    new LambdaPermission(this, "external-api-gw-lambda", {
      functionName: api.thisLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${externalApiGw.executionArn}/*/*`,
    });

    new SnsTopicSubscription(this, "errorHandler", {
      protocol: "lambda",
      topicArn: snsTopic.arn,
      endpoint: errorHandler.thisLambda.arn,
    });

    new LambdaPermission(this, "sns-to-lambda", {
      functionName: errorHandler.thisLambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "sns.amazonaws.com",
      sourceArn: snsTopic.arn,
    });

    new TerraformOutput(this, "ApiGatewayUrl", {
      value: externalApiGw.apiEndpoint,
    });
  }
}
