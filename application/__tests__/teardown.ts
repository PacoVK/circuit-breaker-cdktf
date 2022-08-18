import { getDynamoDbClient } from "../aws/dynamodb";

require("dotenv").config();

const dynamoDBClient = getDynamoDbClient();

module.exports = async () => {
  console.log("Tear down");
  await dynamoDBClient
    .deleteTable({
      TableName: "serviceErrors",
    })
    .promise();
  console.log("Successfully teared down");
};
