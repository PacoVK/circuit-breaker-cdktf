import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import { Vpc } from "../../.gen/modules/vpc";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

export class HarbourVPC extends TerraformStack {
  public vpc: Vpc;
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new AwsProvider(this, "frankfurt");
    this.vpc = new Vpc(this, "HarbourVpc", {
      name: "harbour",
      cidr: "10.0.0.0/16",
      azs: ["eu-central-1a", "eu-central-1b", "eu-central-1c"],
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      enableNatGateway: true,
    });
  }
}
