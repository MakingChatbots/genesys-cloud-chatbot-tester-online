import { useState } from "react";
import { EditIcon } from "./EditIcon.tsx";
import {
  EditTestStepModelWindow,
  EditTestStepModelWindowProps,
} from "./modals/EditTestStepModelModal/EditTestStepModelWindow.tsx";
import { BinIcon } from "./BinIcon.tsx";
import { ConfirmDeleteStepModal } from "./modals/ConfirmDeleteStepModal.tsx";
import { SayStep, Step } from "../../stepDefinitions.ts";
import { SortableList } from "./SortableList";
import {
  AddTestStepModalWindow,
  StepSelection,
} from "./modals/AddTestStepModal/AddTestStepModalWindow.tsx";
import { StepExecutionFeedbackIcon } from "./StepExecutionFeedbackIcon.tsx";

export interface StepExecutionStatus {
  stepId: number;
  feedback: "in-progress" | "success" | "failure";
}

interface Props {
  isTestRunning: boolean;
  onTestStepsUpdated: (steps: Step[]) => void;
  runningTestFeedback: StepExecutionStatus[];
  steps: Step[];
}

function excludeInitialStep(steps: Step[]): Step[] {
  return steps.filter((step) => step.id !== 0);
}

function getStepZeroElseDefault(steps: Step[], defaultStep: SayStep): SayStep {
  const stepZero = steps.find((s) => s.id === 0);
  if (stepZero && stepZero.testStepType === "say") {
    return stepZero;
  } else {
    return defaultStep;
  }
}

function addInitialBackIn(
  updateSteps: Props["onTestStepsUpdated"],
  step: Step,
) {
  return (steps: Step[]) => {
    updateSteps([step, ...steps]);
  };
}

const DEFAULT_INITIAL_SAY_STEP: SayStep = {
  id: 0,
  testStepType: "say",
  details: { sayText: "Hello" },
};

export function TestStepsConfig({
  steps,
  isTestRunning,
  onTestStepsUpdated,
  runningTestFeedback,
}: Props) {
  const addStepModalId = "addStepModal";
  const editStepModalId = "editStepModal";
  const deleteTestStepModalId = "confirmDeleteModel";

  const [stepIdToConfirmDeletion, setStepIdToConfirmDeletion] = useState<
    number | null
  >(null);
  const [stepEditWindow, setStepEditWindow] =
    useState<EditTestStepModelWindowProps["stepProps"]>(null);

  const deleteTestStep = (id: number): void => {
    onTestStepsUpdated(steps.filter((step) => step.id !== id));
  };

  const editTestStep = (newState: Step): void => {
    onTestStepsUpdated(
      steps.map((step) =>
        step.id === newState.id ? { ...step, ...newState } : step,
      ),
    );
  };

  const onStepChosen = (stepCreationDetails: StepSelection): void => {
    onTestStepsUpdated([
      ...steps,
      {
        id: Math.max(...steps.map((step) => step.id), 0) + 1,
        ...(stepCreationDetails.type === "say"
          ? {
              testStepType: "say",
              details: { sayText: stepCreationDetails.sayText },
            }
          : {
              testStepType: "waitForReplyContaining",
              details: {
                expectedReplyText: stepCreationDetails.expectedReplyText,
              },
            }),
      },
    ]);
  };

  const getItemFeedback = (
    stepId: number,
  ): "in-progress" | "success" | "failure" | "actioning-soon" => {
    const feedback = runningTestFeedback.find(
      (feedback) => feedback.stepId === stepId,
    );
    if (!feedback) {
      return "actioning-soon";
    }

    return feedback.feedback;
  };

  return (
    <>
      <AddTestStepModalWindow
        modalId={addStepModalId}
        onStepChosen={onStepChosen}
      />
      <EditTestStepModelWindow
        modalId={editStepModalId}
        stepProps={stepEditWindow}
        onEditConfirmed={editTestStep}
      />
      <ConfirmDeleteStepModal
        modalId={deleteTestStepModalId}
        stepId={stepIdToConfirmDeletion}
        onDeleteConfirmed={deleteTestStep}
      />

      <div className="row mt-3">
        <div className="pb-2">Test steps</div>
        <ul
          id="test-step-default"
          className="list-unstyled mb-0"
          role="application"
        >
          <SortableList.Item
            id={getStepZeroElseDefault(steps, DEFAULT_INITIAL_SAY_STEP).id}
          >
            <StepExecutionFeedbackIcon
              feedbackStatus={getItemFeedback(
                getStepZeroElseDefault(steps, DEFAULT_INITIAL_SAY_STEP).id,
              )}
            />
            <div className="flex-grow-1 text-break">
              <div>
                Say:{" "}
                <code>
                  {
                    getStepZeroElseDefault(steps, DEFAULT_INITIAL_SAY_STEP)
                      .details.sayText
                  }
                </code>
              </div>
            </div>
            <div
              className="btn-toolbar flex-nowrap"
              role="toolbar"
              aria-label="Toolbar with button groups"
            >
              <EditIcon
                disabled={isTestRunning}
                dataBsToggle="modal"
                dataBsTarget={`#${editStepModalId}`}
                onClick={() =>
                  setStepEditWindow(
                    getStepZeroElseDefault(steps, DEFAULT_INITIAL_SAY_STEP),
                  )
                }
              />
            </div>
          </SortableList.Item>
        </ul>
        <SortableList
          disabled={isTestRunning}
          items={excludeInitialStep(steps)}
          onChange={addInitialBackIn(
            onTestStepsUpdated,
            getStepZeroElseDefault(steps, DEFAULT_INITIAL_SAY_STEP),
          )}
          renderItem={(item) =>
            item.id === 0 ? (
              <SortableList.Item id={item.id}></SortableList.Item>
            ) : (
              <SortableList.Item id={item.id}>
                <StepExecutionFeedbackIcon
                  feedbackStatus={getItemFeedback(item.id)}
                />
                <div className="flex-grow-1 align-items-center text-break">
                  {item.testStepType === "say" && (
                    <>
                      Say: <code>{item.details.sayText}</code>
                    </>
                  )}
                  {item.testStepType === "waitForReplyContaining" && (
                    <>
                      Wait For Reply Containing:{" "}
                      <code>{item.details.expectedReplyText}</code>
                    </>
                  )}
                </div>
                <div
                  className="btn-toolbar flex-nowrap"
                  role="toolbar"
                  aria-label="Toolbar with button groups"
                >
                  <BinIcon
                    disabled={isTestRunning}
                    onClick={() => setStepIdToConfirmDeletion(item.id)}
                    dataBsToggle="modal"
                    dataBsTarget={`#${deleteTestStepModalId}`}
                  />
                  <EditIcon
                    onClick={() => setStepEditWindow(item)}
                    disabled={isTestRunning}
                    dataBsToggle="modal"
                    dataBsTarget={`#${editStepModalId}`}
                  />
                  <SortableList.DragHandle />
                </div>
              </SortableList.Item>
            )
          }
        />
        <div className="d-grid col-6 mx-auto">
          <button
            id="add-step"
            type="button"
            className="btn btn-light"
            disabled={isTestRunning}
            data-bs-toggle="modal"
            data-bs-target={`#${addStepModalId}`}
          >
            <i className="bi bi-plus-circle"></i>
            <span className="visually-hidden">Add step</span>
          </button>
        </div>
      </div>
    </>
  );
}
