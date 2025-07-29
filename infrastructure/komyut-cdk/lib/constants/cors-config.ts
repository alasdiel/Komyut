import { CorsOptions } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from "aws-cdk-lib";

export const CORS_CONFIG: CorsOptions = {
  allowOrigins: ['*'], // Will specify exact domains after testing
  allowMethods: ['POST', 'OPTIONS'], // PUT, GET, DELETE
  allowHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent',
  ],
  allowCredentials: true,
  maxAge: Duration.minutes(10),
  statusCode: 200,
//allowCredentials: Uncomment to allow credentials (cookies, HTTP)
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
  'Access-Control-Max-Age': '600' // 10 minutes in seconds
};

// export const STRICT_CORS_CONFIG: CorsOptions = {
//   ...DEFAULT_CORS_CONFIG,
//   allowOrigins: [
//     'https://your-production-domain.com',
//     'https://staging.your-domain.com'
//   ]
// };