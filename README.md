# Micro-Frontends in AWS

## Context

Micro-Frontends are the technical representation of a business subdomain, they allow independent implementations with the same or different technology, they should minimize the code shared with other subdomains and they are own by a single team.

These characteristics might seem familiar if you have built distibuted systems in the past. Micro-Frontends are the answer when you need to scale your organizations having multiple teams working together in the same project.

In this repository we collect examples to implement Micro-Frontends in AWS, leveraging several AWS services that represents the building blocks for stitching together distributed architecterues not only for the backend but now for the frontend too.

## Server-side rendering Micro-Frontends

In this example we have created a basic example that leverages the building blocks to create a server-side rendering (SSR) micro-frontends implementation.

The architecture in this example is represented in the following diagram:

![SSR micro-frontends](./images/diagram.png)

## Installation
Please ensure you have the [AWS CLI](https://aws.amazon.com/cli) installed and configured with [credentials](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

### UI Composer

### Catalog Micro-Frontend

### Reviews Micro-Frontend





The install script uses SAM to deploy relevant resources to your AWS account:
```bash
$ git clone https://github.com/awslabs/aws-lambda-deploy
$ cd aws-lambda-deploy
$ export BUCKET_NAME=[S3_BUCKET_NAME_FOR_BUILD_ARTIFACTS]
$ ./install.sh
```

## Deployment workflow
In the SSR Micro-Frontends example we used [AWS CDK](https://aws.amazon.com/cdk/) and [AWS SAM]()

```bash
$ export STATE_MACHINE_ARN=`aws cloudformation describe-stack-resources --stack-name aws-lambda-deploy-stack --logical-resource-id DeployStateMachine --output text | cut  -d$'\t' -f3`
$ aws stepfunctions start-execution --state-machine-arn $STATE_MACHINE_ARN --input '{
"function-name": "MyFunction",
"alias-name": "MyAlias",
"new-version": "2",
"steps": 10,
"interval": 120,
"type": "linear"}'

```