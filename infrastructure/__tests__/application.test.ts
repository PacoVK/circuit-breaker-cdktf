import "cdktf/lib/testing/adapters/jest";
import { Testing } from "cdktf";
import { HarbourApp } from "../stacks/application";

describe("Application code test", () => {
  describe("Checking validity", () => {
    it("check if the produced terraform configuration is valid", () => {
      const app = Testing.app();
      const stack = new HarbourApp(app, "application", "*", {
        vpcId: "vpc-id",
        securityGroupIds: ["security-group-id"],
        privateSubnets: ["subnet-a", "subnet-b", "subnet-c"],
      });
      expect(Testing.fullSynth(stack)).toBeValidTerraform();
    });


    it("check if this can be planned", () => {
      const app = Testing.app();
      const stack = new HarbourApp(app, "application", "*", {
        vpcId: "vpc-id",
        securityGroupIds: ["security-group-id"],
        privateSubnets: ["subnet-a", "subnet-b", "subnet-c"],
      });
      expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
  });
});
