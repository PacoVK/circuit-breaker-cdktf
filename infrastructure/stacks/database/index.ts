import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb";

export class HarbourDB extends TerraformStack {
  public dynamodbTable: DynamodbTable;
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new AwsProvider(this, "frankfurt");
    this.dynamodbTable = new DynamodbTable(this, "HarbourDB", {
      // @ts-ignore
      name: process.env.DYNAMODB_TABLE,
      ttl: {
        enabled: true,
        attributeName: "TTL",
      },
      billingMode: "PAY_PER_REQUEST",
      hashKey: "vendor",
      rangeKey: "calledAt",
      attribute: [
        {
          name: "vendor",
          type: "S",
        },
        {
          name: "calledAt",
          type: "N",
        },
      ],
    });
  }
}
