import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Hello World Lambda executed! Event:', JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Hello World boss dawgs!',
  };
};