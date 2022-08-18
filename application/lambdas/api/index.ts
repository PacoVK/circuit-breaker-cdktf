import { APIGatewayEvent } from "aws-lambda";
import { buildResponse } from "../../util";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  fetchErrorsForVendorSince,
  publishError,
} from "../../service/errorTrackingService";
import { fetchCatFacts } from "../../service/catFactsService";

const { ERROR_THRESHOLD, TARGET_API } = process.env;

const logger = new Logger({ serviceName: "FancyApi" });

export const handler = async (event: APIGatewayEvent) => {
  logger.debug("Received event", { event });
  const now = Math.round(Date.now() / 1000).toString();
  const errors = await fetchErrorsForVendorSince(TARGET_API, now);
  logger.debug("Errors in Dynamodb:", { errors });

  if (errors.Count < parseInt(ERROR_THRESHOLD)) {
    try {
      await fetchCatFacts();
      return buildResponse(200, "Ok");
    } catch (error) {
      await publishError(error, now);
      return buildResponse(500, "External Service Call Failed");
    }
  } else {
    logger.debug(
      "The circuit is close. We have detected too many errors for",
      TARGET_API
    );
    return buildResponse(
      500,
      `The circuit is close. We have detected too many errors for ${TARGET_API}`
    );
  }
};
