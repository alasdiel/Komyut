import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

import * as path from 'path';

export class KomyutCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here    

		// 💿 DYNAMODB TABLES

		// ⭐ LAMBDA FUNCTIONS (use lambda-nodejs NodejsFunction() instead to avoid building to .js)
		// ANTHONY'S WORK
		const fnHelloWorld = new lambdaNJS.NodejsFunction(this, 'HelloWorldFunction', {
			entry: path.join(__dirname, '../lambda/helloworld/helloworld.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
		});

		const fnTestLoadRoutePack = new lambdaNJS.NodejsFunction(this, 'TestLoadRoutePackFunction', {
			entry: path.join(__dirname, '../lambda/findpath/test-routepack.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(120)
		});

		const fnCalcPlan = new lambdaNJS.NodejsFunction(this, 'CalculatePlanFunction', {
			entry: path.join(__dirname, '../lambda/findpath/findbestpath.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(300),
			memorySize: 3008, // Adjust memory size as needed (Higher Memory also = faster cpu), 3008 is the limit for Lambda
		});
		// In your CDK stack

		// KARLO'S WORK
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

		// 🪣 S3 BUCKETS
		const routePackBucket = new s3.Bucket(this, 'RoutePackBucket', {
			bucketName: `komyut-routepack-bucket`, 
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			publicReadAccess: false,
		});
		// routePackBucket.grantRead(fnTestLoadRoutePack);
		routePackBucket.grantRead(fnCalcPlan);

		// ☁️ CLOUDFRONT DISTRIBUTION
		const routePackDistribution = new cloudfront.Distribution(this, 'RoutePackDistribution', {
		defaultBehavior: {
			origin: new origins.S3Origin(routePackBucket),
			allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
			viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED, 
		},
		defaultRootObject: 'routepack-bundle/routepack.json',
		priceClass: cloudfront.PriceClass.PRICE_CLASS_100 // Cheapest available option, slowest
		});

		// 🚦 APIGATEWAY DEFINITION
		const api = new apigw.RestApi(this, 'KomyutRestApi');
		api.root.addResource('hello-world')
			.addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));
		// api.root.addResource('test-routepack')
		//   .addMethod('GET', new apigw.LambdaIntegration(fnTestLoadRoutePack));
		api.root.addResource('calc-route')
			.addMethod('POST', new apigw.LambdaIntegration(fnCalcPlan));
	}
}
