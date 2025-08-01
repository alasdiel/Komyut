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

		// The code that defines your stack goes here    

		// 💿 DYNAMODB TABLES

		// //#region ⚡ EC2 INSTANCES + VPC + SECURITY GROUPS		
		// // VPC
		// const vpc = new ec2.Vpc(this, 'KomyutVPC', {
		// 	maxAzs: 2,
		// 	subnetConfiguration: [
		// 		{
		// 			cidrMask: 24,
		// 			name: 'private-subnet',
		// 			subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
		// 		},
		// 		{
		// 			cidrMask: 24,
		// 			name: 'public-subnet',
		// 			subnetType: ec2.SubnetType.PUBLIC
		// 		},
		// 	],
		// });

		// // Security Groups
		// const sgEC2 = new ec2.SecurityGroup(this, 'KomyutSG_ec2', {
		// 	vpc,
		// 	allowAllOutbound: true,
		// 	description: 'Allow Lambdas to access OSRM'
		// });
		// const sgLambda = new ec2.SecurityGroup(this, 'KomyutSG_lambda', {
		// 	vpc,
		// 	allowAllOutbound: true
		// });
		// sgEC2.addIngressRule(sgLambda, ec2.Port.tcp(5000), 'Allow Lambdas to access OSRM');
		// sgEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5000), 'Allow remote to access OSRM');
		// sgEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'shh(insecure)');

		// // EC2		
		// const ec2Instance = new ec2.Instance(this, 'KomyutOSRM-EC2', {
		// 	instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
		// 	// machineImage: ec2.MachineImage.latestAmazonLinux2023(),
		// 	machineImage: ec2.MachineImage.genericLinux({
		// 		'ap-southeast-1': 'ami-0714c5f5fa186c34d'
		// 	}),
		// 	blockDevices: [{
		// 		deviceName: '/dev/xvda',
		// 		volume: ec2.BlockDeviceVolume.ebs(30),
		// 	}],

		// 	vpc,
		// 	vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
		// 	securityGroup: sgEC2,

		// 	keyName: 'komyut-osrm-keypair',			
		// });
		// new ssm.StringParameter(this, 'KomyutEc2PrivateIP', { parameterName: '/komyut/ec2/private-ip', stringValue: ec2Instance.instancePrivateIp });
		// ec2Instance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));		
		// ec2Instance.addUserData(
		// 	fs.readFileSync(path.join(__dirname, '../helpers/ec2.sh'), 'utf-8').replace(/\${ROUTEPACK_BUCKET_SUFFIX}/g, process.env.ROUTEPACK_BUCKET_SUFFIX!)
		// );
		//#endregion

		//#region 🏊 COGNITO USER POOL
		const userPool = new cognito.UserPool(this, 'KomyutUserPool', {
			userPoolName: 'KomyutUsers',
			selfSignUpEnabled: true, // Allow users to sign up
			signInAliases: { email: true }, // Allow sign in with email
			autoVerify: { email: true },
			userVerification: {
				emailSubject: 'Your Komyut Verification Code',
				emailBody: 'Your verification code is: {####}', // Code will replace {####}
				emailStyle: cognito.VerificationEmailStyle.CODE
			},
			passwordPolicy: {
				minLength: 6,
				requireDigits: false,
				requireSymbols: false,
				requireUppercase: false,
				requireLowercase: false, // All optional, adjust as needed
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const userPoolClient = new cognito.UserPoolClient(this, 'KomyutUserPoolClient', {
			userPool,
			authFlows: { userPassword: true },
		});

		new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
		new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
		//#endregion

		//#region 🪣 S3 BUCKETS
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
		console.log(distPath);

		const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
			bucketName: `komyut-frontend-dev-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
			publicReadAccess: true,
			blockPublicAccess: new s3.BlockPublicAccess({
				blockPublicAcls: false,
				ignorePublicAcls: false,
				blockPublicPolicy: false,
				restrictPublicBuckets: false,
			}),
			websiteIndexDocument: 'index.html',
			websiteErrorDocument: 'index.html',
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		// The DeployFrontend BucketDeployment is at the very last part of the cdk declaration
		// this is a workaround for an issue

		//#endregion

		//#region ⭐ LAMBDA FUNCTIONS (use lambda-nodejs NodejsFunction() instead to avoid building to .js)
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
				ROUTEPACK_BUCKET_NAME: routePackBucket.bucketName,
			},

			// vpc: vpc,
			// vpcSubnets: {
			// 	subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
			// },
			// securityGroups: [sgLambda],
		});
		fnCalcPlan.addToRolePolicy(new iam.PolicyStatement({
			actions: ['ssm:GetParameter'],
			resources: ['*']
		}));
		routePackBucket.grantRead(fnCalcPlan);

		// Authentication Functions
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

		// Add Cognito permissions to all auth functions
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
		//#endregion

		//#region ☁️ CLOUDFRONT DISTRIBUTION
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
		//#endregion	

		//#region 🚦 APIGATEWAY DEFINITION
		const api = new apigw.RestApi(this, 'KomyutRestApi', {
			defaultCorsPreflightOptions: CORS_CONFIG
		});

		// Endpoints
		api.root.addResource('hello-world')
			.addMethod('GET', new apigw.LambdaIntegration(fnHelloWorld));

		api.root.addResource('calc-plan')
			.addMethod('POST', new apigw.LambdaIntegration(fnCalcPlan, {
				proxy: true,
			}));

		api.root.addResource('signin')
			.addMethod('POST', new apigw.LambdaIntegration(fnSignin, {
				proxy: true,
			}));
		api.root.addResource('signup')
			.addMethod('POST', new apigw.LambdaIntegration(fnSignup, {
				proxy: true,
			}));
		api.root.addResource('confirm-signup')
			.addMethod('POST', new apigw.LambdaIntegration(fnConfirmSignup, {
				proxy: true,
			}));
		api.root.addResource('resend-code')
			.addMethod('POST', new apigw.LambdaIntegration(fnResendVerificationCode, {
				proxy: true,
			}));
		
		//#endregion

		//#region FRONTEND BUCKET DEPLOYMENT
		new s3deploy.BucketDeployment(this, 'DeployFrontend', {
			sources: [
				s3deploy.Source.asset(distPath),
				s3deploy.Source.data('cdk-config.json', JSON.stringify({ apiBaseUrl: api.url })),	
			],
			destinationBucket: frontendBucket,	
			prune: false,					
		});
		//#endregion
	}
}
