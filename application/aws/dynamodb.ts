import { DynamoDB } from "aws-sdk";

export const getDynamoDbClient = () =>
  new DynamoDB(
    process.env.NODE_ENV == "test"
      ? {
          endpoint: process.env.AWS_ENDPOINT,
        }
      : {}
  );
