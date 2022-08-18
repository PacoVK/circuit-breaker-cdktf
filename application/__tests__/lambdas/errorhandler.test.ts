import createEvent from "mock-aws-events";
import { handler } from "../../lambdas/errorhandler";
import { getDynamoDbClient } from "../../aws/dynamodb";

const dynamoDBClient = getDynamoDbClient();
const calledAt = Math.round(Date.now() / 1000 + 30);
const vendor = "https://github.com";

const event = createEvent("aws:sns", {
  Records: [
    {
      // @ts-ignore
      Sns: {
        Message: JSON.stringify({
          errorMessage: "Request took too long",
          vendor,
          calledAt,
        }),
        MessageAttributes: {
          errorName: {
            Type: "String",
            Value: "AbortConnection",
          },
        },
      },
    },
  ],
});

describe("Test Errorhandler", () => {
  test("Errorhandler correctly persists the circuit lock", async () => {
    await handler(event);
    const itemResult = await dynamoDBClient
      .getItem({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          vendor: {
            S: vendor,
          },
          calledAt: {
            N: calledAt.toString(),
          },
        },
      })
      .promise();
    expect(itemResult).toStrictEqual({
      Item: {
        calledAt: { N: calledAt.toString() },
        TTL: { N: calledAt.toString() },
        vendor: { S: vendor },
        errorName: { S: "AbortConnection" },
      },
    });
  });
});
