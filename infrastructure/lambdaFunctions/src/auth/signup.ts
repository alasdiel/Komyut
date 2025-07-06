import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export const handler = async (event: SignupRequest) => {
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: event.email,
      Password: event.password,
      UserAttributes: [
        { Name: 'email', Value: event.email },
        { Name: 'name', Value: event.name },
        ...(event.phoneNumber ? [{ Name: 'phone_number', Value: event.phoneNumber }] : [])
      ],
    };

    const response = await cognito.signUp(params).promise();
    
    return {
      statusCode: 200,
      body: {
        message: 'User registration initiated',
        userId: response.UserSub,
        email: event.email
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 400,
      body: { error: (error as Error).message }
    };
  }
};