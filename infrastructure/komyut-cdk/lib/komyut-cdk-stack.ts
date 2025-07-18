import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
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
		const ec2Role = new iam.Role(this, 'Ec2Role', { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'), });
		const ec2Instance = new ec2.Instance(this, 'KomyutOSRM-EC2', {
			instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
			machineImage: ec2.MachineImage.latestAmazonLinux2023(),
			blockDevices: [{
				deviceName: '/dev/xvda',
				volume: ec2.BlockDeviceVolume.ebs(30),
			}],

			vpc,
			vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
			securityGroup: sgEC2,

			keyName: 'osrm-keypair',
			role: ec2Role
		});
		new ssm.StringParameter(this, 'KomyutEc2PrivateIP', { parameterName: '/komyut/ec2/private-ip', stringValue: ec2Instance.instancePrivateIp });
		ec2Instance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));		
		ec2Instance.addUserData(
			fs.readFileSync(path.join(__dirname, '../helpers/ec2.sh'), 'utf-8').replace(/\${ROUTEPACK_BUCKET_SUFFIX}/g, process.env.ROUTEPACK_BUCKET_SUFFIX!)
		);
		// ec2Instance.userData.addCommands(
		// 	//Redirect all output to both a log file and the system logger
		// 	`exec > >(tee -a /home/ec2-user/init.log | logger -t user-data -s) 2>&1`,
		// 	`set -x  # Print each command before executing`,

		// 	`echo "===== STARTING EC2 INIT SCRIPT ====="`,

		// 	`echo "Updating packages..."`,
		// 	`sudo yum update -y`,

		// 	`echo "Installing Docker..."`,
		// 	`sudo yum install -y docker`,
		// 	`sudo systemctl start docker`,
		// 	`sudo usermod -a -G docker ec2-user`,

		// 	`echo "Setting up 10GB swap file..."`,
		// 	`sudo /bin/dd if=/dev/zero of=/var/swapfile bs=1M count=10240 status=progress`,
		// 	`sudo /sbin/mkswap /var/swapfile`,
		// 	`sudo chmod 600 /var/swapfile`,
		// 	`sudo /sbin/swapon /var/swapfile`,
		// 	`echo "Swap setup complete"`,

		// 	`echo "Creating data directory..."`,
		// 	`mkdir -p /home/ec2-user/data`,

		// 	`echo "Waiting for osrm-data.tar.gz in S3..."`,
		// 	`while ! aws s3 ls s3://komyut-permanent-${process.env.ROUTEPACK_BUCKET_SUFFIX}/osrm-data.tar.gz; do`,
		// 	`echo "File not yet available... waiting 30s"`,
		// 	`sleep 30`,
		// 	`done`,

		// 	`echo "File found! Downloading..."`,
		// 	`aws s3 cp s3://komyut-permanent-${process.env.ROUTEPACK_BUCKET_SUFFIX}/osrm-data.tar.gz /home/ec2-user/osrm-data.tar.gz`,

		// 	`echo "Extracting OSRM data..."`,
		// 	`tar -xvzf /home/ec2-user/osrm-data.tar.gz -C /home/ec2-user/data`,

		// 	`echo "Starting OSRM in Docker..."`,
		// 	`docker run -d -p 5000:5000 -v /home/ec2-user/data:/data osrm/osrm-backend osrm-routed --algorithm mld /data/philippines-latest.osrm > /home/ec2-user/osrm.log 2>&1`,

		// 	`# Optional: wait a few seconds then append container logs to osrm.log`,
		// 	`sleep 5`,
		// 	`echo "Appending Docker container logs to osrm.log..."`,
		// 	`docker logs $(docker ps -q --filter ancestor=osrm/osrm-backend) >> /home/ec2-user/osrm.log`,

		// 	`echo "===== EC2 INIT SCRIPT COMPLETE ====="`
		// );		
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
		const permanentBucket = new s3.Bucket(this, 'PermanentBucket', {
			bucketName: `komyut-permanent-${process.env.ROUTEPACK_BUCKET_SUFFIX}`, 
			removalPolicy: cdk.RemovalPolicy.RETAIN,			
			publicReadAccess: false,						
		});	
		routePackBucket.grantRead(fnCalcPlan);
		permanentBucket.grantRead(ec2Role);
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
