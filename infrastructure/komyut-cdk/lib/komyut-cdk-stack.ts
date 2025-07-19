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

import * as path from 'path';
import * as fs from 'fs';

import { CONSTS } from "@shared/consts";

export class KomyutCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here    

		// 💿 DYNAMODB TABLES

		//#region ⚡ EC2 INSTANCES + VPC + SECURITY GROUPS		
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

		// EC2		
		const ec2Instance = new ec2.Instance(this, 'KomyutOSRM-EC2', {
			instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
			// machineImage: ec2.MachineImage.latestAmazonLinux2023(),
			machineImage: ec2.MachineImage.genericLinux({
				'ap-southeast-2': 'ami-0423bb1d0e9ecb96b'
			}),
			blockDevices: [{
				deviceName: '/dev/xvda',
				volume: ec2.BlockDeviceVolume.ebs(30),
			}],

			vpc,
			vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
			securityGroup: sgEC2,

			keyName: 'osrm-keypair',			
		});
		new ssm.StringParameter(this, 'KomyutEc2PrivateIP', { parameterName: '/komyut/ec2/private-ip', stringValue: ec2Instance.instancePrivateIp });
		ec2Instance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));		
		ec2Instance.addUserData(
			fs.readFileSync(path.join(__dirname, '../helpers/ec2.sh'), 'utf-8').replace(/\${ROUTEPACK_BUCKET_SUFFIX}/g, process.env.ROUTEPACK_BUCKET_SUFFIX!)
		);
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
				ROUTEPACK_BUCKET_SUFFIX: process.env.ROUTEPACK_BUCKET_SUFFIX!,
			},			

			vpc: vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
			},
			securityGroups: [sgLambda],
		});		
		fnCalcPlan.addToRolePolicy(new iam.PolicyStatement({
			actions: ['ssm:GetParameter'],
			resources: ['*']
		}))

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
		//#endregion

		//#region 🪣 S3 BUCKETS
		const routePackBucket = new s3.Bucket(this, 'RoutePackBucket', {
			bucketName: `komyut-routepack-bucket-${process.env.ROUTEPACK_BUCKET_SUFFIX}`, 
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			publicReadAccess: false,						
		});
		new s3deploy.BucketDeployment(this, 'RoutePackBundleData', {
			destinationBucket: routePackBucket,
			sources: [s3deploy.Source.asset(path.join(__dirname, '../assets/routepack-bundle'))],
			destinationKeyPrefix: 'routepack-bundle',
		});		
		routePackBucket.grantRead(fnCalcPlan);		
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
		//#endregion
	}
}
