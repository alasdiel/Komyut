import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as path from 'path';

export class KomyutCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here    

    // 💿 DYNAMODB TABLES

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

        // 🪣 S3 BUCKETS
    const routePackBucket = new s3.Bucket(this, 'RoutePackBucket', {
      bucketName: 'komyut-routepack-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });    
    routePackBucket.grantRead(fnTestLoadManifest);

    // 🚦 APIGATEWAY DEFINITION
    const api = new apigw.RestApi(this, 'KomyutRestApi');
    api.root.addResource('hello-world')
      .addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));
    api.root.addResource('test-manif')
      .addMethod('GET', new apigw.LambdaIntegration(fnTestLoadManifest));
  }
}
