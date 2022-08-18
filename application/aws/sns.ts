import { SNS } from "aws-sdk";

export const getSnsClient = () =>
  new SNS(
    process.env.NODE_ENV == "test"
      ? {
          endpoint: process.env.AWS_ENDPOINT,
        }
      : {}
  );
