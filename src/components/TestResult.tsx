import { TimeoutWaitingForResponseError } from "../testing-engine/Conversation.ts";
import { useCallback } from "react";
import { TestOutcome } from "../testing-engine/TestRunner.ts";

interface Props {
  result: TestOutcome;
}

export function TestResult({ result }: Props) {
  const friendlyErrorMessage = useCallback((error: any) => {
    if (error instanceof TimeoutWaitingForResponseError) {
      return (
        <>
          <b>Expected reply containing:</b>
          <br />
          {`${error.expectedResponse}`}
          <br />
          <b>But received:</b>
          <br />
          {`${error.responsesReceived.map((m) => m.text).join(",")}`}
        </>
      );
    }
    if (error instanceof Error) {
      return <>{`${error.message}`}</>;
    }
    return <>`${error}`</>;
  }, []);

  return (
    <div>
      {result.result === "success" && (
        <div className="mt-3 alert alert-success" role="alert">
          <h4 className="alert-heading mb-0">Test passed</h4>
        </div>
      )}
      {result.result === "failed" && (
        <div className="mt-3 alert alert-danger" role="alert">
          <h4 className="alert-heading">Test failed</h4>
          <p className="mb-0">
            {friendlyErrorMessage(result.reasonStepFailed)}
          </p>
        </div>
      )}
    </div>
  );
}
