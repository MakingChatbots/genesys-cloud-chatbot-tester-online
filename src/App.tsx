import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { LiveTranscription } from "./components/LiveTranscription.tsx";
import {
  StepExecutionStatus,
  TestStepsConfig,
} from "./components/TestStepsConfig/TestStepsConfig.tsx";
import { Navbar } from "./components/NavBar/Navbar.tsx";
import { DeploymentConfig } from "./components/DeploymentConfig.tsx";
import { Step } from "./stepDefinitions.ts";
import { appStatePersistence } from "./appStatePersistence.ts";
import { Log, Logs } from "./components/Logs.tsx";
import { TestOutcome, TestRunner } from "./testing-engine/TestRunner.ts";
import { TestResult } from "./components/TestResult.tsx";
import { Modal, Toast } from "bootstrap";
import { ShareTestStepModal } from "./components/ShareTest/ShareTestModal.tsx";
import { useSearchParams } from "react-router";
import { TestEncoderV1 } from "./testing-engine/sharable-url/encoder.ts";
import { SimpleToast } from "./components/SimpleToast.tsx";

interface Utterance {
  who: string;
  message: string;
}

function enrichPreConnectedMessage(baseUrl: string, errorMessage: string) {
  return (
    <>
      {errorMessage}
      <hr />
      <p>Make sure:</p>
      <ul className="mb-0">
        <li>The Deployment ID and Region you provided are correct</li>
        <li>
          The Deployment's <em>'Restrict domain access'</em> setting is either:{" "}
          <em>'Allow all domains'</em> or lists the trusted domain{" "}
          <em>'{baseUrl}'</em>
        </li>
      </ul>
    </>
  );
}

function getDemoSteps(): Step[] {
  return [
    { id: 0, testStepType: "say", details: { sayText: "Hello" } },
    {
      id: 1,
      testStepType: "waitForReplyContaining",
      details: { expectedReplyText: "Can we ask you some questions" },
    },
  ];
}

function updateStepFeedback(
  stepDef: Step,
  newFeedback: StepExecutionStatus["feedback"],
) {
  return (previousState: StepExecutionStatus[]): StepExecutionStatus[] => {
    const statuses = [...previousState];
    const stepIndex = previousState.findIndex(
      (feedback) => feedback.stepId === stepDef.id,
    );
    if (stepIndex > -1) {
      statuses[stepIndex].feedback = newFeedback;
    } else {
      statuses.push({ stepId: stepDef.id, feedback: newFeedback });
    }

    return statuses;
  };
}

interface Props {
  appState: ReturnType<typeof appStatePersistence>;
  baseUrl: string;
}

type TestRunningStatus = "stopping" | "running" | "not-running";
const shareTestStepModalId = "shareTestStep";

const testEncoderV1 = new TestEncoderV1();

export function App({ appState, baseUrl }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const queryTests = searchParams.get("tests");
    if (queryTests) {
      searchParams.delete("tests");
      setSearchParams(searchParams);

      const toastLiveExample = document.getElementById("testsLoadedToast");

      const decodedResult = testEncoderV1.decode(queryTests);
      if (decodedResult.decoded) {
        const { steps, deploymentConfig } = decodedResult.testDefinition;

        setTestSteps(steps);

        if (deploymentConfig?.deploymentId) {
          setDeploymentId(deploymentConfig.deploymentId);
        }
        if (deploymentConfig?.region) {
          setRegion(deploymentConfig.region);
        }

        if (toastLiveExample) {
          Toast.getOrCreateInstance(toastLiveExample, { delay: 2000 }).show();
        }
      }
    }
  }, []);

  const [deploymentId, setDeploymentId] = useState(
    appState.readDeploymentId() || "",
  );
  const [region, setRegion] = useState(appState.readRegion() || "");
  const [testSteps, setTestSteps] = useState<Step[]>(
    appState.readTestSteps(getDemoSteps()),
  );

  const [transcription, setTranscription] = useState<Utterance[]>([]);
  const [testOutcome, setTestOutcome] = useState<TestOutcome | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [errors, setErrors] = useState<
    { errorType: "pre-connected" | "post-connected"; errorMessage: string }[]
  >([]);
  const [disableTestButton, setDisableTestButton] = useState(false);

  const [testRunningStatus, setTestRunningStatus] =
    useState<TestRunningStatus>("not-running");
  const [stepExecutionStatuses, setStepExecutionStatuses] = useState<
    StepExecutionStatus[]
  >([]);

  const testRunner = useRef<TestRunner | null>();

  useEffect(() => testSteps && appState.saveTestSteps(testSteps), [testSteps]);
  useEffect(() => {
    deploymentId && appState.saveDeploymentId(deploymentId);
  }, [deploymentId]);
  useEffect(() => {
    region && appState.saveRegion(region);
  }, [region]);

  useEffect(() => {
    setDisableTestButton(
      deploymentId === "" || region === "" || testSteps.length === 0,
    );
  }, [deploymentId, region, testSteps]);

  useEffect(() => {
    if (testRunner.current) {
      return;
    }

    testRunner.current = new TestRunner(
      (severity, overview, detailed) => {
        if (severity === "error") {
          console.error(overview, detailed);
        } else {
          console.log(overview, detailed);
        }

        setLogs((prev) => [...prev, { severity, overview, detailed }]);
      },
      (errorType, errorMessage) => {
        const errorPayload = { errorType, errorMessage };
        console.error(errorPayload);
        setErrors((prev) => [...prev, errorPayload]);
        cancelTest();
      },
      (step, feedback) => {
        setStepExecutionStatuses(updateStepFeedback(step, feedback.feedback));
      },
      (testResult) => setTestOutcome(testResult),
      () => {
        setTestRunningStatus("stopping");
        setTimeout(() => setTestRunningStatus("not-running"), 5000);
      },
      (event: any) =>
        setTranscription((prev: Utterance[]): Utterance[] => [
          ...prev,
          {
            who: event.detail.who,
            message: event.detail.message,
          },
        ]),
    );
  }, []);

  const cancelTest = (event?: FormEvent): void => {
    event && event.preventDefault();

    setTestRunningStatus("stopping");

    setLogs((prev) => [
      ...prev,
      { severity: "info", overview: "Cancelling test" },
    ]);
    testRunner.current?.stopTest().finally(() => {
      setLogs((prev) => [
        ...prev,
        { severity: "info", overview: "Test cancelled" },
      ]);

      // Delay by 5 seconds to prevent start/stopping tests with wild abandon, creating lots of abandoned sessions in Genesys Cloud
      setTimeout(() => {
        setTestRunningStatus("not-running");
      }, 5000);
    });
  };

  const startTest = (event: FormEvent): void => {
    event.preventDefault();

    // Clear previous test results
    setStepExecutionStatuses([]);
    setTranscription([]);
    setLogs([]);
    setTestOutcome(null);
    setErrors([]);

    setLogs((prev) => [
      ...prev,
      { severity: "info", overview: "Starting test" },
    ]);

    setTestRunningStatus("running");

    // Check not already running
    if (testRunner.current !== null && !testRunner.current?.isTestRunning()) {
      testRunner.current
        ?.runTest({ deploymentId, region, origin: baseUrl }, testSteps)
        .catch((error) => {
          setLogs((prev) => [
            ...prev,
            {
              severity: "error",
              overview: "Error starting test",
              detailed: error.message,
            },
          ]);
          setTestRunningStatus("not-running");
        });
    }
  };

  const onShareTestClicked = useCallback(
    () => new Modal(`#${shareTestStepModalId}`).show(),
    [],
  );

  return (
    <>
      <SimpleToast toastId="testsLoadedToast" message="Tests loaded" />
      <ShareTestStepModal
        modalId={shareTestStepModalId}
        test={{
          deploymentConfig: {
            ...(deploymentId ? { deploymentId } : {}),
            ...(region ? { region } : {}),
          },
          testSteps,
        }}
        baseUrl={baseUrl}
      />
      <Navbar
        logsButton={{
          dataBsToggle: "offcanvas",
          dataBsTarget: "#offcanvasExample",
          ariaControls: "offcanvasExample",
        }}
        onShareTestClicked={onShareTestClicked}
      />

      {/* Logs sidebar */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            Logs
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <Logs logs={logs} />
        </div>
      </div>

      <div className="container mt-2">
        <div className="row">
          <div className="col">
            <DeploymentConfig
              deploymentId={deploymentId}
              region={region}
              setDeploymentId={setDeploymentId}
              setRegion={setRegion}
            />
            <TestStepsConfig
              steps={testSteps}
              onTestStepsUpdated={setTestSteps}
              runningTestFeedback={stepExecutionStatuses}
              isTestRunning={testRunningStatus === "running"}
            />
            <div className="row justify-content-center mt-3">
              <button
                id="run-tests"
                hidden={testRunningStatus !== "not-running"}
                type="button"
                onClick={startTest}
                disabled={disableTestButton}
                className="btn btn-primary col-10"
              >
                Run Tests
              </button>
              <button
                hidden={testRunningStatus === "not-running"}
                type="button"
                onClick={cancelTest}
                className="btn btn-secondary col-10"
                disabled={testRunningStatus === "stopping"}
              >
                {testRunningStatus === "running" && "Cancel"}
                {testRunningStatus === "stopping" && "Stopping..."}
              </button>
            </div>
          </div>

          <div className="col">
            {errors.length > 0 && (
              <div className="mt-3 alert alert-danger" role="alert">
                <h4 className="alert-heading">Error</h4>
                {errors.map((e, index) => (
                  <p key={index} className="mb-0">
                    {e.errorType === "pre-connected" &&
                      enrichPreConnectedMessage(baseUrl, e.errorMessage)}
                    {e.errorType === "post-connected" && e.errorMessage}
                  </p>
                ))}
              </div>
            )}
            <LiveTranscription transcription={transcription} />
            {testOutcome && <TestResult result={testOutcome} />}
          </div>
        </div>
      </div>
      <div className="align-text-middle fixed-bottom text-end">
        Created by{" "}
        <a
          className="icon-link text-decoration-none"
          href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=lucas-woodward-the-dev"
        >
          Lucas Woodward
          <i className="bi bi-linkedin me-1 mb-2"></i>
        </a>
      </div>
    </>
  );
}
