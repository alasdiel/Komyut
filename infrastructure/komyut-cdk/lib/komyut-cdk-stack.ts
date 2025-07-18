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
			}
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

		// ⚡ EC2 INSTANCES
		// Define default VPC
		const vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {isDefault: true});
		// Security Group
		const secuGroup = new ec2.SecurityGroup(this, 'OSRMSecurityGroup', {
			vpc,
			allowAllOutbound: true,
			description: 'Allow SSH and OSRM HTTP access',
		});
		secuGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH');
		secuGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5000), 'OSRM server');

		// Commands to run
		const userData = ec2.UserData.forLinux();
		userData.addCommands(
			'sudo yum update -y',
			'sudo yum groupinstall "Development Tools" -y',
			'sudo yum install -y git cmake gcc-c++ make boost-devel tbb-devel libxml2-devel lua-devel unzip wget',
			'git clone https://github.com/Project-OSRM/osrm-backend.git',
			'cd osrm-backend',
			'mkdir build && cd build',
			'cmake .. -DCMAKE_BUILD_TYPE=Release',
			'cmake --build .',
			'cd ..',
			'wget https://download.geofabrik.de/asia/philippines-latest.osm.pbf',
			'./build/osrm-extract -p profiles/foot.lua philippines-latest.osm.pbf',
			'./build/osrm-partition philippines-latest.osrm',
			'./build/osrm-customize philippines-latest.osrm',
			'nohup ./build/osrm-routed --algorithm mld philippines-latest.osrm --max-matching-size=1000 --max-table-size=1000 --max-viaroute-size=1000 -p 5000 &'
		);

		new ec2.Instance(this, 'OSRMInstanceServer', {
			vpc, instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
			machineImage: ec2.MachineImage.latestAmazonLinux2023(),
			securityGroup: secuGroup,
			keyName: 'osrm-keypair',
			userData: userData
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
