import createEvent from "mock-aws-events";
import { handler } from "../../lambdas/api";
import { buildResponse } from "../../util";
import { fetchCatFacts } from "../../service/catFactsService";

const event = createEvent("aws:apiGateway", {});

jest.mock("../../service/catFactsService");

jest.mock("../../service/errorTrackingService", () => {
  const originalService = jest.requireActual(
    "../../service/errorTrackingService"
  );
  return {
    ...originalService,
    fetchErrorsForVendorSince: jest
      .fn()
      // first test
      .mockImplementationOnce(() => {
        return { Count: 3 };
      })
      // second test
      .mockImplementationOnce(() => {
        return { Count: 10 };
      }),
  };
});

describe("Testing fancy API", () => {
  test("Circuit is open and API is called", async () => {
    // @ts-ignore
    fetchCatFacts.mockResolvedValue("success");
    const response = await handler(event);
    expect(response).toStrictEqual(buildResponse(200, "Ok"));
  });

  test("Circuit is closed on too many failures", async () => {
    const response = await handler(event);
    expect(response).toStrictEqual(
      buildResponse(
        500,
        `The circuit is close. We have detected too many errors for ${process.env.TARGET_API}`
      )
    );
  });
});
