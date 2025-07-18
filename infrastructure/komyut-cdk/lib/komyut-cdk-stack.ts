import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as path from 'path';

export class KomyutCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here    

		// 💿 DYNAMODB TABLES

		// ⚡ EC2 INSTANCES + VPC + SECURITY GROUPS
		// VPC
		const vpc = new ec2.Vpc(this, 'KomyutVPC', {
			maxAzs: 2,
			subnetConfiguration: [
				{
					cidrMask: 24,
					name: 'private-subnet',
					subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
				},
				{
					cidrMask: 24,
					name: 'public-subnet',
					subnetType: ec2.SubnetType.PUBLIC
				},
			],
		});

		// Security Groups
		const sgEC2 = new ec2.SecurityGroup(this, 'KomyutSG_ec2', {
			vpc,
			allowAllOutbound: true,
			description: 'Allow Lambdas to access OSRM'
		});
		const sgLambda = new ec2.SecurityGroup(this, 'KomyutSG_lambda', {
			vpc,
			allowAllOutbound: true
		});
		sgEC2.addIngressRule(sgLambda, ec2.Port.tcp(5000), 'Allow Lambdas to access OSRM');
		sgEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5000), 'Allow remote to access OSRM');
		sgEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'shh(insecure)');

		// [[ EC2 HAS TO BE SET UP MANUALLY! ]]

		// ⭐ LAMBDA FUNCTIONS (use lambda-nodejs NodejsFunction() instead to avoid building to .js)
		// ANTHONY'S WORK
		const fnHelloWorld = new lambdaNJS.NodejsFunction(this, 'HelloWorldFunction', {
			entry: path.join(__dirname, '../lambda/helloworld/helloworld.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
		});

		const fnCalcPlan = new lambdaNJS.NodejsFunction(this, 'CalculatePlanFunction', {
			entry: path.join(__dirname, '../lambda/calcplan/calcplan.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(300),
			memorySize: 3008, // Adjust memory size as needed (Higher Memory also = faster cpu), 3008 is the limit for Lambda
			environment: {
				ROUTEPACK_BUCKET_SUFFIX: process.env.ROUTEPACK_BUCKET_SUFFIX!,
				EC2_OSRM_PRIVATE_IP: process.env.EC2_OSRM_PRIVATE_IP!,
			},			

			vpc: vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
			},
			securityGroups: [sgLambda],
		});		

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
			bucketName: `komyut-routepack-bucket-${process.env.ROUTEPACK_BUCKET_SUFFIX}`, 
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
		priceClass: cloudfront.PriceClass.PRICE_CLASS_200 // Choose 200 or 300 as they cover the regions we need
		});				

		// 🚦 APIGATEWAY DEFINITION
		const api = new apigw.RestApi(this, 'KomyutRestApi', {
			defaultMethodOptions: {
    			authorizationType: apigw.AuthorizationType.NONE // Disable auth
			},
			defaultCorsPreflightOptions: {
				allowOrigins: apigw.Cors.ALL_ORIGINS, 
				allowMethods: apigw.Cors.ALL_METHODS,
				allowHeaders: [
				'Content-Type',
				'X-Amz-Date',
				'Authorization',
				'X-Api-Key',
				'X-Amz-Security-Token'
				],
			},
		});

		api.root.addResource('hello-world')
			.addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));
		// api.root.addResource('test-routepack')
		//   .addMethod('GET', new apigw.LambdaIntegration(fnTestLoadRoutePack));

		api.root.addResource('calc-route')
		.addMethod('POST', new apigw.LambdaIntegration(fnCalcPlan, {
			proxy: true, // Added to allow the Lambda func to handle the request body directly
		}));
	}
}
