import { Construct } from "constructs";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambdafunction";
import { DataAwsIamPolicyDocument, IamRole } from "@cdktf/provider-aws/lib/iam";
import { AssetType, TerraformAsset } from "cdktf";
import { VpcConfig } from "../../types";

export class Lambda {
  public iamRole;
  public thisLambda;

  constructor(
    scope: Construct,
    lambdaName: string,
    vpc: VpcConfig,
    environment?: {}
  ) {
    this.iamRole = new IamRole(scope, `LambdaExecutionRole-${lambdaName}`, {
      name: lambdaName,
      assumeRolePolicy: new DataAwsIamPolicyDocument(
        scope,
        `LambdaAssumeRole-${lambdaName}`,
        {
          statement: [
            {
              actions: ["sts:AssumeRole"],
              principals: [
                {
                  type: "Service",
                  identifiers: ["lambda.amazonaws.com"],
                },
              ],
            },
          ],
        }
      ).json,
      managedPolicyArns: [
        "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
      ],
    });

    const asset = new TerraformAsset(scope, `${lambdaName}-lambda-asset`, {
      path: `${__dirname}/../../../application/dist/${lambdaName}`,
      type: AssetType.ARCHIVE,
    });

    this.thisLambda = new LambdaFunction(
      scope,
      `LambdaFunction-${lambdaName}`,
      {
        functionName: lambdaName,
        runtime: "nodejs16.x",
        role: this.iamRole.arn,
        handler: "index.handler",
        filename: asset.path,
        sourceCodeHash: asset.assetHash,
        vpcConfig: {
          subnetIds: vpc.privateSubnets,
          securityGroupIds: vpc.securityGroupIds,
        },
        environment: {
          variables: environment,
        },
      }
    );
  }
}
