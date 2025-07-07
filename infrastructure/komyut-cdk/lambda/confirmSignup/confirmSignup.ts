import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface ConfirmSignupRequest {
  email: string;
  confirmationCode: string;
}

export const handler = async (event: ConfirmSignupRequest) => {
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: event.email,
      ConfirmationCode: event.confirmationCode
    };

    await cognito.confirmSignUp(params).promise();
    
    return {
      statusCode: 200,
      body: { message: 'User confirmed successfully' }
    };
  } catch (error) {
    console.error('Confirmation error:', error);
    return {
      statusCode: 400,
      body: { error: (error as Error).message }
    };
  }
};