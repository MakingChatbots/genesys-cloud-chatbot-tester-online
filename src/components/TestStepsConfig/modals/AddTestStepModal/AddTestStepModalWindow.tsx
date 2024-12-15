import React, { useCallback, useEffect, useRef, useState } from "react";
import { Say } from "./Say.tsx";
import { WaitForReplyContaining } from "./WaitForReplyContaining.tsx";

export interface WaitForReplyContainingStepSelection {
  type: "waitForReplyContaining";
  expectedReplyText: string;
}

export interface SayStepSelection {
  type: "say";
  sayText: string;
}

export type StepSelection =
  | WaitForReplyContainingStepSelection
  | SayStepSelection;

export interface AddStepModelWindowProps {
  modalId: string;
  onStepChosen: (stepCreationDetails: StepSelection) => void;
}

export function AddTestStepModalWindow({
  modalId,
  onStepChosen,
}: AddStepModelWindowProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const [sayText, setSayText] = useState("");

  const [expectedReplyText, setExpectedReplyText] = useState("");

  const [selectedStep, setSelectedStep] = useState<
    StepSelection["type"] | null
  >(null);

  useEffect(() => {
    const modalElement = document.getElementById(modalId);
    const handleModalShown = () => {
      if (selectRef.current) {
        selectRef.current.focus();
      }
    };

    if (modalElement) {
      modalElement.addEventListener("shown.bs.modal", handleModalShown);

      return () => {
        modalElement.removeEventListener("shown.bs.modal", handleModalShown);
      };
    }
  }, []);

  function isValidState() {
    switch (selectedStep) {
      case "waitForReplyContaining":
        return expectedReplyText !== "";
      case "say":
        return sayText !== "";
      default:
        return false;
    }
  }

  const handleSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      switch (event.target.value) {
        case "waitForReplyContaining":
          setSelectedStep("waitForReplyContaining");
          break;
        case "say":
          setSelectedStep("say");
          break;
        default:
          setSelectedStep(null);
      }
    },
    [],
  );

  const resetInputs = useCallback(() => {
    setSelectedStep(null);
    setSayText("");
    setExpectedReplyText("");
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && isValidState()) {
      event.preventDefault();
      addButtonRef.current?.click();
    }
  };

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
              Add step
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <select
              id="add-step-type"
              className="form-select"
              value={selectedStep ?? ""}
              onChange={handleSelectChange}
              ref={selectRef}
            >
              <option value="" disabled>
                Select step type...
              </option>
              <option value="say">Say</option>
              <option value="waitForReplyContaining">
                Wait For Reply Containing
              </option>
            </select>
            <div className="mt-4" onKeyDown={handleKeyDown}>
              {selectedStep === "say" && (
                <Say sayText={sayText} setSayText={setSayText} />
              )}
              {selectedStep === "waitForReplyContaining" && (
                <WaitForReplyContaining
                  whatTextToWaitFor={expectedReplyText}
                  setWhatTextToWaitFor={setExpectedReplyText}
                />
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => setSelectedStep(null)}
            >
              Cancel
            </button>
            <button
              id="add-step-action"
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {
                switch (selectedStep) {
                  case "waitForReplyContaining":
                    onStepChosen({
                      type: "waitForReplyContaining",
                      expectedReplyText: expectedReplyText,
                    });
                    break;
                  case "say":
                    onStepChosen({
                      type: "say",
                      sayText: sayText,
                    });
                    break;
                  default:
                    setSelectedStep(null);
                }

                resetInputs();
              }}
              disabled={!isValidState()}
              ref={addButtonRef}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
