import { App } from "cdktf";
import { HarbourVPC } from "./stacks/network/vpc";
import { HarbourApp } from "./stacks/application";
import { HarbourDB } from "./stacks/database";

require("dotenv").config({ path: "../application/.env" });

const app = new App();
const network = new HarbourVPC(app, "network");
const database = new HarbourDB(app, "database");

new HarbourApp(app, "application", database.dynamodbTable.arn, {
  vpcId: network.vpc.vpcIdOutput,
  privateSubnets: network.vpc.privateSubnets as string[],
  securityGroupIds: [network.vpc.defaultSecurityGroupIdOutput],
});
app.synth();
