import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import * as path from 'path';

export class KomyutCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here    

    // 💿 DYNAMODB TABLES
      // TBA
      
    // ======================
    // SECTION 1 Functions
    // ======================

    // ⭐ LAMBDA FUNCTIONS (use lambda-nodejs NodejsFunction() instead to avoid building to .js)
    const fnHelloWorld = new lambdaNJS.NodejsFunction(this, 'HelloWorldFunction', {
      entry: path.join(__dirname, '../lambda/helloworld/helloworld.ts'),
      runtime: lambda.Runtime.NODEJS_20_X,      
    });

    const fnTestLoadManifest = new lambdaNJS.NodejsFunction(this, 'TestManifestFunction', {
      entry: path.join(__dirname, '../lambda/findpath/test.ts'),
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(120)
    });

    const fnConfirmSignup = new lambdaNJS.NodejsFunction(this, 'ConfirmSignupFunction', {
      entry: path.join(__dirname, '../lambda/confirmSignup/confirmSignup.ts'),
      runtime: lambda.Runtime.NODEJS_20_X,      
    });

    const fnSignin = new lambdaNJS.NodejsFunction(this, 'SigninFunction', {
      entry: path.join(__dirname, '../lambda/signin/signin.ts'),
      runtime: lambda.Runtime.NODEJS_20_X,      
    });

    const fnSignup = new lambdaNJS.NodejsFunction(this, 'SignupFunction', {
      entry: path.join(__dirname, '../lambda/signup/signup.ts'),
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    // ======================
    // SECTION 2 Storage
    // ======================

    // 🪣 S3 BUCKETS
    const routePackBucket = new s3.Bucket(this, 'RoutePackBucket', {
      bucketName: 'komyut-routepack-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });    
    routePackBucket.grantRead(fnTestLoadManifest);

    // ======================
    // SECTION 3 Authentication
    // ======================

    // 🔑 COGNITO
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });

    const client = userPool.addClient('WebClient', {
      authFlows: { userPassword: true },
    });

    
    // ======================
    // SECTION 4 API Gateway
    // ======================

    // 🚦 APIGATEWAY DEFINITION
    const api = new apigw.RestApi(this, 'KomyutRestApi');
    api.root.addResource('hello-world')
      .addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));
    api.root.addResource('test-manif')
      .addMethod('GET', new apigw.LambdaIntegration(fnTestLoadManifest));


    // ======================
    // SECTION 5 Frontend Implementation
    // ======================

    // 💻 OUTPUTS
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'ClientId', { value: client.userPoolClientId });
  }
}
