#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UiComposerStack } from '../lib/ui-composer-stack';
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';

const app = new cdk.App({
  context:{
    catalogArn: "/ssr-mfe/catalogARN",
    reviewsArn: "/ssr-mfe/reviewsARN",
    bucketArn: "/ssr-mfe/bucketARN"
  }
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
new UiComposerStack(app, 'UiComposerStack', {});