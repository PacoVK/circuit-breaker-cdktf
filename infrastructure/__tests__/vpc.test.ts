import "cdktf/lib/testing/adapters/jest";
import { Testing } from "cdktf";
import { HarbourVPC } from "../stacks/network/vpc";

describe("Networking code test", () => {
  describe("Checking validity", () => {
    it("check if the produced terraform configuration is valid", () => {
      const app = Testing.app();
      const stack = new HarbourVPC(app, "network");
      expect(Testing.fullSynth(stack)).toBeValidTerraform();
    });

    /*
    TODO: uncomment if you provide valid AWS credentials (eg. in CI context)
    it("check if this can be planned", () => {
      const app = Testing.app();
      const stack = new HarbourVPC(app, "network");
      expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
     */
  });
});
