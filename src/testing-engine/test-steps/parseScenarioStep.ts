import { Conversation } from '../Conversation.ts';
import { Step } from '../../stepDefinitions.ts';

export interface Config {
  timeoutInSeconds: number;
}

export interface ParsedStep {
  definition: Step;
  action: (convo: Conversation, config: Config) => Promise<unknown | void>;
}

export function parseScenarioStep(
  step: Step
): ParsedStep {
  if (step.testStepType === 'say') {
    return { definition: step, action: (convo) => convo.sendText(step.details.sayText) };
  }

  if (step.testStepType === 'waitForReplyContaining') {
    return {
      definition: step,
      action: (convo: Conversation, config: Config) =>
        convo.waitForResponseWithTextContaining(step.details.expectedReplyText, {
          timeoutInSeconds: config.timeoutInSeconds
        })
    };
  }

  throw new Error(`Unsupported step ${step}`);
}
