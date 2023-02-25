#!/usr/bin/env node
import 'source-map-support/register';
import { UiComposerStack } from '../lib/ui-composer-stack';
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects, App, Stack } from 'aws-cdk-lib';

const app = new App();
const stack = new UiComposerStack(app, 'UiComposerStack',{
    env: { region: 'eu-west-1' }
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))