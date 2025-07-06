import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { BaseConstructProps } from "../../types";

interface CognitoConstructProps extends BaseConstructProps {
  signupLambda: lambda.Function;
  confirmSignupLambda?: lambda.Function;
  authLambda?: lambda.Function;
  domainName?: string;
}

export class CognitoConstruct extends Construct {
  public userPool: cognito.UserPool;
  public userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    this.createUserPool(props);
    this.createUserPoolClient(props);
    this.createUserPoolGroups(props);
    this.addLambdaTriggers(props);
  }

  private createUserPool(props: CognitoConstructProps) {
    this.userPool = new cognito.UserPool(
      this,
      `${props.stage}-Cognito-UserPool`,
      {
        userPoolName: `${props.stage}-Cognito-UserPool`,
        selfSignUpEnabled: true,
        signInAliases: {
          email: true,
        },
        customAttributes: {
          role: new cognito.StringAttribute({ mutable: true }),
        },
        passwordPolicy: {
          minLength: 8,
          requireDigits: true,
          requireLowercase: true,
          requireSymbols: false,
          requireUppercase: true,
        },
        lambdaTriggers: {
          preSignUp: props.signupLambda,
          customMessage: props.confirmSignupLambda,
          postAuthentication: props.authLambda,
        },
        deletionProtection: props.stage == "prod" ? true : false,
        removalPolicy:
          props.stage == "prod"
            ? cdk.RemovalPolicy.RETAIN
            : cdk.RemovalPolicy.DESTROY,
      },
    );
  }

  private createUserPoolClient(props: CognitoConstructProps) {
    const callbackUrls = ["http://localhost:3000/callback"];
    const logoutUrls = ["http://localhost:3000"];

    if (props.domainName) {
      callbackUrls.push(`https://${props.domainName}/callback`);
      logoutUrls.push(`https://${props.domainName}`);
    }

    this.userPoolClient = this.userPool.addClient(`${props.stage}-Cognito-UserPoolClient`, {
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
      },
      idTokenValidity: cdk.Duration.hours(4),
      accessTokenValidity: cdk.Duration.hours(4),
      refreshTokenValidity: cdk.Duration.days(30),
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls,
        logoutUrls
      }
    });
  }

  private createUserPoolGroups(props: CognitoConstructProps) {
    new cognito.CfnUserPoolGroup(
      this,
      `${props.stage}-Cognito-UserPoolGroup-Users`,
      {
        userPoolId: this.userPool.userPoolId,
        groupName: "users",
      },
    );

    new cognito.CfnUserPoolGroup(
      this,
      `${props.stage}-Cognito-UserPoolGroup-Admin`,
      {
        userPoolId: this.userPool.userPoolId,
        groupName: "admin",
      },
    );
  }

  private addLambdaTriggers(props: CognitoConstructProps) {
    if (props.signupLambda) {
      this.userPool.grant(
        props.signupLambda,
        'cognito-idp:AdminCreateUser',
        'cognito-idp:SignUp'
      );
    }

    if (props.confirmSignupLambda) {
      this.userPool.grant(
        props.confirmSignupLambda,
        'cognito-idp:ConfirmSignUp'
      );
    }

    if (props.authLambda) {
      this.userPool.grant(
        props.authLambda,
        'cognito-idp:AdminInitiateAuth',
        'cognito-idp:InitiateAuth'
      );
    }
  }
}