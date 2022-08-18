import { SNSEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { persistError } from "../../service/errorTrackingService";

const logger = new Logger({ serviceName: "CircuitBreakerErrorHandler" });

export const handler = async (event: SNSEvent) => {
  logger.debug("Received event", { event });
  const { Message, MessageAttributes } = event.Records.at(0).Sns;

  await persistError(
    JSON.parse(Message).vendor,
    MessageAttributes.errorName.Value
  );
  return;
};
