import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDdbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    const movieId = event.pathParameters?.movieId; // 获取 URL 中的 movieId
    if (!movieId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing movieId in request path" }),
      };
    }

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: parseInt(movieId) }, // 电影ID是数值类型
      })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: `Movie with ID ${movieId} deleted` }),
    };
  } catch (error: any) {
    console.error("Error deleting movie:", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function createDdbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = { wrapNumbers: false };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}