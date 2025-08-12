import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CORS_CONFIG } from './constants/cors-config';

import * as path from 'path';
import * as cr from 'aws-cdk-lib/custom-resources';

import { CONSTS } from "@shared/consts";

export class KomyutCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// ---------- EC2 VPC + Security ----------
		const vpc = new ec2.Vpc(this, 'KomyutVPC', {
			maxAzs: 1,
			subnetConfiguration: [
				{
					cidrMask: 24,
					name: 'public-subnet',
					subnetType: ec2.SubnetType.PUBLIC
				},
			],
			natGateways: 0,
		});

		const sgEC2 = new ec2.SecurityGroup(this, 'KomyutSG_ec2', {
			vpc,
			allowAllOutbound: true,
			description: 'Allow Lambdas to access OSRM'
		});
		sgEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5000), 'Allow remote to access OSRM');

		const ec2Instance = new ec2.Instance(this, 'KomyutOSRM-EC2', {
			instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
			machineImage: ec2.MachineImage.genericLinux({
				'ap-southeast-1': 'ami-09957f087e462106d'
			}),
			blockDevices: [{
				deviceName: '/dev/xvda',
				volume: ec2.BlockDeviceVolume.ebs(30),
			}],
			vpc,
			vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
			securityGroup: sgEC2,
			keyName: 'komyut-ec2',
		});

		new ssm.StringParameter(this, 'KomyutEc2PublicIP', {
			parameterName: '/komyut/ec2/public-ip',
			stringValue: ec2Instance.instancePublicIp
		});

		ec2Instance.role.addManagedPolicy(
			iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
		);

		// ---------- Cognito ----------
		const userPool = new cognito.UserPool(this, 'KomyutUserPool', {
			userPoolName: 'KomyutUsers',
			selfSignUpEnabled: true,
			signInAliases: { email: true },
			autoVerify: { email: true },
			userVerification: {
				emailSubject: 'Your Komyut Verification Code',
				emailBody: 'Your verification code is: {####}',
				emailStyle: cognito.VerificationEmailStyle.CODE
			},
			passwordPolicy: {
				minLength: 6,
				requireDigits: false,
				requireSymbols: false,
				requireUppercase: false,
				requireLowercase: false,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const userPoolClient = new cognito.UserPoolClient(this, 'KomyutUserPoolClient', {
			userPool,
			authFlows: { userPassword: true },
		});

		new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
		new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });

		// ---------- S3 Buckets ----------
		const routePackBucket = new s3.Bucket(this, 'RoutePackBucket', {
			bucketName: `komyut-routepack-bucket-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			publicReadAccess: false,
		});

		new s3deploy.BucketDeployment(this, 'RoutePackBundleData', {
			destinationBucket: routePackBucket,
			sources: [s3deploy.Source.asset(path.join(__dirname, '../assets/routepack-bundle'))],
			destinationKeyPrefix: 'routepack-bundle',
		});

		const distPath = path.resolve(process.cwd(), '../../frontend/dist');

		const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
			bucketName: `komyut-frontend-dev-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		// ---------- Lambda Functions ----------
		const fnHelloWorld = new lambdaNJS.NodejsFunction(this, 'HelloWorldFunction', {
			entry: path.join(__dirname, '../lambda/helloworld/helloworld.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
		});

		const fnCalcPlan = new lambdaNJS.NodejsFunction(this, 'CalculatePlanFunction', {
			entry: path.join(__dirname, '../lambda/calcplan/calcplan.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(300),
			memorySize: 3008,
			environment: {
				ROUTEPACK_BUCKET_NAME: routePackBucket.bucketName,
			},
		});
		fnCalcPlan.addToRolePolicy(new iam.PolicyStatement({
			actions: ['ssm:GetParameter'],
			resources: ['*']
		}));
		routePackBucket.grantRead(fnCalcPlan);

		// Cognito auth lambdas
		const fnConfirmSignup = new lambdaNJS.NodejsFunction(this, 'ConfirmSignupFunction', {
			entry: path.join(__dirname, '../lambda/confirmSignup/confirmSignup.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			environment: {
				COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
				COGNITO_USER_POOL_ID: userPool.userPoolId,
			},
		});

		const fnSignin = new lambdaNJS.NodejsFunction(this, 'SigninFunction', {
			entry: path.join(__dirname, '../lambda/signin/signin.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			environment: {
				COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
				COGNITO_USER_POOL_ID: userPool.userPoolId,
			},
		});

		const fnSignup = new lambdaNJS.NodejsFunction(this, 'SignupFunction', {
			entry: path.join(__dirname, '../lambda/signup/signup.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			environment: {
				COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
				COGNITO_USER_POOL_ID: userPool.userPoolId,
			},
		});

		const fnResendVerificationCode = new lambdaNJS.NodejsFunction(this, 'ResendVerificationCodeFunction', {
			entry: path.join(__dirname, '../lambda/resendVerificationCode/resendVerificationCode.ts'),
			runtime: lambda.Runtime.NODEJS_20_X,
			environment: {
				COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
				COGNITO_USER_POOL_ID: userPool.userPoolId,
			},
		});

		const cognitoPolicy = new iam.PolicyStatement({
			actions: [
				'cognito-idp:SignUp',
				'cognito-idp:ConfirmSignUp',
				'cognito-idp:InitiateAuth',
				'cognito-idp:AdminConfirmSignUp',
			],
			resources: [
				`arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/${process.env.COGNITO_USER_POOL_ID}`
			],
		});

		fnSignup.addToRolePolicy(cognitoPolicy);
		fnSignin.addToRolePolicy(cognitoPolicy);
		fnConfirmSignup.addToRolePolicy(cognitoPolicy);
		fnResendVerificationCode.addToRolePolicy(cognitoPolicy);

		// ---------- CloudFront for RoutePack ----------
		const routePackDistribution = new cloudfront.Distribution(this, 'RoutePackDistribution', {
			defaultBehavior: {
				origin: new origins.S3Origin(routePackBucket),
				allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
			},
			defaultRootObject: 'routepack-bundle/routepack.json',
			priceClass: cloudfront.PriceClass.PRICE_CLASS_200
		});

		// ---------- API Gateway ----------
		const api = new apigw.RestApi(this, 'KomyutRestApi', {
			defaultCorsPreflightOptions: CORS_CONFIG
		});

		api.root.addResource('hello-world').addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));
		api.root.addResource('calc-plan').addMethod('POST', new apigw.LambdaIntegration(fnCalcPlan));
		api.root.addResource('signin').addMethod('POST', new apigw.LambdaIntegration(fnSignin));
		api.root.addResource('signup').addMethod('POST', new apigw.LambdaIntegration(fnSignup));
		api.root.addResource('confirm-signup').addMethod('POST', new apigw.LambdaIntegration(fnConfirmSignup));
		api.root.addResource('resend-code').addMethod('POST', new apigw.LambdaIntegration(fnResendVerificationCode));

		// ---------- CloudFront for Frontend ----------
		const oai = new cloudfront.OriginAccessIdentity(this, 'FrontendOAI');
		frontendBucket.grantRead(oai);

		const frontendDistribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
			defaultBehavior: {
				origin: new origins.S3Origin(frontendBucket, { originAccessIdentity: oai }),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
				cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
			},
			defaultRootObject: 'index.html',
			errorResponses: [
				{
					httpStatus: 403,
					responseHttpStatus: 200,
					responsePagePath: '/index.html',
					ttl: cdk.Duration.minutes(0),
				},
				{
					httpStatus: 404,
					responseHttpStatus: 200,
					responsePagePath: '/index.html',
					ttl: cdk.Duration.minutes(0),
				}
			],
		});

		// ---------- Deploy Frontend to S3 & Invalidate CF ----------
		new s3deploy.BucketDeployment(this, 'DeployFrontend', {
			sources: [
				s3deploy.Source.asset(distPath),
				s3deploy.Source.data('cdk-config.json', JSON.stringify({ apiBaseUrl: api.url })),
			],
			destinationBucket: frontendBucket,
			prune: false,
			distribution: frontendDistribution,
			distributionPaths: ['/*'],
		});

		new cdk.CfnOutput(this, 'FrontendURL', { value: `https://${frontendDistribution.domainName}` });
	}
}
