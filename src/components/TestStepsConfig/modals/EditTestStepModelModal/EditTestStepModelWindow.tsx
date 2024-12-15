import { Say } from "./Say.tsx";
import { WaitForReplyContaining } from "./WaitForReplyContaining.tsx";
import React, { useEffect, useRef, useState } from "react";
import { Step } from "../../../../stepDefinitions.ts";

export interface EditTestStepModelWindowProps {
  modalId: string;
  /**
   * Properties of the step to edit. This can be null as the Model window's HTML has to be defined at the
   * point the button to show it is clicked.
   */
  stepProps: null | Step;
  onEditConfirmed: (newState: Step) => void;
}

export function EditTestStepModelWindow({
  modalId,
  stepProps,
  onEditConfirmed,
}: EditTestStepModelWindowProps) {
  const [currentDetails, setCurrentDetails] = useState(stepProps);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setCurrentDetails(stepProps), [stepProps]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && currentDetails) {
      event.preventDefault();
      saveButtonRef.current?.click();
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
              Edit Step
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" onKeyDown={handleKeyDown}>
            {currentDetails?.testStepType === "say" && (
              <Say details={currentDetails} setDetails={setCurrentDetails} />
            )}
            {currentDetails?.testStepType === "waitForReplyContaining" && (
              <WaitForReplyContaining
                details={currentDetails}
                setDetails={setCurrentDetails}
              />
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={
                !currentDetails
                  ? () => {}
                  : () => onEditConfirmed(currentDetails)
              }
              ref={saveButtonRef}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
