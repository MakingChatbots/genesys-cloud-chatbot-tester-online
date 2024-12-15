export interface IdentifiableStep {
  id: number;
}

export interface WaitForReplyContainingStep extends IdentifiableStep {
  testStepType: 'waitForReplyContaining';
  details: {
    expectedReplyText: string;
  };
}

export interface SayStep extends IdentifiableStep {
  testStepType: 'say';
  details: {
    sayText: string;
  };
}

export type Step = WaitForReplyContainingStep | SayStep;
