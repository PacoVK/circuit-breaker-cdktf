import { Logger } from "@aws-lambda-powertools/logger";
import axios from "axios";

const { TARGET_API, TARGET_API_RESPONSE_THRESHOLD } = process.env;

const logger = new Logger({ serviceName: "catFactsService" });

export const fetchCatFacts = () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), parseInt(TARGET_API_RESPONSE_THRESHOLD));
  logger.debug(
    `Calling ${TARGET_API} with timeout set to ${TARGET_API_RESPONSE_THRESHOLD}`
  );
  return axios.get(TARGET_API, {
    signal: controller.signal,
  });
};
