import "cdktf/lib/testing/adapters/jest";
import { Testing } from "cdktf";
import { HarbourDB } from "../stacks/database";

describe("Database code test", () => {
  describe("Checking validity", () => {
    it("check if the produced terraform configuration is valid", () => {
      const app = Testing.app();
      const stack = new HarbourDB(app, "database");
      expect(Testing.fullSynth(stack)).toBeValidTerraform();
    });

    /*
    TODO: uncomment if you provide valid AWS credentials (eg. in CI context)
    it("check if this can be planned", () => {
      const app = Testing.app();
      const stack = new HarbourDB(app, "database");
      expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
     */
  });
});
