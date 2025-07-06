import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async(event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello World! the time is ${new Date()}`,
        })
    };
}