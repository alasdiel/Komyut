import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface ConfirmRequest {
  email: string;  
  code: string; 
}

export const handler = async (event: { body: string }) => {
  try {
    const { email, code } = JSON.parse(event.body) as ConfirmRequest;
    
    await cognito.confirmSignUp({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email, 
      ConfirmationCode: code
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Email verified successfully' })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: (error as Error).message,
        code: (error as any).code
      })
    };
  }
};