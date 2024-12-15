import { Conversation } from "./Conversation.ts";
import { Step } from "../stepDefinitions.ts";
import { parseScenarioStep } from "./test-steps/parseScenarioStep.ts";
import {
  OnErrorCallback,
  WebMessengerGuestSession,
} from "./genesys/WebMessengerGuestSession.ts";
import { StepExecutionStatus } from "../components/TestStepsConfig/TestStepsConfig.tsx";
import { SessionTranscriber } from "./transcribe/Transcriber.ts";

export type TestOutcome =
  | { result: "success" }
  | {
      result: "failed";
      stepThatFailed: Step;
      reasonStepFailed: any;
    };

type OnLog = (
  severity: "info" | "error",
  overview: string,
  detailed?: any,
) => void;

type OnTestProgressUpdate = (step: Step, feedback: StepExecutionStatus) => void;
type OnTestFinished = (result: TestOutcome) => void;
type OnSessionClosed = () => void;
type OnTranscription = (event: any) => void;

export function sessionFactory(
  deploymentId: string,
  region: string,
  origin: string,
  onError: OnErrorCallback,
  logger: (overview: string, detailed?: string) => void,
) {
  return new WebMessengerGuestSession(
    {
      deploymentId: deploymentId,
      region: region,
      origin: origin,
    },
    logger,
    onError,
  );
}

export class TestRunner {
  private webMessengerGuestSession: WebMessengerGuestSession | null = null;
  private sessionTranscriber: SessionTranscriber | null = null;

  private conversation: Conversation | null = null;
  private activeAction: Promise<unknown | void> | null = null;

  private cancelTests: boolean = false;

  public constructor(
    private readonly onLogCallback: OnLog,
    private readonly onErrorCallback: OnErrorCallback,
    private readonly onTestProgressUpdateCallback: OnTestProgressUpdate,
    private readonly onTestResultCallback: OnTestFinished,
    private readonly onSessionClosedCallback: OnSessionClosed,
    private readonly onTranscriptionCallback: OnTranscription,
    private readonly createSession: typeof sessionFactory = sessionFactory,
  ) {}

  private setupTranscription(
    webMessengerGuestSession: WebMessengerGuestSession,
  ) {
    this.sessionTranscriber = new SessionTranscriber(webMessengerGuestSession);
    this.sessionTranscriber.addEventListener(
      "messageTranscribed",
      this.onTranscriptionCallback,
    );
  }

  public isTestRunning(): boolean {
    return this.webMessengerGuestSession !== null || this.conversation !== null;
  }

  public async runTest(
    deploymentConfig: { deploymentId: string; region: string; origin: string },
    testSteps: Step[],
  ) {
    if (this.webMessengerGuestSession || this.conversation) {
      throw new Error(
        "Test already running. Stop it first before starting another",
      );
    }

    const parsedSteps = testSteps.map(parseScenarioStep);

    this.webMessengerGuestSession = this.createSession(
      deploymentConfig.deploymentId,
      deploymentConfig.region,
      deploymentConfig.origin,
      (errorType, errorMessage) =>
        this.onErrorCallback(errorType, errorMessage),
      (overview, detailed) => this.onLogCallback("info", overview, detailed),
    );
    this.setupTranscription(this.webMessengerGuestSession);

    this.conversation = new Conversation(this.webMessengerGuestSession);

    this.onLogCallback(
      "info",
      "Waiting for conversation to start",
      deploymentConfig,
    );
    await this.conversation.waitForConversationToStart();
    this.onLogCallback("info", "Conversation started");

    this.cancelTests = false;
    let stepsCompleted = 0;
    for (const stepDef of parsedSteps) {
      if (this.cancelTests) break;

      this.onTestProgressUpdateCallback(stepDef.definition, {
        stepId: stepDef.definition.id,
        feedback: "in-progress",
      });
      try {
        this.activeAction = stepDef.action(this.conversation, {
          timeoutInSeconds: 5,
        });
        await this.activeAction;
        stepsCompleted++;

        this.onTestProgressUpdateCallback(stepDef.definition, {
          stepId: stepDef.definition.id,
          feedback: "success",
        });
        this.onLogCallback(
          "info",
          `Step completed (${stepDef.definition.testStepType})`,
          stepDef.definition,
        );
      } catch (error) {
        // Ignore errors if test has been cancelled. Likely result from action working against closed connection
        if (!this.cancelTests) {
          this.onTestProgressUpdateCallback(stepDef.definition, {
            stepId: stepDef.definition.id,
            feedback: "failure",
          });
          this.onTestResultCallback({
            result: "failed",
            stepThatFailed: stepDef.definition,
            reasonStepFailed: error,
          });
        }
        break;
      }
    }

    if (stepsCompleted === parsedSteps.length) {
      this.onTestResultCallback({ result: "success" });
    }

    await this.stopTest();
  }

  public async stopTest() {
    this.cancelTests = true;

    // Check action has finished
    try {
      await this.activeAction;
    } catch {
      /* Ignore error */
    }

    this.sessionTranscriber?.removeEventListener(
      "messageTranscribed",
      this.onTranscriptionCallback,
    );
    this.webMessengerGuestSession?.close();

    this.webMessengerGuestSession = null;
    this.conversation = null;

    this.onSessionClosedCallback();
  }
}
