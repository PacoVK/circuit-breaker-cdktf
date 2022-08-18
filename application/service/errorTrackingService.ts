import { getDynamoDbClient } from "../aws/dynamodb";
import { PublishInput } from "aws-sdk/clients/sns";
import { getSnsClient } from "../aws/sns";
import { Logger } from "@aws-lambda-powertools/logger";

const { DYNAMODB_TABLE, TARGET_TOPIC_ARN, TARGET_API, CLEAR_ERROR_TIMEOUT } =
  process.env;

const dynamoDBClient = getDynamoDbClient();
const snsClient = getSnsClient();
const logger = new Logger({ serviceName: "errorTrackingService" });

export const fetchErrorsForVendorSince = (vendor: string, time: string) => {
  const params = {
    ExpressionAttributeValues: {
      ":vendor": { S: vendor },
      ":calledAt": { N: time },
    },
    KeyConditionExpression: "vendor = :vendor and calledAt >= :calledAt",
    TableName: DYNAMODB_TABLE,
  };

  return dynamoDBClient.query(params).promise();
};

export const publishError = (error: Error, calledAt: string) => {
  logger.error("External Service Call Failed", error);
  const params: PublishInput = {
    TopicArn: TARGET_TOPIC_ARN,
    MessageAttributes: {
      errorName: {
        DataType: "String",
        StringValue: error.name,
      },
    },
    Message: JSON.stringify({
      errorMessage: error.message,
      vendor: TARGET_API,
      calledAt,
    }),
  };
  return snsClient.publish(params).promise();
};

export const persistError = (vendor: string, errorName: string) => {
  const resetTime = Math.round(
    Date.now() / 1000 + parseInt(CLEAR_ERROR_TIMEOUT)
  ).toString();
  const params = {
    TableName: DYNAMODB_TABLE,
    Item: {
      vendor: { S: vendor },
      calledAt: { N: resetTime },
      TTL: { N: resetTime },
      errorName: { S: errorName },
    },
  };
  return dynamoDBClient.putItem(params).promise();
};
