import { CognitoIdentityServiceProvider } from 'aws-sdk';
const cognito = new CognitoIdentityServiceProvider();

interface SignupRequest {
  username: string; 
  email: string;  
  password: string;
}

export const handler = async (event: { body: string }) => {
  try {
    const { username, email, password } = JSON.parse(event.body) as SignupRequest;
    
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email, // Use email as username if username not provided
      Password: password,
      UserAttributes: [
        { 
          Name: 'email', 
          Value: email 
        },
      ],
    };

    const response = await cognito.signUp(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'User registration successful. Please check your email to verify.',
        userId: response.UserSub,
        email: email
      })
    };
  } catch (error) {
    console.error('Signup error:', error);
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