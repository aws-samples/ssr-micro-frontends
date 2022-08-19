import { Stack, StackProps, aws_iam } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, OriginAccessIdentity, CloudFrontAllowedMethods, CloudFrontAllowedCachedMethods, OriginProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';
import * as path from 'path';


export class UiComposerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
      // --------  UI-COMPOSER-MICROSERVICE ------------    
      const vpc = new Vpc(this, "ui-composer-vpc", {
        maxAzs: 3
      });

      const cluster = new Cluster(this, "ui-composer-cluster", {
        vpc: vpc
      });


      // -------- PARAMETER STORE -------
      
      const catalogARN = StringParameter.valueForStringParameter(this, '/ssr-mfe/catalogARN');
      const reviewsARN = StringParameter.valueForStringParameter(this, '/ssr-mfe/reviewsARN');
      const bucketARN = StringParameter.valueForStringParameter(this, '/ssr-mfe/bucketARN');
      
      // ----------------------------------------

      const taskRole = new aws_iam.Role(this, "fargate-task-role", {
        assumedBy: new aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        roleName: "fargate-task-role",
        description: "IAM role for consuming MFEs"
      });

      taskRole.attachInlinePolicy(
        new aws_iam.Policy(this, "task-policy", {
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["ssm:*"],
              resources: ["*"],
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [reviewsARN]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["states:StartSyncExecution"],
              resources: [catalogARN]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["s3:ListBucket", "s3:GetObject"],
              resources: [bucketARN]
            })
          ],
        })
      );

      const loadBalancedFargateService = new ApplicationLoadBalancedFargateService(this, 'ui-composer-service', {
        cluster,
        memoryLimitMiB: 2048,
        desiredCount: 3,
        cpu: 1024,
        publicLoadBalancer: true,
        taskImageOptions:{
          image: ContainerImage.fromAsset(path.resolve(__dirname, '../')),
          taskRole: taskRole,
          environment: {
            REGION: process.env.region || "eu-west-1"
          }
        },
      });

      loadBalancedFargateService.targetGroup.configureHealthCheck({
        path: "/health",
      });
      
      const scalableTarget = loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 3,
        maxCapacity: 4,
      });
      
      scalableTarget.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 70,
      });
      
      scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: 70,
      });

      // ----------------------------------------

      // --------  CF and S3 for distribution and static assets ------------    

      const sourceBucket = new Bucket(this, 'mfe-static-assets');
      const oai = new OriginAccessIdentity(this, 'mfe-oai')

      const distribution = new CloudFrontWebDistribution(this, 'mfe-distro', {
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
                  headers: ['*']
                }
              }
          ]
          }
        ],
      });

  }
}