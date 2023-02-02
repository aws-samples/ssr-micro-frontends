#!/usr/bin/env node
import 'source-map-support/register';
import { UiComposerStack } from '../lib/ui-composer-stack';
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects, App, Tags, Stack } from 'aws-cdk-lib';

const app = new App();
const stack = new UiComposerStack(app, 'UiComposerStack');
Tags.of(stack).add("webapp", "mfe")
// Tags.of(stack).add("webapp", "mfe", { includeResourceTypes: [
//   'AWS::ECS::Service',
//   'AWS::ECS::TaskDefinition',
//   'AWS::ECS::Cluster'
// ]});
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))