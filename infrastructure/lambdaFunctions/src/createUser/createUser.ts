import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event: any) => {
  console.log("event", event);

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, name, age } = body;

    // Validate required fields
    if (!email || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email and name are required fields"
        })
      };
    }

    // Create user object
    const user = {
      email: email,
      name: name,
      age: age || null,
      createdAt: new Date().toISOString()
    };

    // Put item in DynamoDB
    const command = new PutCommand({
      TableName: "dev-Data",
      Item: user
    });

    await docClient.send(command);

    const response = {
      statusCode: 201,
      body: JSON.stringify({
        message: "User created successfully",
        user: user
      })
    };

    return response;

  } catch (error: any) {
    console.error("Error creating user:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message
      })
    };
  }
};
