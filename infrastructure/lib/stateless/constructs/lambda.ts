import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { Construct } from "constructs";
import { BaseConstructProps } from "../../types";

interface LambdaConstructProps extends BaseConstructProps {
  dynamodbTable: dynamodb.Table;
}
export class LambdaConstruct extends Construct {
  public loginFunction: lambda.Function;
  public createUserFunction: lambda.Function;

  public loginIntegration: integrations.HttpLambdaIntegration;
  public createUserIntegration: integrations.HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.createLambdaFunctions(props);
    this.createLambdaIntegrations(props);
    this.assignPermissions(props);
  }

  private createLambdaFunctions(props: LambdaConstructProps) {
    this.loginFunction = this.createLambdaFunction("login", props);
    this.createUserFunction = this.createLambdaFunction("createUser", props);
  }

  private createLambdaIntegrations(props: LambdaConstructProps) {
    this.loginIntegration = this.createLambdaIntegration(
      props,
      "login",
      this.loginFunction,
    );
    this.createUserIntegration = this.createLambdaIntegration(
      props,
      "createUser",
      this.createUserFunction,
    );
  }

  private assignPermissions(props: LambdaConstructProps) {
    // Grant explicit DynamoDB permissions to both functions
    const dynamoDbPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:BatchGetItem',
        'dynamodb:BatchWriteItem'
      ],
      resources: [
        props.dynamodbTable.tableArn,
        `${props.dynamodbTable.tableArn}/index/*`
      ]
    });

    this.createUserFunction.addToRolePolicy(dynamoDbPolicy);
    this.loginFunction.addToRolePolicy(dynamoDbPolicy);
  }

  private createLambdaFunction(
    functionName: string,
    props: LambdaConstructProps,
    deadLetterQueue?: sqs.Queue,
  ) {
    return new lambda.Function(this, `${props.stage}-Lambda-${functionName}`, {
      functionName: `${props.stage}-Lambda-${functionName}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.resolve(
          __dirname,
          `../../../lambdaFunctions/dist/${functionName}`,
        ),
      ),
    });
  }

  private createLambdaIntegration(
    props: LambdaConstructProps,
    functionName: string,
    lambdaFunction: lambda.Function,
  ) {
    return new integrations.HttpLambdaIntegration(
      `${props.stage}-LambdaIntegration-${functionName}`,
      lambdaFunction,
    );
  }
}
