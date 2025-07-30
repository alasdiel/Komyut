import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface ResendCodeRequest {
  email: string;
}

export const handler = async (event: { body: string }) => {
  try {
    const { email } = JSON.parse(event.body) as ResendCodeRequest;
    
    await cognito.resendConfirmationCode({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        message: 'Verification code resent successfully' 
      })
    };
  } catch (error) {
    console.error('Resend code error:', error);
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