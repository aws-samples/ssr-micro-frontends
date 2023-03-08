import {Stack, StackProps, aws_iam, App, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, OriginAccessIdentity, CloudFrontAllowedMethods, CloudFrontAllowedCachedMethods, OriginProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { Vpc, FlowLog, FlowLogResourceType, FlowLogDestination, CfnPrefixList, SecurityGroup, Port, Peer } from "aws-cdk-lib/aws-ec2";
import { AccountRootPrincipal, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

import * as path from 'path';
import { NagSuppressions } from 'cdk-nag';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class UiComposerStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
      // --------  S3 Buckets ------------
      const accesslogsBucket = process.env.ACCESS_LOGS_BUCKET
          ? Bucket.fromBucketName(this, "access-logs-bucket", process.env.ACCESS_LOGS_BUCKET)
          : undefined;
      const sourceBucket = new Bucket(this, 'mfe-static-assets', {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true,
        serverAccessLogsBucket: accesslogsBucket,
        serverAccessLogsPrefix: "s3-logs",
        encryption: BucketEncryption.S3_MANAGED,
        removalPolicy: RemovalPolicy.DESTROY
      });

      // --------  UI-COMPOSER-NETWORKING ------------  
      const vpc = new Vpc(this, "ui-composer-vpc", {
        maxAzs: 3
      });

      const cluster = new Cluster(this, "ui-composer-cluster", {
        vpc: vpc,
        containerInsights: true,
      });

      const vpcLogGroup = new LogGroup(this, 'VPCLogGroup');
      const role = new Role(this, "vpc-log-group", {
        assumedBy: new ServicePrincipal('vpc-flow-logs.amazonaws.com')
      });

      const flowlog = new FlowLog(this, 'FlowLog', {
        resourceType: FlowLogResourceType.fromVpc(vpc),
        destination: FlowLogDestination.toCloudWatchLogs(vpcLogGroup, role)
      });

      const uiComposerSG = new SecurityGroup(this, 'ui-composer-sg', {
        vpc: vpc,
        allowAllOutbound: true,
        description: 'ui-composer-sg'
      })

      // --------  UI-COMPOSER-FARGATE ------------

      // ----------------------------------------
      
      // --------  SSM Parameter Store ----------  

      new StringParameter(this, 'ui-composer-params', {
        parameterName: '/ssr-mfe/catalogpage',
        description: "template config for UI-composer",
        stringValue: `{"template": "templates/catalog.template", "templatesBucket": "${sourceBucket.bucketName}"}`,
      });

      // --------  UI-COMPOSER -------------  

      const taskRole = new aws_iam.Role(this, "fargate-task-role", {
        assumedBy: new aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        roleName: "fargate-task-role",
        description: "IAM role for consuming MFEs"  
      });

      const account = new AccountRootPrincipal()

      taskRole.attachInlinePolicy(
        new aws_iam.Policy(this, "task-access-policy", {
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                "ssm:GetParameter",
                "ssm:GetParameters"
              ],
              resources: [`arn:aws:ssm:${process.env.region || "eu-west-1"}:${account.accountId}:parameter/ssr-mfe/*`]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                "lambda:InvokeFunction",
                "states:StartSyncExecution"
              ],
              resources: [
                `arn:aws:lambda:${process.env.region || "eu-west-1"}:${account.accountId}:function:*`,
                `arn:aws:states:${process.env.region || "eu-west-1"}:${account.accountId}:stateMachine:*`
              ]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                "s3:GetObject",
                "s3:ListBucket"
              ],
              resources: [
                sourceBucket.bucketArn,
                `${sourceBucket.bucketArn}/*`
              ],
            })
          ],
        })
      )

      const loadBalancedFargateService = new ApplicationLoadBalancedFargateService(this, 'ui-composer-service', {
        cluster,
        memoryLimitMiB: 2048,
        desiredCount: 2,
        cpu: 512,
        listenerPort: 80,
        publicLoadBalancer: true,
        openListener: false,
        securityGroups: [uiComposerSG],
        serviceName: "ui-composer-service",
        circuitBreaker: {
          rollback: true,
        },
        taskImageOptions:{
          image: ContainerImage.fromAsset(path.resolve(__dirname, '../')),
          taskRole: taskRole,
          executionRole: taskRole,
          enableLogging: true,
          environment: {
            REGION: process.env.region || "eu-west-1"
          }
        },
      });

      const albSG = new SecurityGroup(this, 'alb-sg', {
        vpc: vpc,
        allowAllOutbound: true,
        description: 'alb-sg'
      })

      const PREFIX_GLOBAL_CF_EU_WEST_1 = "pl-4fa04526";
      albSG.addIngressRule(Peer.prefixList(PREFIX_GLOBAL_CF_EU_WEST_1), Port.tcp(80), 'allow ingress from CF')
      loadBalancedFargateService.loadBalancer.addSecurityGroup(albSG)

      if (accesslogsBucket !== undefined) {
        loadBalancedFargateService.loadBalancer.logAccessLogs(accesslogsBucket as Bucket, "alb-logs");
      }

      loadBalancedFargateService.targetGroup.configureHealthCheck({
        path: "/health",
      });
      
      const scalableTarget = loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 3,
      });
      
      scalableTarget.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 70,
      });
      
      scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: 70,
      });

      // ----------------------------------------

      // --------  CF distro ------------    

      const oai = new OriginAccessIdentity(this, 'mfe-oai')
      let loggingConfiguration;
      if (accesslogsBucket !== undefined) {
        loggingConfiguration = {
          bucket: accesslogsBucket,
          includeCookies: false,
        };
      }

      const distribution = new CloudFrontWebDistribution(this, 'mfe-distro', {
        loggingConfig: loggingConfiguration,
        originConfigs: [
          {

            s3OriginSource: {
              s3BucketSource: sourceBucket,
              originAccessIdentity: oai
            },
            behaviors : [
              { pathPattern: '/static/*',
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD
              }
            ],
          },
          {
            customOriginSource: {
              domainName: loadBalancedFargateService.loadBalancer.loadBalancerDnsName,
              originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors : [
              {
                isDefaultBehavior: true,
                allowedMethods: CloudFrontAllowedMethods.ALL,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: 'all'
                  },
                  headers: ['*'],
                }
              }
          ]
          }
        ],
      });
      
      // ----------------------------------------

      new CfnOutput(this, 'distributionDomainName', {
          value: `https://${distribution.distributionDomainName}/productdetails`,
          description: 'the URL to access the website in a browser',
          exportName: 'website-url'
      });

      // --------  NAG suppression statements ------------

      NagSuppressions.addResourceSuppressions(loadBalancedFargateService.taskDefinition, [
        {id: 'AwsSolutions-ECS2', reason: 'It\'s a demo'},
      ])
      
      NagSuppressions.addStackSuppressions(this, [
        {id: 'AwsSolutions-ELB2', reason: 'It\'s a demo so access logs are opt-in using the ACCESS_LOGS_BUCKET env var' },
        {id: 'AwsSolutions-IAM5', reason: 'remediate with override inline policies'}
      ])

      NagSuppressions.addResourceSuppressions(distribution, [
        { id: 'AwsSolutions-CFR5', reason: 'It\'s a demo so no need to enforce SSLv3 or TLSv1' },
        { id: 'AwsSolutions-CFR4', reason: 'It\'s a demo so no need to enforce SSLv3 or TLSv1' },
        { id: 'AwsSolutions-CFR3', reason: 'It\'s a demo so no need to have access logs' },
        { id: 'AwsSolutions-CFR2', reason: 'It\'s a demo so no need to integrate WAF on the CloudFront Distribution' },
        { id: 'AwsSolutions-CFR1', reason: 'It\'s a demo so no need to implement GEO restriction rules' },
      ]);
  }
}