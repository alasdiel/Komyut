import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface SigninRequest {
  email: string;
  password: string;
}

export const handler = async (event: SigninRequest) => {
  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: event.email,
        PASSWORD: event.password
      }
    };

    const response = await cognito.initiateAuth(params).promise();
    
    return {
      statusCode: 200,
      body: {
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        expiresIn: response.AuthenticationResult?.ExpiresIn
      }
    };
  } catch (error) {
    console.error('Signin error:', error);
    return {
      statusCode: 401,
      body: { error: 'Authentication failed' }
    };
  }
};