import { SQS } from "aws-sdk";
import { getDynamoDbClient } from "../aws/dynamodb";
import { getSnsClient } from "../aws/sns";

require("dotenv").config();

const dynamoDBClient = getDynamoDbClient();
const snsClient = getSnsClient();

const sqsClient = new SQS({
  endpoint: process.env.AWS_ENDPOINT,
});

module.exports = async () => {
  await dynamoDBClient
    .createTable({
      TableName: "serviceErrors",
      BillingMode: "PAY_PER_REQUEST",
      KeySchema: [
        {
          KeyType: "HASH",
          AttributeName: "vendor",
        },
        {
          KeyType: "RANGE",
          AttributeName: "calledAt",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "vendor",
          AttributeType: "S",
        },
        {
          AttributeName: "calledAt",
          AttributeType: "N",
        },
      ],
    })
    .promise();
  await snsClient
    .createTopic({
      Name: process.env.TARGET_TOPIC_ARN.split(":")[5],
    })
    .promise();
  await sqsClient
    .createQueue({
      QueueName: "dummy",
    })
    .promise();
  await snsClient
    .subscribe({
      TopicArn: process.env.TARGET_TOPIC_ARN,
      Protocol: "sqs",
      Endpoint: `${process.env.AWS_ENDPOINT}/000000000000/dummy`,
    })
    .promise();
  console.log("Successfully setup tests");
};

const tearDownAwsServices = async () => {
  console.log("Tear down");
  await dynamoDBClient
    .deleteTable({
      TableName: "serviceErrors",
    })
    .promise();
  console.log("Successfully teared down");
};
