import { Step } from "../../stepDefinitions.ts";
import { useCallback, useMemo, useRef, useState } from "react";
import { TestEncoderV1 } from "../../testing-engine/sharable-url/encoder.ts";

export interface TargetedTest {
  deploymentConfig?: {
    deploymentId?: string;
    region?: string;
  };
  testSteps: Step[];
}

export interface ConfirmDeleteStepModelWindowProps {
  modalId: string;
  baseUrl: string;
  test: TargetedTest;
}

const testEncoderV1 = new TestEncoderV1();

export function ShareTestStepModal({
  modalId,
  test,
  baseUrl,
}: ConfirmDeleteStepModelWindowProps) {
  const [isCopied, setIsCopied] = useState(false);

  const linkInputRef = useRef<HTMLInputElement>(null);

  // Memoize permalink and reset `isCopied` when `test` changes
  const permalink = useMemo(() => {
    setIsCopied(false);
    return testEncoderV1.appendToURL(baseUrl, {
      schemaVersion: 1,
      deploymentConfig: test.deploymentConfig,
      steps: test.testSteps,
    });
  }, [test, baseUrl]);

  // Handle modal "shown" event to auto-select the link
  useMemo(() => {
    const modalElement = document.getElementById(modalId);

    const handleModalShown = () => {
      if (linkInputRef.current) {
        linkInputRef.current.select();
      }
    };

    if (modalElement) {
      modalElement.addEventListener("shown.bs.modal", handleModalShown);

      return () => {
        modalElement.removeEventListener("shown.bs.modal", handleModalShown);
      };
    }
  }, [modalId]);

  const copyTestsToClipboard = useCallback(() => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      linkInputRef.current.setSelectionRange(0, 99999); // For compatibility with some browsers

      navigator.clipboard
        .writeText(linkInputRef.current.value)
        .then(() => {
          console.log("Copied link to clipboard");
          setIsCopied(true);
        })
        .catch((err) =>
          console.error(`Failed to copy link to clipboard: ${err}`),
        );
    }
  }, []);

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex={-1}
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={`${modalId}Label`}>
              Share Test
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <label htmlFor="sharableLinkInput" className="form-label">
              Sharable link to your test
            </label>
            <div className="input-group mb-3">
              <input
                id="sharableLinkInput"
                type="text"
                className="form-control"
                placeholder="Sharable link to your test"
                aria-label="Sharable link to your test"
                aria-describedby="button-addon2"
                value={permalink}
                readOnly={true}
                ref={linkInputRef}
              />
              <button
                className="btn btn-primary"
                type="button"
                id="button-addon1"
                onClick={copyTestsToClipboard}
              >
                {isCopied ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  <i className="bi bi-clipboard2"></i>
                )}
              </button>
            </div>
            <div className="form-text">
              This link contains your test encoded within it. Your test is not
              saved on a server.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
